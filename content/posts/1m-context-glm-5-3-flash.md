---
title: Scaling Training to 1M Token Context
subtitle: on GLM-5.3-Flash
date: 2026-10-18
tag: ENGINEERING
authors: "Avi Basnet and SkyRL Team; Keith Truongcao and the Lila Sciences' AI Research Team"
label: SkyRL + Lila Sciences
layout: sidebar
featured: true
hero: hero.png
heroAlt: "Sparse attention: one query attends to a few dozen tokens scattered across a long context"
excerpt: SkyRL now trains GLM-5.3-Flash at 1M tokens per sequence, 64× the previous baseline, through sparse attention fixes, activation recompute and offloading, context parallelism and fewer fp32 upcasts.
draft: true
---

## Intro {#intro}

The model capabilities with the highest practical usefulness involve **long context windows**. A coding agent working through a repository, a lab agent running a multi-day experiment, and a reasoning model thinking through a hard problem all require hundreds of thousands of tokens kept in context.

However, there are many engineering challenges with training models at that length of context. Memory grows with sequence length in every layer, and in attention it grows quadratically, so standard open source training frameworks run out of memory well before 1M tokens.

In the latest version of SkyRL, the SkyRL team from Anyscale worked with the AI Research Team at [Lila Sciences](https://www.lila.ai/) to enable key optimizations for GLM 5.3 Flash to train at **1M tokens per sequence**, which is 64× higher than the previous baseline.

![Peak memory at 1M tokens, adding one optimization at a time](./peak-memory-waterfall.svg)

*Note: The bf16 MoE combine looks small here because it saves far more on real data with uneven expert routing.*

The throughput and memory numbers come from dummy fine-tuning runs on random tokens with random-init weights. We check correctness separately. On real data, uneven MoE routing raises the peak, which we cover in [Training on Real Data](#training-on-real-data).

![Training throughput from 16k to 1M tokens per sequence](./throughput.png)

Getting there took work in four areas, which we walk through below:

1. **DeepSeek Sparse Attention:** run DSA on a sparse kernel, and chunk and shard its quadratic indexer.
2. **Activation recompute and offloading:** recompute activations in backward and offload saved inputs to CPU.
3. **Context parallelism:** split each sequence across GPUs, with new CP support for KDA and a fix for DSA.
4. **Avoiding unnecessary precision upcasts:** keep fp32 copies out of memory and off the network.

Everything is open source and reproducible, and several fixes also go back upstream to Megatron-LM ([#7522](https://github.com/NVIDIA/Megatron-LM/pull/7522), [#8297](https://github.com/NVIDIA/Megatron-LM/pull/8297), [#8298](https://github.com/NVIDIA/Megatron-LM/pull/8298), [#8299](https://github.com/NVIDIA/Megatron-LM/pull/8299), [#8300](https://github.com/NVIDIA/Megatron-LM/pull/8300)).

![Peak memory per GPU with one optimization removed at a time](./memory-ablation.png)

*Each dashed line shows peak memory per GPU during training with one optimization turned off and the rest left on. The solid blue line has all of them on and stays under the B200's 178 GiB all the way to 1M tokens (144.5 GiB).*

## DeepSeek Sparse Attention (DSA) Optimizations {#dsa-optimizations}

GLM-5.3-Flash is a hybrid attention model: 34 of its 45 layers use Kimi Delta Attention (KDA), a form of linear attention, and the other 11 use DeepSeek Sparse Attention (DSA). DSA is the only part of the model whose cost grows with the square of the sequence length, so it sets the ceiling on how long a context the model can train on.

A lightweight *indexer* picks, for each query, which earlier tokens matter, and the attention reads only those 2048 tokens, so attention cost grows linearly. To make that choice, though, the indexer scores every query against every earlier pool of 4 tokens. The attention is sparse, but the indexer is dense, so the quadratic cost moves into the indexer rather than disappearing.

![Inside a DSA layer: sparse attention, dense indexer](./dsa-indexer.svg)

The next three sections each go after one hidden quadratic cost:

- **The kernel:** GLM's DSA layers were silently falling back to dense attention.
- **Chunking:** the indexer was materializing its full score matrix.
- **Sharding:** every GPU in a tensor-parallel group was repeating the same indexer scoring.

These fixes apply to any model built on DSA, such as the DeepSeek family, not just GLM.

### Making Sparse Attention Actually Sparse {#making-sparse-attention-actually-sparse}

GLM-5.3-Flash's DSA layers weren't actually running sparse. Megatron-core's fused sparse attention kernels only accept DeepSeek-V3.2's tensor shapes. DeepSeek's (and the full GLM-5.3's) queries and keys carry 64 extra channels for rotary position embeddings (RoPE), which encode each token's position, but GLM-5.3-Flash's DSA layers use no positional embeddings (NoPE), so their queries and keys are narrower, and its pooled indexer selects 2,051 keys instead of 2,048. The kernels silently declined these shapes, and Megatron fell back to dense attention over the full S × S matrix. With every other optimization in place, that fallback used 114 GiB per GPU at 16k and ran out of memory at 32k.

We pad GLM's tensors to the shapes the kernel expects ([#2388](https://github.com/NovaSky-AI/SkyRL/pull/2388)). With the sparse kernel, 16k drops to 56 GiB per GPU, half the memory, and 32k no longer runs out of memory. Among the sparse kernels, we use TileLang because it pads attention heads far less than cuDNN/FlashMLA, which uses about 3× the memory at 128k. Generally, enabling long context on new models requires checking that each layer actually runs the kernel you expect. A silent fallback looks like a memory problem, not a bug.

![Sparse attention kernel: 3× less memory than cuDNN](./sparse-kernel.png)

### Splitting the DSA Indexer {#splitting-the-dsa-indexer}

**Over Time: Chunking**

The indexer's score matrix grows quadratically with context: at 32k, scoring all queries at once peaked at 64 GiB per GPU, and at 128k it would reach about 1 TiB. We score and select pools a few hundred queries at a time, keeping each chunk under 2 GiB ([#2413](https://github.com/NovaSky-AI/SkyRL/pull/2413)). Indexer memory becomes constant instead of quadratic, with no loss in speed. At 32k, scoring all queries at once peaked at 64 GiB, while chunked scoring stayed around 2.3 GiB. This is similar to the idea in FlashAttention.

**Across GPUs: Sharding**

Megatron gathers the full sequence onto every GPU in a tensor-parallel group before the indexer, so all 8 GPUs were doing the same O(S²) scoring. Now each GPU scores only its own share of the queries and then shares the selected pool indices, which are small, and cast to int32 to halve the bytes ([#2422](https://github.com/NovaSky-AI/SkyRL/pull/2422)). Each GPU does 1/8 of the indexer work. This was the largest speedup in the DSA work: at 256k on 64 B200s, the full training step went from 218 s to 102 s, 2.1× faster.

![Sharding the DSA indexer at 256k](./indexer-sharding.png)

## Activation Recompute {#activation-recompute}

Once the DSA fixes removed the quadratic costs, ordinary activation memory became the limit. GLM-5.3-Flash uses mHC (manifold-constrained hyper-connections), which replaces the usual single residual stream with 4 parallel streams per token. Each layer reads a weighted mix of the streams and writes its output back into them, so the residual is 4× wider than a normal hidden state, and so is every activation built from it. Megatron's selective recompute keeps most of these activations alive until backward, which capped the model at about 32k tokens per sequence. Switching to full recompute, where each layer keeps only its input and reruns its forward pass during backward, raises that to 256k, about 8× more context, at the cost of about 6% more step time than no recompute and 1% more than selective recompute. Megatron disallows full recompute with mHC, but our implementation doesn't need that restriction ([#2411](https://github.com/NovaSky-AI/SkyRL/pull/2411); upstream fix in [Megatron-LM #7521](https://github.com/NVIDIA/Megatron-LM/pull/7521)).

![Full recompute: half the memory, about the same step time](./full-recompute.png)

### Releasing Stale MoE Router State {#releasing-stale-moe-router-state}

Full recompute exposed a memory leak that affects any MoE model. Megatron's MoE layer holds onto its router probabilities after the forward pass. Without recompute, this costs nothing, since the forward graph has to stay alive until backward anyway. With full recompute, though, each layer's forward reruns during backward, and the stale reference keeps every recomputed graph alive for the rest of the backward pass. Releasing the probabilities once the forward is done saves about 41 GiB per GPU at 256k ([#2433](https://github.com/NovaSky-AI/SkyRL/pull/2433)).

### Offloading Activation Checkpoints to CPU {#offloading-activation-checkpoints-to-cpu}

Even with full recompute, each layer keeps its input on the GPU until backward. With mHC, that input is the 4-stream residual, 4× wider than a normal hidden state: roughly 180 GB per GPU across 45 layers at 1M tokens. These inputs sit unused between the forward and backward passes, so we move them to CPU memory and bring them back when backward needs them ([#2412](https://github.com/NovaSky-AI/SkyRL/pull/2412)). The patch works for any Megatron model, not just GLM.

At 256k, offloading cuts peak memory from 142 to 98 GiB per GPU and adds 21% to step time (84 s → 102 s). At 512k it's required: without it, the step runs out of memory. Below that, we only turn it on when the context wouldn't fit otherwise.

#### Pinned vs. pageable memory {#pinned-vs-pageable-memory}

By default, the offloaded tensors go into pageable memory. To copy them over PCIe, the CUDA driver first stages each one through an internal pinned buffer. Copying straight into pinned memory skips that step and lets the copies run asynchronously which makes offloading 22% faster than with ordinary pageable memory (102 s vs. 130 s per step at 256k). Below 512k, offload is a trade of about 20% step time for 43 GiB.

![Checkpoint offload at 256k: no offload vs. pageable vs. pinned](./checkpoint-offload.png)

The catch is host RAM. It's shared with the optimizer, whose state we also keep in CPU memory, and PyTorch's allocator holds on to freed pinned blocks, so we release them after every step. Plan on enough host memory per node: the offloaded inputs alone are about 180 GB per GPU at 1M before context parallelism, over 1 TB per 8-GPU node.

## Context Parallelism {#context-parallelism}

At 1M tokens, even with everything else in place, a single sequence's activations don't fit on one 8-GPU tensor-parallel group, so the sequence itself has to be split across GPUs. Because GLM-5.3-Flash is a hybrid, this took work on both layer types:

- **KDA (linear attention):** Megatron had no CP for KDA, so we implemented it. Splitting KDA by tokens would mean each GPU first needs the recurrent state from all earlier tokens. That's doable, using compact state summaries, but it costs an extra pass. We split heads instead, Ulysses-style: each GPU gets the full sequence for a subset of heads and runs KDA end to end, with no state passed between GPUs.
- **DSA (sparse attention):** split the tokens and have each GPU gather the keys it needs from the others. Megatron already supports this, but it needed a fix for GLM's indexer.

### KDA: Communicate the Smallest Tensor {#kda-communicate-the-smallest-tensor}

Megatron's Ulysses implementation exchanges the projected queries, keys, values, and gates, which are about 10× wider than the hidden state ([#2418](https://github.com/NovaSky-AI/SkyRL/pull/2418)). We gather the hidden state instead and have each GPU project only its own heads ([#2437](https://github.com/NovaSky-AI/SkyRL/pull/2437)). At CP2, this sends about 5× fewer bytes into each KDA layer, since the all-to-all only sends the heads that live on the other ranks. Communication is only part of the step, so the end-to-end gain is smaller: a 1M step went from 335 s to 307 s (−8%). Generally, we want to move the communication where the tensor is smallest. *(To learn more about how the different parallelism schemes interact with the KDA layer see the [Appendix](#appendix).)*

![Context parallelism for KDA at CP2: all-to-all vs. all-gather](./kda-cp.svg)

### DSA: Gather by Token Position {#dsa-gather-by-token-position}

To balance causal attention, Megatron gives each GPU an early and a late chunk of the sequence (a "zigzag"), then gathers the indexer's keys from all GPUs back into sequence order. It didn't do the same for the k-pool gate scores that weight each key within a pool, so each GPU had keys for the whole sequence but scores only for its own tokens. We gather and reorder the gate scores exactly like the keys, so each pool combines matching keys and scores ([#2418](https://github.com/NovaSky-AI/SkyRL/pull/2418)).

Going from 512k without CP to 1M with CP2, aggregate throughput drops from 18.2k to 13.7k tokens/s. Splitting each sequence over 2 GPUs halves the number of sequences trained in parallel, and each step pays for the exchange. The indexer's quadratic cost also keeps growing with length. That's why we only use CP when a sequence wouldn't fit otherwise.

## Avoiding Unnecessary Precision Upcasts {#avoiding-unnecessary-precision-upcasts}

GLM-5.3-Flash trains in bf16, but in two places Megatron upcasts a tensor to fp32 and then stores or sends the fp32 copy, even though nothing needs the extra precision. Each is a hidden 2× cost in memory or communication.

**The mHC projection** ([#2434](https://github.com/NovaSky-AI/SkyRL/pull/2434))

The mHC projection runs in fp32, and autograd saved the fp32 copy of its input, a second, twice-as-large copy of a tensor already kept in bf16. We recompute the cast in backward instead of storing it, since a cast is almost free to redo. This saves 8 GiB at 512k (152 → 144 GiB), and much more without full recompute.

**The MoE combine** ([#2414](https://github.com/NovaSky-AI/SkyRL/pull/2414))

Expert outputs were upcast to fp32 before the reduce-scatter across expert-TP ranks. With 2 ranks, that reduction is a single addition, which NCCL already performs in fp32 and rounds once. So reducing in bf16 gives the same result with half the bytes and no fp32 copy. At 512k, fp32 runs out of memory and bf16 fits at 144 GiB. With more than 2 ranks (and/or with NVLS, which reduces inside the NVSwitch), bf16 partial sums are rounded at each step, so we keep fp32 there.

Both changes are exact: the mHC fix is bit-identical to the original, and the bf16 combine matches the fp32 result on all 64M elements we compared.

## Training on Real Data {#training-on-real-data}

Everything above used random weights and random tokens. Here we check correctness and show what changes on real data.

Real data broke the setup. Fine-tuning on real books from ProLong-512K ([Gao et al., 2024](https://arxiv.org/abs/2410.02660)) ran out of memory at 512k, where random-token runs fit easily. Real text routes unevenly across experts: the busiest GPU got about 4× the average tokens. For MoE models, random-token memory benchmarks underestimate the real peak. Running the MoE layer over the sequence in chunks fixes it ([#2468](https://github.com/NovaSky-AI/SkyRL/pull/2468)).

### Results {#results}

**Training and Eval Loss Curves**

![Held-out loss on chr22 and training loss over 80 steps](./loss-curves.png)

*Note: two very repetitive stretches of DNA dropped training loss sharply, leading to the noise.*

With chunking, the full model trains on real books at 512k (122 GiB peak) and 1M (109 GiB, CP=4). To show learning, we fine-tuned on the human genome (hg38): chromosomes 1-2 for training and chromosome 22, never trained on, for evaluation. Held-out loss falls 4.8% over 80 steps at 512k tokens per sequence.

**Per-Position Loss Shows Long-Context Learning**

![Held-out loss by token position before and after fine-tuning](./per-position-loss.png)

We split held-out loss by token position into 32k-token buckets and compare before and after fine-tuning. Early tokens have little context before them, so any improvement there comes from learning local patterns, such as short motifs and base composition. Late tokens have up to 500k tokens of context before them. Local learning helps every position about equally, so a larger improvement at late positions has to come from the long context only they have.

**Correctness**

In full RL runs with the real weights, trainer and vLLM log-probabilities agree to within 0.04–0.07 (mean absolute difference) from 128k to 1M tokens. Fine-tuned on the same four 512k-token books every step, loss falls from 1.65 to 0.17 in 20 steps, so gradients are correct end to end.

## Appendix {#appendix}

![Step time vs. context length](./step-time.png)

![Peak GPU memory vs. context length](./peak-memory.png)

**Context, Tensor, and Sequence Parallelism with the KDA Layer**

![KDA context parallelism with all-gather at CP2 × TP2](./kda-cp-detail.png)

Each GPU is one TP rank inside one CP rank. Between layers, CP splits the sequence across CP ranks (rank 0 owns t1, t2, t7, t8; rank 1 owns t3–t6), and sequence parallelism (SP) splits each CP rank's tokens again across its TP ranks, so each GPU holds s/(CP·TP) tokens.

Inside KDA, CP switches from splitting tokens to splitting heads. KDA is a recurrence over the whole sequence, so instead of passing state between ranks, an all-gather within TP and then across CP gives every GPU all s tokens. TP gives each rank half the heads and CP splits each half again, so each GPU projects and runs KDA for H/(TP·CP) heads over the full sequence. An all-to-all across CP then returns each token to its owning CP rank, and the output projection plus a reduce-scatter within TP restore the s/(CP·TP) layout.
