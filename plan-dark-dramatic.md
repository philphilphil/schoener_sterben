# Redesign Plan: Dark & Dramatic

## Vision
A cinematic, moody opera blog that defaults to dark mode. Heavy use of accent red, subtle glow effects, gradients, and a sense of theatrical drama. Think movie poster / film noir aesthetic for opera.

---

## 1. Homepage (`src/pages/index.astro`)

### Dark Hero with Glow
- Dark background as default canvas
- Site name "Schöner Sterben" in Draculitos at ~90px, centered
- Subtle red-to-transparent radial gradient glow behind the title (CSS only)
- Subtitle "Oper für alle!" in accent red, italic
- Very generous vertical padding (140px top/bottom)
- Thin red horizontal rule below

### Featured Post (Latest)
- Full-width dark card with subtle red glow on left edge (`box-shadow: inset 4px 0 0 var(--accent), 0 0 20px rgba(196,54,58,0.1)`)
- Large title in cream/white
- Summary as pull quote
- "Neuester Beitrag" label in accent red, uppercase, small

### Remaining Posts
- Single column, stacked (editorial scroll feel)
- Each card has a subtle red left-edge glow on hover
- Minimal: title + date + summary, separated by thin dark rules
- Hover: faint red glow appears around card

---

## 2. Color Palette (`src/styles/global.css`)

### Dark Mode (Default)
```
--theme:        #0a0505    (near-black with warm tint)
--entry:        #120a0a    (very subtle elevation)
--primary:      #f0e8dc    (warm cream text)
--secondary:    #a08868    (muted gold)
--tertiary:     #1e1010    (dark separator)
--content:      #e0d8cc    (warm white body text)
--accent:       #c4363a    (blood red — stays)
--accent-dim:   #e05555    (brighter hover)
--accent-glow:  rgba(196, 54, 58, 0.15)  (NEW: for glow effects)
--border:       #1e1010    (subtle dark border)
--code-bg:      #1a0e0e    (dark code bg)
--code-block-bg:#060303    (near-black)
body bg:        #0a0505
```

### Light Mode (Secondary, for toggle)
```
--theme:        #faf6f0    (warm cream)
--entry:        #f5f0e8    (off-white)
--primary:      #1a0808    (deep near-black)
--secondary:    #6b4c35    (warm brown)
--tertiary:     #e0d5c8    (light tan)
--content:      #2a1212    (dark warm text)
--accent:       #b8292d    (deeper red for light bg)
--accent-dim:   #8a1f1f    (darker hover)
--accent-glow:  rgba(184, 41, 45, 0.08)
--border:       #e0d5c8
```

### Default Theme Switch
- Change `<html data-theme="light">` to `<html data-theme="dark">` in BaseLayout
- Update the localStorage init script accordingly (dark is now default)

---

## 3. Navigation (`src/components/Header.astro`)

### Dark Glass Nav
- `position: sticky; top: 0`
- `backdrop-filter: blur(16px)` with semi-transparent dark background
- Bottom border: thin line with subtle red glow (`box-shadow: 0 1px 0 var(--border), 0 1px 8px var(--accent-glow)`)
- Logo in Draculitos, cream colored
- Nav links: cream, hover turns accent red
- Active link: accent red with glow underline
- Theme toggle: circular, subtle glow ring on hover

### Mobile Menu
- Full-screen dark overlay
- Nav items centered vertically, large text
- Red accent line next to active item

---

## 4. Typography

### Headings
- Post titles: 52px on desktop, cream colored, tight line-height (1.08)
- Negative letter-spacing (-0.03em) for cinematic feel
- On hover (in card context): subtle red text-shadow glow

### Body
- Keep iA Writer Quattro, 18px, line-height 1.75
- Cream/warm white on dark background for easy reading

### Drop Cap
- First paragraph: drop cap in Draculitos, accent red, 3 lines
- Subtle red glow (`text-shadow: 0 0 20px var(--accent-glow)`)

---

