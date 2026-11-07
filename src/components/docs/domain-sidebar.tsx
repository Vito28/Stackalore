'use client';

import { useState, type CSSProperties } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Binary,
  BookOpen,
  BrainCircuit,
  ChartScatter,
  ChevronRight,
  Check,
  ChevronsUpDown,
  ListTree,
  LockKeyhole,
  Network,
} from 'lucide-react';
import {
  SidebarItem,
  SidebarSeparator,
} from 'fumadocs-ui/components/sidebar/base';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import { cn } from '@/lib/cn';

export const docsDomains = {
  'data-structures': {
    label: 'Data Structures & Algorithms',
    shortLabel: 'Data Structures',
    description: 'Organize data, trace operations, and reason about efficiency.',
    href: '/docs/data-structures/welcome',
    accent: '#06b6d4',
    accentClass: 'text-domain-dsa',
    borderClass: 'border-domain-dsa/25',
    backgroundClass: 'bg-domain-dsa/8',
    icon: Network,
    chapterCount: 10,
  },
  'machine-learning': {
    label: 'Machine Learning',
    shortLabel: 'Machine Learning',
    description: 'Learn how models discover useful patterns from data.',
    href: '/docs/machine-learning',
    accent: '#10b981',
    accentClass: 'text-domain-ml',
    borderClass: 'border-domain-ml/25',
    backgroundClass: 'bg-domain-ml/8',
    icon: ChartScatter,
    chapterCount: 1,
  },
  'deep-learning': {
    label: 'Deep Learning',
    shortLabel: 'Deep Learning',
    description: 'See how neural networks build complex representations.',
    href: '/docs/deep-learning',
    accent: '#8b5cf6',
    accentClass: 'text-domain-dl',
    borderClass: 'border-domain-dl/25',
    backgroundClass: 'bg-domain-dl/8',
    icon: BrainCircuit,
    chapterCount: 1,
  },
  cryptography: {
    label: 'Cryptography',
    shortLabel: 'Cryptography',
    description: 'Understand how information is protected and verified.',
    href: '/docs/cryptography',
    accent: '#f59e0b',
    accentClass: 'text-domain-crypto',
    borderClass: 'border-domain-crypto/25',
    backgroundClass: 'bg-domain-crypto/8',
    icon: LockKeyhole,
    chapterCount: 1,
  },
} as const;

export type DocsDomainSlug = keyof typeof docsDomains;

interface DomainSidebarProps {
  domain: DocsDomainSlug;
}

interface DomainSidebarBannerProps extends DomainSidebarProps {
  materialCount: number;
}

