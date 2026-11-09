'use client';

import {
  createContext,
  use,
  useLayoutEffect,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { TOCItemType } from 'fumadocs-core/toc';

interface DocsContextValue {
  tree: PageTree.Root;
  toc: TOCItemType[];
  setToc: Dispatch<SetStateAction<TOCItemType[]>>;
}

export const DocsContext = createContext<DocsContextValue | null>(null);

export function useDocsContext() {
  const context = use(DocsContext);
  if (!context) throw new Error('useDocsContext must be used inside <DocsShell>');
  return context;
}

/**
 * Pages render this to hand their headings to the sidebar, which lives in the
 * layout and therefore cannot read page data directly.
 */
export function TocRegistrar({ toc }: { toc: TOCItemType[] }) {
  const { setToc } = useDocsContext();

  useLayoutEffect(() => {
    setToc(toc);
    return () => setToc([]);
  }, [toc, setToc]);

  return null;
}

/* ------------------------------------------------------------------------- */
/* Reading history (per tab), used to send readers back from a deep-dive.    */
/* ------------------------------------------------------------------------- */

const historyKey = 'stacklore:history';
const emptyHistory: string[] = [];
const historyListeners = new Set<() => void>();
let historyCache: string[] | null = null;

function readHistory(): string[] {
  if (historyCache) return historyCache;
  try {
    const stored = JSON.parse(sessionStorage.getItem(historyKey) ?? '[]');
    historyCache = Array.isArray(stored) ? stored.filter((v) => typeof v === 'string') : [];
  } catch {
    historyCache = [];
  }
  return historyCache ?? emptyHistory;
}

export function pushHistory(pathname: string) {
  const current = readHistory();
  if (current[current.length - 1] === pathname) return;

  historyCache = [...current, pathname].slice(-30);
  try {
    sessionStorage.setItem(historyKey, JSON.stringify(historyCache));
  } catch {
    // Storage can be unavailable (private mode); history then lives in memory only.
  }
  for (const listener of historyListeners) listener();
}

function subscribeHistory(listener: () => void) {
  historyListeners.add(listener);
  return () => historyListeners.delete(listener);
}

export function useReadingHistory() {
  return useSyncExternalStore(subscribeHistory, readHistory, () => emptyHistory);
}
