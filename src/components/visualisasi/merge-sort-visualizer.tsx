'use client';

import { useId, useMemo, useState } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'motion/react';
import { randomValues, type ArrayItem } from '@/lib/visualisasi/array';
import { MERGE_RANDOM_LENGTH, mergeCases, mergePseudocode, mergeSortSteps, type MergeStep } from '@/lib/visualisasi/merge-sort';
import { arraySpring } from './array-view';
import { ChoicePicker } from './choice-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiMergeSortProps {
  /** Starting data: `materi` (default), `urut`, `terbalik` or `ganjil`. */
  kasus?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'baru diambil' },
  { role: 'khusus', label: 'pembandingnya' },
  { role: 'selesai', label: 'sudah urut' },
];

const choices = mergeCases.map((example) => ({ value: example.id, label: example.label }));

/**
 * Merge sort on a grid: one column per index, one row per recursion depth.
 * Dividing drops a range's elements into its two halves on the next row;
 * merging lifts them back up one at a time, smallest front first. The `i`
 * and `j` badges mark the fronts of the halves, as in the lesson's `gabung`.
 */
function MergeSortView({ step, index }: { step: MergeStep; index: number }) {
  const { segments, n, rows, heads, call, comparisons } = step.state;
  const groupId = useId();
  const headName = new Map(heads.map((head) => [head.id, head.name]));
  const placed = segments
    .flatMap((segment) =>
      segment.cells.flatMap((cell, offset) =>
        cell ? [{ item: cell, row: 2 * segment.depth + 1, column: segment.kiri + offset + 1 }] : [],
      ),
    )
    .sort((a, b) => a.item.id.localeCompare(b.item.id));
  const describe = (cells: (ArrayItem | null)[]) => cells.map((cell) => cell?.value ?? '_').join(' ');
  const label = segments.map((segment) => `tingkat ${segment.depth}, [${segment.kiri}, ${segment.kanan}]: ${describe(segment.cells)}`).join('; ');

  return (
    <MotionConfig reducedMotion="user" transition={arraySpring}>
      <LayoutGroup id={groupId}>
        <div className="flex flex-col items-center gap-4">
          <div className="min-h-6 text-xs text-fd-muted-foreground">
            {call ? (
              <>
                Sedang berjalan: <code className="rounded bg-fd-muted px-1 py-0.5 font-mono text-fd-foreground">{call}</code>
              </>
            ) : (
              'Satu baris = satu tingkat rekursi'
            )}
          </div>

          <div
            role="list"
            aria-label={label}
            className="mx-auto grid w-full gap-x-1 gap-y-0.5 sm:gap-x-1.5"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(0, 3rem))`,
              gridTemplateRows: Array.from({ length: rows }, () => '2.5rem 0.75rem').join(' '),
              justifyContent: 'center',
            }}
          >
            {segments.map((segment) => {
              const role = step.highlights[segment.id];
              return (
                <div
                  key={segment.id}
                  className="mx-0.5 mt-0.5 h-1.5 rounded-b-sm border-x-[1.5px] border-b-[1.5px] border-fd-muted-foreground/45 transition-colors"
                  style={{
                    gridRow: 2 * segment.depth + 2,
                    gridColumn: `${segment.kiri + 1} / ${segment.kanan + 2}`,
                    borderColor: role ? `var(--viz-${role})` : undefined,
                  }}
                  aria-hidden="true"
                />
              );
            })}

            {segments.flatMap((segment) =>
              segment.cells.map((cell, offset) =>
                cell ? null : (
                  <div
                    key={`slot-${segment.id}-${offset}`}
                    className="rounded-md border-[1.5px] border-dashed border-fd-muted-foreground/40"
                    style={{ gridRow: 2 * segment.depth + 1, gridColumn: segment.kiri + offset + 1 }}
                    aria-hidden="true"
                  />
                ),
              ),
            )}

            {placed.map(({ item, row, column }) => {
              const head = headName.get(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  role="listitem"
                  className="viz-cell relative flex h-10 w-full items-center justify-center rounded-md font-mono text-[0.8125rem] font-semibold tabular-nums sm:text-sm"
                  style={{ gridRow: row, gridColumn: column }}
                  data-role={step.highlights[item.id]}
                >
                  {item.value}
                  {head ? (
                    <span className="viz-text-aktif absolute -top-2 -right-1 rounded-full border bg-fd-background px-1 font-sans text-[0.625rem] leading-3.5 font-semibold">
                      {head}
                    </span>
                  ) : null}
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <InfoBox title="Perbandingan">
              <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{comparisons}</span>
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

function startingCase(kasus: string | undefined): string {
  if (kasus === undefined) return 'materi';
  if (!mergeCases.some((example) => example.id === kasus)) {
    reportPropError('VisualisasiMergeSort', 'kasus', `harus salah satu dari ${mergeCases.map((example) => example.id).join(', ')}.`);
    return 'materi';
  }
  return kasus;
}

/** Merge sort, dividing down and merging back up. MDX: `<VisualisasiMergeSort />`. */
export function VisualisasiMergeSort({ kasus, judul = 'Visualisasi merge sort' }: VisualisasiMergeSortProps) {
  const [caseId, setCaseId] = useState(() => startingCase(kasus));
  const [random, setRandom] = useState<number[] | null>(null);
  const values = random ?? mergeCases.find((example) => example.id === caseId)!.values;
  const steps = useMemo(() => mergeSortSteps(values), [values]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={mergePseudocode}
      legend={legend}
      renderHeader={() => (
        <ChoicePicker
          label="Data"
          choices={choices}
          value={caseId}
          onChange={(id) => {
            setRandom(null);
            setCaseId(id);
          }}
          onRandom={() => setRandom(randomValues(MERGE_RANDOM_LENGTH))}
          randomActive={random !== null}
        />
      )}
      render={(step, index) => <MergeSortView step={step} index={index} />}
    />
  );
}