export function DomainSidebarBanner({
  domain,
  materialCount,
}: DomainSidebarBannerProps) {
  const [open, setOpen] = useState(false);
  const active = docsDomains[domain];
  const Icon = active.icon;
  const accentStyle = { '--subject-accent': active.accent } as CSSProperties;

  return (
    <div className="space-y-3" style={accentStyle}>
      <Link
        href="/docs"
        className="group inline-flex items-center gap-2 text-xs font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        All documentation
      </Link>

      <div>
        <p className={cn('mb-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase', active.accentClass)}>
          Current subject
        </p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-2.5 text-left outline-none transition-colors hover:bg-fd-accent/60 data-[popup-open]:bg-fd-accent/70',
              active.borderClass,
              active.backgroundClass,
            )}
            aria-label="Switch documentation subject"
          >
            <span
              className="pointer-events-none absolute -top-7 -right-6 size-20 rounded-full opacity-15 blur-2xl"
              style={{ backgroundColor: active.accent }}
            />
            <span
              className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border bg-fd-background/85 shadow-sm"
              style={{ borderColor: `color-mix(in srgb, ${active.accent} 32%, transparent)` }}
            >
              <Icon className={cn('size-[18px]', active.accentClass)} />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-[0.875rem] font-semibold tracking-tight text-fd-foreground">
                {active.shortLabel}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-fd-muted-foreground">
                {active.chapterCount} {active.chapterCount === 1 ? 'chapter' : 'chapters'}
              </span>
            </span>
            <ChevronsUpDown className="relative size-4 shrink-0 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground" />
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={6}
            className="flex w-(--anchor-width) flex-col gap-1 p-1.5 fd-scroll-container"
          >
            <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">
              Choose a subject
            </p>
            {Object.entries(docsDomains).map(([slug, item]) => {
              const ItemIcon = item.icon;
              const selected = slug === domain;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-2.5 rounded-lg border border-transparent p-2 transition-colors hover:bg-fd-accent/75 hover:text-fd-accent-foreground"
                  style={
                    selected
                      ? {
                          borderColor: `color-mix(in srgb, ${item.accent} 22%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${item.accent} 8%, transparent)`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-fd-border bg-fd-background [&_svg]:size-4"
                    style={selected ? { color: item.accent, borderColor: `color-mix(in srgb, ${item.accent} 30%, transparent)` } : { color: item.accent }}
                  >
                    <ItemIcon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs leading-5 font-semibold text-fd-foreground">
                      {item.shortLabel}
                    </span>
                    <span className="block text-[10px] leading-4 text-fd-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <Check
                    className={cn('mt-1 size-3.5 shrink-0', selected ? 'opacity-100' : 'opacity-0')}
                    style={{ color: item.accent }}
                  />
                </Link>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2 border-t border-fd-border/70 px-1 pt-3">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md border"
          style={{
            color: active.accent,
            borderColor: `color-mix(in srgb, ${active.accent} 25%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${active.accent} 8%, transparent)`,
          }}
        >
          <ListTree className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">
            Course contents
          </span>
          <span className="mt-0.5 block text-xs font-medium text-fd-foreground">
            Browse every lesson
          </span>
        </span>
        <span className="rounded-full border border-fd-border bg-fd-background px-2 py-1 font-mono text-[10px] font-semibold text-fd-muted-foreground">
          {materialCount}
        </span>
      </div>
    </div>
  );
}

export function DomainSidebarFooter({ domain }: DomainSidebarProps) {
  const active = docsDomains[domain];
  const Icon = active.chapterCount > 1 ? Binary : BookOpen;

  return (
    <Link
      href="/#visualizations"
      className="group mt-2 flex items-center gap-2.5 rounded-lg border border-fd-border bg-fd-background px-3 py-2.5 text-xs transition-colors hover:border-fd-foreground/15 hover:bg-fd-accent/60"
    >
      <Icon className={cn('size-4', active.accentClass)} />
      <span>
        <span className="block font-medium text-fd-foreground">Open visualizer</span>
        <span className="mt-0.5 block text-[10px] text-fd-muted-foreground">Learn by watching each step</span>
      </span>
      <ChevronRight className="ml-auto size-3.5 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

interface DomainSidebarItemProps extends DomainSidebarProps {
  item: PageTree.Item;
}

export function DomainSidebarItem({ item, domain }: DomainSidebarItemProps) {
  const pathname = usePathname();
  const active = pathname === item.url || pathname === `${item.url}/`;
  const accent = docsDomains[domain].accent;

  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={active}
      className="group relative flex min-h-10 items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-[0.8125rem] leading-5 text-fd-muted-foreground transition-colors hover:bg-fd-accent/60 hover:text-fd-foreground data-[active=true]:font-semibold"
      style={
        active
          ? {
              color: accent,
              borderColor: `color-mix(in srgb, ${accent} 24%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accent} 9%, transparent)`,
            }
          : undefined
      }
      icon={
        item.icon ? (
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-md border border-fd-border bg-fd-background text-fd-muted-foreground group-hover:text-fd-foreground [&_svg]:size-3.5"
            style={active ? { color: accent, borderColor: `color-mix(in srgb, ${accent} 30%, transparent)` } : undefined}
          >
            {item.icon}
          </span>
        ) : undefined
      }
    >
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
      <ChevronRight className="size-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60" />
      {active ? (
        <span
          className="absolute inset-y-2 left-0 w-0.5 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
      ) : null}
    </SidebarItem>
  );
}

export function DomainSidebarSeparator({ item }: { item: PageTree.Separator }) {
  return (
    <SidebarSeparator className="mt-5 mb-1.5 flex items-center gap-2 px-2 first:mt-1">
      <span className="text-[10px] font-semibold tracking-[0.14em] text-fd-muted-foreground/75 uppercase">
        {item.name}
      </span>
      <span className="h-px flex-1 bg-fd-border/70" aria-hidden="true" />
    </SidebarSeparator>
  );
}
