import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Filesystem-backed blog content (content/blog/*.md) with a hand-rolled parser
 * for the markdown subset the posts use — same no-dependency philosophy as the
 * changelog. Posts ship in the repo, so every page is fully static at build.
 *
 * Frontmatter between `---` lines: title, description, date (YYYY-MM-DD),
 * author, tags (comma-separated).
 */

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readingMinutes: number;
}

export type BlogBlock =
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string; id: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'pre'; lang: string; code: string }
  | { type: 'quote'; text: string }
  | { type: 'hr' };

export interface BlogPost extends BlogPostMeta {
  blocks: BlogBlock[];
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const meta: Record<string, string> = {};
  if (!raw.startsWith('---')) return { meta, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta, body: raw };
  for (const line of raw.slice(3, end).split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: raw.slice(end + 4) };
}

function parseBlocks(body: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  const lines = body.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push({ type: 'pre', lang, code: code.join('\n') });
      continue;
    }

    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      blocks.push({ type: 'h3', text, id: slugifyHeading(text) });
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      blocks.push({ type: 'h2', text, id: slugifyHeading(text) });
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quote.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'quote', text: quote.join(' ') });
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, '').trim());
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Paragraph: consume consecutive plain lines.
    const para: string[] = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(## |### |> |[-*] |\d+\. |```)/.test(lines[i]) &&
      !/^(-{3,}|\*{3,})$/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'p', text: para.join(' ') });
  }

  return blocks;
}

function readingMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

async function parsePost(slug: string): Promise<BlogPost | null> {
  try {
    const raw = await readFile(path.join(BLOG_DIR, `${slug}.md`), 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    if (!meta.title || !meta.date) return null;
    return {
      slug,
      title: meta.title,
      description: meta.description || '',
      date: meta.date,
      author: meta.author || 'Pushify',
      tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      readingMinutes: readingMinutes(body),
      blocks: parseBlocks(body),
    };
  } catch {
    return null;
  }
}

/** All posts, newest first. */
export async function listBlogPosts(): Promise<BlogPost[]> {
  let files: string[];
  try {
    files = await readdir(BLOG_DIR);
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files.filter((f) => f.endsWith('.md')).map((f) => parsePost(f.replace(/\.md$/, ''))),
  );
  return (posts.filter(Boolean) as BlogPost[]).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  return parsePost(slug);
}
