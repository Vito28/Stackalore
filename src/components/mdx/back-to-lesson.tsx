'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import { CornerUpLeft } from 'lucide-react';
import { useReadingHistory } from '@/components/docs/reading-history';
import { findSubjectFolder, getSubjectEntries, getSubjectSlug, nodeText } from '@/lib/docs-tree';

interface BackToLessonProps {
  /** Lesson to return to when the reader opened this page directly. */
  href: string;
  label: string;
}

/**
 * Deep-dive pages can be reached from several lessons. This link returns the
 * reader to the lesson they actually came from, falling back to `href`.
 */
export function BackToLesson({ href, label }: BackToLessonProps) {
  const { full: tree } = useTreeContext();
  const pathname = usePathname();
  const history = useReadingHistory();

  let target = { href, label };
  for (let i = history.length - 1; i >= 0; i--) {
    const visited = history[i];
    if (visited === pathname) continue;

    const folder = findSubjectFolder(tree, getSubjectSlug(visited));
    const entry = folder ? getSubjectEntries(folder).find((item) => item.url === visited) : undefined;
    if (!entry) continue;
    if (entry.kind === 'reference') continue;

    target = { href: entry.url, label: nodeText(entry.name) || label };
    break;
  }

  return (
    <Link
      href={target.href}
      className="not-prose my-6 inline-flex items-center gap-2 rounded-lg border bg-fd-card px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:border-fd-primary/40 hover:text-fd-foreground"
    >
      <CornerUpLeft className="size-3.5" aria-hidden="true" />
      Kembali ke <span className="font-medium text-fd-foreground">{target.label}</span>
    </Link>
  );
}
