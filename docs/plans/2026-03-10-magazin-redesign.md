# Magazin Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign "Schöner Sterben" from dark hero-animation theme to light editorial magazine layout with Draculitos masthead, asymmetric grid, and crimson accents.

**Architecture:** Replace global.css, rewrite Header/Footer/Homepage/PostLayout/PostCard components. Add optional `image` field to content schema. Keep all existing pages (browse, tags, about, faq, etc.) functional. Remove dark/light theme toggle — magazine is light-only.

**Tech Stack:** Astro 5, self-hosted Draculitos font, Google Fonts (Libre Baskerville, Crimson Pro, Outfit), vanilla CSS, no framework.

**Design doc:** `docs/plans/2026-03-10-magazin-redesign-design.md`
**Prototype reference:** `proposals/proposal-b-magazin.html`

---

## Important Context

- No test framework — verify visually via dev server (`npm run dev` at localhost:4321)
- Current global.css is ~1750 lines. We're replacing it entirely.
- Current site is dark-first with theme toggle. New design is light-only.
- Draculitos font already exists at `public/fonts/Draculitos.woff2`
- iA Writer Quattro V font stays for body text fallback but primary body becomes Crimson Pro
- The prototype HTML in `proposals/proposal-b-magazin.html` is the visual target, with refinements: Draculitos masthead, crimson accent (#9b1b30), no Aktuelles section, optional images

### Color Palette

```
--bg: #fafafa
--text: #1a1a1a
--accent: #9b1b30
--muted: #6b6b6b
--divider: #e0e0e0
```

### Typography

```
Masthead: Draculitos (self-hosted)
Headlines: Libre Baskerville 700 (Google Fonts)
Body: Crimson Pro 400, 400i (Google Fonts)
Nav/UI: Outfit 500, 600 (Google Fonts)
```

---

### Task 1: Create feature branch and update content schema

**Files:**
- Modify: `src/content.config.ts`

**Step 1: Create feature branch**

```bash
git checkout -b feat/magazin-redesign
```

**Step 2: Add optional `image` field to post schema**

In `src/content.config.ts`, add `image: z.string().optional()` to the posts schema, after the `summary` field:

```typescript
image: z.string().optional(),
```

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: No errors. Site loads at localhost:4321.

**Step 4: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: add optional image field to post schema"
```

---

### Task 2: Update BaseLayout — Google Fonts, remove theme toggle, light-only

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Step 1: Replace the BaseLayout**

Key changes:
- Remove `data-theme="dark"` from `<html>` — no default dark theme
- Remove the inline theme-detection script (localStorage dark/light)
- Add Google Fonts preconnect and stylesheet links for Libre Baskerville, Crimson Pro, Outfit
- Keep Draculitos preload (already there)
- Remove iA Writer Quattro V preload (no longer primary font — keep the font-face in CSS as fallback but don't preload)
- Remove `bodyClass` prop — not needed
- Keep Header and Footer component imports

The `<head>` should include:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;1,400&family=Libre+Baskerville:wght@700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="preload" href="/fonts/Draculitos.woff2" as="font" type="font/woff2" crossorigin>
```

Remove the theme toggle script entirely. The `<html>` tag should just be `<html lang="de">`.

**Step 2: Verify — page loads without errors**

```bash
npm run dev
```

Check localhost:4321 — it will look broken (CSS not yet updated) but should load without console errors.

**Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: update BaseLayout for magazine design — Google Fonts, remove theme toggle"
```

---

### Task 3: Replace global.css with magazine design system

**Files:**
- Rewrite: `src/styles/global.css`

This is the largest task. Replace the entire 1750-line CSS file with the new magazine design system. Use the prototype (`proposals/proposal-b-magazin.html`) as the CSS reference, expanded for all site components.

**Step 1: Write the new global.css**

The new CSS must cover these sections (in order):

1. **Font faces** — Keep Draculitos @font-face. Remove iA Writer font-faces (or keep as fallback).
2. **CSS variables** — Single set (no dark/light toggle):
   ```css
   :root {
     --bg: #fafafa;
     --text: #1a1a1a;
     --accent: #9b1b30;
     --muted: #6b6b6b;
     --divider: #e0e0e0;
     --placeholder-start: #e8e4dc;
     --placeholder-end: #d4cfc4;
     --font-display: 'Draculitos', Georgia, serif;
     --font-headline: 'Libre Baskerville', Georgia, serif;
     --font-body: 'Crimson Pro', Georgia, serif;
     --font-ui: 'Outfit', 'Helvetica Neue', sans-serif;
   }
   ```
3. **Reset + base** — box-sizing, body font (Crimson Pro), background, text color, antialiased rendering, line-height 1.7
4. **Header/masthead** — Draculitos centered, large (~60-68px), subtitle in Outfit small-caps
5. **Navigation** — Uppercase Outfit links, thin black rules above/below, centered, evenly spaced
6. **Homepage grid** — Asymmetric grid (1fr 0.68fr), featured post large, side posts stacked
7. **Post cards** — Tag labels (1px bordered), headlines in Libre Baskerville, excerpts in muted Crimson Pro, dates in Outfit. Image optional.
8. **Image placeholders** — Gradient placeholder for posts without images (only where image is expected)
9. **Tag labels** — 1px border, Outfit uppercase, crimson on hover
10. **Article/post layout** — Single-column ~700px, Libre Baskerville headlines, Crimson Pro body 19px, line-height 1.8
11. **Pullquote/TLDR** — Crimson left border, bold Libre Baskerville, large
12. **Blockquotes** — Divider left border, italic, muted
13. **Handlung details** — Collapsible, bordered, Outfit summary, muted body
14. **Recordings** — Type badges (bordered labels), list with dividers
15. **Post meta** — Tags, dates, reading time in Outfit
16. **Browse/archive page** — Adapt to magazine style (keep functional, restyle)
17. **Tags page** — Adapt to magazine style
18. **FAQ page** — Adapt details/summary to magazine style
19. **Footer** — Thin top border, centered text, Outfit small
20. **Responsive** — Breakpoints at 860px and 520px. Grid collapses to single column.
21. **Pagefind search overrides** — Keep any existing pagefind UI styling, adapted to new colors
22. **Utility classes** — Drop cap (Draculitos first letter on articles), link styles

Key differences from current CSS:
- No noise overlay, no glow effects, no pulsing animations
- No hero section with singer background
- No dark theme variables
- No theme toggle button styling
- No hero animation keyframes
- Simpler, flatter design — editorial cleanliness

Refer to the prototype HTML for exact CSS values for the homepage grid, masthead, nav, post cards, article view, recordings, and handlung sections. Adapt and expand for the full site.

**Step 2: Verify — dev server shows new styling**

```bash
npm run dev
```

The homepage will still show old HTML structure, so it won't look right yet. But navigation, font loading, and base typography should be visible.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: replace CSS with magazine design system"
```

---

### Task 4: Rewrite Header component — Draculitos masthead + editorial nav

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: Replace Header component**

New structure:
```html
<header class="site-header">
  <div class="container">
    <a href="/" class="masthead">Schöner Sterben</a>
    <div class="subtitle">Ein Opernblog</div>
  </div>
  <nav class="site-nav">
    <div class="container">
      <ul>
        <li><a href="/#beitraege">Blog</a></li>
        <li><a href="/browse/">Archiv</a></li>
        <li><a href="/faq/">Opern-FAQ</a></li>
        <li><a href="/about/">Über</a></li>
      </ul>
    </div>
  </nav>
</header>
```

Remove:
- Theme toggle button and its script
- Logo visibility toggling based on hero intersection
- Fixed positioning / backdrop-filter
- All JavaScript in the Header component

The header is now static (not fixed), purely structural.

**Step 2: Verify**

Dev server — header should show Draculitos masthead + nav links.

**Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: editorial header with Draculitos masthead"
```

---

### Task 5: Rewrite Footer component

**Files:**
- Modify: `src/components/Footer.astro`

**Step 1: Simplify Footer**

```html
<footer class="site-footer">
  <div class="container">
    <p>Schöner Sterben — Ein Opernblog</p>
    <nav class="footer-links">
      <a href="/impressum/">Impressum</a>
      <a href="/datenschutz/">Datenschutz</a>
      <a href="/rss.xml">RSS</a>
    </nav>
  </div>
</footer>
```

Keep legal links (Impressum, Datenschutz) and RSS. Remove the "Made by Human" badge unless the user wants to keep it (ask if unsure).

**Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: simplified magazine footer"
```

---

### Task 6: Rewrite Homepage — asymmetric magazine grid

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/PostCard.astro` (or create new component)

**Step 1: Rewrite index.astro**

Remove entirely:
- SingerBackground component import and usage
- Hero section with animations, scroll hint, glow
- The animation-heavy markup

New homepage structure:
```
BaseLayout
  → Header (already done)
  → <main>
      <section class="featured-grid">
        <!-- Large featured post (newest) -->
        <article class="featured-main">
          {post.data.image && <img src={post.data.image} alt="" class="featured-image">}
          <span class="tag">{post.data.tags[0]}</span>
          <h2><a href={postUrl}>{post.data.title}</a></h2>
          <p class="excerpt">{post.data.summary}</p>
          <span class="date">{formattedDate}</span>
        </article>

        <!-- Side posts (2nd and 3rd newest) -->
        <div class="featured-side">
          {sidePosts.map(post => <SidePostCard post={post} />)}
        </div>
      </section>

      <!-- Remaining posts below as simpler list -->
      {remainingPosts.length > 0 && (
        <section class="more-posts">
          <hr class="section-divider">
          <h3 class="section-title">Weitere Beiträge</h3>
          {remainingPosts.map(post => <PostListItem post={post} />)}
        </section>
      )}
    </main>
  → Footer
```

Use `getPublishedPosts()` from `src/utils/posts.ts` to get sorted posts. Split into:
- `featuredPost` = posts[0] (newest)
- `sidePosts` = posts.slice(1, 3)
- `remainingPosts` = posts.slice(3)

Format dates in German locale (`de-DE`).

**Step 2: Update or create PostCard component**

The existing `PostCard.astro` is tightly coupled to the current grid layout (120px date column + content). Either rewrite it or create separate components for the different card sizes:
- Featured main card (large, inline in index.astro)
- Side post card (medium, with optional image)
- Post list item (compact, for "Weitere Beiträge")

Recommend: keep it simple, inline the cards in index.astro for now since each card type has different markup. Refactor into components later if needed.

**Step 3: Remove SingerBackground component reference**

The SingerBackground SVG component (`src/components/SingerBackground.astro`) is no longer imported on the homepage. Don't delete the file yet — just remove the import.

**Step 4: Verify**

Dev server — homepage should show the asymmetric grid with real post data.

**Step 5: Commit**

```bash
git add src/pages/index.astro src/components/PostCard.astro
git commit -m "feat: magazine homepage with asymmetric grid"
```

---

### Task 7: Rewrite PostLayout — editorial article view

**Files:**
- Modify: `src/layouts/PostLayout.astro`

**Step 1: Rewrite PostLayout**

New structure:
```html
<BaseLayout title={title}>
  <main class="article-wrapper">
    <a href="/" class="back-link">← Zurück</a>

    <div class="article-meta">
      {tags && tags.map(tag => <a href={`/tags/${tag}/`} class="tag">{tag}</a>)}
      <span class="meta-date">{formattedDate}</span>
      {readingTime && <span>· {readingTime} Min. Lesezeit</span>}
    </div>

    <h1 class="article-title">
      {title}
      {subtitle && <span class="article-subtitle">{subtitle}</span>}
    </h1>

    {image && <img src={image} alt="" class="article-image">}

    <div class="article-body" data-pagefind-body>
      <slot />
    </div>

    <footer class="article-footer">
      <nav class="post-nav">
        {prevPost && <a href={prevUrl}>← {prevPost.title}</a>}
        {nextPost && <a href={nextUrl}>{nextPost.title} →</a>}
      </nav>
    </footer>
  </main>
</BaseLayout>
```

Key changes:
- Remove the hero-style post header with glow background
- Single-column centered layout (~700px max-width)
- Back link at top
- Tag + date + reading time meta line
- Title in Libre Baskerville
- Optional image below title
- Article body with `data-pagefind-body` for search
- Prev/next navigation at bottom
- Add `image` to the props interface

**Step 2: Verify with an actual post**

Navigate to localhost:4321/posts/strauss-elektra-psychothriller/ — should show the editorial article layout.

**Step 3: Commit**

```bash
git add src/layouts/PostLayout.astro
git commit -m "feat: editorial article layout"
```

---

### Task 8: Update MDX component styles — TLDR, Handlung, Recordings

**Files:**
- Review: `src/components/TLDR.astro`
- Review: `src/components/Handlung.astro`
- Review: `src/components/Recordings.astro`
- Review: `src/components/Recording.astro`

These components use CSS classes that are styled in global.css. The HTML structure should mostly stay the same — the new global.css (Task 3) should include updated styles for these components. But verify that class names match.

**Step 1: Check component HTML against new CSS**

Read each component file. Ensure the class names used in the HTML match what the new global.css targets. If the components use inline `<style>` blocks (Astro scoped styles), those may need updating too.

**Step 2: Adjust component markup if needed**

For example, if TLDR currently uses `class="tldr"` but the new CSS targets `.pullquote`, either update the CSS class name or the component markup. Prefer matching the component to the CSS since multiple components share global.css.

**Step 3: Verify**

Open the Elektra post — TLDR box, Handlung collapsible, and Recordings section should all render correctly with new styling.

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: update MDX components for magazine design"
```

---

### Task 9: Update remaining pages — browse, tags, about, FAQ

**Files:**
- Modify: `src/pages/browse.astro`
- Modify: `src/pages/tags/index.astro`
- Modify: `src/pages/tags/[tag].astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/faq.astro`
- Modify: `src/layouts/ListLayout.astro`
- Modify: `src/pages/404.astro`

**Step 1: Update ListLayout**

ListLayout wraps tag pages. Update to match magazine typography and spacing. It should use the same centered container approach.

**Step 2: Update browse page**

The archive/browse page lists posts chronologically. Restyle to use magazine typography (Libre Baskerville headlines, Crimson Pro body, Outfit dates/meta). Keep the functional structure.

**Step 3: Update tag pages**

Tag index and individual tag pages. Restyle tag pills to use the new bordered label style with crimson hover.

**Step 4: Update about page**

Restyle to match magazine body typography. Centered, max-width ~700px.

**Step 5: Update FAQ page**

Restyle details/summary elements to match magazine aesthetic. Use new font stack.

**Step 6: Update 404 page**

Simple restyle with magazine typography.

**Step 7: Verify each page**

Visit each page on dev server and confirm styling is consistent.

**Step 8: Commit**

```bash
git add src/pages/ src/layouts/ListLayout.astro
git commit -m "feat: update all pages for magazine design"
```

---

### Task 10: Cleanup and build verification

**Files:**
- Possibly delete: `src/components/SingerBackground.astro` (no longer used)
- Possibly delete: `src/components/DraftIcon.astro` (check if still used)
- Remove: Theme toggle references anywhere remaining

**Step 1: Search for dead code**

Check for any remaining references to:
- `SingerBackground`
- `data-theme`
- Theme toggle
- Old CSS class names that no longer exist
- Old animation keyframes

**Step 2: Remove unused components**

Delete files that are no longer imported anywhere.

**Step 3: Full build test**

```bash
npm run build
```

Must complete without errors. Check that Pagefind index builds correctly.

**Step 4: Preview production build**

```bash
npm run preview
```

Navigate through all pages and verify everything works.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dead code and verify build"
```

---

## Execution Notes

- **Task 3 (CSS) is the heaviest task** — it touches every visual aspect. Use the prototype HTML as the primary reference for exact CSS values.
- **Tasks 4-7 can reference the prototype** for exact HTML structure and class names.
- **Task 9 is broad but shallow** — mostly applying the same typography and spacing patterns to existing page structures.
- **Keep dev server running throughout** — verify after each task visually.
- The Playwright MCP can be used for screenshots at each checkpoint. Save to `.playwright-mcp/`.
