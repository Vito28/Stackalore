'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import { useActiveAnchor, type TOCItemType } from 'fumadocs-core/toc';
import { BookOpen, ChevronRight, ListFilter, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  findSubjectFolder,
  formatLessonNumber,
  getSubjectEntries,
  getSubjectSlug,
  nodeText,
  type SubjectEntry,
} from '@/lib/docs-tree';
import { getSubject, subjectHref, subjects, type Subject } from '@/lib/subjects';
import { useDocsContext } from './docs-context';

interface DocsSidebarProps {
  /** `drawer` adds the subject switcher, which the desktop header already shows. */
  variant?: 'desktop' | 'drawer';
  /** Called after any link inside the sidebar is followed (used to close the drawer). */
  onNavigate?: () => void;
}

function isActiveUrl(url: string, pathname: string) {
  return pathname === url || pathname === `${url}/`;
}

export function DocsSidebar({ variant = 'desktop', onNavigate }: DocsSidebarProps) {
  const { tree, toc } = useDocsContext();
  const pathname = usePathname();
  const slug = getSubjectSlug(pathname);
  const subject = getSubject(slug);
  const folder = useMemo(() => findSubjectFolder(tree, slug), [tree, slug]);
  const entries = useMemo(() => (folder ? getSubjectEntries(folder) : []), [folder]);
  const [query, setQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const lessons = entries.filter((entry) => entry.kind === 'lesson');
  const references = entries.filter((entry) => entry.kind === 'reference');
  const current = entries.find((entry) => isActiveUrl(entry.url, pathname));

  // Keep the active lesson visible when navigating between pages.
  useEffect(() => {
    const container = scrollRef.current;
    const active = container?.querySelector<HTMLElement>('[data-active-page="true"]');
    if (!container || !active) return;

    const box = container.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.top < box.top + 8 || item.bottom > box.bottom - 8) {
      container.scrollTop += item.top - box.top - box.height / 4;
    }
  }, [pathname]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b px-4 pt-4 pb-3">
        {variant === 'drawer' ? <SubjectSwitcher activeSlug={slug} onNavigate={onNavigate} /> : null}
        {subject ? (
          <SubjectHeading subject={subject} lessons={lessons.length} references={references.length} />
        ) : (
          <p className="text-sm font-medium text-fd-foreground">Semua dokumentasi</p>
        )}
        {entries.length > 4 ? (
          <FilterInput
            value={query}
            onChange={setQuery}
            entries={entries}
            onNavigate={onNavigate}
          />
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className="sidebar-scroll flex-1 overflow-y-auto overscroll-contain px-3 py-3"
      >
        {!folder ? (
          <SubjectList onNavigate={onNavigate} />
        ) : query.trim() ? (
          <FilteredList entries={entries} query={query} pathname={pathname} onNavigate={onNavigate} />
        ) : (
          <SubjectTree
            folder={folder}
            entries={entries}
            pathname={pathname}
            toc={toc}
            onNavigate={onNavigate}
          />
        )}
      </div>

      {current?.kind === 'lesson' && current.number ? (
        <ProgressFooter number={current.number} total={lessons.length} />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function SubjectSwitcher({
  activeSlug,
  onNavigate,
}: {
  activeSlug?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Pilih dokumentasi" className="grid grid-cols-4 gap-1 rounded-lg bg-fd-muted p-1">
      {subjects.map((subject) => {
        const active = subject.slug === activeSlug;
        return (
          <Link
            key={subject.slug}
            href={subjectHref(subject)}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-md px-1 py-1.5 text-center text-xs font-medium transition-colors',
              active
                ? 'bg-fd-background text-fd-foreground shadow-sm'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {subject.shortName}
          </Link>
        );
      })}
    </nav>
  );
}

function SubjectHeading({
  subject,
  lessons,
  references,
}: {
  subject: Subject;
  lessons: number;
  references: number;
}) {
  const Icon = subject.icon;
  const meta =
    subject.status === 'soon'
      ? 'Segera hadir'
      : [`${lessons} materi`, references > 0 ? `${references} referensi` : null]
          .filter(Boolean)
          .join(' · ');

  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-fd-card text-fd-foreground">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fd-foreground">{subject.name}</p>
        <p className="text-xs text-fd-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}

function FilterInput({
  value,
  onChange,
  entries,
  onNavigate,
}: {
  value: string;
  onChange: (value: string) => void;
  entries: SubjectEntry[];
  onNavigate?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="relative">
      <ListFilter
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fd-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onChange('');
          if (event.key === 'Enter') {
            const first = filterEntries(entries, value)[0];
            if (first) {
              router.push(first.url);
              onChange('');
              onNavigate?.();
            }
          }
        }}
        placeholder="Saring materi…"
        aria-label="Saring materi di sidebar"
        className="h-8 w-full rounded-md border bg-fd-background pr-8 pl-8 text-sm text-fd-foreground outline-none transition-colors placeholder:text-fd-muted-foreground focus:border-fd-primary/60 focus-visible:ring-2 focus-visible:ring-fd-ring/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus saringan"
          className="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 place-items-center rounded text-fd-muted-foreground hover:text-fd-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function filterEntries(entries: SubjectEntry[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return entries;
  return entries.filter((entry) => {
    const haystack = [
      nodeText(entry.name),
      nodeText(entry.section),
      entry.number ? formatLessonNumber(entry.number) : '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

function FilteredList({
  entries,
  query,
  pathname,
  onNavigate,
}: {
  entries: SubjectEntry[];
  query: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const results = filterEntries(entries, query);

  if (results.length === 0) {
    return (
      <p className="px-2.5 py-6 text-center text-sm text-fd-muted-foreground">
        Tidak ada materi yang cocok.
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {results.map((entry) => (
        <li key={entry.url}>
          <ItemLink
            href={entry.url}
            active={isActiveUrl(entry.url, pathname)}
            marker={<EntryMarker entry={entry} />}
            onNavigate={onNavigate}
          >
            <span className="block">{entry.name}</span>
            {entry.section ? (
              <span className="block text-xs font-normal text-fd-muted-foreground">{entry.section}</span>
            ) : null}
          </ItemLink>
        </li>
      ))}
    </ul>
  );
}

function SubjectTree({
  folder,
  entries,
  pathname,
  toc,
  onNavigate,
}: {
  folder: PageTree.Folder;
  entries: SubjectEntry[];
  pathname: string;
  toc: TOCItemType[];
  onNavigate?: () => void;
}) {
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
  const indexUrl = folder.index?.url;

  const renderPage = (item: PageTree.Item) => {
    const entry = byUrl.get(item.url);
    const active = isActiveUrl(item.url, pathname);

    return (
      <li key={item.url}>
        <ItemLink
          href={item.url}
          active={active}
          marker={entry ? <EntryMarker entry={entry} /> : null}
          onNavigate={onNavigate}
        >
          {item.name}
        </ItemLink>
        {active && toc.length > 0 ? <PageToc toc={toc} onNavigate={onNavigate} /> : null}
      </li>
    );
  };

  return (
    <ul className="space-y-0.5">
      {folder.index ? renderPage(folder.index) : null}
      {folder.children.map((child, index) => {
        if (child.type === 'separator') {
          return (
            <li
              key={child.$id ?? `separator-${index}`}
              className="px-2.5 pt-5 pb-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] text-fd-muted-foreground/80 uppercase"
            >
              {child.name}
            </li>
          );
        }
        if (child.type === 'page') {
          // The index may also be listed in meta.json; it is already rendered first.
          return child.url === indexUrl ? null : renderPage(child);
        }
        return (
          <FolderGroup
            key={child.$id ?? `folder-${index}`}
            folder={child}
            pathname={pathname}
            renderPage={renderPage}
          />
        );
      })}
    </ul>
  );
}

function FolderGroup({
  folder,
  pathname,
  renderPage,
}: {
  folder: PageTree.Folder;
  pathname: string;
  renderPage: (item: PageTree.Item) => ReactNode;
}) {
  const pages = [
    ...(folder.index ? [folder.index] : []),
    ...folder.children.filter((child): child is PageTree.Item => child.type === 'page'),
  ].filter((page, index, list) => list.findIndex((other) => other.url === page.url) === index);
  const containsActive = pages.some((page) => isActiveUrl(page.url, pathname));
  const [open, setOpen] = useState(folder.defaultOpen ?? containsActive);
  const [wasActive, setWasActive] = useState(containsActive);

  // Re-open the group when the reader navigates into one of its pages.
  if (containsActive !== wasActive) {
    setWasActive(containsActive);
    if (containsActive) setOpen(true);
  }

  return (
    <li className="pt-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
      >
        <span className="grid w-5 shrink-0 place-items-center text-fd-muted-foreground [&_svg]:size-4">
          {folder.icon}
        </span>
        <span className="flex-1">{folder.name}</span>
        <span className="font-mono text-[0.6875rem] text-fd-muted-foreground tabular-nums">
          {pages.length}
        </span>
        <ChevronRight
          className={cn(
            'size-3.5 text-fd-muted-foreground transition-transform duration-200',
            open && 'rotate-90',
          )}
          aria-hidden="true"
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
        inert={!open}
      >
        <ul className="ml-[1.3rem] min-h-0 space-y-0.5 overflow-hidden border-l pt-0.5 pl-2">
          {pages.map((page) => renderPage(page))}
        </ul>
      </div>
    </li>
  );
}

function EntryMarker({ entry }: { entry: SubjectEntry }) {
  if (entry.kind === 'lesson' && entry.number) {
    return <span className="font-mono text-xs tabular-nums">{formatLessonNumber(entry.number)}</span>;
  }
  if (entry.kind === 'intro') return <BookOpen className="size-3.5" aria-hidden="true" />;
  return null;
}

function ItemLink({
  href,
  active,
  marker,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  marker: ReactNode;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-active-page={active}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-start gap-2.5 rounded-md px-2.5 py-1.5 text-sm leading-5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
        active
          ? 'bg-fd-primary/10 font-medium text-fd-foreground'
          : 'text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground',
      )}
    >
      {marker ? (
        <span
          className={cn(
            'mt-px grid w-5 shrink-0 place-items-center',
            active ? 'text-fd-primary' : 'text-fd-muted-foreground/70 group-hover:text-fd-muted-foreground',
          )}
        >
          {marker}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">{children}</span>
    </Link>
  );
}

function PageToc({ toc, onNavigate }: { toc: TOCItemType[]; onNavigate?: () => void }) {
  const activeAnchor = useActiveAnchor();
  const headings = toc.filter((item) => item.depth <= 2);
  if (headings.length === 0) return null;

  // Highlight the section (h2) that contains the active heading, even if the
  // reader is currently inside one of its sub-headings.
  let activeSection: string | undefined;
  for (const item of toc) {
    if (item.depth <= 2) activeSection = item.url;
    if (item.url === `#${activeAnchor}`) break;
  }
  if (!activeAnchor) activeSection = undefined;

  return (
    <ul className="mt-1 mb-2 ml-[1.3rem] space-y-px border-l py-0.5" aria-label="Subbab di halaman ini">
      {headings.map((item) => {
        const active = item.url === activeSection;
        return (
          <li key={item.url}>
            <a
              href={item.url}
              onClick={onNavigate}
              data-active={active}
              className={cn(
                'relative -ml-px block border-l py-1 pr-2 pl-3 text-[0.8125rem] leading-5 transition-colors',
                active
                  ? 'border-fd-primary font-medium text-fd-primary'
                  : 'border-transparent text-fd-muted-foreground hover:border-fd-foreground/30 hover:text-fd-foreground',
              )}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function ProgressFooter({ number, total }: { number: number; total: number }) {
  const percent = Math.round((number / total) * 100);

  return (
    <div className="border-t px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-fd-muted-foreground">
          Materi <span className="font-medium text-fd-foreground">{number}</span> dari {total}
        </span>
        <span className="font-mono text-fd-muted-foreground tabular-nums">{percent}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-fd-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={number}
        aria-label="Posisi materi"
      >
        <div
          className="h-full rounded-full bg-fd-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SubjectList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {subjects.map((subject) => {
        const Icon = subject.icon;
        return (
          <li key={subject.slug}>
            <Link
              href={subjectHref(subject)}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground"
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="flex-1">{subject.name}</span>
              {subject.status === 'soon' ? (
                <span className="text-[0.6875rem] text-fd-muted-foreground/80">Segera</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
