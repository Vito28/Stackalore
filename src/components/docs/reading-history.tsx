'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Per-tab list of recently visited docs pages. Deep-dive pages use it to send
 * readers back to the lesson they actually came from.
 */

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

function pushHistory(pathname: string) {
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

/** Mounted once in the docs layout to record every page the reader opens. */
export function ReadingHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    pushHistory(pathname);
  }, [pathname]);

  return null;
}
