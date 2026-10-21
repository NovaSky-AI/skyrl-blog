import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, GitBranch } from 'lucide-react'
import { assetUrl, formatDate, getPost, getPosts, renderPost } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  const images = post.hero ? [assetUrl(post, post.hero)] : undefined
  return {
    metadataBase: new URL('https://blog.skyrl.ai'),
    title: `${post.title} — SkyRL Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article', images },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)
  if (!post) notFound()
  const { html, toc } = renderPost(post)

  return (
    <main className="min-h-screen bg-white text-[#10131a]">
      <header className="border-b border-[#e7e8eb]">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-8 sm:px-12 lg:px-20">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-[-0.04em]">
            <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-[8px] bg-[#1769ff] text-white">
              <img src="https://github.com/NovaSky-AI.png" alt="NovaSky AI" className="h-full w-full object-cover" />
            </span>
            <span className="text-[19px]">SkyRL</span>
          </Link>
          <nav className="flex items-center gap-6 text-[14px] font-medium text-[#667085]">
            <Link href="/" className="flex items-center gap-2 transition-colors hover:text-[#1769ff]"><ArrowLeft size={16} /> Blog</Link>
            <a href="https://github.com/NovaSky-AI/SkyRL" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors hover:text-[#1769ff]"><GitBranch size={16} /> GitHub</a>
          </nav>
        </div>
      </header>
      <article className="w-full bg-white pb-24 pt-16 sm:pt-20">
        <style>{`
          .document-body { box-sizing: border-box; max-width: 1200px; margin: 0 auto; padding: 0 32px 96px; color: #667085; background: #fff; font-family: Arial, sans-serif; font-size: 17px; line-height: 1.75; }
          .document-body h2 { margin: 64px 0 20px; padding-top: 30px; color: #10131a; border-top: 1px solid #e7e8eb; font-family: Arial, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -.045em; line-height: 1.12; scroll-margin-top: 24px; }
          .document-body h3 { margin: 38px 0 14px; color: #10131a; font-family: Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -.03em; line-height: 1.25; scroll-margin-top: 24px; }
          .document-body p { margin: 0 0 18px; }
          .document-body strong { color: #10131a; }
          .document-body ul, .document-body ol { margin: 0 0 22px; padding-left: 26px; list-style: disc; }
          .document-body ol { list-style: decimal; }
          .document-body li { margin: 10px 0; padding-left: 3px; }
          .document-body a { color: #1769ff; text-decoration-line: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
          .document-body a:hover { color: #0b4dcc; }
          .document-body img { display: block; max-width: 100%; height: auto; margin: 38px auto; border: 1px solid #e7e8eb; border-radius: 12px; }
          .document-body p:has(> img) + p:has(> em:only-child) { max-width: 760px; margin: -20px auto 40px; color: #98a2b3; font-size: 14px; line-height: 1.6; text-align: center; }
          .document-body p:has(> img) + p:has(> em:only-child) em { font-style: normal; }
          .document-body pre { overflow-x: auto; margin: 28px 0; padding: 22px; border: 1px solid #e7e8eb; border-radius: 12px; background: #f8f9fb; color: #202124; font: 14px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
          .document-body code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .document-body :not(pre) > code { padding: 2px 5px; border-radius: 4px; background: #f2f4f7; color: #344054; font-size: .92em; }
          .document-body blockquote { margin: 28px 0; padding-left: 20px; border-left: 3px solid #e7e8eb; }
          .document-body table { display: block; overflow-x: auto; width: 100%; margin: 28px 0 32px; border-collapse: collapse; font-size: 15px; line-height: 1.6; }
          .document-body th, .document-body td { padding: 12px 16px; border-bottom: 1px solid #e7e8eb; text-align: left; vertical-align: top; }
          .document-body th { color: #10131a; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; border-bottom-color: #c4cbd6; }
          .document-body td:first-child { min-width: 170px; color: #10131a; }
          @media (min-width: 640px) { .document-body { padding-left: 48px; padding-right: 48px; } }
          @media (min-width: 1024px) { .document-body { padding-left: 80px; padding-right: 80px; } }
          @media (max-width: 640px) { article { padding-top: 56px; } .document-body { font-size: 16px; } .document-body h2 { margin-top: 44px; padding-top: 22px; font-size: 28px; } }
        `}</style>
        <div className="mx-auto mb-12 max-w-[1200px] px-8 sm:px-12 lg:px-20">
          <div className="mb-8 flex items-center gap-3 text-[11px] font-bold tracking-[0.16em] text-[#1769ff]">
            <span>{post.tag}</span>
            <span className="h-1 w-1 rounded-full bg-[#c4cbd6]" />
            <time dateTime={post.date} className="font-normal tracking-normal text-[#8a93a2]">{formatDate(post.date)}</time>
            {post.draft && <span className="rounded bg-[#fff4e5] px-2 py-0.5 tracking-normal text-[#b54708]">DRAFT</span>}
          </div>
          <h1 className="text-[clamp(42px,5vw,64px)] font-bold leading-[1.03] tracking-[-0.065em] text-[#10131a]">{post.title}</h1>
          <p className="mt-6 text-[17px] text-[#667085]">By <span className="font-semibold text-[#10131a]">{post.authors}</span></p>
          {post.hero && <img src={assetUrl(post, post.hero)} alt={post.heroAlt} className="mt-12 w-full rounded-[12px] border border-[#e7e8eb]" />}
          {toc.length > 0 && (
            <nav aria-labelledby="toc-heading" className="mt-12 rounded-[12px] border border-[#e7e8eb] bg-[#fafbfc] px-6 py-6 sm:px-8">
              <p id="toc-heading" className="mb-4 text-[11px] font-bold tracking-[0.16em] text-[#98a2b3]">CONTENTS</p>
              <ol className="gap-x-12 sm:columns-2">
                {toc.map((entry, index) => (
                  <li key={entry.id} className="break-inside-avoid">
                    <a href={`#${entry.id}`} className="group flex items-baseline gap-3 py-1 text-[15px] font-medium text-[#10131a] transition-colors hover:text-[#1769ff]">
                      <span className="w-5 shrink-0 text-[12px] tabular-nums text-[#98a2b3] group-hover:text-[#1769ff]">{String(index + 1).padStart(2, '0')}</span>
                      {entry.text}
                    </a>
                    {entry.children.length > 0 && (
                      <ul className="mb-1 ml-8 border-l border-[#e7e8eb] pl-4">
                        {entry.children.map((child) => (
                          <li key={child.id}><a href={`#${child.id}`} className="block py-0.5 text-[14px] text-[#667085] transition-colors hover:text-[#1769ff]">{child.text}</a></li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
        <div className="document-body" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  )
}
