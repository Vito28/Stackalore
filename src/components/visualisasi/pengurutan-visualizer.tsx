'use client';

import { useMemo, useState } from 'react';
import { randomValues } from '@/lib/visualisasi/array';
import {
  ALGORITMA_URUT,
  URUT_RANDOM_LENGTH,
  namaAlgoritma,
  urutCases,
  urutPseudocode,
  urutSteps,
  type AlgoritmaUrut,
  type UrutStep,
} from '@/lib/visualisasi/pengurutan';
import { ArrayView } from './array-view';
import { ChoicePicker, PickerStack, type Choice } from './choice-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiPengurutanProps {
  /** Locks the visualization to one algorithm. Without it the reader can switch between all three. */
  algoritma?: AlgoritmaUrut;
  /** Starting data: `materi` (default), `urut`, `terbalik` or `hampir`. */
  kasus?: string;
  judul?: string;
}

const legends: Record<AlgoritmaUrut, LegendItem[]> = {
  bubble: [
    { role: 'aktif', label: 'sedang dibandingkan' },
    { role: 'selesai', label: 'sudah di tempat akhir' },
  ],
  selection: [
    { role: 'aktif', label: 'sedang dibandingkan' },
    { role: 'khusus', label: 'terkecil sejauh ini' },
    { role: 'selesai', label: 'sudah di tempat akhir' },
  ],
  insertion: [
    { role: 'khusus', label: 'kunci' },
    { role: 'aktif', label: 'dibandingkan atau digeser' },
    { role: 'selesai', label: 'selesai diurutkan' },
  ],
};

const algorithmChoices: Choice<AlgoritmaUrut>[] = ALGORITMA_URUT.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const caseChoices: Choice<string>[] = urutCases.map((item) => ({ value: item.id, label: item.label }));

/** Stacked pointer labels each algorithm can need under one index. */
const pointerRows: Record<AlgoritmaUrut, number> = { bubble: 1, selection: 2, insertion: 1 };

type Data = { kind: 'kasus'; id: string } | { kind: 'acak'; values: number[] };

function startingCase(kasus: string | undefined): string {
  if (kasus === undefined) return urutCases[0].id;
  if (urutCases.some((item) => item.id === kasus)) return kasus;
  reportPropError('VisualisasiPengurutan', 'kasus', `pilih salah satu dari ${urutCases.map((item) => item.id).join(', ')}.`);
  return urutCases[0].id;
}

function SortView({ step, index, algoritma }: { step: UrutStep; index: number; algoritma: AlgoritmaUrut }) {
  const { items, floating, pointers, brackets, comparisons, moves } = step.state;
  const values = items.map((item, position) => item?.value ?? (floating?.index === position ? floating.item.value : 0));
  const barMax = Math.max(9, ...values);
  const insertion = algoritma === 'insertion';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full">
        <ArrayView
          items={items}
          highlights={step.highlights}
          pointers={pointers}
          pointerRoles={{ terkecil: 'khusus' }}
          pointerRows={pointerRows[algoritma]}
          brackets={brackets}
          bracketRow={insertion}
          floating={floating}
          floatRow={insertion}
          barMax={barMax}
          label={`Isi data: ${items.map((item) => item?.value ?? 'kosong').join(', ')}${
            floating ? `. Kunci ${floating.item.value} diangkat di atas indeks ${floating.index}` : ''
          }`}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
        <InfoBox title="Perbandingan">
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{comparisons}</span>
        </InfoBox>
        <InfoBox title={insertion ? 'Pergeseran' : 'Pertukaran'}>
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{moves}</span>
        </InfoBox>
        <InfoBox title="Hasil">
          <ResultValue result={step.result} stepKey={String(index)} error={false} />
        </InfoBox>
      </div>
    </div>
  );
}

/**
 * Bubble, selection and insertion sort as bars. With `algoritma` it shows one
 * algorithm; without it the reader can switch algorithms on the same data.
 * MDX: `<VisualisasiPengurutan algoritma="bubble" />` or `<VisualisasiPengurutan />`.
 */
export function VisualisasiPengurutan({ algoritma, kasus, judul }: VisualisasiPengurutanProps) {
  const lockedTo = algoritma !== undefined && ALGORITMA_URUT.includes(algoritma) ? algoritma : null;
  const locked = lockedTo !== null;
  const [chosen, setChosen] = useState<AlgoritmaUrut>(() => {
    if (algoritma !== undefined && lockedTo === null) {
      reportPropError('VisualisasiPengurutan', 'algoritma', `pilih salah satu dari ${ALGORITMA_URUT.join(', ')}.`);
    }
    return lockedTo ?? 'bubble';
  });
  const [data, setData] = useState<Data>(() => ({ kind: 'kasus', id: startingCase(kasus) }));

  const active = lockedTo ?? chosen;
  const values = data.kind === 'acak' ? data.values : (urutCases.find((item) => item.id === data.id) ?? urutCases[0]).values;
  const steps = useMemo(() => urutSteps(active, values), [active, values]);
  const title = judul ?? (locked ? `Visualisasi ${namaAlgoritma[active]}` : 'Visualisasi pengurutan');

  return (
    <Visualizer
      title={title}
      steps={steps}
      pseudocode={urutPseudocode[active]}
      legend={legends[active]}
      renderHeader={() => (
        <PickerStack>
          {locked ? null : <ChoicePicker label="Algoritma" choices={algorithmChoices} value={chosen} onChange={setChosen} />}
          <ChoicePicker
            label="Data"
            choices={caseChoices}
            value={data.kind === 'kasus' ? data.id : ''}
            onChange={(id) => setData({ kind: 'kasus', id })}
            onRandom={() => setData({ kind: 'acak', values: randomValues(URUT_RANDOM_LENGTH) })}
            randomActive={data.kind === 'acak'}
          />
        </PickerStack>
      )}
      render={(step, index) => <SortView step={step} index={index} algoritma={active} />}
    />
  );
}
