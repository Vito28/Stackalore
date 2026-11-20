'use client';

import dynamic from 'next/dynamic';

/** Client-only wrapper so pages can render the playground without bundling CodeMirror into the server render. */
export const PlaygroundLoader = dynamic(() => import('./playground').then((module) => module.Playground), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border bg-fd-card px-3 py-24 text-center text-sm text-fd-muted-foreground">
      Memuat editor…
    </div>
  ),
});
