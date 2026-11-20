'use client';

import { useMemo, useState } from 'react';
import { randomValues } from '@/lib/visualisasi/array';
import { QUICK_RANDOM_LENGTH, quickCases, quickPseudocode, quickSortSteps, type QuickStep } from '@/lib/visualisasi/quick-sort';
import { ArrayView } from './array-view';
import { ChoicePicker } from './choice-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiQuickSortProps {
  /** Starting data: `materi` (default), `urut`, `terbalik` or `kembar`. */
  kasus?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'khusus', label: 'pivot' },
  { role: 'aktif', label: 'sedang diperiksa (j)' },
  { role: 'selesai', label: 'sudah di posisi akhir' },
];

const choices = quickCases.map((example) => ({ value: example.id, label: example.label }));

/**
 * Quick sort in place, drawn as bars. Only the current call's range is at
 * full strength; above it, `< pivot` and `≥ pivot` brackets show how Lomuto
 * partition grows the two zones while `j` scans to the right.
 */
function QuickSortView({ step, index }: { step: QuickStep; index: number }) {
  const { items, range, pointers, brackets, comparisons, stack, maxDepth } = step.state;
  const barMax = Math.max(...items.map((item) => item.value), 1);
  const call = stack.at(-1);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="min-h-6 text-xs text-fd-muted-foreground">
        {call ? (
          <>
            Sedang berjalan: <code className="rounded bg-fd-muted px-1 py-0.5 font-mono text-fd-foreground">{call}</code>
          </>
        ) : (
          'Batang lebih tinggi = nilai lebih besar'
        )}
      </div>

      <ArrayView
        items={items}
        highlights={step.highlights}
        pointers={pointers}
        pointerRoles={{ j: 'aktif', pivot: 'khusus' }}
        pointerRows={2}
        brackets={brackets}
        bracketRow
        barMax={barMax}
        focus={range ? { from: range.kiri, to: range.kanan } : null}
        label={`Isi array: ${items.map((item) => item.value).join(', ')}${range ? `. Rentang yang sedang dikerjakan: indeks ${range.kiri} sampai ${range.kanan}` : ''}`}
      />

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
        <InfoBox title="Perbandingan">
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{comparisons}</span>
        </InfoBox>
        <InfoBox title="Kedalaman rekursi">
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{stack.length}</span>
          <span className="ml-1 text-xs text-fd-muted-foreground">paling dalam {maxDepth}</span>
        </InfoBox>
        <InfoBox title="Hasil">
          <ResultValue result={step.result} stepKey={String(index)} error={false} />
        </InfoBox>
      </div>
    </div>
  );
}

function startingCase(kasus: string | undefined): string {
  if (kasus === undefined) return 'materi';
  if (!quickCases.some((example) => example.id === kasus)) {
    reportPropError('VisualisasiQuickSort', 'kasus', `harus salah satu dari ${quickCases.map((example) => example.id).join(', ')}.`);
    return 'materi';
  }
  return kasus;
}

/** Quick sort with Lomuto partition. MDX: `<VisualisasiQuickSort />` or `<VisualisasiQuickSort kasus="urut" />`. */
export function VisualisasiQuickSort({ kasus, judul = 'Visualisasi quick sort' }: VisualisasiQuickSortProps) {
  const [caseId, setCaseId] = useState(() => startingCase(kasus));
  const [random, setRandom] = useState<number[] | null>(null);
  const values = random ?? quickCases.find((example) => example.id === caseId)!.values;
  const steps = useMemo(() => quickSortSteps(values), [values]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={quickPseudocode}
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
          onRandom={() => setRandom(randomValues(QUICK_RANDOM_LENGTH))}
          randomActive={random !== null}
        />
      )}
      render={(step, index) => <QuickSortView step={step} index={index} />}
    />
  );
}
