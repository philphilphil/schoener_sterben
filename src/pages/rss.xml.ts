import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../utils/posts';
import { getPostSlug } from '../utils/getPostSlug';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: 'Schöner Sterben',
    description: 'Oper für alle!',
    site: context.site!.toString(),
    items: posts.map((post) => {
      const slug = getPostSlug(post);
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary || '',
        link: `/posts/${slug}/`,
      };
    }),
  });
}
