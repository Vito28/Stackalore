import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, BookMarked, Layers, Library } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DeepDiveProps {
  href: string;
  title: string;
  /** `konsep` for concept deep-dives, `pustaka` for C++ library references. */
  kind?: 'konsep' | 'pustaka';
  children?: ReactNode;
}

const kinds = {
  konsep: { label: 'Pendalaman', icon: Layers },
  pustaka: { label: 'Pustaka C++', icon: Library },
} as const;

/**
 * A card that points to a longer explanation living on its own page, so the
 * main lesson stays short while curious readers can dig deeper.
 */
export function DeepDive({ href, title, kind = 'konsep', children }: DeepDiveProps) {
  const { label, icon: Icon } = kinds[kind];

  return (
    <Link
      href={href}
      className="deep-dive not-prose group my-6 flex gap-4 rounded-xl border bg-fd-card p-4 transition-colors hover:border-fd-primary/40 hover:bg-fd-muted/40 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-fd-background text-fd-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-fd-primary uppercase">{label}</div>
        <div className="mt-0.5 font-semibold text-fd-foreground">{title}</div>
        {children ? (
          <div className="mt-1 text-sm leading-6 text-fd-muted-foreground [&_p]:m-0">{children}</div>
        ) : null}
      </div>
      <ArrowRight
        className="mt-1 size-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fd-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Inline link to a deep-dive term, styled differently from regular links. */
export function Term({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn('term-link')}>
      {children}
      <BookMarked className="ml-0.5 inline size-3 -translate-y-px align-middle opacity-60" aria-hidden="true" />
    </Link>
  );
}
