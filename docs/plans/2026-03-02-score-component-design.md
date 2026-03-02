# Score Component Design

## Goal

Display short musical scores (single melody lines) with MIDI-style playback in blog posts. Used for leitmotifs, vocal themes, and melodic examples in opera reviews.

## Approach

Use [abcjs](https://www.abcjs.net/) (v6.x) — a JavaScript library that renders ABC notation as SVG and includes a Web Audio synth for playback. Single npm dependency, client-side rendering.

## Component API

```mdx
import Score from '../../components/Score.astro';

<Score
  abc="X:1\nK:Db\nL:1/8\n|: d2 ef | g2 fe :| "
  title="La donna è mobile"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `abc` | string | (required) | ABC notation string |
| `title` | string | — | Caption below the score |
| `playback` | boolean | `true` | Show play/stop controls |

## Architecture

1. **Score.astro** renders a static HTML shell: score container `<div>`, play/stop button, optional caption
2. **`<script>` block** imports abcjs, finds all `.notenbeispiel` containers, calls `abcjs.renderAbc()` for SVG rendering, sets up `abcjs.synth` for playback
3. **Lazy loading** via Astro's deferred `<script>` tag — abcjs only loads after page is interactive

## Styling

- All styles in `global.css` following project convention
- CSS variables for dark/light theme support (abcjs SVG elements are styleable via CSS classes)
- Minimal play/stop button consistent with blog aesthetic

## Files

| Action | File |
|--------|------|
| Create | `src/components/Score.astro` |
| Modify | `src/styles/global.css` |
| Modify | `package.json` (add `abcjs`) |
