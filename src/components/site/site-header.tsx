'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getSubjectSlug } from '@/lib/docs-tree';
import { subjectHref, subjects } from '@/lib/subjects';
import { Logo } from './logo';
import { SearchIconButton, SearchTrigger } from './search-trigger';
import { ThemeToggle } from './theme-toggle';

interface SiteHeaderProps {
  /** Extra buttons placed before the theme switch. */
  actions?: ReactNode;
  /** Shows the "Materi" button that opens the lesson drawer on small screens. */
  onOpenSidebar?: () => void;
}

export function SiteHeader({ actions, onOpenSidebar }: SiteHeaderProps) {
  const pathname = usePathname();
  const activeSlug = getSubjectSlug(pathname);

  return (
    <header className="sticky top-0 z-40 border-b bg-fd-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-fd-background/70">
      <div className="mx-auto flex h-14 w-full max-w-[90rem] items-center gap-3 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Dokumentasi" className="ml-5 hidden items-center gap-0.5 md:flex">
          {subjects.map((subject) => {
            const active = subject.slug === activeSlug;
            return (
              <Link
                key={subject.slug}
                href={subjectHref(subject)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-md px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                  active
                    ? 'font-medium text-fd-foreground'
                    : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {subject.name}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-3 -bottom-[0.6875rem] h-0.5 rounded-full bg-fd-primary transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <SearchTrigger className="hidden w-56 sm:inline-flex lg:w-64" />
          <SearchIconButton className="sm:hidden" />
          {actions}
          <ThemeToggle />
          {onOpenSidebar ? (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium text-fd-foreground outline-none transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring lg:hidden"
            >
              <PanelRightOpen className="size-4" aria-hidden="true" />
              Materi
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
