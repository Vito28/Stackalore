'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, Shuffle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Shared bits for the data editors and side panels of the tree visualizations. */

export const editorButton =
  'inline-flex h-10 items-center gap-1.5 rounded-lg border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

export const editorInput =
  'h-10 rounded-lg border bg-fd-background px-3 font-mono text-base text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:text-sm';

/** The list of operations above the drawing; the current one is highlighted. */
export function OperationStrip({ labels, current, error }: { labels: string[]; current: number | null; error: boolean }) {
  if (labels.length === 0) return null;
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Urutan operasi">
      {labels.map((label, index) => (
        <li
          key={index}
          aria-current={index === current ? 'step' : undefined}
          className={cn('viz-cell rounded-md px-2 py-0.5 font-mono text-xs', current !== null && index > current && 'opacity-45')}
          data-role={index === current ? (error ? 'error' : 'aktif') : current !== null && index < current ? 'selesai' : undefined}
        >
          {label}
        </li>
      ))}
    </ol>
  );
}

/** Removable chips for the operations in the editor. */
export function OperationChips({ labels, onRemove }: { labels: string[]; onRemove: (index: number) => void }) {
  if (labels.length === 0) return null;
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Operasi yang akan dijalankan">
      {labels.map((label, index) => (
        <li key={index} className="viz-cell flex items-center rounded-md pl-2 font-mono text-xs">
          {label}
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Hapus operasi ke-${index + 1}, ${label}`}
            className="ml-0.5 grid size-8 place-items-center rounded-md text-fd-muted-foreground hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ol>
  );
}

export function EditorMessage({ message, hint }: { message: string | null; hint: string }) {
  return (
    <p className={cn('text-xs', message ? 'viz-text-error' : 'text-fd-muted-foreground')} aria-live="polite">
      {message ?? hint}
    </p>
  );
}

/** "Kembalikan contoh materi", "Acak", and optionally "Kosongkan". */
export function EditorActions({
  onReset,
  onRandom,
  onClear,
  clearDisabled = false,
}: {
  onReset: () => void;
  onRandom: () => void;
  onClear?: () => void;
  clearDisabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onReset} className={editorButton}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Kembalikan contoh materi
      </button>
      <button type="button" onClick={onRandom} className={editorButton}>
        <Shuffle className="size-4" aria-hidden="true" />
        Acak
      </button>
      {onClear ? (
        <button type="button" onClick={onClear} disabled={clearDisabled} className={editorButton}>
          <Trash2 className="size-4" aria-hidden="true" />
          Kosongkan
        </button>
      ) : null}
    </div>
  );
}

/** Small labelled box beside the drawing, e.g. "Hasil operasi". */
export function InfoBox({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-fd-muted-foreground">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/** Result of the current operation with a short swap animation. */
export function ResultValue({ result, stepKey, error }: { result: string | undefined; stepKey: string; error: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={`${stepKey}-${result ?? ''}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
        className={cn('viz-cell inline-flex min-h-9 items-center rounded-md px-3 font-mono text-sm', !result && 'text-fd-muted-foreground')}
        data-role={result ? (error ? 'error' : 'khusus') : undefined}
      >
        {result ?? '—'}
      </motion.span>
    </AnimatePresence>
  );
}

/** Reports a bad MDX prop to the author during development instead of failing silently. */
export function reportPropError(component: string, prop: string, error: string) {
  if (process.env.NODE_ENV !== 'production') console.error(`<${component} ${prop}>: ${error}`);
}
