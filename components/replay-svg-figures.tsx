'use client'

import { useEffect } from 'react'

/**
 * Restart animated SVG figures each time they scroll into view. Chrome sometimes leaves an SVG image's
 * animation stalled after a reload; loading the image under a fresh URL fragment gives it a new timeline,
 * so the animation runs and starts from the beginning when the reader reaches it.
 */
export function ReplaySvgFigures({ selector }: { selector: string }) {
  useEffect(() => {
    const images = [...document.querySelectorAll<HTMLImageElement>(`${selector} img[src$=".svg"]`)]
    if (images.length === 0 || !('IntersectionObserver' in window)) return
    let run = 0
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const img = entry.target as HTMLImageElement
          img.src = `${img.src.split('#')[0]}#play-${++run}`
        }
      },
      { threshold: 0.35 },
    )
    images.forEach((img) => observer.observe(img))
    return () => observer.disconnect()
  }, [selector])
  return null
}
