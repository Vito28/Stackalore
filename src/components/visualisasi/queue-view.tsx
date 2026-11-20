'use client';

import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import type { QueueStep } from '@/lib/visualisasi/queue';

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const;

function Marker({ id, label }: { id: string; label: string }) {
  return (
    <motion.span layoutId={id} className="viz-text-khusus flex items-center gap-0.5 font-sans text-xs font-semibold whitespace-nowrap">
      <span aria-hidden="true">↑</span>
      {label}
    </motion.span>
  );
}

/**
 * A queue drawn as a lane, front on the left. New elements slide in at the
 * back, served ones slide out of the front, and the `depan` / `belakang`
 * markers glide to their new owners. Movement is skipped when the reader
 * prefers reduced motion.
 */
export function QueueView({ step }: { step: QueueStep }) {
  const { items } = step.state;
  const frontId = items[0]?.id;
  const backId = items.at(-1)?.id;
  const isError = step.status === 'error';
  const groupId = useId();
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);

  // A long queue scrolls inside its lane: keep the element this step is about in view.
  useEffect(() => {
    const container = scroller.current;
    if (!container || container.scrollWidth <= container.clientWidth) return;
    const target = container.querySelector<HTMLElement>('[role="listitem"][data-role]');
    const left = target ? target.offsetLeft + target.offsetWidth / 2 - container.clientWidth / 2 : 0;
    container.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
  }, [step, reduce]);

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup id={groupId}>
        <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-4">
          <div className="w-full min-w-0 sm:w-auto sm:max-w-full sm:min-w-64 sm:flex-1">
            <div className="mb-1.5 flex justify-between gap-4 text-xs text-fd-muted-foreground" aria-hidden="true">
              <span>← keluar dari depan</span>
              <span>masuk dari belakang ←</span>
            </div>
            <div ref={scroller} className="overflow-x-auto">
              <div
                role="list"
                aria-label={
                  items.length
                    ? `Isi queue dari depan ke belakang: ${items.map((item) => item.value).join(', ')}`
                    : 'Queue kosong'
                }
                className={cn(
                  'relative flex min-h-[5.75rem] w-max min-w-full items-start gap-1.5 border-y-2 border-dashed px-2 pt-3 pb-8 transition-colors',
                  isError ? 'border-[var(--viz-error)]' : 'border-fd-muted-foreground/35',
                )}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      role="listitem"
                      initial={{ opacity: 0, x: 56, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -56, scale: 0.92, transition: { duration: 0.28, ease: 'easeIn' } }}
                      className="viz-cell relative flex h-10 min-w-14 shrink-0 items-center justify-center rounded-md px-2.5 font-mono text-sm font-semibold"
                      data-role={step.highlights[item.id]}
                    >
                      {item.value}
                      {item.id === frontId || item.id === backId ? (
                        <span className="absolute top-full left-1/2 mt-1.5 flex -translate-x-1/2 gap-2">
                          {item.id === frontId ? <Marker id="queue-depan" label="depan" /> : null}
                          {item.id === backId ? <Marker id="queue-belakang" label="belakang" /> : null}
                        </span>
                      ) : null}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 ? (
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-fd-muted-foreground italic">
                    kosong
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <dl className="grid min-w-36 grid-cols-2 gap-3 sm:grid-cols-1">
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
                      'viz-cell mt-1 inline-flex min-h-9 items-center rounded-md px-3 font-mono text-sm whitespace-nowrap',
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
