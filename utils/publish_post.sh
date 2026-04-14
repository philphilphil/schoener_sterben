#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASTRO_POSTS="$SCRIPT_DIR/src/content/posts"

# Read DRAFTS_PATH from .env
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  DRAFTS_PATH=$(grep -E '^DRAFTS_PATH=' "$SCRIPT_DIR/.env" | sed 's/^DRAFTS_PATH=//')
fi

if [[ -z "${DRAFTS_PATH:-}" ]]; then
  echo "Error: DRAFTS_PATH not set. Add it to .env"
  exit 1
fi

if [[ ! -d "$DRAFTS_PATH" ]]; then
  echo "Error: DRAFTS_PATH does not exist: $DRAFTS_PATH"
  exit 1
fi

usage() {
  echo "Usage: publish.sh <draft-name>"
  echo ""
  echo "Publishes a draft from the DRAFTS_PATH folder to src/content/posts/."
  echo "The draft name is the filename without .md extension."
  echo ""
  echo "Available drafts:"
  for f in "$DRAFTS_PATH"/*.md; do
    [[ -f "$f" ]] && echo "  $(basename "$f" .md)"
  done
  exit 1
}

[[ $# -lt 1 ]] && usage

name="$1"
src="$DRAFTS_PATH/${name}.md"

if [[ ! -f "$src" ]]; then
  echo "Error: Draft not found at $src"
  echo ""
  echo "Available drafts:"
  for f in "$DRAFTS_PATH"/*.md; do
    [[ -f "$f" ]] && echo "  $(basename "$f" .md)"
  done
  exit 1
fi

# Extract frontmatter values
frontmatter=$(sed -n '/^---$/,/^---$/p' "$src")

title=$(echo "$frontmatter" | grep -E '^title:' | sed 's/^title: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
slug=$(echo "$frontmatter" | grep -E '^slug:' | sed 's/^slug: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
summary=$(echo "$frontmatter" | grep -E '^summary:' | sed 's/^summary: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')

# Tags can be inline (tags: [a, b]) or multi-line (tags:\n  - a\n  - b)
has_tags=false
if echo "$frontmatter" | grep -qE '^tags:'; then
  tags_line=$(echo "$frontmatter" | grep -E '^tags:' | sed 's/^tags: *//')
  if [[ -n "$tags_line" && "$tags_line" != "[]" ]]; then
    has_tags=true
  elif echo "$frontmatter" | grep -qE '^ +- '; then
    has_tags=true
  fi
fi

# Validate required fields
errors=()
[[ -z "$title" ]] && errors+=("title is missing")
[[ -z "$slug" ]] && errors+=("slug is missing")
[[ -z "$summary" ]] && errors+=("summary is missing")
[[ "$has_tags" == "false" ]] && errors+=("tags is missing or empty")

if [[ ${#errors[@]} -gt 0 ]]; then
  echo "Error: Cannot publish '${name}':"
  for err in "${errors[@]}"; do
    echo "  - $err"
  done
  exit 1
fi

# Use date from frontmatter for filename
post_date=$(echo "$frontmatter" | grep -E '^date:' | sed 's/^date: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')

if [[ -z "$post_date" ]]; then
  echo "Error: date is missing in frontmatter"
  exit 1
fi

astro_filename="${post_date}_${slug}.mdx"

# Copy to Astro as .mdx
cp "$src" "$ASTRO_POSTS/${astro_filename}"
echo "Published to $ASTRO_POSTS/${astro_filename}"

# Move draft to Posted folder in vault
posted_dir="$(dirname "$DRAFTS_PATH")/Posted"
mkdir -p "$posted_dir"
mv "$src" "$posted_dir/${post_date}_${slug}.md"
echo "Moved draft to $posted_dir/${post_date}_${slug}.md"
