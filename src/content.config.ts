import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/pages',
    generateId: ({ entry }) => {
      return entry.replace(/\.mdx?$/, '');
    },
  }),
  schema: z.object({}).passthrough(),
});

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId: ({ entry }) => {
      return entry.replace(/\.mdx?$/, '');
    },
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    slug: z.string().optional(),
    summary: z.string().optional().default(''),
    hideMeta: z.boolean().optional().default(false),
    cssclasses: z.array(z.string()).optional(),
  }),
});

export const collections = { pages, posts };
