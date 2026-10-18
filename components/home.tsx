'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, GitBranch, Moon, Search, Sun } from 'lucide-react'
import type { PostSummary } from '@/lib/posts'

export type FeaturedPost = {
  href: string
  title: string
  excerpt: string
  tag: string
  label: string
  month: string
  heroUrl?: string
  heroAlt: string
}

// UTC so the server render and the browser agree on the day.
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export default function Home({ posts, featured }: { posts: PostSummary[]; featured?: FeaturedPost }) {
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)
  const filteredPosts = useMemo(
    () => posts.filter((post) => `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase())),
    [posts, query],
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

        {featured && (
          <section aria-labelledby="featured-heading" className="mb-16">
            <a href={featured.href} className={dark ? 'group block overflow-hidden rounded-2xl border border-white/10 bg-[#191d25]' : 'group block overflow-hidden rounded-2xl border border-[#e2e5e9] bg-[#fbfcfe]'}>
              {featured.heroUrl && <div className="overflow-hidden border-b border-[#e2e5e9] bg-white px-4 py-2 sm:px-10 sm:py-4"><img src={featured.heroUrl} alt={featured.heroAlt} className="mx-auto w-full max-w-[960px] transition duration-500 group-hover:scale-[1.02]" /></div>}
              <div className="flex flex-col justify-center p-8 md:px-12 md:py-10">
                <p className="mb-4 text-[11px] font-bold tracking-[0.18em] text-[#1769ff]">FEATURED · {featured.tag}</p>
                <h2 id="featured-heading" className="max-w-[520px] text-[28px] font-semibold leading-[1.12] tracking-[-0.04em] md:text-[34px]">{featured.title}</h2>
                <p className="mt-5 text-[14px] leading-6 text-[#667085]">{featured.excerpt}</p>
                <div className="mt-7 flex items-center gap-3 text-[12px] font-medium text-[#8a93a2]"><time>{featured.month}</time><span>·</span><span>{featured.label}</span><ArrowUpRight size={16} className="ml-auto text-[#1769ff] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
              </div>
            </a>
          </section>
        )}

        <section id="articles" className="grid gap-12 md:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-6 flex items-end justify-between border-b border-[#e7e8eb] pb-4"><h2 className="text-[13px] font-bold tracking-[0.16em]">LATEST ARTICLES</h2><span className="text-[12px] text-[#98a2b3]">{filteredPosts.length} stories</span></div>
            <div className="divide-y divide-[#e7e8eb]">
              {filteredPosts.map((post) => (
                <a href={post.href} {...(post.external ? { target: '_blank', rel: 'noreferrer' } : {})} key={post.href} className="group block py-7 first:pt-2">
                  <div className="mb-3 flex items-center gap-3 text-[11px] font-semibold tracking-[0.08em] text-[#1769ff]"><span>{post.tag}</span><span className="h-1 w-1 rounded-full bg-[#c4cbd6]" /><time dateTime={post.date} className="font-normal tracking-normal text-[#8a93a2]">{formatDate(post.date)} · {post.label}</time></div>
                  <h3 className="max-w-[650px] text-[22px] font-semibold leading-[1.2] tracking-[-0.035em] transition-colors group-hover:text-[#1769ff]">{post.title}</h3>
                  <p className="mt-3 max-w-[650px] text-[14px] leading-6 text-[#667085]">{post.excerpt}</p>
                </a>
              ))}
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
