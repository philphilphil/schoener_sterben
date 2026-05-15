import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const DRAFTS_CONTENT_DIR = 'src/content/drafts';

function readFrontmatter(file: string): string | null {
  let text: string;
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(8192);
    const n = fs.readSync(fd, buf, 0, 8192, 0);
    fs.closeSync(fd);
    text = buf.subarray(0, n).toString('utf8');
  } catch {
    return null;
  }
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : null;
}

function isBlogDraft(file: string): boolean {
  const fm = readFrontmatter(file);
  if (!fm) return false;

  if (!/^draft:\s*true\s*$/m.test(fm)) return false;

  const inline = fm.match(/^tags:\s*\[([^\]]*)\]/m);
  if (inline) {
    const parts = inline[1]
      .split(',')
      .map((s) => s.trim().replace(/^["']|["']$/g, ''));
    if (parts.includes('oper')) return true;
  }

  const multiline = fm.match(/^tags:\s*\n((?:[ \t]+-.*\n?)+)/m);
  if (multiline) {
    const items = multiline[1]
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(Boolean);
    if (items.includes('oper')) return true;
  }

  return false;
}

function walkMdFiles(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile() && e.name.endsWith('.md')) out.push(full);
    }
  }
  return out;
}

function collectDrafts(root: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const f of walkMdFiles(root)) {
    if (!isBlogDraft(f)) continue;
    const base = path.basename(f);
    const existing = map.get(base);
    if (existing) {
      console.warn(`[drafts] Duplicate basename ${base}; keeping ${existing}, skipping ${f}`);
      continue;
    }
    map.set(base, f);
  }
  return map;
}

function syncDrafts(draftsPath: string, destDir: string) {
  if (!fs.existsSync(draftsPath)) {
    console.warn(`[drafts] Source path does not exist: ${draftsPath}`);
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });

  const drafts = collectDrafts(draftsPath);
  const wanted = new Set<string>();
  for (const [base, src] of drafts) {
    const destName = base.replace(/\.md$/, '.mdx');
    wanted.add(destName);
    fs.copyFileSync(src, path.join(destDir, destName));
  }

  for (const file of fs.readdirSync(destDir)) {
    if (!file.endsWith('.mdx')) continue;
    if (!wanted.has(file)) {
      fs.unlinkSync(path.join(destDir, file));
    }
  }
}

export default function draftsIntegration(draftsPath: string): AstroIntegration {
  const resolvedSource = path.resolve(draftsPath);

  return {
    name: 'drafts',
    hooks: {
      'astro:config:setup'({ command, logger }) {
        const destDir = path.resolve(DRAFTS_CONTENT_DIR);

        if (command !== 'dev') {
          if (fs.existsSync(destDir)) {
            for (const file of fs.readdirSync(destDir)) {
              fs.unlinkSync(path.join(destDir, file));
            }
          }
          return;
        }

        syncDrafts(resolvedSource, destDir);
        logger.info(`Synced drafts from ${resolvedSource}`);

        // Single recursive watcher. On macOS this is backed by FSEvents and
        // does not consume a file descriptor per subdirectory, so large notes
        // trees no longer trip EMFILE.
        let watcher: fs.FSWatcher | null = null;
        try {
          watcher = fs.watch(resolvedSource, { recursive: true }, (_event, filename) => {
            if (!filename || !String(filename).endsWith('.md')) return;
            syncDrafts(resolvedSource, destDir);
            logger.info(`Re-synced drafts (change: ${filename})`);
          });
          watcher.on('error', (err) => {
            logger.warn(`drafts watcher error: ${err.message}`);
            watcher?.close();
          });
        } catch (err) {
          logger.warn(
            `Could not watch drafts folder (${(err as Error).message}); changes require dev server restart`,
          );
        }

        process.on('exit', () => {
          watcher?.close();
        });
      },
    },
  };
}
