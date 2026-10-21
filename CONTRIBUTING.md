# Writing a post for the SkyRL blog

Posts are Markdown files in this repository. Open a pull request with your post; once it is merged into `main`,
the site deploys to [blog.skyrl.ai](https://blog.skyrl.ai) automatically.

## 1. Add your post

1. Pick a short, URL-friendly slug, for example `async-rl-on-tpus`. The post will live at `/blog/async-rl-on-tpus`.
2. Copy [`content/posts/_template.md`](content/posts/_template.md) to `content/posts/<slug>.md` and fill in the
   frontmatter:

   | Field | Required | Meaning |
   |---|---|---|
   | `title` | yes | Post title |
   | `date` | yes | Publication date, `YYYY-MM-DD` |
   | `tag` | yes | `RELEASE`, `RESEARCH`, `ENGINEERING` or `CASE STUDY` |
   | `authors` | yes | Byline, e.g. `Jane Doe and the SkyRL team` |
   | `excerpt` | yes | One or two sentences for the homepage and link previews |
   | `label` | no | Text next to the date on the homepage (default `SkyRL`) |
   | `hero` | no | Hero image file name in `public/blog/<slug>/`; also used as the link-preview image |
   | `heroAlt` | no | Alt text for the hero image (defaults to the title) |
   | `featured` | no | `true` shows the post in the homepage's featured card; the newest featured post wins |
   | `draft` | no | `true` hides the post everywhere except local preview |

3. Put images in `public/blog/<slug>/` and reference them from the post as `./figure.png`. An italic paragraph
   directly after an image (`*Note: ...*`) is shown as that image's caption. Keep each image under
   about 1 MB (1600-2000 px wide is plenty).
4. Write the body in Markdown below the frontmatter. `##` and `###` headings make up the table of contents. Tables,
   code blocks and inline HTML work. Don't repeat the title or byline in the body.

Writing in Google Docs works too: export with **File → Download → Markdown (.md)**, then delete the title, byline and
any table-of-contents lines at the top. Explicit heading ids from the export (`## Heading {#heading}`) are kept.

## 2. Preview it locally

You need Node.js 22 or newer.

```bash
corepack enable          # once; provides the pnpm version pinned in package.json
pnpm install
pnpm dev                 # http://localhost:3000, reloads as you edit
```

Open `http://localhost:3000/blog/<slug>`. Drafts are visible in this preview. Before opening a pull request, check
that the production build passes:

```bash
pnpm build
```

## 3. Open a pull request

Commit the post and its images and open a pull request against `main`. The pull request runs the same build. When
the post is ready to publish, set `draft: false` (or remove the line). Merging into `main` publishes it.

## Linking to a post hosted elsewhere

To list a post that lives on another site, add an entry to [`content/external-posts.json`](content/external-posts.json)
with `title`, `date`, `tag`, `label`, `excerpt` and `href`. It appears on the homepage and links out.
