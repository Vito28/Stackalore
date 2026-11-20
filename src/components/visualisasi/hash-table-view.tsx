'use client';

import { Fragment, useId } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { bucketId, type HashComputation, type HashTableStep } from '@/lib/visualisasi/hash-table';

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const;

/** `hashMainan("dina")`: each letter over its ASCII code, the sum, then `% 10`. */
function Computation({ computation }: { computation: HashComputation }) {
  const { key, codes, total, bucket } = computation;
  return (
    <div className="space-y-1.5">
      <div className="font-mono text-xs text-fd-muted-foreground">hashMainan(&quot;{key}&quot;)</div>
      <div className="flex flex-wrap items-end gap-x-1.5 gap-y-2 font-mono">
        {codes.map((code, index) => (
          <Fragment key={index}>
            {index > 0 ? (
              <span className="pb-0.5 text-xs text-fd-muted-foreground" aria-hidden="true">
                +
              </span>
            ) : null}
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: index * 0.04 }}
              className="flex flex-col items-center leading-tight"
            >
              <span className="text-sm font-semibold text-fd-foreground">{key[index]}</span>
              <span className="text-xs text-fd-muted-foreground tabular-nums">{code}</span>
            </motion.span>
          </Fragment>
        ))}
        <span className="pb-0.5 text-xs text-fd-foreground">= {total}</span>
        <span className="flex items-center gap-1.5 pb-0.5 text-xs whitespace-nowrap">
          <span className="text-fd-muted-foreground" aria-hidden="true">
            →
          </span>
          <span className="text-fd-foreground">
            {total} % 10 = <strong className="viz-text-khusus text-sm">{bucket}</strong>
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * Ten lockers with separate chaining. The current key's hash is worked out
 * above the lockers, the target locker lights up, and entries slide into or
 * out of its chain. Movement is skipped when the reader prefers reduced motion.
 */
export function HashTableView({ step }: { step: HashTableStep }) {
  const { buckets, computation } = step.state;
  const groupId = useId();

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup id={groupId}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
            <div className="min-h-[3.75rem] min-w-0 basis-full rounded-lg border border-dashed px-3 py-2 sm:basis-0 sm:flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.state.operation ?? 'awal'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                >
                  {computation ? (
                    <Computation computation={computation} />
                  ) : (
                    <p className="py-2 text-xs text-fd-muted-foreground">Perhitungan hash setiap kunci muncul di sini.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 sm:block">
              <div className="text-xs text-fd-muted-foreground">Hasil operasi</div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${step.state.operation}-${step.result ?? ''}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                  className={cn(
                    'viz-cell inline-flex min-h-9 items-center rounded-md px-3 font-mono text-sm whitespace-nowrap sm:mt-1',
                    !step.result && 'text-fd-muted-foreground',
                  )}
                  data-role={step.result ? 'khusus' : undefined}
                >
                  {step.result ?? '—'}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <ol className="grid grid-flow-col grid-cols-2 grid-rows-[repeat(5,auto)] gap-1.5" aria-label="Isi loker 0 sampai 9">
            {buckets.map((chain, index) => (
              <li
                key={index}
                className="viz-cell flex min-h-10 min-w-0 items-stretch overflow-hidden rounded-lg"
                data-role={step.highlights[bucketId(index)]}
                aria-label={
                  chain.length
                    ? `Loker ${index}: ${chain.map((entry) => `${entry.key} ${entry.value}`).join(', ')}`
                    : `Loker ${index}: kosong`
                }
              >
                <span className="flex w-7 shrink-0 items-center justify-center border-r sm:w-9 border-fd-border font-mono text-xs font-semibold text-fd-muted-foreground tabular-nums">
                  {index}
                </span>
                <div className="flex min-w-0 flex-1 items-center px-1 py-1 sm:px-1.5">
                  <div className="relative flex min-w-0 flex-wrap items-center gap-1" aria-hidden="true">
                    <AnimatePresence initial={false} mode="popLayout">
                      {chain.map((entry, position) => (
                        <motion.div
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, x: -14, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85, y: 8, transition: { duration: 0.25, ease: 'easeIn' } }}
                          className="flex items-center gap-1"
                        >
                          {position > 0 ? <span className="text-xs text-fd-muted-foreground">→</span> : null}
                          <span
                            className="viz-cell inline-flex h-7 items-center gap-0.5 rounded-md px-1.5 font-mono text-xs whitespace-nowrap sm:px-2"
                            data-role={step.highlights[entry.id]}
                          >
                            <span className="font-semibold">{entry.key}</span>
                            <span className="text-fd-muted-foreground">:</span>
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={entry.value}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="tabular-nums"
                              >
                                {entry.value}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {chain.length === 0 ? <span className="px-1 text-xs text-fd-muted-foreground/60">—</span> : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
