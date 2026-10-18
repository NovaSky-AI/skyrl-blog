import Home from '@/components/home'
import { assetUrl, formatDate, getAllPostSummaries, getFeaturedPost } from '@/lib/posts'

export default function Page() {
  const post = getFeaturedPost()
  const featured = post && {
    href: post.href,
    title: post.title,
    excerpt: post.excerpt,
    tag: post.tag,
    label: post.label,
    month: formatDate(post.date, 'month'),
    heroUrl: post.hero ? assetUrl(post, post.hero) : undefined,
    heroAlt: post.heroAlt,
  }
  return <Home posts={getAllPostSummaries()} featured={featured} />
}
