#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASTRO_POSTS="$PROJECT_ROOT/src/content/posts"

usage() {
  echo "Usage: $(basename "$0") <path/to/draft.md>"
  echo ""
  echo "Publishes a Markdown draft to src/content/posts/."
  echo "Requires frontmatter fields: title, slug, summary, date."
  echo ""
  echo "Copies the draft to src/content/posts/<date>_<slug>.mdx and renames"
  echo "the source file in place to <date>_<slug>.md (same directory)."
  exit 1
}

[[ $# -lt 1 ]] && usage

src="$1"

if [[ ! -f "$src" ]]; then
  echo "Error: file not found: $src"
  exit 1
fi

case "$src" in
  *.md) ;;
  *) echo "Error: expected a .md file, got: $src"; exit 1 ;;
esac

# Print frontmatter (between the first two --- markers, exclusive).
extract_frontmatter() {
  awk '
    /^---[[:space:]]*$/ { n++; if (n == 2) exit; next }
    n == 1
  ' "$1"
}

frontmatter=$(extract_frontmatter "$src")

if [[ -z "$frontmatter" ]]; then
  echo "Error: no frontmatter found in $src"
  exit 1
fi

title=$(echo "$frontmatter" | grep -E '^title:' | sed 's/^title: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
slug=$(echo "$frontmatter" | grep -E '^slug:' | sed 's/^slug: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
summary=$(echo "$frontmatter" | grep -E '^summary:' | sed 's/^summary: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
post_date=$(echo "$frontmatter" | grep -E '^date:' | sed 's/^date: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')

errors=()
[[ -z "$title" ]] && errors+=("title is missing")
[[ -z "$slug" ]] && errors+=("slug is missing")
[[ -z "$summary" ]] && errors+=("summary is missing")
[[ -z "$post_date" ]] && errors+=("date is missing")

if [[ ${#errors[@]} -gt 0 ]]; then
  echo "Error: cannot publish $src:"
  for err in "${errors[@]}"; do
    echo "  - $err"
  done
  exit 1
fi

astro_filename="${post_date}_${slug}.mdx"
src_dir=$(dirname "$src")
renamed_src="$src_dir/${post_date}_${slug}.md"

cp "$src" "$ASTRO_POSTS/${astro_filename}"
echo "Published to $ASTRO_POSTS/${astro_filename}"

if [[ "$src" != "$renamed_src" ]]; then
  mv "$src" "$renamed_src"
  echo "Renamed source to $renamed_src"
else
  echo "Source already named $renamed_src; no rename needed"
fi
