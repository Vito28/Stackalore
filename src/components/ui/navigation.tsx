import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  external?: boolean;
  trailing?: ReactNode;
}

export interface TechnicalNavigationProps
  extends HTMLAttributes<HTMLElement> {
  brand: ReactNode;
  items: NavigationItem[];
  actions?: ReactNode;
  brandHref?: string;
  sticky?: boolean;
}

export function TechnicalNavigation({
  actions,
  brand,
  brandHref = '/',
  className,
  items,
  sticky = false,
  ...props
}: TechnicalNavigationProps) {
  return (
    <header
      className={cn(
        'tech-glass z-40 w-full border-y border-fd-border/80',
        sticky && 'sticky top-0',
        className,
      )}
      {...props}
    >
      <div className="flex min-h-16 w-full items-stretch lg:min-h-24">
        <Link
          href={brandHref}
          className="relative flex shrink-0 items-center overflow-hidden border-r border-fd-border/75 px-4 text-fd-foreground transition-colors hover:bg-fd-accent/35 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500/70 sm:px-6 lg:w-[clamp(15rem,18vw,21.5rem)] lg:px-8"
        >
          <span
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fd-border)_1px,transparent_1px)] bg-[size:20px_20px] opacity-25 [mask-image:linear-gradient(to_right,black,transparent_95%)]"
            aria-hidden="true"
          />
          <span className="relative">{brand}</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="min-w-0 flex-1 overflow-x-auto px-2 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex h-full min-w-max items-center justify-start gap-1 lg:w-full lg:justify-center lg:gap-2 xl:gap-3">
            {items.map((item) => {
              const sharedClassName = cn(
                'group relative flex h-11 items-center gap-2 border border-transparent px-3.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-fd-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-fd-border/80 hover:bg-fd-accent/45 hover:text-fd-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background xl:px-4',
                item.active &&
                  'border-cyan-700/35 bg-cyan-500/6 text-fd-foreground shadow-[inset_0_0_0_1px_rgb(6_182_212/0.04)] dark:border-cyan-400/30 dark:bg-cyan-400/5',
              );
              const content = (
                <>
                  <span>{item.label}</span>
                  {item.trailing}
                  {item.active && (
                    <span
                      className="absolute -inset-[3px] border border-cyan-500/0 transition-colors group-focus-visible:border-cyan-500/80"
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              return (
                <li key={`${item.label}-${item.href}`} className="flex">
                  {item.external ? (
                    <a
                      href={item.href}
                      className={sharedClassName}
                      target="_blank"
                      rel="noreferrer"
                      aria-current={item.active ? 'page' : undefined}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={sharedClassName}
                      aria-current={item.active ? 'page' : undefined}
                    >
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {actions && (
          <div className="flex shrink-0 items-center gap-2 border-l border-fd-border/75 px-2.5 sm:px-4 lg:gap-3 lg:px-5">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
