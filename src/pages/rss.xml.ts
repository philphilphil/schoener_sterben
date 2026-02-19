import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('posts', (entry) => {
    return entry.id.startsWith('posts/') && !entry.data.draft;
  });
  const posts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Schöner Sterben',
    description: 'Oper für alle!',
    site: context.site!.toString(),
    items: posts.map((post) => {
      const slug = post.data.slug || post.id.split('/').pop()?.replace(/\.mdx?$/, '');
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary || '',
        link: `/posts/${slug}/`,
      };
    }),
  });
}
