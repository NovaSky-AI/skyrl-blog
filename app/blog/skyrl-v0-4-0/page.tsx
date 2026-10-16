import fs from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { ArrowLeft, GitBranch } from 'lucide-react'

async function getDocumentMarkup() {
  const sourcePath = path.join(process.cwd(), 'public/blog/skyrl-v0-4-0/source.html')
  const source = await fs.readFile(sourcePath, 'utf8')
  const rawBody = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? source
  const body = rawBody
    .replace(/\sstyle=("[^"]*"|'[^']*')/gi, '')
    .replace(/(@casper_hansen)(?![^<]*<\/a>)/g, '<a href="https://x.com/casper_hansen_" target="_blank" rel="noreferrer">$1</a>')
  return { body }
}

export default async function SkyRLV040Page() {
  const { body } = await getDocumentMarkup()

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
          .document-body { box-sizing: border-box; max-width: 1200px; margin: 0 auto; padding: 0 0 96px; color: #667085; background: #fff; font-family: Arial, sans-serif; font-size: 17px; line-height: 1.75; }
          .document-body > h1:first-child { margin: 0 0 20px !important; color: #10131a !important; font-size: 32px !important; font-weight: 700 !important; letter-spacing: -.045em !important; line-height: 1.12 !important; }
          .document-body > h1:first-child + p { max-width: none; margin-bottom: 18px; color: #667085; font-size: 17px; line-height: 1.75; }
          .document-body > h1:first-child ~ ul[class*="-0"] { max-width: none; margin: 0; padding-left: 26px; color: #667085; font-size: 17px; line-height: 1.75; list-style: disc; }
          .document-body > h1:first-child ~ ul[class*="-0"] > li { position: static; margin: 7px 0 0; padding-left: 3px; }
          .document-body > h1:first-child ~ ul[class*="-1"] { max-width: none; margin: 0 0 0; padding-left: 52px; color: #667085; font-size: 17px; line-height: 1.75; list-style: circle; }
          .document-body > h1:first-child ~ ul[class*="-1"] > li { position: static; margin: 7px 0; padding-left: 3px; }
          .document-body > h1:first-child ~ ul[class*="-0"] + ul[class*="-0"] { margin-top: 18px; }
          .document-body > h1:first-child ~ ul[class*="-0"] + ul[class*="-1"] + ul[class*="-0"] { margin-top: 18px; }
          .document-body h1 { margin: 0 0 28px !important; color: #10131a !important; font-family: Arial, sans-serif !important; font-size: 32px !important; font-weight: 700 !important; letter-spacing: -.045em !important; line-height: 1.12 !important; text-shadow: none !important; }
          .document-body > h1:first-child { margin-top: 0 !important; padding-top: 0; border-top: 0; }
          .document-body h2 { margin: 64px 0 20px; padding-top: 30px; color: #10131a; border-top: 1px solid #e7e8eb; font-family: Arial, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -.045em; line-height: 1.12; }
          .document-body > ul { margin: 22px 0 26px; padding-left: 24px; list-style: disc; }
          .document-body > ul > li { margin: 0 0 18px; padding-left: 4px; }
          .document-body > ul > li > ul { margin: 10px 0 0; padding-left: 24px; list-style: circle; }
          .document-body > ul > li > ul > li { margin: 7px 0; padding-left: 3px; }
          .document-body > ul + h2 { margin-top: 58px; }
          .document-body h3 { margin: 38px 0 14px; color: #10131a; font-family: Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -.03em; line-height: 1.25; }
          .document-body p { margin: 0 0 18px; }
          .document-body ul, .document-body ol { margin: 0 0 22px; padding-left: 26px; }
          .document-body li { margin: 7px 0; padding-left: 3px; }
          .document-body a { color: #1769ff; text-decoration-line: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
          .document-body a:hover { color: #0b4dcc; }
          .document-body img { display: block; max-width: 100%; height: auto; margin: 38px auto; border: 1px solid #e7e8eb; border-radius: 12px; }
          .document-body pre { overflow-x: auto; margin: 28px 0; padding: 22px; border: 1px solid #e7e8eb; border-radius: 12px; background: #f8f9fb; color: #202124; font: 14px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
          .document-body code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
          .document-body :not(pre) > code { padding: 2px 5px; border-radius: 4px; background: #f2f4f7; color: #344054; font-size: .92em; }
          @media (max-width: 640px) { article { padding-top: 56px; } .document-body { padding: 0 24px 60px; font-size: 16px; } .document-body h1 { font-size: 28px !important; } .document-body h2 { margin-top: 44px; padding-top: 22px; font-size: 28px; } }
        `}</style>
        <div className="mx-auto mb-14 max-w-[1200px] px-6 lg:px-0">
          <div className="mb-8 flex items-center gap-3 text-[11px] font-bold tracking-[0.16em] text-[#1769ff]"><span>RELEASE</span><span className="h-1 w-1 rounded-full bg-[#c4cbd6]" /><span className="font-normal tracking-normal text-[#8a93a2]">SkyRL v0.4.0 · 2026</span></div>
          <h1 className="!mb-0 !text-[clamp(42px,5vw,64px)] !font-bold !leading-[1.03] !tracking-[-0.065em] !text-[#10131a]">SkyRL v0.4.0 Release</h1>
        </div>
        <div className="document-body" dangerouslySetInnerHTML={{ __html: body }} />
        <section className="mx-auto mt-4 max-w-[1200px] border-t border-[#e7e8eb] px-6 pt-12 lg:px-0" aria-labelledby="github-release-heading">
          <h2 id="github-release-heading" className="text-[32px] font-bold tracking-[-0.045em] text-[#10131a]">Github Release</h2>
          <p className="mt-4 text-[17px] leading-8 text-[#667085]">Read the full SkyRL v0.4.0 release notes and access the latest code on GitHub.</p>
          <a href="https://github.com/NovaSky-AI/SkyRL/releases/tag/skyrl-v0.4.0" target="_blank" rel="noreferrer" className="mt-3 inline-block text-[17px] text-[#1769ff] underline decoration-1 underline-offset-4 hover:text-[#0b4dcc]">View SkyRL v0.4.0 on GitHub</a>
        </section>
      </article>
    </main>
  )
}
