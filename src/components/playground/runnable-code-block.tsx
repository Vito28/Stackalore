'use client';

import { useRef, useState, type ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { RunLanguage } from './engine';

// CodeMirror and the playground UI load only when a reader opens one.
const Playground = dynamic(() => import('./playground').then((module) => module.Playground), {
  ssr: false,
  loading: () => (
    <div className="my-3 rounded-xl border bg-fd-card px-3 py-6 text-center text-sm text-fd-muted-foreground">
      Memuat editor…
    </div>
  ),
});

type RunnableCodeBlockProps = ComponentProps<'pre'> & {
  /** Set by `remarkRunnable` for complete C++ programs and their Python pair. */
  'data-run': RunLanguage;
  'data-input'?: string;
};

/**
 * A normal Fumadocs code block with a "Jalankan" button. The button opens a
 * playground under the block, filled with the block's code and sample input.
 */
export function RunnableCodeBlock({ 'data-run': language, 'data-input': input, ...props }: RunnableCodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState<string | null>(null);

  const toggle = () => {
    if (code !== null) {
      setCode(null);
      return;
    }
    // Shiki renders one `.line` span per source line; joining them avoids the
    // extra blank lines that the newline text nodes between spans would add.
    const pre = containerRef.current?.querySelector('pre');
    const lines = pre ? Array.from(pre.querySelectorAll('.line'), (line) => line.textContent ?? '') : [];
    const text = lines.length > 0 ? lines.join('\n') : (pre?.textContent ?? '');
    setCode(text.replace(/\s+$/, '') + '\n');
  };

  const open = code !== null;

  return (
    <div ref={containerRef} className="runnable-code-block">
      <CodeBlock
        {...(props as ComponentProps<typeof CodeBlock>)}
        Actions={({ className, children }) => (
          <div className={cn('flex items-center gap-0.5', className)}>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-fd-primary transition-colors hover:bg-fd-accent focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
            >
              {open ? <X className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
              {open ? 'Tutup' : 'Jalankan'}
            </button>
            {children}
          </div>
        )}
      >
        <Pre>{props.children}</Pre>
      </CodeBlock>
      {open ? (
        <Playground
          sources={{ [language]: { code, input } }}
          defaultLanguage={language}
          onClose={() => setCode(null)}
          className="my-3"
        />
      ) : null}
    </div>
  );
}
