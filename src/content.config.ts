import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import fs from 'node:fs';

// Ensure drafts directory exists (it's gitignored, may not exist on CI)
fs.mkdirSync('./src/content/drafts', { recursive: true });

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
    audio: z.string().optional(),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    imagePosition: z.string().optional(),
    hideMeta: z.boolean().optional().default(false),
    cssclasses: z.array(z.string()).optional(),
  }),
});

const drafts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/drafts',
    generateId: ({ entry }) => {
      return entry.replace(/\.mdx?$/, '');
    },
  }),
  schema: z.object({
    title: z.string().default('Untitled Draft'),
    subtitle: z.string().optional(),
    date: z.coerce.date().default(new Date()),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    slug: z.string().optional(),
    summary: z.string().optional().default(''),
    audio: z.string().optional(),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    imagePosition: z.string().optional(),
    hideMeta: z.boolean().optional().default(false),
    cssclasses: z.any().optional(),
  }).passthrough(),
});

export const collections = { pages, posts, drafts };
