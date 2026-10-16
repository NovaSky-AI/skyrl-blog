'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, GitBranch, Moon, Search, Sun } from 'lucide-react'

const posts = [
  { date: 'Release 18', read: 'Mercor + SkyRL', title: 'Training frontier knowledge work agents: A 397B RL training guide with SkyRL', excerpt: 'A step-by-step guide to post-training Qwen3.5-397B-A17B with SkyRL, including the infrastructure, systems tuning, and lessons behind the hero run.', tag: 'CASE STUDY', publishedAt: '2026-09-01', href: 'https://mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-rl-training-guide-with-skyrl' },
  { date: 'Release 20', read: 'SkyRL v0.4.0', title: 'SkyRL v0.4.0: Improving SkyRL for large scale post-training', excerpt: 'New model support, more stable RL, faster routing replay, efficient weight transfer, and a stronger path to production-scale experiments.', tag: 'RELEASE', href: '/blog/skyrl-v0-4-0' },
  { date: 'Release 01', read: 'SkyRL v0', title: 'SkyRL v0: Train real-world long-horizon agents via reinforcement learning', excerpt: 'Introducing SkyRL v0, an open framework for training capable long-horizon agents with reinforcement learning.', tag: 'RESEARCH', href: 'https://novasky-ai.notion.site/skyrl-v0' },
  { date: 'Release 02', read: 'SkyRL SQL', title: 'SkyRL SQL: Reinforcement learning with structured data', excerpt: 'Training agents to reason over databases, structured data, and reliable tool interactions.', tag: 'RESEARCH', href: 'https://novasky-ai.notion.site/skyrl-sql' },
  { date: 'Release 03', read: 'SkyRL v0.1', title: 'SkyRL v0.1: Building a stronger foundation for agent RL', excerpt: 'The next step in making full-stack reinforcement learning research more modular and reproducible.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-v01' },
  { date: 'Release 04', read: 'Search-R1', title: 'Search-R1: Training reasoning models to search', excerpt: 'Exploring reinforcement learning for agents that learn when and how to search for information.', tag: 'RESEARCH', href: 'https://novasky-ai.notion.site/skyrl-searchr1' },
  { date: 'Release 05', read: 'DeepResearch', title: 'SkyRL DeepResearch: Long-horizon research agents', excerpt: 'A look at the systems and training recipes behind capable research-oriented agents.', tag: 'RESEARCH', href: 'https://novasky-ai.notion.site/skyrl-agent-deepresearch' },
  { date: 'Release 06', read: 'SkyRL TX', title: 'SkyRL TX: Scaling training for tool-using agents', excerpt: 'New infrastructure for efficient reinforcement learning with tool use and external environments.', tag: 'ENGINEERING', href: 'https://novasky-ai.notion.site/skyrl-tx' },
  { date: 'Release 07', read: 'SkyRL TX v0.0.2', title: 'SkyRL TX v0.0.2: Iterating on agent training infrastructure', excerpt: 'An incremental release focused on making agent training workflows easier to run and extend.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-tx-v002' },
  { date: 'Release 08', read: 'SkyRL TX 0.0.3', title: 'SkyRL TX 0.0.3: More reliable experiments', excerpt: 'Updates to the TX stack for reproducible, production-minded reinforcement learning research.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-tx-003' },
  { date: 'Release 09', read: 'SkyRL TX v0.1.0', title: 'SkyRL TX v0.1.0: A new milestone for tool-use RL', excerpt: 'The first major TX release brings a more complete foundation for training tool-using agents.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-tx-v010' },
  { date: 'Release 10', read: 'SkyRL TX v0.2', title: 'SkyRL TX v0.2: Advancing scalable agent training', excerpt: 'New capabilities for scaling experiments across environments, tools, and model families.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-tx-v02' },
  { date: 'Release 11', read: 'SkyRL TX Release', title: 'SkyRL TX Release — February 2026', excerpt: 'A release update covering the latest progress in SkyRL TX and tool-using agent research.', tag: 'RELEASE', href: 'https://app.notion.com/p/SkyRL-tx-Release-2026-02-27-3138f0016b9d80f7a954c0bb0c42bf68' },
  { date: 'Release 12', read: 'SkyRL TX v0.3.0', title: 'SkyRL TX v0.3.0: Toward dependable agent RL', excerpt: 'A new TX release with improvements for dependable, scalable training workflows.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-tx-v030' },
  { date: 'Release 13', read: 'SkyRL TX v0.2.1', title: 'SkyRL TX v0.2.1: Refining the training loop', excerpt: 'A focused update that improves the day-to-day experience of running TX experiments.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-tx-v021' },
  { date: 'Release 14', read: 'SkyRL Tinker', title: 'SkyRL Tinker: Faster iteration for RL researchers', excerpt: 'Making it easier to prototype, debug, and iterate on reinforcement learning ideas.', tag: 'ENGINEERING', href: 'https://novasky-ai.notion.site/skyrl-tinker' },
  { date: 'Release 15', read: 'On-Policy Distillation', title: 'On-policy distillation for capable language agents', excerpt: 'A practical look at distilling strong behaviors into models through on-policy training.', tag: 'RESEARCH', href: 'https://novasky-ai.notion.site/on-policy-distillation' },
  { date: 'Release 16', read: 'SkyRL Harbor', title: 'SkyRL Harbor: A home for agent environments', excerpt: 'An environment layer for bringing richer tasks and real-world interaction into agent RL.', tag: 'ENGINEERING', href: 'https://novasky-ai.notion.site/skyrl-harbor' },
  { date: 'Release 17', read: 'Case Study', title: 'Improving GPU power utilization on agentic RL with async training', excerpt: 'A case study on using asynchronous training to improve utilization in agentic reinforcement learning.', tag: 'CASE STUDY', href: 'https://tested-erica-a2b.notion.site/Case-Study-Improving-GPU-Power-Utilization-on-Agentic-RL-with-Async-training-3218f0016b9d80299e23ff72c9de3f04' },
  { date: 'Release 19', read: 'SkyRL v0.3', title: 'SkyRL v0.3: The open stack keeps moving', excerpt: 'The latest SkyRL milestone and what comes next for open, full-stack reinforcement learning.', tag: 'RELEASE', href: 'https://novasky-ai.notion.site/skyrl-v03' },
]

