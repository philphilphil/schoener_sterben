#!/usr/bin/env bash
set -euo pipefail

OBSIDIAN_BLOG="/Users/phil/Notes/30 Kultur/31 Blog Schöner Sterben"
ASTRO_POSTS="/Users/phil/Projects/schoener_sterben/src/content/posts"
ASTRO_DATA="/Users/phil/Projects/schoener_sterben/src/data"

usage() {
  echo "Usage:"
  echo "  publish.sh faq              Copy FAQ from Obsidian to Astro"
  echo "  publish.sh post <name>      Publish a draft post from Obsidian to Astro"
  exit 1
}

publish_faq() {
  local src="$OBSIDIAN_BLOG/faq.md"
  local dest="$ASTRO_DATA/faq.md"

  if [[ ! -f "$src" ]]; then
    echo "Error: FAQ file not found at $src"
    exit 1
  fi

  cp "$src" "$dest"
  echo "FAQ copied to $dest"
}

publish_post() {
  local name="$1"
  local src="$OBSIDIAN_BLOG/Drafts/${name}.md"

  if [[ ! -f "$src" ]]; then
    echo "Error: Draft not found at $src"
    exit 1
  fi

  # Extract frontmatter values
  local frontmatter
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$src")

  local title slug tags summary subtitle

  title=$(echo "$frontmatter" | grep -E '^title:' | sed 's/^title: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
  subtitle=$(echo "$frontmatter" | grep -E '^subtitle:' | sed 's/^subtitle: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
  slug=$(echo "$frontmatter" | grep -E '^slug:' | sed 's/^slug: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
  summary=$(echo "$frontmatter" | grep -E '^summary:' | sed 's/^summary: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')

  # Tags can be inline (tags: [a, b]) or multi-line (tags:\n  - a\n  - b)
  local has_tags=false
  if echo "$frontmatter" | grep -qE '^tags:'; then
    local tags_line
    tags_line=$(echo "$frontmatter" | grep -E '^tags:' | sed 's/^tags: *//')
    if [[ -n "$tags_line" && "$tags_line" != "[]" ]]; then
      has_tags=true
    elif echo "$frontmatter" | grep -qE '^ +- '; then
      has_tags=true
    fi
  fi

  # Validate required fields
  local errors=()
  [[ -z "$title" ]] && errors+=("title is missing")
  [[ -z "$subtitle" ]] && errors+=("subtitle is missing")
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
  local post_date
  post_date=$(echo "$frontmatter" | grep -E '^date:' | sed 's/^date: *//' | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')

  if [[ -z "$post_date" ]]; then
    echo "Error: date is missing in frontmatter"
    exit 1
  fi

  local new_filename="${post_date}_${slug}.md"
  local astro_filename="${post_date}_${slug}.mdx"

  # Move renamed file in Obsidian from Drafts to Posted
  mkdir -p "$OBSIDIAN_BLOG/Posted"
  mv "$src" "$OBSIDIAN_BLOG/Posted/${new_filename}"
  echo "Moved draft to $OBSIDIAN_BLOG/Posted/${new_filename}"

  # Copy to Astro as .mdx
  cp "$OBSIDIAN_BLOG/Posted/${new_filename}" "$ASTRO_POSTS/${astro_filename}"
  echo "Published to $ASTRO_POSTS/${astro_filename}"
}

# --- Main ---

[[ $# -lt 1 ]] && usage

case "$1" in
  faq)
    publish_faq
    ;;
  post)
    [[ $# -lt 2 ]] && { echo "Error: Missing post name. Usage: publish.sh post <name>"; exit 1; }
    publish_post "$2"
    ;;
  *)
    usage
    ;;
esac
