import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const { DRAFTS_PATH } = loadEnv(process.env.NODE_ENV ?? '', process.cwd(), '');

const integrations = [mdx(), sitemap()];

if (DRAFTS_PATH) {
  const { default: draftsIntegration } = await import('./src/integrations/drafts.ts');
  integrations.push(draftsIntegration(DRAFTS_PATH));
}

export default defineConfig({
  site: 'https://schoenersterben.de',
  integrations,
});