export default function Page() {
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)
  const filteredPosts = useMemo(
    () => [...posts]
    .sort((a, b) => Number.parseInt(b.date.replace('Release ', ''), 10) - Number.parseInt(a.date.replace('Release ', ''), 10))
    .filter((post) => `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <div className={dark ? 'min-h-screen bg-[#111318] text-[#f5f7fa]' : 'min-h-screen bg-white text-[#10131a]'}>
      <header className={dark ? 'border-b border-white/10' : 'border-b border-[#e7e8eb]'}>
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-6 lg:px-0">
          <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-[-0.04em]">
            <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-[8px] bg-[#1769ff] text-white">
              <img src="https://github.com/NovaSky-AI.png" alt="NovaSky AI" className="h-full w-full object-cover" />
            </span>
            <span className="text-[19px]">SkyRL</span>
          </a>
          <nav className="hidden items-center gap-8 text-[14px] font-medium text-[#667085] md:flex">
            <a href="#articles" className="transition-colors hover:text-[#1769ff]">Articles</a>
            <a href="https://github.com/NovaSky-AI/SkyRL" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors hover:text-[#1769ff]"><GitBranch size={16} /> GitHub</a>
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDark((value) => !value)} aria-label="Toggle theme" className="rounded-full p-2 text-[#667085] transition hover:bg-black/5 hover:text-[#1769ff] dark:hover:bg-white/10">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <a href="#articles" className="hidden rounded-full bg-[#10131a] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#1769ff] sm:block">Read the latest</a>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-[1120px] px-6 pb-24 lg:px-0">
        <section className="grid gap-10 pb-14 pt-16 md:grid-cols-[1fr_390px] md:items-end md:pt-24">
          <div>
            <h1 className="max-w-[600px] text-[48px] font-semibold leading-[1.03] tracking-[-0.065em] sm:text-[64px]">SkyRL Blog</h1>
            <p className="mt-6 max-w-[580px] text-[18px] leading-8 text-[#667085]">Engineering notes, research updates, practical guides and deep dives on post-training from the SkyRL community</p>
          </div>
          <label className={dark ? 'flex h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 text-[#aeb6c4]' : 'flex h-12 items-center gap-3 rounded-xl border border-[#dfe2e7] bg-[#fafbfc] px-4 text-[#667085]'}>
            <Search size={18} />
            <span className="sr-only">Search articles</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles..." className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#98a2b3]" />
          </label>
        </section>

        <section aria-labelledby="featured-heading" className="mb-16">
          <a href="https://mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-rl-training-guide-with-skyrl" target="_blank" rel="noreferrer" className={dark ? 'group grid overflow-hidden rounded-2xl border border-white/10 bg-[#191d25] md:grid-cols-[42%_58%]' : 'group grid overflow-hidden rounded-2xl border border-[#e2e5e9] bg-[#fbfcfe] md:grid-cols-[42%_58%]'}>
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-white p-5 md:min-h-[320px] md:p-8"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VnhyMhAhe1QcCtbdxsTVGF0zWmWTVT.png" alt="SkyRL architecture diagram showing the VeRL backend, tools, environment runtime, and sandbox server" className="h-full w-full scale-[1.08] object-contain transition duration-500 group-hover:scale-[1.1]" /></div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="mb-4 text-[11px] font-bold tracking-[0.18em] text-[#1769ff]">FEATURED · CASE STUDY</p>
              <h2 id="featured-heading" className="max-w-[520px] text-[28px] font-semibold leading-[1.12] tracking-[-0.04em] md:text-[34px]">Training frontier knowledge work agents: A 397B RL training guide with SkyRL</h2>
              <p className="mt-5 text-[14px] leading-6 text-[#667085]">A step-by-step guide to post-training Qwen3.5-397B-A17B with SkyRL, including the infrastructure, systems tuning, and lessons behind the hero run.</p>
              <div className="mt-7 flex items-center gap-3 text-[12px] font-medium text-[#8a93a2]"><time>September 2026</time><span>·</span><span>Mercor + SkyRL</span><ArrowUpRight size={16} className="ml-auto text-[#1769ff] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
            </div>
          </a>
        </section>

        <section id="articles" className="grid gap-12 md:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-6 flex items-end justify-between border-b border-[#e7e8eb] pb-4"><h2 className="text-[13px] font-bold tracking-[0.16em]">LATEST ARTICLES</h2><span className="text-[12px] text-[#98a2b3]">{filteredPosts.length} stories</span></div>
            <div className="divide-y divide-[#e7e8eb]">
              {filteredPosts.map((post) => <a href={post.href} target="_blank" rel="noreferrer" key={post.title} className="group block py-7 first:pt-2"><div className="mb-3 flex items-center gap-3 text-[11px] font-semibold tracking-[0.08em] text-[#1769ff]"><span>{post.tag}</span><span className="h-1 w-1 rounded-full bg-[#c4cbd6]" /><time className="font-normal tracking-normal text-[#8a93a2]">{post.date} · {post.read}</time></div><h3 className="max-w-[650px] text-[22px] font-semibold leading-[1.2] tracking-[-0.035em] transition-colors group-hover:text-[#1769ff]">{post.title}</h3><p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#667085]">{post.excerpt}</p></a>)}
              {filteredPosts.length === 0 && <p className="py-12 text-sm text-[#667085]">No articles match that search.</p>}
            </div>
          </div>
          <aside id="about" className="md:pt-1"><p className="mb-5 text-[11px] font-bold tracking-[0.16em] text-[#98a2b3]">ABOUT SKYRL</p><p className="text-[15px] leading-7 text-[#667085]">SkyRL is a modular full-stack reinforcement learning library for large language models, built by NovaSky AI and the open-source community.</p><a href="https://github.com/NovaSky-AI/SkyRL" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-[#1769ff]">Explore SkyRL <ArrowUpRight size={15} /></a></aside>
        </section>
      </main>
      <footer className={dark ? 'border-t border-white/10' : 'border-t border-[#e7e8eb]'}><div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-6 py-8 text-[12px] text-[#98a2b3] sm:flex-row sm:items-center sm:justify-between lg:px-0"><span>© 2026 SkyRL AI</span><span>Built in the open for the open AI community.</span></div></footer>
    </div>
  )
}
