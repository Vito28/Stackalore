import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  findSubjectFolder,
  formatLessonNumber,
  getSubjectEntries,
  type SubjectEntry,
} from '@/lib/docs-tree';
import { source } from '@/lib/source';

interface LessonListProps {
  subject?: string;
  /** Hide the optional reference pages listed below the lessons. */
  hideReferences?: boolean;
  className?: string;
}

/** Numbered lesson overview built from the page tree, grouped by section. */
export function LessonList({ subject = 'cpp', hideReferences, className }: LessonListProps) {
  const folder = findSubjectFolder(source.getPageTree(), subject);
  if (!folder) return null;

  const entries = getSubjectEntries(folder);
  const lessons = entries.filter((entry) => entry.kind === 'lesson');
  const references = entries.filter((entry) => entry.kind === 'reference');
  const descriptions = new Map(source.getPages().map((page) => [page.url, page.data.description]));

  const groups: { section: ReactNode; entries: SubjectEntry[] }[] = [];
  for (const lesson of lessons) {
    const last = groups[groups.length - 1];
    if (last && last.section === lesson.section) last.entries.push(lesson);
    else groups.push({ section: lesson.section, entries: [lesson] });
  }

  return (
    <div className={cn('not-prose my-6 overflow-hidden rounded-xl border bg-fd-card', className)}>
      {groups.map((group, index) => (
        <section key={index} className={cn(index > 0 && 'border-t')}>
          {group.section ? (
            <h3 className="border-b bg-fd-muted/40 px-4 py-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-fd-muted-foreground uppercase">
              {group.section}
            </h3>
          ) : null}
          <ol className="divide-y">
            {group.entries.map((entry) => (
              <li key={entry.url}>
                <Link
                  href={entry.url}
                  className="group flex items-start gap-4 px-4 py-3.5 transition-colors hover:bg-fd-muted/50"
                >
                  <span className="mt-0.5 font-mono text-sm text-fd-muted-foreground tabular-nums">
                    {formatLessonNumber(entry.number ?? 0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-fd-foreground">{entry.name}</span>
                    {descriptions.get(entry.url) ? (
                      <span className="mt-0.5 block text-sm leading-6 text-fd-muted-foreground">
                        {descriptions.get(entry.url)}
                      </span>
                    ) : null}
                  </span>
                  <ArrowRight
                    className="mt-1 size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fd-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {!hideReferences && references.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t bg-fd-muted/40 px-4 py-3">
          <span className="mr-1 text-xs font-medium text-fd-muted-foreground">Referensi:</span>
          {references.map((entry) => (
            <Link
              key={entry.url}
              href={entry.url}
              className="rounded-md border bg-fd-background px-2 py-0.5 text-xs text-fd-foreground transition-colors hover:border-fd-primary/40"
            >
              {entry.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
