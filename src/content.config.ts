import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import fs from 'node:fs';

const recordingSchema = z.array(z.object({
  typ: z.string(),
  label: z.string(),
  links: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })),
})).optional();

export type Recording = z.infer<typeof recordingSchema>;

const isDev = process.env.NODE_ENV !== 'production';

// Drafts only exist in dev (the integration clears the dir on build).
// Without registering them conditionally, the glob loader warns on every
// production build about the empty directory.
if (isDev) {
  fs.mkdirSync('./src/content/drafts', { recursive: true });
}

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
    summary: z.string().nullish().transform((v) => v ?? ''),
    audio: z.string().optional(),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    imagePosition: z.string().optional(),
    hideMeta: z.boolean().optional().default(false),
    recordings: recordingSchema,
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
    summary: z.string().nullish().transform((v) => v ?? ''),
    audio: z.string().optional(),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    imagePosition: z.string().optional(),
    hideMeta: z.boolean().optional().default(false),
    recordings: recordingSchema,
  }).passthrough(),
});

export const collections = isDev
  ? { pages, posts, drafts }
  : { pages, posts };
