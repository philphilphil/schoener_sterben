# Magazin Redesign — Design Document

## Summary

Redesign "Schöner Sterben" with an editorial magazine aesthetic. Asymmetric grid homepage, strong typographic hierarchy, Draculitos blackletter masthead contrasted with clean serif/sans editorial typography. Crimson accent color.

## Identity

- **Masthead**: "Schöner Sterben" in Draculitos (self-hosted), large, centered
- **Subtitle**: "Ein Opernblog" in Outfit, small caps, letter-spaced
- **Personality**: serious editorial structure meets punk/metal energy — "opera, but not stuffy"

## Typography

| Role | Font | Weight | Source |
|------|------|--------|--------|
| Masthead | Draculitos | normal | self-hosted (`public/fonts/`) |
| Headlines | Libre Baskerville | 700 | Google Fonts |
| Body | Crimson Pro | 400, 400i | Google Fonts |
| Nav/UI/tags | Outfit | 500, 600 | Google Fonts |

## Color Palette

| Role | Hex |
|------|-----|
| Background | `#fafafa` |
| Text | `#1a1a1a` |
| Accent (links, hover, highlights) | `#9b1b30` |
| Muted (dates, meta, excerpts) | `#6b6b6b` |
| Dividers | `#e0e0e0` |

## Homepage Layout

- Centered Draculitos masthead + subtitle
- Navigation bar: uppercase Outfit links, thin black rules above and below
- Asymmetric grid below nav:
  - Left (~60%): one large featured post (newest)
  - Right (~40%): two smaller posts, stacked
- Each post card: optional image + tag label + headline + excerpt + date
- Posts without images: text-only card (tag + headline + excerpt + date)
- Tag labels: 1px bordered rectangles, crimson color on hover
- No "Aktuelles" sidebar (redundant with few posts — add later when 10+ posts exist)

## Article View

- Single-column, ~700px max-width, centered
- "← Zurück" back link
- Tag + date meta line
- Headline in Libre Baskerville
- Optional featured image
- Pullquote (TLDR) with crimson left border, Playfair Display or Libre Baskerville bold
- Collapsible "Handlung" details section
- Blockquote in italic Crimson Pro
- "Empfohlene Aufnahmen" section with type badges (bordered labels)
- Premiere info at bottom
- Crimson accent for all links and interactive elements

## Content Schema Change

Add optional `image` field to post frontmatter in `src/content.config.ts`:
- Field: `image` (string, optional) — path to featured image
- Layout adapts: with image = image card, without = text-only card
- Public domain opera art (Wikimedia Commons, Met Open Access, etc.) for imagery

## Design Decisions

1. **Draculitos masthead only** — blackletter for post titles would hurt readability
2. **No "Aktuelles" section** — redundant with 4 posts, add when content grows
3. **Optional images** — flexible, no pressure to find art for every post
4. **Crimson accent** — opera curtains, drama, blood — fits "Schöner Sterben" identity
5. **No dark mode** — the magazine aesthetic is inherently light

## Reference

Prototype: `proposals/proposal-b-magazin.html`
Inspiration: Surplus magazine layout (asymmetric grid, editorial density)
