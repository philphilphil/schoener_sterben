#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: prepare-tts.sh <markdown-file>"
  exit 1
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/../tts_prep_output.md"

SYSTEM_PROMPT='You prepare German blog posts about opera for text-to-speech narration.

Given a markdown/MDX blog post, produce a clean plain-text version optimized for a German TTS voice (OpenAI gpt-4o-mini-tts). Output ONLY the prepared text, no commentary.

Rules:
1. Remove all frontmatter (---...---), import statements, and MDX/JSX component tags.
2. Remove the TLDR section entirely (tag and content).
3. Replace <Handlung> sections: keep the content but prepend a "Die Handlung" heading.
4. Remove <Recordings>, <Recording>, <YouTube>, <Score>, <Spoiler>, <Collapse> blocks entirely (tags and content for Recordings/YouTube/Score; for Spoiler/Collapse keep inner text but remove tags).
5. Remove markdown links but keep the link text. Remove bare URLs entirely.
6. Remove the metadata lines at the end (Libretto links, "Uraufführung:", opus/TrV numbers).
7. Remove markdown formatting (**, *, ##) but preserve the text structure with blank lines between paragraphs. Keep heading text as-is (without ##) — the TTS will naturally pause.
8. Keep blockquotes (>) as regular text.
9. English and foreign loanwords that a German TTS would mispronounce: replace them with phonetic spellings that guide German pronunciation. Common examples:
   - Post → Pohst, Posts → Pohsts
   - Blog → Blogg
   - Thriller → Sriller, Psychothriller → Psychosriller
   - Blockbuster → Blockbaster
   - Fantasy → Fäntäsi
   - Streaming → Strieming
   - Spoiler → Schpoiler
   - Playlist → Pläilist
   - Highlight(s) → Heileit(s)
   - Performance → Pörformänss
   - Must-Listen → Mast-Lissen
   - Fun Fact → Fann Fäkt
   - Soundtrack → Saundträck
   Use your judgment for other English/foreign words that appear. German compound words containing English parts should also be adjusted.
10. Collapse multiple blank lines into single blank lines.
11. The output should read naturally when spoken aloud in German.'

cat "$FILE" | claude -p "$SYSTEM_PROMPT" > "$OUTPUT"
echo "Written to $OUTPUT ($(wc -w < "$OUTPUT" | tr -d ' ') words)"
