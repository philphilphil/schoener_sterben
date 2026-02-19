# Redesign Plan: Editorial Magazine

## Vision
Transform the blog from a simple blog template into a boutique opera magazine. Bold typography, dramatic hero section, refined cards with shadows, ornamental CSS dividers. High-end print magazine meets web.

---

## 1. Homepage (`src/pages/index.astro`)

### Hero Section
- Large display of site name "Schöner Sterben" in Draculitos at ~80px, centered
- Subtitle "Oper für alle!" below in italic iA Writer Quattro
- Subtle dark-to-transparent gradient backdrop (using CSS gradient, no images)
- Generous vertical padding (120px top/bottom)
- Thin ornamental divider below (CSS pseudo-element: `— ◆ —` style)

### Featured Post (Latest)
- First post gets a large, full-width card treatment
- Title at ~36px, summary displayed as a pull quote in italic
- Accent-colored left border (4px)
- Slightly elevated with a refined box-shadow
- "Neuester Beitrag" label above in small caps

### Remaining Posts
- 2-column grid on desktop, single column on mobile
- Smaller cards with refined shadow instead of plain border
- Hover: card lifts slightly (translateY + shadow increase)
- Thin top accent line on each card

### Section Dividers
- Between hero and posts: ornamental CSS divider
- Between featured and grid: heading "Weitere Beiträge" with decorative horizontal rules on either side

---

## 2. Navigation (`src/components/Header.astro`)

### Sticky Nav with Backdrop Blur
- `position: sticky; top: 0` with `backdrop-filter: blur(12px)`
- Background becomes semi-transparent on scroll (CSS only: always semi-transparent, blur handles it)
- Slightly reduce header height from 72px to 64px
- Logo stays Draculitos but at a slightly smaller size in nav (48px)
- Nav links: remove uppercase, use normal case with subtle letter-spacing
- Active link: accent underline with 2px offset below text
- Theme toggle: refined circular button with subtle border

### Mobile Menu
- Slide-in from right with overlay backdrop
- Smooth transform transition
- Nav items stacked with generous spacing

---

## 3. Color Palette Refinement (`src/styles/global.css`)

### Light Mode — Warmer, More Contrast
```
--theme:        #faf6f0    (warmer cream)
--entry:        #ffffff    (clean white cards for contrast)
--primary:      #1a0a0a    (deeper near-black)
--secondary:    #6b4c35    (refined warm brown)
--tertiary:     #e8ddd0    (soft tan)
--content:      #2a1515    (dark warm text)
--accent:       #b8292d    (slightly deeper, more sophisticated red)
--accent-dim:   #8a1f1f    (darker hover)
--border:       #e0d5c8    (subtle warm border)
--code-bg:      #f0ebe3    (warm off-white)
--code-block-bg:#1a0a0a    (near-black)
body bg:        #f5f0e8    (warm parchment, slightly lighter than current)
```

### Dark Mode — Richer, Deeper
```
--theme:        #0f0808    (true deep dark)
--entry:        #1a0e0e    (subtle card elevation)
--primary:      #f2ebe0    (warm white)
--secondary:    #c4a882    (warm gold)
--tertiary:     #2a1616    (dark border)
--content:      #e8ddd0    (warm off-white)
--accent:       #d44045    (slightly brighter red for dark bg)
--accent-dim:   #e86060    (lighter hover)
--border:       #2a1616    (subtle border)
```

---

## 4. Typography Enhancements

### Headings
- Post titles: increase to 48px on desktop, tighter line-height (1.1)
- Add subtle letter-spacing (-0.02em) for large headings for editorial feel
- Section headings ("Beiträge", etc.): small-caps treatment with decorative rules

### Body
- Keep iA Writer Quattro at 18px, line-height 1.75 (slightly more generous)
- Increase paragraph spacing slightly

### Drop Cap
- First paragraph of each post gets a CSS drop cap (first-letter pseudo-element)
- Draculitos font, 3 lines tall, accent color, float left

---

## 5. Post Layout (`src/layouts/PostLayout.astro`, `global.css`)

### Article Header
- Title at 48px with tight line-height
- Meta info below with refined separator dots
- Thin ornamental divider between header and content

### Blockquotes
- Large decorative opening quotation mark (") as CSS pseudo-element
- Slightly larger font size, italic
- Left border stays but refined (accent color, 3px)
- Subtle background tint

### TLDR Component
- Refined: subtle gradient left border instead of flat color
- Slightly rounded corners (6px)
- Better typography hierarchy within

### Handlung Component
- Cleaner summary header styling
- Smoother open/close transition (max-height animation)
- Refined border treatment

### Tags
- Pill-shaped with subtle shadow
- Hover: fill with accent color, white text

### Prev/Next Navigation
- Larger, more prominent cards
- Arrow indicators
- Subtle hover lift effect

---

## 6. Footer (`src/components/Footer.astro`)

- Ornamental divider above (matching hero divider style)
- More generous padding
- Cleaner layout: copyright on one line, links on next
- Remove "Theme Vorhang" credit text (or make it very subtle)
- Scroll-to-top button: refined with smooth fade-in

---

## 7. Cards (`src/components/PostCard.astro`)

- White/entry background with refined box-shadow (`0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`)
- On hover: lift effect (`translateY(-2px)`) + stronger shadow
- Thin accent-colored top border (2px)
- Better internal spacing and typography hierarchy
- Press effect stays (scale 0.98 on active)

---

## 8. Other Pages

### Archive (`src/pages/archive.astro`)
- Refined year/month headings with decorative rules
- Better spacing between groups

### Tags (`src/pages/tags/index.astro`)
- Tags displayed as refined pills in a flex-wrap layout
- Size variation based on post count (subtle)

### FAQ (`src/pages/faq.astro`)
- Cleaner details/summary styling
- Better spacing and dividers between categories

### 404 (`src/pages/404.astro`)
- More dramatic: use Draculitos font for "404"
- Add a witty subtitle

---

## 9. Animations & Micro-interactions

- Card hover lifts: `transform: translateY(-2px)` with `transition: all 0.2s ease`
- Nav background transition on scroll (if JS added, otherwise always blurred)
- Smooth theme toggle transition on colors (`transition: background-color 0.3s, color 0.3s` on body)
- Focus-visible states: accent-colored outline for accessibility

---

## Files Changed

| File | Changes |
|------|---------|
| `src/styles/global.css` | Major: new palette, typography, card styles, blockquotes, drop caps, dividers, animations |
| `src/pages/index.astro` | Hero section, featured post, 2-col grid |
| `src/components/Header.astro` | Sticky blur nav, refined styling |
| `src/components/Footer.astro` | Ornamental divider, cleaner layout |
| `src/components/PostCard.astro` | Shadow cards, accent top border, hover lift |
| `src/layouts/PostLayout.astro` | Refined article header, ornamental dividers |
| `src/layouts/BaseLayout.astro` | Minor: color transition on body |
| `src/components/TLDR.astro` | Refined styling |
| `src/components/Handlung.astro` | Refined styling |
| `src/pages/archive.astro` | Refined headings |
| `src/pages/tags/index.astro` | Refined tag pills |
| `src/pages/faq.astro` | Cleaner details styling |
| `src/pages/404.astro` | Draculitos font, subtitle |
