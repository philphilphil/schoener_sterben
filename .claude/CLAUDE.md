# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Schöner Sterben" is a German-language opera blog built with Astro 5.x as a static site.
Live URL: https://schoenersterben.de

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

Draft posts are excluded from listings/feeds and not built in production.

## Custom MDX Components

Available for use in posts — must be explicitly imported with relative paths:

- `<TLDR>` — "Why you should listen to this" aside
- `<Spoiler title="...">` — Collapsed spoiler block
- `<Collapse summary="..." openByDefault={false}>` — Generic collapsible
- `<Handlung>` — Plot summary in a collapsible `<details>` block (open by default)
- `<YouTube id="..." title="..." start={0} posterSrc="..." description="...">` — Privacy-safe YouTube embed (DSGVO/GDPR compliant). No YouTube resources loaded until user clicks the page-level consent button. All embeds on a page load/unload together via a single controller inserted before the first embed. Individual videos can be hidden via "Video ausblenden". Wraps `YouTubeConsentEmbed`. Optional `posterSrc` for a locally-hosted poster image, `description` for context text.
- `<Recordings>` + `<Recording>` — Recommended recordings section. Container `<Recordings>` wraps `<Recording>` items. Props for `<Recording>`: `typ` (string badge, e.g. "Audio"), `label` (string), `links` (array of `{name, url}`)

Import path from `src/content/posts/`: `../../components/ComponentName.astro`

## Key Files

- `astro.config.mjs` — Site URL, integrations (MDX, sitemap)
- `src/content.config.ts` — Content collection schema
- `src/layouts/BaseLayout.astro` — Root HTML shell
- `src/layouts/PostLayout.astro` — Single post layout with breadcrumbs, meta, prev/next nav
- `src/pages/posts/[...slug].astro` — Individual post rendering

## MCP Tools

- **Playwright**: Use the Playwright MCP for browser automation — visually inspecting pages, taking screenshots, clicking elements, and verifying rendered output. Start the dev server (`npm run dev`) before navigating to `http://localhost:4321`. **Save all screenshots to `.playwright-mcp/`** (e.g. `filename: ".playwright-mcp/my-screenshot.png"`).
- **Astro Docs**: Use the `search_astro_docs` MCP tool to look up Astro framework documentation when unsure about APIs, components, or configuration.

# Design Rules

<frontend_aesthetics>
You tend to converge toward generic outputs. Avoid "AI slop."

Typography: Never use Inter, Roboto, Open Sans, Lato, Space Grotesk, 
or system fonts. Load from Google Fonts. Use extreme weight contrasts 
(200 vs 800+), size jumps of 3x+.

Colors: No default Tailwind palette. No purple-on-white. Build palette 
from a single brand color. Use CSS variables. Dominant color + sharp accent.

Backgrounds: No solid white/gray. Layer gradients, noise textures, 
geometric patterns, or contextual effects.

Shadows: No flat shadow-md. Use layered, colored, or offset shadows.

Layout: No centered-card-on-white-page. Use asymmetry, overlap, 
grid-breaking elements, or editorial column structures.
</frontend_aesthetics>
