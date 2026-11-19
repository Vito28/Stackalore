'use client';

import { useId } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import type { StackStep } from '@/lib/visualisasi/stack';

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const;

/**
 * A stack drawn as a container filled from the bottom. Pushed elements drop
 * in from above, popped ones lift out, and the top element carries a `top`
 * label. Movement is skipped when the reader prefers reduced motion.
 */
export function StackView({ step }: { step: StackStep }) {
  const { items } = step.state;
  const topId = items.at(-1)?.id;
  const isError = step.status === 'error';
  // Keeps the `top` marker animation separate when a page has several stacks.
  const groupId = useId();

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup id={groupId}>
        <div className="flex flex-wrap items-end justify-center gap-x-10 gap-y-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'relative flex min-h-48 w-28 flex-col-reverse gap-1.5 rounded-b-xl border-x-2 border-b-2 px-1.5 pt-10 pb-1.5 transition-colors',
                isError ? 'border-[var(--viz-error)]' : 'border-fd-muted-foreground/40',
              )}
              role="list"
              aria-label={items.length ? `Isi stack dari bawah ke atas: ${items.map((item) => item.value).join(', ')}` : 'Stack kosong'}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    role="listitem"
                    initial={{ opacity: 0, y: -56, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -64, scale: 0.92, transition: { duration: 0.28, ease: 'easeIn' } }}
                    className="viz-cell relative flex h-9 shrink-0 items-center justify-center rounded-md font-mono text-base font-semibold"
                    data-role={step.highlights[item.id]}
                  >
                    {item.value}
                    {item.id === topId ? (
                      <motion.span
                        layoutId="stack-top-marker"
                        className="viz-text-khusus absolute left-full ml-2.5 flex items-center gap-1 font-sans text-xs font-semibold whitespace-nowrap"
                      >
                        <span aria-hidden="true">←</span> top
                      </motion.span>
                    ) : null}
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 ? (
                <span className="absolute inset-x-0 bottom-3 text-center text-xs text-fd-muted-foreground italic">kosong</span>
              ) : null}
            </div>
            <span className="mt-1.5 text-xs text-fd-muted-foreground">dasar stack</span>
          </div>

          <dl className="grid min-w-36 gap-3 pb-6">
            <div>
              <dt className="text-xs text-fd-muted-foreground">size</dt>
              <dd className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{items.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">Hasil operasi</dt>
              <dd>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${step.state.operation}-${step.result ?? ''}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                    className={cn(
                      'viz-cell mt-1 inline-flex min-h-9 items-center rounded-md px-3 font-mono text-sm',
                      !step.result && 'text-fd-muted-foreground',
                    )}
                    data-role={step.result ? (isError ? 'error' : 'khusus') : undefined}
                  >
                    {step.result ?? '—'}
                  </motion.span>
                </AnimatePresence>
              </dd>
            </div>
          </dl>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
