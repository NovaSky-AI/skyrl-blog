---
# Copy this file to content/posts/<your-slug>.md. The file name is the URL: /blog/<your-slug>.
# Files starting with "_" are ignored by the site.
title: Your post title
# subtitle: Optional smaller grey line under the title; listings show "title subtitle"
# layout: sidebar # optional: wider margins, image captions and a sticky contents sidebar
date: 2026-01-31 # YYYY-MM-DD; the homepage sorts by this
tag: ENGINEERING # RELEASE, RESEARCH, ENGINEERING or CASE STUDY
authors: Your Name and the SkyRL team
label: SkyRL # shown next to the date on the homepage, e.g. "SkyRL + Partner"
excerpt: One or two sentences for the homepage card and link previews.
hero: hero.png # optional; a file in public/blog/<your-slug>/
heroAlt: Describe the hero image
featured: false # true puts the post in the homepage's featured card (newest featured post wins)
draft: true # drafts only show in local preview (pnpm dev); set to false to publish
---

Write the post in Markdown. The title, authors, date and hero image come from the frontmatter above, so
don't repeat them here.

## Use `##` for sections

`##` and `###` headings build the table of contents at the top of the post.

![Describe the figure](./figure.png)

Put images in `public/blog/<your-slug>/` and reference them as `./figure.png`.
