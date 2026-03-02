# Score Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `<Score>` MDX component that renders ABC notation as sheet music with MIDI-style playback using abcjs.

**Architecture:** Astro component renders a static HTML shell (score div, play button, caption). A client-side `<script>` imports abcjs, renders SVG notation into each container, and wires up Web Audio synth playback on button click. All styling in global.css with theme support.

**Tech Stack:** Astro 5, abcjs 6.x, Web Audio API

---

### Task 1: Install abcjs dependency

**Files:**
- Modify: `package.json`

**Step 1: Install abcjs**

Run: `npm install abcjs`

**Step 2: Verify installation**

Run: `npm ls abcjs`
Expected: `abcjs@6.x.x` listed

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add abcjs dependency for score rendering"
```

---

### Task 2: Create Score.astro component

**Files:**
- Create: `src/components/Score.astro`

**Step 1: Create the component**

```astro
---
interface Props {
  abc: string;
  title?: string;
  playback?: boolean;
}

const { abc, title, playback = true } = Astro.props;
const id = `score-${Math.random().toString(36).slice(2, 9)}`;
---

<div class="notenbeispiel" id={id} data-abc={abc} data-playback={playback.toString()}>
  <div class="notenbeispiel-notation"></div>
  {playback && (
    <div class="notenbeispiel-controls">
      <button class="notenbeispiel-play" type="button" aria-label="Abspielen">
        <svg class="notenbeispiel-icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
        <svg class="notenbeispiel-icon-stop" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
      </button>
    </div>
  )}
  {title && <p class="notenbeispiel-titel">{title}</p>}
</div>

<script>
  import abcjs from 'abcjs';

  function initScores() {
    document.querySelectorAll<HTMLElement>('.notenbeispiel').forEach((container) => {
      // Skip already-initialized
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      const abc = container.dataset.abc;
      if (!abc) return;

      const notationEl = container.querySelector<HTMLElement>('.notenbeispiel-notation');
      if (!notationEl) return;

      // Render the score as SVG
      const visualObj = abcjs.renderAbc(notationEl, abc, {
        responsive: 'resize',
        add_classes: true,
      });

      // Set up playback if enabled
      const playBtn = container.querySelector<HTMLButtonElement>('.notenbeispiel-play');
      if (!playBtn || container.dataset.playback === 'false') return;

      const iconPlay = playBtn.querySelector<SVGElement>('.notenbeispiel-icon-play');
      const iconStop = playBtn.querySelector<SVGElement>('.notenbeispiel-icon-stop');

      let synthControl: ReturnType<typeof abcjs.synth.CreateSynth.prototype.constructor> | null = null;
      let isPlaying = false;

      playBtn.addEventListener('click', async () => {
        if (isPlaying && synthControl) {
          synthControl.stop();
          isPlaying = false;
          if (iconPlay) iconPlay.style.display = '';
          if (iconStop) iconStop.style.display = 'none';
          return;
        }

        try {
          const audioContext = new AudioContext();
          synthControl = new abcjs.synth.CreateSynth();

          await synthControl.init({
            visualObj: visualObj[0],
            audioContext,
            millisecondsPerMeasure: visualObj[0].millisecondsPerMeasure(),
          });

          await synthControl.prime();
          synthControl.start();
          isPlaying = true;

          if (iconPlay) iconPlay.style.display = 'none';
          if (iconStop) iconStop.style.display = '';

          // Reset button when playback ends
          const duration = synthControl.prime ? synthControl.duration : 5;
          // Use a fallback: poll for completion
          const checkEnd = setInterval(() => {
            if (synthControl && !synthControl.isRunning?.()) {
              clearInterval(checkEnd);
              isPlaying = false;
              if (iconPlay) iconPlay.style.display = '';
              if (iconStop) iconStop.style.display = 'none';
            }
          }, 250);
        } catch (err) {
          console.error('Score playback error:', err);
        }
      });
    });
  }

  // Init on page load and on Astro view transitions
  initScores();
  document.addEventListener('astro:page-load', initScores);
