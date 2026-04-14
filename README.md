# Schöner Sterben

Personal opera blog. Astro 5, static, deployed at [schoenersterben.de](https://schoenersterben.de).

```sh
npm run dev      # localhost:4321
npm run build    # → ./dist/
```

Posts live in `src/content/posts/`. See `.claude/CLAUDE.md` for architecture notes.

## Custom Astro Behavior

This project has one custom Astro integration for working with drafts outside the repo in an obsidian vault:

- If `DRAFTS_PATH` is set in `.env`, `astro.config.mjs` loads `src/integrations/drafts.ts`.
- In `dev`, that integration copies `.md` files from the external drafts folder into `src/content/drafts/` as `.mdx`, keeps them in sync, and watches the source folder for changes.
- The `drafts` content collection is defined in `src/content.config.ts`, so synced drafts can be rendered through the normal Astro content APIs.
- Draft routes live at `/drafts/` and `/drafts/[slug]/`, but only in development. The header link is also only shown in `dev` when `DRAFTS_PATH` exists.
- In non-dev builds, the integration clears `src/content/drafts/` so synced local drafts never leak into production output.

## Utility Scripts

Helpers in `utils/` support drafting, publishing, and text-to-speech workflows:

- `utils/prepare-tts.py <input_file> [output_file]` reads a post, loads instructions from `utils/TTS-Prep-Prompt.md`, and runs `codex exec` to turn the source Markdown/MDX into narration-friendly plain text. It strips frontmatter and MDX-only sections, keeps the article structure, and lightly rewrites passages for spoken German. Use `--dry-run` to inspect the resolved paths and model config without generating output.
- `utils/generate-tts.py [input_file] [output_file]` reads the prepared narration text, loads voice settings from `utils/TTS-Prompt.md`, and sends it to the OpenAI speech API. It splits long inputs into chunks, generates audio per chunk, and concatenates the result with `ffmpeg`. It requires `OPENAI_API_KEY` in the environment or `.env`. `--max-chars` controls chunk size, and `--dry-run` prints the resolved config only.
- `utils/publish_post.sh <draft-name>` publishes a draft from the external drafts folder configured via `DRAFTS_PATH` in `.env`. It validates required frontmatter (`title`, `slug`, `summary`, `tags`, `date`), copies the draft into `src/content/posts/` as `<date>_<slug>.mdx`, and then moves the original source file into a sibling `Posted/` folder.

Supporting files in `utils/`:

- `utils/TTS-Prep-Prompt.md` contains the transformation rules and default model settings for `prepare-tts.py`.
- `utils/TTS-Prompt.md` contains the voice, speed, and narration style settings for `generate-tts.py`.
- `utils/blog_sparring_CLAUDE.md` is a review prompt for critically checking opera blog posts for factual accuracy and concept fit.
