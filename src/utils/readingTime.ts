export function estimateReadingTime(body: string): number {
  const stripped = body
    .replace(/^---[\s\S]*?^---/m, '')     // frontmatter
    .replace(/^import\s+.+$/gm, '')       // import lines
    .replace(/<\/?[A-Za-z][^>]*>/g, '')   // HTML/JSX tags
    .trim();
  const words = stripped.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
