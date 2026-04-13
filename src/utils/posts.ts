import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
  const allPosts = await getCollection('posts', (entry) => {
    return !entry.data.draft;
  });
  return allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getDraftPosts() {
  try {
    const drafts = await getCollection('drafts');
    return drafts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  } catch {
    return [];
  }
}

export async function getTagCounts(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  return tagCounts;
}
