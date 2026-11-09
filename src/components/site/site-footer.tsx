import Link from 'next/link';
import { appName, repoUrl } from '@/lib/shared';
import { subjectHref, subjects } from '@/lib/subjects';

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 px-4 py-8 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-medium text-fd-foreground">{appName}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          Dokumentasi belajar pemrograman dan computer science.
        </p>
        <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {subjects.map((subject) => (
            <Link
              key={subject.slug}
              href={subjectHref(subject)}
              className="transition-colors hover:text-fd-foreground"
            >
              {subject.name}
            </Link>
          ))}
          <Link href="/lisensi" className="transition-colors hover:text-fd-foreground">
            Lisensi
          </Link>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fd-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
