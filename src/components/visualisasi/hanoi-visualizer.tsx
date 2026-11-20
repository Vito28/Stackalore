'use client';

import { useId, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import {
  HANOI_LIMITS,
  PEGS,
  diskId,
  formatHanoiCall,
  hanoiPseudocode,
  hanoiSteps,
  lessonHanoiDisks,
  validateHanoiDisks,
  type HanoiCall,
  type HanoiStep,
  type Peg,
} from '@/lib/visualisasi/hanoi';
import { NumberPicker } from './number-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiHanoiProps {
  /** Starting number of disks, 1 to 4. Defaults to 3 as in the lesson. */
  cakram?: number;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'cakram yang sedang diurus' },
  { role: 'khusus', label: 'harus pindah dulu' },
  { role: 'selesai', label: 'sudah sampai' },
];

const spring = { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 } as const;

/** Disk 1 is the narrowest; the largest disk fills its peg. */
function diskWidth(disk: number, disks: number): number {
  if (disks === 1) return 60;
  return 34 + ((disk - 1) / (disks - 1)) * 66;
}

const pegRoleLabel = (peg: Peg, call: HanoiCall) => (peg === call.asal ? 'asal' : peg === call.tujuan ? 'tujuan' : 'bantu');

/**
 * Three pegs side by side. A moved disk keeps its `layoutId`, so it glides
 * from one peg to the other. Under each peg is its role in the call that is
 * running now, because those roles swap from call to call.
 */
function HanoiView({ step, index }: { step: HanoiStep; index: number }) {
  const { pegs, calls, disks, moves, total } = step.state;
  const groupId = useId();
  const current: HanoiCall = calls.at(-1) ?? { n: disks, asal: 'A', tujuan: 'C', bantu: 'B' };
  const description = PEGS.map(
    (peg) => `Tiang ${peg}: ${pegs[peg].length ? `cakram ${pegs[peg].join(', ')} dari bawah ke atas` : 'kosong'}`,
  ).join('. ');

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup id={groupId}>
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-4" role="img" aria-label={`${description}.`}>
            {PEGS.map((peg) => (
              <div key={peg} className="flex min-w-0 flex-col items-center">
                <div
                  className="relative flex w-full flex-col-reverse items-center gap-1"
                  style={{ height: `calc(${disks} * 2rem + 1.75rem)` }}
                >
                  <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-t-full bg-fd-muted-foreground/30" />
                  {pegs[peg].map((disk) => (
                    <motion.div
                      key={disk}
                      layoutId={`cakram-${disk}`}
                      className="viz-cell relative z-10 grid h-7 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold"
                      style={{ width: `${diskWidth(disk, disks)}%` }}
                      data-role={step.highlights[diskId(disk)]}
                    >
                      {disk}
                    </motion.div>
                  ))}
                </div>
                <div aria-hidden="true" className="h-1.5 w-full rounded-full bg-fd-muted-foreground/40" />
                <div className="mt-1.5 font-mono text-sm font-semibold text-fd-foreground">{peg}</div>
                <div className="text-xs text-fd-muted-foreground">{pegRoleLabel(peg, current)}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <div className="text-xs text-fd-muted-foreground">Call stack (atas = panggilan terbaru)</div>
              <ol className="mt-1.5 flex min-h-8 flex-col-reverse gap-1" aria-label="Call stack dari bawah ke atas">
                <AnimatePresence initial={false} mode="popLayout">
                  {calls.map((call, depth) => (
                    <motion.li
                      key={`${depth}-${formatHanoiCall(call)}`}
                      layout
                      initial={{ opacity: 0, y: -14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
                      className="viz-cell w-fit rounded-md px-2 py-1 font-mono text-xs"
                      data-role={depth === calls.length - 1 ? 'aktif' : 'khusus'}
                    >
                      {formatHanoiCall(call)}
                    </motion.li>
                  ))}
                </AnimatePresence>
                {calls.length === 0 ? <li className="text-xs leading-8 text-fd-muted-foreground italic">kosong</li> : null}
              </ol>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 sm:grid sm:min-w-40 sm:content-start sm:gap-3">
              <InfoBox title="Langkah pindah">
                <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{moves}</span>
                <span className="ml-1 text-xs text-fd-muted-foreground">dari {total}</span>
              </InfoBox>
              <InfoBox title="Hasil">
                <ResultValue result={step.result} stepKey={String(index)} error={false} />
              </InfoBox>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

function startingDisks(cakram: number | undefined): number {
  if (cakram === undefined) return lessonHanoiDisks;
  const error = validateHanoiDisks(cakram);
  if (error) {
    reportPropError('VisualisasiHanoi', 'cakram', error);
    return lessonHanoiDisks;
  }
  return cakram;
}

/** Tower of Hanoi with the recursive calls behind every move. MDX: `<VisualisasiHanoi />`. */
export function VisualisasiHanoi({ cakram, judul = 'Visualisasi Menara Hanoi' }: VisualisasiHanoiProps) {
  const [disks, setDisks] = useState(() => startingDisks(cakram));
  const steps = useMemo(() => hanoiSteps(disks), [disks]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={hanoiPseudocode}
      legend={legend}
      renderHeader={() => (
        <NumberPicker label="Banyak cakram" min={HANOI_LIMITS.min} max={HANOI_LIMITS.max} value={disks} onChange={setDisks} />
      )}
      render={(step, index) => <HanoiView step={step} index={index} />}
    />
  );
}