</script>
```

**Step 2: Verify the component renders without errors**

Run: `npm run dev`
Create a temporary test in any existing MDX post by adding:
```mdx
import Score from '../../components/Score.astro';

<Score abc="X:1\nK:C\nL:1/4\n| C D E F | G A B c |" title="C-Dur Tonleiter" />
```

Navigate to that post at `http://localhost:4321` and verify:
- SVG score renders with notes visible
- Play button appears
- Clicking play produces sound
- Clicking stop halts playback

**Step 3: Remove the test usage from the MDX post**

**Step 4: Commit**

```bash
git add src/components/Score.astro
git commit -m "feat: add Score component for ABC notation with playback"
```

---

### Task 3: Add styles for Score component

**Files:**
- Modify: `src/styles/global.css` (append before any final closing comments)

**Step 1: Add score styles to global.css**

Append to `src/styles/global.css`:

```css
/* ===== Score / Notenbeispiel ===== */
.notenbeispiel {
    margin: 1.5rem 0;
    padding: 1rem;
    background: var(--bg-raised);
    border: 1px solid var(--nl-border);
    border-radius: var(--radius);
    overflow: hidden;
}

.notenbeispiel-notation {
    width: 100%;
}

/* abcjs SVG theme overrides */
.notenbeispiel-notation svg {
    width: 100%;
    max-width: 100%;
}

.notenbeispiel .abcjs-note,
.notenbeispiel .abcjs-beam-elem,
.notenbeispiel .abcjs-rest,
.notenbeispiel .abcjs-clef,
.notenbeispiel .abcjs-key-signature,
.notenbeispiel .abcjs-time-signature {
    fill: var(--text);
}

.notenbeispiel .abcjs-staff {
    stroke: var(--text-muted);
}

.notenbeispiel .abcjs-bar {
    fill: var(--text-muted);
}

.notenbeispiel .abcjs-lyric {
    fill: var(--text-secondary);
}

.notenbeispiel-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--nl-border);
}

.notenbeispiel-play {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: 1px solid var(--nl-border-strong);
    border-radius: var(--radius);
    color: var(--red);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}

.notenbeispiel-play:hover {
    background: var(--red-glow);
    border-color: var(--red);
}

.notenbeispiel-titel {
    margin: 0.5rem 0 0 0;
    font-size: 0.85rem;
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
}
```

**Step 2: Verify styles look correct**

Run the dev server and check:
- Score has a subtle raised background
- Notes are visible in both dark and light theme (toggle with theme button)
- Play button is styled with red accent color
- Title caption is italic, muted, centered

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add styles for Score/Notenbeispiel component"
```

---

### Task 4: Visual verification with Playwright

**Step 1: Start dev server and take screenshots**

Run: `npm run dev`

Add a test score to an existing post temporarily:
```mdx
import Score from '../../components/Score.astro';

<Score abc="X:1\nK:C\nL:1/4\n| C D E F | G A B c |" title="C-Dur Tonleiter" />

<Score abc="X:1\nK:Am\nM:3/4\nL:1/8\n| A2 B2 c2 | d2 e2 f2 | e4 z2 |" title="Mollmelodie" />

<Score abc="X:1\nK:G\nL:1/4\n| G A B d | e d B A | G4 |" playback={false} title="Ohne Wiedergabe" />
```

Use Playwright MCP to:
1. Navigate to the post page
2. Take a screenshot in dark mode → `.playwright-mcp/score-dark.png`
3. Toggle theme, take screenshot in light mode → `.playwright-mcp/score-light.png`
4. Verify scores render correctly in both themes

**Step 2: Remove test scores from the post**

**Step 3: Commit any style adjustments**

---

### Task 5: Build verification

**Step 1: Run production build**

Run: `npm run build`
Expected: Build completes without errors, abcjs is bundled

**Step 2: Preview production build**

Run: `npm run preview`
Navigate to a page with a score, verify rendering and playback work

**Step 3: Final commit if any fixes needed**
