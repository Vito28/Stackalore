import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TechBadge } from './badge';

export interface ArticleHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow: string;
  title: ReactNode;
  metadata: string[];
  backHref?: string;
  backLabel?: string;
  notice?: ReactNode;
  noticeHref?: string;
}

export function ArticleHeader({
  backHref,
  backLabel = 'All materials',
  className,
  eyebrow,
  metadata,
  notice,
  noticeHref,
  title,
  ...props
}: ArticleHeaderProps) {
  return (
    <header className={cn('border-b border-fd-border/85 pb-8', className)} {...props}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-fd-muted-foreground transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
      )}

      <TechBadge className="text-cyan-300">{eyebrow}</TechBadge>
      <h1 className="mt-5 max-w-5xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-pretty text-fd-foreground sm:text-5xl lg:text-6xl">
        {title}
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.17em] text-red-400">
        {metadata.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-3">
            {index > 0 && <span className="text-red-500/55" aria-hidden="true">·</span>}
            {item}
          </span>
        ))}
      </div>

      {notice && (
        <div className="mt-7 inline-flex max-w-full items-center gap-2 border border-red-500/35 bg-red-500/8 px-4 py-2.5 text-sm text-fd-muted-foreground">
          <span className="truncate">{notice}</span>
          {noticeHref && (
            <Link
              href={noticeHref}
              className="shrink-0 text-red-400 transition-colors hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
              aria-label="Open related material"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export interface ArticleSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  accent?: 'info' | 'attention' | 'urgent';
}

const sectionAccents = {
  info: 'bg-cyan-400 shadow-[0_0_14px_rgb(34_211_238/0.7)]',
  attention: 'bg-amber-400 shadow-[0_0_14px_rgb(251_191_36/0.7)]',
  urgent: 'bg-red-500 shadow-[0_0_14px_rgb(239_68_68/0.7)]',
} as const;

export function ArticleSection({
  accent = 'info',
  children,
  className,
  title,
  ...props
}: ArticleSectionProps) {
  return (
    <section className={cn('mt-12', className)} {...props}>
      <div className="relative flex items-center pl-5">
        <span
          className={cn('absolute inset-y-0 left-0 w-px', sectionAccents[accent])}
          aria-hidden="true"
        />
        <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-6 space-y-5 text-base leading-8 text-fd-muted-foreground sm:text-lg sm:leading-8">
        {children}
      </div>
    </section>
  );
}
