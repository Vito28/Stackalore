'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { formatCell } from '@/lib/visualisasi/grid';
import { labirinCases, labirinPseudocode, labirinSteps, type LabirinStep } from '@/lib/visualisasi/labirin';
import { ChoicePicker } from './choice-picker';
import { GridView, type GridCellContent } from './grid-view';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiLabirinProps {
  /** Starting maze: `materi` (default), `buntu` or `terbuka`. */
  kasus?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang diproses' },
  { role: 'khusus', label: 'di dalam queue' },
  { role: 'selesai', label: 'rute terpendek' },
];

const caseChoices = labirinCases.map((item) => ({ value: item.id, label: item.label }));

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const;

const position = (id: string) => {
  const [r, c] = id.slice(1).split('c').map(Number);
  return formatCell(r, c);
};

function startingCase(kasus: string | undefined): string {
  if (kasus === undefined) return labirinCases[0].id;
  if (labirinCases.some((item) => item.id === kasus)) return kasus;
  reportPropError('VisualisasiLabirin', 'kasus', `pilih salah satu dari ${labirinCases.map((item) => item.id).join(', ')}.`);
  return labirinCases[0].id;
}

function LabirinView({ step, index }: { step: LabirinStep; index: number }) {
  const { grid, dist, queue, start, end } = step.state;
  const content: Record<string, GridCellContent> = {};
  for (const [id, value] of Object.entries(dist)) content[id] = { text: String(value), description: `jarak ${value}` };
  content[start] = { ...content[start], tag: 'S' };
  content[end] = { ...content[end], tag: 'E', placeholder: end in dist ? undefined : 'E' };
  const found = Object.keys(dist).length;

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <div className="flex flex-col items-center gap-4">
        <GridView
          grid={grid}
          highlights={step.highlights}
          content={content}
          label={`Labirin ${grid.rows} kali ${grid.cols}. ${found} sel sudah punya jarak.`}
        />

        <div className="w-full">
          <div className="mb-1.5 text-xs text-fd-muted-foreground">Queue (depan di kiri)</div>
          <ol
            className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-fd-muted-foreground/35 px-2 py-1.5"
            aria-label={queue.length ? `Isi queue dari depan: ${queue.map(position).join(', ')}` : 'Queue kosong'}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {queue.map((id) => (
                <motion.li
                  key={id}
                  layout
                  initial={{ opacity: 0, x: 24, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }}
                  className="viz-cell flex h-8 items-center gap-1.5 rounded-md px-2 font-mono text-xs whitespace-nowrap"
                  data-role="khusus"
                >
                  {position(id)}
                  <span className="text-fd-muted-foreground">jarak {dist[id]}</span>
                </motion.li>
              ))}
            </AnimatePresence>
            {queue.length === 0 ? <li className="text-xs text-fd-muted-foreground italic">kosong</li> : null}
          </ol>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          <InfoBox title="dist[E] sejauh ini">
            <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{dist[end] ?? -1}</span>
          </InfoBox>
          <InfoBox title="Hasil">
            <ResultValue result={step.result} stepKey={String(index)} error={false} />
          </InfoBox>
        </div>
      </div>
    </MotionConfig>
  );
}

/** BFS on a maze from S to E, as in the BFS lesson. MDX: `<VisualisasiLabirin />`. */
export function VisualisasiLabirin({ kasus, judul = 'Visualisasi BFS pada labirin' }: VisualisasiLabirinProps) {
  const [caseId, setCaseId] = useState(() => startingCase(kasus));
  const current = labirinCases.find((item) => item.id === caseId) ?? labirinCases[0];
  const steps = useMemo(() => labirinSteps(current.rows), [current]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={labirinPseudocode}
      legend={legend}
      renderHeader={() => <ChoicePicker label="Labirin" choices={caseChoices} value={caseId} onChange={setCaseId} />}
      render={(step, index) => <LabirinView step={step} index={index} />}
    />
  );
}
