import type { CollectionEntry } from 'astro:content';

export function getPostSlug(post: CollectionEntry<'posts'>): string {
  return post.data.slug || post.id;
}
