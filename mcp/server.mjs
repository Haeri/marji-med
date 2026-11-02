#!/usr/bin/env node
// Content tools for the site. Paths are relative to src/content, e.g. "pages/en/history.md".
import { execFile } from 'node:child_process';
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const run = promisify(execFile);

function contentPath(path) {
  const full = resolve(CONTENT, path);
  if (!full.startsWith(CONTENT + sep)) throw new Error(`Path is outside src/content: ${path}`);
  return full;
}

const text = (t) => ({ content: [{ type: 'text', text: t }] });
const path = z.string().describe('Path relative to src/content, e.g. pages/en/history.md, pages/ru/history.md or pages/ka/history.md');
const server = new McpServer({ name: 'mcp-site-content', version: '1.0.0' });

server.tool('list_content', 'List all content files. Folders: pages, articles, results, publications, settings, each with en, ru and ka subfolders.', {}, async () => {
  const files = await readdir(CONTENT, { recursive: true, withFileTypes: true });
  return text(files.filter((f) => f.isFile()).map((f) => join(f.parentPath, f.name).slice(CONTENT.length + 1)).sort().join('\n'));
});

server.tool('read_content', 'Read a content file, including its frontmatter.', { path }, async ({ path }) =>
  text(await readFile(contentPath(path), 'utf8')));

server.tool('write_content', 'Create or replace a content file. Run check_site afterwards: it validates the frontmatter.',
  { path, content: z.string() },
  async ({ path, content }) => {
    const full = contentPath(path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content);
    return text(`Wrote ${path}`);
  });

server.tool('delete_content', 'Delete a content file.', { path }, async ({ path }) => {
  await rm(contentPath(path));
  return text(`Deleted ${path}`);
});

server.tool('add_image', 'Copy a local image into public/uploads. Returns the URL to use in Markdown.',
  { source: z.string().describe('Absolute path of the image') },
  async ({ source }) => {
    const name = basename(source);
    await copyFile(source, join(ROOT, 'public/uploads', name));
    return text(`/uploads/${name}`);
  });

server.tool('check_site', 'Build the site. Fails with the error if any content does not match the schema.', {}, async () => {
  const { stdout } = await run('npm', ['run', 'build'], { cwd: ROOT });
  return text(stdout.split('\n').slice(-3).join('\n'));
});

server.tool('publish', 'Build the site, then commit all content changes and push them. Pushing makes them live.',
  { message: z.string().describe('Commit message') },
  async ({ message }) => {
    await run('npm', ['run', 'build'], { cwd: ROOT });
    await run('git', ['add', 'src/content', 'public/uploads'], { cwd: ROOT });
    await run('git', ['commit', '-m', message], { cwd: ROOT });
    await run('git', ['push'], { cwd: ROOT });
    return text('Published.');
  });

await server.connect(new StdioServerTransport());
