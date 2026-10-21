'use client'

import { useEffect, useRef, useState } from 'react'
import type { TocEntry } from '@/lib/posts'

// A heading counts as the current section once its top passes this far down the viewport.
const ACTIVE_OFFSET = 120

/** Sticky contents for wide screens; highlights the section being read and expands its subsections. */
export function TocSidebar({ toc }: { toc: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ids = toc.flatMap((entry) => [entry.id, ...entry.children.map((child) => child.id)])
    const headings = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    let frame = 0
    const update = () => {
      frame = 0
      let current: string | null = null
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > ACTIVE_OFFSET) break
        current = heading.id
      }
      // At the very bottom the last sections may never reach the offset; treat the last one as current.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && headings.length > 0) {
        current = headings[headings.length - 1].id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [toc])

  // Keep the highlighted entry in view when the list is taller than the window.
  useEffect(() => {
    const nav = navRef.current
    const link = active && nav?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (!nav || !link) return
    // Scroll only the list, never the page.
    const top = link.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop
    if (top < nav.scrollTop) nav.scrollTop = top - 8
    else if (top + link.offsetHeight > nav.scrollTop + nav.clientHeight) nav.scrollTop = top + link.offsetHeight - nav.clientHeight + 8
  }, [active])

  const activeSection = toc.find((entry) => entry.id === active || entry.children.some((child) => child.id === active))?.id

  return (
    <nav ref={navRef} aria-label="Contents" className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-4 pr-2">
      <p className="mb-4 text-[11px] font-bold tracking-[0.16em] text-[#98a2b3]">CONTENTS</p>
      <ol className="border-l border-[#e7e8eb]">
        {toc.map((entry) => {
          const isSection = entry.id === activeSection
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                data-id={entry.id}
                aria-current={entry.id === active ? 'location' : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-4 text-[14px] leading-[1.4] transition-colors hover:text-[#1769ff] ${
                  isSection ? 'border-[#1769ff] font-semibold text-[#10131a]' : 'border-transparent text-[#667085]'
                }`}
              >
                {entry.text}
              </a>
              {isSection && entry.children.length > 0 && (
                <ul className="mb-1">
                  {entry.children.map((child) => (
                    <li key={child.id}>
                      <a
                        href={`#${child.id}`}
                        data-id={child.id}
                        aria-current={child.id === active ? 'location' : undefined}
                        className={`block py-1 pl-7 text-[13px] leading-[1.4] transition-colors hover:text-[#1769ff] ${
                          child.id === active ? 'text-[#1769ff]' : 'text-[#8a93a2]'
                        }`}
                      >
                        {child.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
