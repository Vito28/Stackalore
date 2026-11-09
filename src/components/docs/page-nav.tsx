import Link from 'next/link';
import { ArrowLeft, ArrowRight, Hourglass } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatLessonNumber, type SubjectEntry } from '@/lib/docs-tree';

interface PageNavProps {
  previous?: SubjectEntry;
  next?: SubjectEntry;
  /** Show a "coming soon" card when the last lesson has no successor yet. */
  showUpcoming?: boolean;
}

export function PageNav({ previous, next, showUpcoming }: PageNavProps) {
  if (!previous && !next && !showUpcoming) return null;

  return (
    <nav aria-label="Navigasi materi" className="mt-10 grid gap-3 border-t pt-8 sm:grid-cols-2">
      {previous ? <NavCard entry={previous} direction="previous" /> : <span className="hidden sm:block" />}
      {next ? (
        <NavCard entry={next} direction="next" />
      ) : showUpcoming ? (
        <div className="flex flex-col gap-1 rounded-xl border border-dashed p-4 sm:items-end sm:text-right">
          <span className="inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <Hourglass className="size-3.5" aria-hidden="true" />
            Berikutnya
          </span>
          <span className="font-medium text-fd-muted-foreground">Materi selanjutnya sedang disiapkan</span>
        </div>
      ) : null}
    </nav>
  );
}

function NavCard({ entry, direction }: { entry: SubjectEntry; direction: 'previous' | 'next' }) {
  const isNext = direction === 'next';

  return (
    <Link
      href={entry.url}
      className={cn(
        'group flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:border-fd-primary/40 hover:bg-fd-muted/40',
        isNext && 'sm:items-end sm:text-right',
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground">
        {isNext ? null : (
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        )}
        {isNext ? 'Berikutnya' : 'Sebelumnya'}
        {isNext ? (
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        ) : null}
      </span>
      <span className="font-medium text-fd-foreground">
        {entry.number ? (
          <span className="mr-2 font-mono text-sm text-fd-muted-foreground">
            {formatLessonNumber(entry.number)}
          </span>
        ) : null}
        {entry.name}
      </span>
    </Link>
  );
}
