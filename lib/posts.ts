import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const EXTERNAL_POSTS_FILE = path.join(process.cwd(), 'content', 'external-posts.json')
const TAGS = ['RELEASE', 'RESEARCH', 'ENGINEERING', 'CASE STUDY'] as const

export type Tag = (typeof TAGS)[number]

/** A post as listed on the homepage: either a markdown post in this repo or a link to one elsewhere. */
export type PostSummary = {
  title: string
  date: string
  tag: Tag
  label: string
  excerpt: string
  href: string
  external: boolean
}

export type Post = PostSummary & {
  slug: string
  /** Title as shown on the post page; `title` appends the subtitle for listings and link previews. */
  heading: string
  subtitle?: string
  authors: string
  hero?: string
  heroAlt: string
  featured: boolean
  draft: boolean
  markdown: string
}

export type Heading = { level: number; id: string; text: string }
export type TocEntry = Heading & { children: Heading[] }

const showDrafts = process.env.NODE_ENV === 'development'

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const value = data[key]
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${file}: frontmatter "${key}" is required`)
  return value.trim()
}

function toDate(value: unknown, file: string): string {
  // YAML parses an unquoted 2026-10-16 as a Date.
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${file}: frontmatter "date" must be YYYY-MM-DD`)
  return date
}

function toTag(value: unknown, file: string): Tag {
  const tag = String(value ?? '').toUpperCase()
  if (!(TAGS as readonly string[]).includes(tag)) throw new Error(`${file}: frontmatter "tag" must be one of ${TAGS.join(', ')}`)
  return tag as Tag
}

function readPost(file: string): Post {
  const slug = file.replace(/\.md$/, '')
  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'))
  const heading = requireString(data, 'title', file)
  const subtitle = typeof data.subtitle === 'string' && data.subtitle.trim() ? data.subtitle.trim() : undefined
  const title = subtitle ? `${heading} ${subtitle}` : heading
  return {
    slug,
    title,
    heading,
    subtitle,
    date: toDate(data.date, file),
    tag: toTag(data.tag, file),
    label: typeof data.label === 'string' ? data.label : 'SkyRL',
    excerpt: requireString(data, 'excerpt', file),
    authors: requireString(data, 'authors', file),
    hero: typeof data.hero === 'string' ? data.hero : undefined,
    heroAlt: typeof data.heroAlt === 'string' ? data.heroAlt : title,
    featured: data.featured === true,
    draft: data.draft === true,
    href: `/blog/${slug}`,
    external: false,
    markdown: content,
  }
}

/** Markdown posts under content/posts, newest first. Files starting with "_" (templates) are skipped. */
export function getPosts(): Post[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
    .map(readPost)
    .filter((post) => showDrafts || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug)
}

/** Every post for the homepage list: markdown posts plus content/external-posts.json, newest first. */
export function getAllPostSummaries(): PostSummary[] {
  const external = (JSON.parse(fs.readFileSync(EXTERNAL_POSTS_FILE, 'utf8')) as Record<string, unknown>[]).map(
    (entry, index): PostSummary => {
      const where = `content/external-posts.json[${index}]`
      return {
        title: requireString(entry, 'title', where),
        date: toDate(entry.date, where),
        tag: toTag(entry.tag, where),
        label: requireString(entry, 'label', where),
        excerpt: requireString(entry, 'excerpt', where),
        href: requireString(entry, 'href', where),
        external: !String(entry.href).startsWith('/'),
      }
    },
  )
  const local = getPosts().map(({ title, date, tag, label, excerpt, href, external }) => ({ title, date, tag, label, excerpt, href, external }))
  return [...local, ...external].sort((a, b) => b.date.localeCompare(a.date))
}

/** The newest markdown post marked `featured: true`, else the newest markdown post. */
export function getFeaturedPost(): Post | undefined {
  const posts = getPosts()
  return posts.find((post) => post.featured) ?? posts[0]
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// Google Docs markdown exports escape punctuation (`\-`, `\~`); drop the escapes for plain-text uses.
const unescape = (text: string) => text.replace(/\\([^\w\s])/g, '$1')

/**
 * Render a post body to HTML. Headings get ids (an explicit `## Heading {#id}` wins, as in Google Docs
 * exports), and `##`/`###` headings make up the table of contents. Relative image paths (`./fig.png`)
 * resolve to the post's asset folder, public/blog/<slug>/.
 */
export function renderPost(post: Post): { html: string; toc: TocEntry[] } {
  const headings: Heading[] = []
  let inFence = false
  const body = post.markdown
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      if (line.startsWith('```')) inFence = !inFence
      const match = !inFence && line.match(/^(#{2,6})\s+(.+?)(?:\s*\{#([\w-]+)\})?\s*$/)
      if (!match) return line
      const level = match[1].length
      const text = unescape(match[2])
      const id = match[3] ?? slugify(text)
      headings.push({ level, id, text })
      return `<h${level} id="${id}">${marked.parseInline(match[2])}</h${level}>`
    })
    .join('\n')

  const html = (marked.parse(body, { async: false }) as string).replace(/src="\.\/([^"]+)"/g, `src="/blog/${post.slug}/$1"`)

  const toc: TocEntry[] = []
  for (const heading of headings) {
    if (heading.level === 2) toc.push({ ...heading, children: [] })
    else if (heading.level === 3 && toc.length > 0) toc[toc.length - 1].children.push(heading)
  }
  return { html, toc }
}

export const assetUrl = (post: Post, file: string) => `/blog/${post.slug}/${file.replace(/^\.\//, '')}`

// UTC so the server render and the browser agree on the day.
export const formatDate = (iso: string, style: 'long' | 'short' | 'month' = 'long') =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(
    'en-US',
    style === 'month'
      ? { month: 'long', year: 'numeric', timeZone: 'UTC' }
      : { month: style, day: 'numeric', year: 'numeric', timeZone: 'UTC' },
  )
