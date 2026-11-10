import type * as PageTree from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';

/**
 * Helpers that agree on lesson numbering, modules, and previous/next order.
 *
 * Inside a subject folder:
 * - the folder index page is the introduction (no number),
 * - lessons live in module folders whose names are wrapped in parentheses,
 *   e.g. `(dasar)`, so they keep short URLs like `/docs/cpp/input-dan-output`,
 * - pages with a deeper URL (`/docs/cpp/pendalaman/...`) are optional references.
 */

export type EntryKind = 'intro' | 'lesson' | 'reference';

export interface SubjectEntry {
  url: string;
  name: ReactNode;
  kind: EntryKind;
  /** Module (folder) name the page belongs to. */
  section?: ReactNode;
  /** 1-based lesson number, only for `lesson` entries. */
  number?: number;
}

export function getSubjectSlug(pathname: string): string | undefined {
  const [root, slug] = pathname.split('/').filter(Boolean);
  return root === 'docs' ? slug : undefined;
}

function containsUrlPrefix(node: PageTree.Node, prefix: string): boolean {
  if (node.type === 'page') return node.url === prefix || node.url.startsWith(`${prefix}/`);
  if (node.type === 'folder') {
    if (node.index && containsUrlPrefix(node.index, prefix)) return true;
    return node.children.some((child) => containsUrlPrefix(child, prefix));
  }
  return false;
}

export function findSubjectFolder(
  tree: PageTree.Root,
  slug: string | undefined,
): PageTree.Folder | undefined {
  if (!slug) return undefined;
  const prefix = `/docs/${slug}`;

  for (const node of tree.children) {
    if (node.type === 'folder' && containsUrlPrefix(node, prefix)) return node;
  }
  return undefined;
}

function collectPages(folder: PageTree.Folder): PageTree.Item[] {
  const pages: PageTree.Item[] = [];
  if (folder.index) pages.push(folder.index);
  for (const child of folder.children) {
    if (child.type === 'page') pages.push(child);
    else if (child.type === 'folder') pages.push(...collectPages(child));
  }
  return pages;
}

export function getSubjectEntries(folder: PageTree.Folder): SubjectEntry[] {
  const entries: SubjectEntry[] = [];
  const seen = new Set<string>();
  const add = (entry: SubjectEntry) => {
    if (seen.has(entry.url)) return;
    seen.add(entry.url);
    entries.push(entry);
  };

  if (folder.index) add({ url: folder.index.url, name: folder.index.name, kind: 'intro' });

  let separator: ReactNode | undefined;
  let lessonNumber = 0;
  const addPage = (page: PageTree.Item, section: ReactNode | undefined) => {
    if (seen.has(page.url)) return;
    const depth = urlDepth(page.url);
    // The subject index can also be listed as a regular page in meta.json.
    if (depth === 2) add({ url: page.url, name: page.name, kind: 'intro' });
    else if (depth === 3) add({ url: page.url, name: page.name, kind: 'lesson', section, number: ++lessonNumber });
    else add({ url: page.url, name: page.name, kind: 'reference', section });
  };

  for (const child of folder.children) {
    if (child.type === 'separator') separator = child.name;
    else if (child.type === 'page') addPage(child, separator);
    else for (const page of collectPages(child)) addPage(page, child.name);
  }

  return entries;
}

function urlDepth(url: string) {
  return url.split('/').filter(Boolean).length;
}

/**
 * Lessons and references form two separate reading sequences, so the last
 * lesson does not "continue" into an optional reference page.
 */
export function getNeighbours(entries: SubjectEntry[], url: string) {
  const current = entries.find((entry) => entry.url === url);
  if (!current) return { current: undefined, previous: undefined, next: undefined };

  const sequence = entries.filter((entry) =>
    current.kind === 'reference' ? entry.kind === 'reference' : entry.kind !== 'reference',
  );
  const index = sequence.indexOf(current);

  return {
    current,
    previous: index > 0 ? sequence[index - 1] : undefined,
    next: index < sequence.length - 1 ? sequence[index + 1] : undefined,
  };
}

export function formatLessonNumber(value: number) {
  return value.toString().padStart(2, '0');
}

/** Best-effort plain text for filtering tree names, which may be React nodes. */
export function nodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return nodeText((node.props as { children?: ReactNode }).children);
  }
  return '';
}