## 5. Post Layout (`src/layouts/PostLayout.astro`, `global.css`)

### Article Header
- Title at 52px, cream
- Meta in muted gold (secondary color)
- Red horizontal rule below header (not full width, centered, 60%)

### Blockquotes
- Large red opening quotation mark (") as pseudo-element with glow
- Dark background slightly lighter than page (`var(--entry)`)
- Left border: 3px accent red with glow shadow
- Text in slightly brighter cream

### TLDR Component
- Dark card with red left border glow
- "TL;DR" label in accent red with letter-spacing
- Subtle red glow shadow on the whole aside

### Handlung Component
- Dark card, secondary-colored left border
- Summary in gold/secondary color
- Smooth open/close

### Tags
- Dark pill with red border
- Hover: fill red, white text, subtle glow

### Prev/Next Navigation
- Dark cards with red accent on hover
- Arrow symbols in accent red
- Subtle glow on hover

---

## 6. Footer (`src/components/Footer.astro`)

- Red horizontal rule above (thin, with glow)
- Dark background matching page
- Muted gold text
- Links in accent red
- Minimal, cinematic

---

## 7. Cards (`src/components/PostCard.astro`)

- Dark background (`var(--entry)`)
- Subtle border (`1px solid var(--border)`)
- On hover: red glow effect (`box-shadow: 0 0 20px var(--accent-glow), inset 3px 0 0 var(--accent)`)
- Smooth transition (0.3s ease)
- Press: scale(0.98)
- Title turns slightly brighter on hover

---

## 8. Glow Effects (CSS Custom Utilities)

All glow effects are subtle and CSS-only:

```css
/* Red glow for borders/shadows */
.glow-border {
  box-shadow: 0 0 15px var(--accent-glow);
}

/* Red glow for text (used sparingly) */
.glow-text {
  text-shadow: 0 0 20px var(--accent-glow);
}

/* Radial gradient backdrop */
.glow-backdrop {
  background: radial-gradient(ellipse at center, var(--accent-glow), transparent 70%);
}
```

---

## 9. Other Pages

### Archive
- Year headings in accent red
- Month headings in secondary gold
- Post links with subtle glow on hover

### Tags
- Dark pills with red borders
- Hover glow effect
- Post count in muted secondary

### FAQ
- Dark details/summary
- Red accent on open state
- Red arrow/toggle indicator

### 404
- Giant "404" in Draculitos with red glow
- "Die Oper ist vorbei." subtitle
- Dramatic radial gradient background

---

## 10. Animations & Micro-interactions

- Card hover: glow fades in (transition: box-shadow 0.3s ease)
- Theme toggle: smooth color transitions on all elements (`transition: background-color 0.3s, color 0.3s, border-color 0.3s`)
- Hero title: subtle CSS animation on load (fade-in-up, opacity 0→1, translateY 10px→0, 0.6s)
- Scroll-to-top: red circular button with glow on hover
- Focus-visible: red glow outline for accessibility

---

## Files Changed

| File | Changes |
|------|---------|
| `src/styles/global.css` | Major: new dark-first palette, glow utilities, typography, card styles, blockquotes, drop caps, animations |
| `src/pages/index.astro` | Dark hero with glow, featured post, stacked cards |
| `src/components/Header.astro` | Dark glass nav, glow effects |
| `src/components/Footer.astro` | Red glow divider, dark styling |
| `src/components/PostCard.astro` | Glow hover effects, dark cards |
| `src/layouts/PostLayout.astro` | Refined header, glow blockquotes |
| `src/layouts/BaseLayout.astro` | Default to dark theme, color transitions |
| `src/components/TLDR.astro` | Dark + red glow styling |
| `src/components/Handlung.astro` | Dark + gold border |
| `src/pages/archive.astro` | Red/gold headings |
| `src/pages/tags/index.astro` | Dark glow pills |
| `src/pages/faq.astro` | Dark details styling |
| `src/pages/404.astro` | Dramatic 404 with glow |
