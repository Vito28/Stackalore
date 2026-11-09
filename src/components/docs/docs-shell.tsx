'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import { AnchorProvider, type TOCItemType } from 'fumadocs-core/toc';
import { Sparkles, X } from 'lucide-react';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { SiteHeader } from '@/components/site/site-header';
import { cn } from '@/lib/cn';
import { DocsContext, pushHistory } from './docs-context';
import { DocsSidebar } from './docs-sidebar';

interface DocsShellProps {
  tree: PageTree.Root;
  children: ReactNode;
}

/**
 * Documentation layout: header on top, article in the main column, and the
 * lesson navigation on the RIGHT. Below the `lg` breakpoint the navigation
 * moves into a drawer that slides in from the right.
 */
export function DocsShell({ tree, children }: DocsShellProps) {
  const pathname = usePathname();
  const [toc, setToc] = useState<TOCItemType[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    pushHistory(pathname);
  }, [pathname]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const context = useMemo(() => ({ tree, toc, setToc }), [tree, toc]);

  return (
    <DocsContext value={context}>
      <AnchorProvider toc={toc} single>
        <AISearch>
          <SiteHeader onOpenSidebar={openDrawer} actions={<AskAiButton />} />

          <div className="mx-auto flex w-full max-w-[90rem] flex-1">
            <div className="min-w-0 flex-1">{children}</div>
            <aside
              aria-label="Daftar materi"
              className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-72 shrink-0 border-l lg:block xl:w-80"
            >
              <DocsSidebar />
            </aside>
          </div>

          <SidebarDrawer open={drawerOpen} onClose={closeDrawer} />
          <AISearchPanel />
        </AISearch>
      </AnchorProvider>
    </DocsContext>
  );
}

function AskAiButton() {
  return (
    <AISearchTrigger
      aria-label="Tanya AI"
      title="Tanya AI"
      className="inline-flex size-8 items-center justify-center gap-1.5 rounded-lg text-sm text-fd-muted-foreground outline-none transition-colors hover:bg-fd-muted hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring xl:w-auto xl:px-2.5"
    >
      <Sparkles className="size-4" aria-hidden="true" />
      <span className="hidden xl:inline">Tanya AI</span>
    </AISearchTrigger>
  );
}

function SidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-[visibility] duration-300 lg:hidden',
        open ? 'visible' : 'invisible',
      )}
      inert={!open}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Daftar materi"
        className={cn(
          'absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col border-l bg-fd-background shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <p className="text-sm font-semibold text-fd-foreground">Materi</p>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="Tutup daftar materi"
            className="grid size-8 place-items-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <DocsSidebar variant="drawer" onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
