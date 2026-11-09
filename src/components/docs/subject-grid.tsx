import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { findSubjectFolder, getSubjectEntries } from '@/lib/docs-tree';
import { source } from '@/lib/source';
import { subjectHref, subjects } from '@/lib/subjects';

function countLessons(slug: string) {
  const folder = findSubjectFolder(source.getPageTree(), slug);
  if (!folder) return 0;
  return getSubjectEntries(folder).filter((entry) => entry.kind === 'lesson').length;
}

export function SubjectGrid({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {subjects.map((subject) => {
        const Icon = subject.icon;
        const available = subject.status === 'available';
        const lessons = countLessons(subject.slug);

        return (
          <Link
            key={subject.slug}
            href={subjectHref(subject)}
            className="group flex flex-col rounded-xl border bg-fd-card p-5 transition-[border-color,box-shadow] duration-200 hover:border-fd-primary/40 hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.12)] focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none dark:hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)]"
          >
            <div className="flex items-start justify-between gap-4">
              <span
                className={cn(
                  'grid size-10 place-items-center rounded-lg border',
                  available
                    ? 'border-fd-primary/25 bg-fd-primary/10 text-fd-primary'
                    : 'bg-fd-muted text-fd-muted-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  available
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'text-fd-muted-foreground',
                )}
              >
                {available ? `${lessons} materi` : 'Segera hadir'}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-fd-foreground">{subject.name}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-6 text-fd-muted-foreground">{subject.description}</p>
            <span
              className={cn(
                'mt-5 inline-flex items-center gap-1.5 text-sm font-medium',
                available ? 'text-fd-foreground' : 'text-fd-muted-foreground',
              )}
            >
              {available ? 'Mulai belajar' : 'Lihat halaman'}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
