'use client';

import { useId, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import {
  FAKTORIAL_LIMITS,
  faktorialPseudocode,
  faktorialSteps,
  lessonFaktorialN,
  validateFaktorialN,
  type CallStackPhase,
  type CallStackStep,
} from '@/lib/visualisasi/call-stack';
import { NumberPicker } from './number-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiCallStackProps {
  /** Starting `n` of `faktorial(n)`, 0 to 5. Defaults to 4 as in the lesson. */
  n?: number;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang berjalan' },
  { role: 'khusus', label: 'menunggu hasil' },
  { role: 'selesai', label: 'sudah punya hasil' },
];

const phaseLabels: Record<CallStackPhase, string> = {
  awal: 'belum mulai',
  turun: '↓ turun: memanggil',
  naik: '↑ naik: kembali',
  selesai: 'selesai',
};

const spring = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 } as const;

/**
 * Call stack drawn as a container filled from the bottom, like the Stack
 * visualization: a call drops a frame in from above, a return lifts it out.
 * Every frame shows its own `n`, which is the point of the lesson section.
 */
function CallStackView({ step, index }: { step: CallStackStep; index: number }) {
  const { frames, phase, n } = step.state;
  const groupId = useId();
  const description = frames
    .map((frame) => `${frame.name}${frame.n === null ? '' : ` n = ${frame.n}`} (${frame.note})`)
    .join(', ');

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup id={groupId}>
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full max-w-xs flex-col items-center">
            <ol
              className="flex w-full flex-col-reverse gap-1.5 rounded-b-xl border-x-2 border-b-2 border-fd-muted-foreground/40 px-1.5 pt-6 pb-1.5"
              // Room for the tallest moment (main + n + 1 frames), so the box does not jump.
              style={{ minHeight: `calc(${n + 2} * 2.625rem + 2rem)` }}
              aria-label={`Isi call stack dari bawah ke atas: ${description}`}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {frames.map((frame) => {
                  const role = step.highlights[frame.id];
                  return (
                    <motion.li
                      key={frame.id}
                      layout
                      initial={{ opacity: 0, y: -48, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -56, scale: 0.94, transition: { duration: 0.26, ease: 'easeIn' } }}
                      className="viz-cell flex min-h-9 shrink-0 flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md px-2.5 py-1"
                      data-role={role}
                    >
                      <span className="font-mono text-sm font-semibold">{frame.name}</span>
                      {frame.n !== null ? (
                        <span className="rounded bg-fd-muted px-1.5 font-mono text-xs leading-5 text-fd-foreground">n = {frame.n}</span>
                      ) : null}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={frame.note}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
                          className={cn(
                            'ml-auto font-mono text-xs whitespace-nowrap',
                            role === 'selesai' ? 'font-semibold text-fd-foreground' : 'text-fd-muted-foreground',
                          )}
                        >
                          {frame.note}
                        </motion.span>
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
            <span className="mt-1.5 text-xs text-fd-muted-foreground">call stack (atas = panggilan terbaru)</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <InfoBox title="Tahap">
              <span className="font-medium text-fd-foreground">{phaseLabels[phase]}</span>
            </InfoBox>
            <InfoBox title="Tinggi call stack">
              <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{frames.length}</span>
              <span className="ml-1 text-xs text-fd-muted-foreground">frame</span>
            </InfoBox>
            <InfoBox title="Hasil">
              <ResultValue result={step.result} stepKey={String(index)} error={false} />
            </InfoBox>
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

function startingN(n: number | undefined): number {
  if (n === undefined) return lessonFaktorialN;
  const error = validateFaktorialN(n);
  if (error) {
    reportPropError('VisualisasiCallStack', 'n', error);
    return lessonFaktorialN;
  }
  return n;
}

/** Call stack of `faktorial(n)`, growing on the way down and shrinking on the way up. MDX: `<VisualisasiCallStack />`. */
export function VisualisasiCallStack({ n, judul = 'Visualisasi call stack faktorial' }: VisualisasiCallStackProps) {
  const [value, setValue] = useState(() => startingN(n));
  const steps = useMemo(() => faktorialSteps(value), [value]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={faktorialPseudocode}
      legend={legend}
      renderHeader={() => (
        <NumberPicker
          label={
            <>
              Nilai <code className="font-mono">n</code> untuk <code className="font-mono">faktorial(n)</code>
            </>
          }
          min={FAKTORIAL_LIMITS.min}
          max={FAKTORIAL_LIMITS.max}
          value={value}
          onChange={setValue}
        />
      )}
      render={(step, index) => <CallStackView step={step} index={index} />}
    />
  );
}
