'use client';

import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { cn } from '@/lib/cn';

export function SearchTrigger({
  className,
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'large';
}) {
  const { setOpenSearch, hotKey } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      aria-label="Cari materi"
      className={cn(
        'group inline-flex items-center gap-2 rounded-lg border bg-fd-muted/60 text-left text-fd-muted-foreground outline-none transition-colors hover:border-fd-foreground/20 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring',
        size === 'large' ? 'h-11 w-full px-4 text-[0.95rem]' : 'h-8 px-2.5 text-sm',
        className,
      )}
    >
      <Search className={size === 'large' ? 'size-4.5' : 'size-4'} aria-hidden="true" />
      <span className="flex-1 truncate">Cari materi…</span>
      <span className="hidden items-center gap-0.5 sm:inline-flex" aria-hidden="true">
        {hotKey.map((key, index) => (
          <kbd
            key={index}
            className="rounded border bg-fd-background px-1.5 font-mono text-[0.6875rem] leading-5 text-fd-muted-foreground"
          >
            {key.display}
          </kbd>
        ))}
      </span>
    </button>
  );
}

export function SearchIconButton({ className }: { className?: string }) {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      aria-label="Cari materi"
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg text-fd-muted-foreground outline-none transition-colors hover:bg-fd-muted hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring',
        className,
      )}
    >
      <Search className="size-4" aria-hidden="true" />
    </button>
  );
}
