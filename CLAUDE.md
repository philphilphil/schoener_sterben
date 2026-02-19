# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Schöner Sterben" is a German-language opera review blog at https://schoenersterben.com, built with Astro 5.x as a static site.

## Commands

```sh
npm run dev       # Dev server at localhost:4321
npm run build     # Build to ./dist/ + generate Pagefind search index
npm run preview   # Preview production build
```

No test framework or linter is configured.

## Architecture

- **Framework**: Astro 5 with MDX, static output
- **Styling**: Single `src/styles/global.css` file, no CSS framework. Dark/light theme via `data-theme` attribute on `<html>`
- **Fonts**: Self-hosted in `public/fonts/` — Draculitos (display), iA Writer Quattro V (body)
- **Search**: Pagefind (client-side full-text search, index built at build time)
- **TypeScript**: Strict mode. Path alias `@/*` → `src/*`

## Content Collections

Single collection `posts` defined in `src/content.config.ts`. Loads all `*.{md,mdx}` from `src/content/` with IDs preserving the path (e.g., `posts/my-post`).

Content lives in `src/content/posts/`.

**Required frontmatter**: `title` (string), `date` (date)
**Optional**: `draft` (bool, default false), `tags` (string[]), `slug`, `summary`, `hideMeta`, `cssclasses`

Draft posts are excluded from listings/feeds but still built (accessible by direct URL).

## Custom MDX Components

Available for use in posts — must be explicitly imported with relative paths:

- `<TLDR>` — "Why you should listen to this" aside
- `<Handlung title="...">` — Opera plot summary (open `<details>`)
- `<Spoiler title="...">` — Collapsed spoiler block
- `<Collapse summary="..." openByDefault={false}>` — Generic collapsible

Import path from `src/content/posts/`: `../../components/ComponentName.astro`

## Key Files

- `astro.config.mjs` — Site URL, integrations (MDX, sitemap)
- `src/content.config.ts` — Content collection schema
- `src/layouts/BaseLayout.astro` — Root HTML shell
- `src/layouts/PostLayout.astro` — Single post layout with breadcrumbs, meta, prev/next nav
- `src/pages/posts/[...slug].astro` — Individual post rendering

## MCP Tools

- **Playwright**: Use the Playwright MCP for browser automation — visually inspecting pages, taking screenshots, clicking elements, and verifying rendered output. Start the dev server (`npm run dev`) before navigating to `http://localhost:4321`.
- **Astro Docs**: Use the `search_astro_docs` MCP tool to look up Astro framework documentation when unsure about APIs, components, or configuration.
