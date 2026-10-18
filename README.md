# SkyRL Blog

[![Build and deploy](https://github.com/NovaSky-AI/skyrl-blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/NovaSky-AI/skyrl-blog/actions/workflows/deploy.yml)

Source for [blog.skyrl.ai](https://blog.skyrl.ai), the blog of the [SkyRL](https://github.com/NovaSky-AI/SkyRL)
project. It is a [Next.js](https://nextjs.org) site; posts are Markdown files.

To write a post, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Local preview

```bash
corepack enable
pnpm install
pnpm dev        # http://localhost:3000
```

## Layout

| Path | Contents |
|---|---|
| `content/posts/<slug>.md` | Posts: frontmatter plus Markdown body, served at `/blog/<slug>` |
| `public/blog/<slug>/` | Images for a post |
| `content/external-posts.json` | Posts hosted elsewhere, listed on the homepage |
| `app/page.tsx`, `components/home.tsx` | Homepage |
| `app/blog/[slug]/page.tsx` | Post page |
| `app/blog/skyrl-v0-4-0/` | The v0.4.0 release post (rendered from a Google Docs HTML export) |
| `lib/posts.ts` | Loading, validating and rendering posts |

## Deployment

Every push to `main` deploys to production through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the site and deploys it with the Vercel CLI. Pull requests run the same build without deploying.

The workflow needs these repository settings:

| Name | Kind | Value |
|---|---|---|
| `VERCEL_TOKEN` | Secret | A Vercel access token with access to the project's team |
| `VERCEL_ORG_ID` | Variable | The Vercel team id (`orgId` in `.vercel/project.json` after `vercel link`) |
| `VERCEL_PROJECT_ID` | Variable | The Vercel project id (`projectId` in `.vercel/project.json`) |

To roll back, promote an earlier deployment: `npx vercel promote <deployment-url-or-id> --scope <team>`.
