import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { marked } from 'marked'
import { ArrowLeft, GitBranch } from 'lucide-react'

const SLUG = 'day-0-beam'
const ASSET_DIR = `/blog/${SLUG}`
const TAG = 'RELEASE'
const DATE = 'October 16, 2026'
const EXCERPT = 'LoRA, BF16 full fine-tuning, and MXFP8 RL for Reflection’s 501B Beam model on day 0, plus the systems work that made it efficient.'

type Heading = { level: number; id: string; text: string }
type TocEntry = Heading & { children: Heading[] }

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// Google Docs exports escape punctuation (`\-`, `\~`); drop the escapes for plain-text uses.
const unescape = (text: string) => text.replace(/\\([^\w\s])/g, '$1')
const stripLinks = (text: string) => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')

// The markdown is a Google Docs export: `# Title`, a byline, a hand-written list of
// `[Section](#anchor)` links, then the body with `## Heading {#anchor}` headings. The title
// and byline move into the page header and the table of contents is rebuilt from the
// headings, so the hand-written list is dropped.
async function getPost() {
  const source = await fs.readFile(path.join(process.cwd(), 'public', 'blog', SLUG, `${SLUG}.md`), 'utf8')
  const lines = source.replace(/\r\n/g, '\n').split('\n')

  let i = lines.findIndex((line) => line.startsWith('# '))
  const title = unescape(lines[i].slice(2).replace(/\s*\{#[\w-]+\}\s*$/, '').trim())
  i += 1
  while (lines[i]?.trim() === '') i += 1
  const byline = unescape(stripLinks(lines[i].trim()))
  i += 1
  while (lines[i] !== undefined && (lines[i].trim() === '' || /^\[[^\]]+\]\(#[\w-]+\)\s*$/.test(lines[i].trim()))) i += 1

  const headings: Heading[] = []
  let inFence = false
  const body = lines.slice(i).map((line) => {
    if (line.startsWith('```')) inFence = !inFence
    const match = !inFence && line.match(/^(#{2,6})\s+(.+?)(?:\s*\{#([\w-]+)\})?\s*$/)
    if (!match) return line
    const level = match[1].length
    const text = unescape(match[2])
    const id = match[3] ?? slugify(text)
    headings.push({ level, id, text })
    return `<h${level} id="${id}">${marked.parseInline(match[2])}</h${level}>`
  }).join('\n')

  const html = (marked.parse(body, { async: false }) as string)
    .replace(/src="\.\/([^"]+)"/g, `src="${ASSET_DIR}/$1"`)

  const toc: TocEntry[] = []
  for (const heading of headings) {
    if (heading.level === 2) toc.push({ ...heading, children: [] })
    else if (heading.level === 3 && toc.length > 0) toc[toc.length - 1].children.push(heading)
  }

  return { title, byline, html, toc }
}

export async function generateMetadata(): Promise<Metadata> {
  const { title } = await getPost()
  return {
    metadataBase: new URL('https://blog.skyrl.ai'),
    title: `${title} — SkyRL Blog`,
    description: EXCERPT,
    openGraph: { title, description: EXCERPT, type: 'article', images: [`${ASSET_DIR}/hero.png`] },
    twitter: { card: 'summary_large_image', title, description: EXCERPT, images: [`${ASSET_DIR}/hero.png`] },
  }
}

export default async function Day0BeamPage() {
  const { title, byline, html, toc } = await getPost()

  return (
    <main className="min-h-screen bg-white text-[#10131a]">
      <header className="border-b border-[#e7e8eb]">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6 lg:px-0">
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
          .document-body { box-sizing: border-box; max-width: 1200px; margin: 0 auto; padding: 0 24px 96px; color: #667085; background: #fff; font-family: Arial, sans-serif; font-size: 17px; line-height: 1.75; }
          .document-body h2 { margin: 64px 0 20px; padding-top: 30px; color: #10131a; border-top: 1px solid #e7e8eb; font-family: Arial, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -.045em; line-height: 1.12; scroll-margin-top: 24px; }
          .document-body h3 { margin: 38px 0 14px; color: #10131a; font-family: Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -.03em; line-height: 1.25; scroll-margin-top: 24px; }
          .document-body p { margin: 0 0 18px; }
          .document-body strong { color: #10131a; }
          .document-body ul, .document-body ol { margin: 0 0 22px; padding-left: 26px; list-style: disc; }
          .document-body li { margin: 10px 0; padding-left: 3px; }
          .document-body a { color: #1769ff; text-decoration-line: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
          .document-body a:hover { color: #0b4dcc; }
          .document-body img { display: block; max-width: 100%; height: auto; margin: 38px auto; border: 1px solid #e7e8eb; border-radius: 12px; }
          .document-body pre { overflow-x: auto; margin: 28px 0; padding: 22px; border: 1px solid #e7e8eb; border-radius: 12px; background: #f8f9fb; color: #202124; font: 14px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
          .document-body code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .document-body :not(pre) > code { padding: 2px 5px; border-radius: 4px; background: #f2f4f7; color: #344054; font-size: .92em; }
          .document-body table { display: block; overflow-x: auto; width: 100%; margin: 28px 0 32px; border-collapse: collapse; font-size: 15px; line-height: 1.6; }
          .document-body th, .document-body td { padding: 12px 16px; border-bottom: 1px solid #e7e8eb; text-align: left; vertical-align: top; }
          .document-body th { color: #10131a; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; border-bottom-color: #c4cbd6; }
          .document-body td:first-child { min-width: 170px; color: #10131a; }
          @media (min-width: 1024px) { .document-body { padding-left: 0; padding-right: 0; } }
          @media (max-width: 640px) { article { padding-top: 56px; } .document-body { font-size: 16px; } .document-body h2 { margin-top: 44px; padding-top: 22px; font-size: 28px; } }
        `}</style>
        <div className="mx-auto mb-12 max-w-[1200px] px-6 lg:px-0">
          <div className="mb-8 flex items-center gap-3 text-[11px] font-bold tracking-[0.16em] text-[#1769ff]"><span>{TAG}</span><span className="h-1 w-1 rounded-full bg-[#c4cbd6]" /><time className="font-normal tracking-normal text-[#8a93a2]">{DATE}</time></div>
          <h1 className="text-[clamp(42px,5vw,64px)] font-bold leading-[1.03] tracking-[-0.065em] text-[#10131a]">{title}</h1>
          <p className="mt-6 text-[17px] text-[#667085]">By <span className="font-semibold text-[#10131a]">{byline}</span></p>
          <img src={`${ASSET_DIR}/hero.png`} alt="SkyRL × vLLM × Reflection: Day 0 Support for Beam" className="mt-12 w-full rounded-[12px] border border-[#e7e8eb]" />
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
        </div>
        <div className="document-body" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  )
}
