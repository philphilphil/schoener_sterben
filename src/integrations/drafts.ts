import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const DRAFTS_CONTENT_DIR = 'src/content/drafts';

function syncDrafts(draftsPath: string, destDir: string) {
  if (!fs.existsSync(draftsPath)) {
    console.warn(`[drafts] Source path does not exist: ${draftsPath}`);
    return;
  }

  // Ensure destination exists
  fs.mkdirSync(destDir, { recursive: true });

  // Remove stale files from dest that no longer exist in source
  if (fs.existsSync(destDir)) {
    for (const file of fs.readdirSync(destDir)) {
      if (!file.endsWith('.mdx')) continue;
      const sourceName = file.replace(/\.mdx$/, '.md');
      if (!fs.existsSync(path.join(draftsPath, sourceName))) {
        fs.unlinkSync(path.join(destDir, file));
      }
    }
  }

  // Copy .md files as .mdx
  for (const file of fs.readdirSync(draftsPath)) {
    if (!file.endsWith('.md')) continue;
    const src = path.join(draftsPath, file);
    const dest = path.join(destDir, file.replace(/\.md$/, '.mdx'));
    fs.copyFileSync(src, dest);
  }
}

export default function draftsIntegration(draftsPath: string): AstroIntegration {
  const resolvedSource = path.resolve(draftsPath);

  return {
    name: 'drafts',
    hooks: {
      'astro:config:setup'({ command, addWatchFile, logger }) {
        const destDir = path.resolve(DRAFTS_CONTENT_DIR);

        if (command !== 'dev') {
          // Clear drafts folder for build so leftover synced files don't break it
          if (fs.existsSync(destDir)) {
            for (const file of fs.readdirSync(destDir)) {
              fs.unlinkSync(path.join(destDir, file));
            }
          }
          return;
        }
        syncDrafts(resolvedSource, destDir);
        logger.info(`Synced drafts from ${resolvedSource}`);

        {
          // Watch the external drafts folder for changes
          try {
            const watcher = fs.watch(resolvedSource, (_event, filename) => {
              if (!filename?.endsWith('.md')) return;
              const src = path.join(resolvedSource, filename);
              const dest = path.join(destDir, filename.replace(/\.md$/, '.mdx'));
              if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                logger.info(`Updated draft: ${filename}`);
              } else {
                // File was deleted
                if (fs.existsSync(dest)) {
                  fs.unlinkSync(dest);
                  logger.info(`Removed draft: ${filename}`);
                }
              }
            });

            // Clean up on process exit
            process.on('exit', () => watcher.close());
          } catch {
            logger.warn('Could not watch drafts folder, changes require dev server restart');
          }
        }
      },
    },
  };
}
