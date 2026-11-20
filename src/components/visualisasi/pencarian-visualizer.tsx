'use client';

import { useMemo, useState } from 'react';
import { formatValues } from '@/lib/visualisasi/array';
import {
  batasCases,
  batasPseudocode,
  batasSteps,
  binerPseudocode,
  cariCases,
  isSorted,
  lessonBatasData,
  linearPseudocode,
  searchSteps,
  type BatasStep,
  type CariStep,
  type JenisBatas,
  type MetodeCari,
} from '@/lib/visualisasi/pencarian';
import { ArrayView } from './array-view';
import { ChoicePicker, PickerStack, type Choice } from './choice-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

const metodeChoices: Choice<MetodeCari>[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'biner', label: 'Biner' },
];

function SearchDrawing({ step, index, showJawaban = false }: { step: CariStep | BatasStep; index: number; showJawaban?: boolean }) {
  const { items, x, pointers, checks } = step.state;
  const values = formatValues(items.map((item) => item.value));
  return (
    <div className="flex flex-col items-center gap-4">
      <ArrayView
        items={items}
        highlights={step.highlights}
        pointers={pointers.filter((pointer) => pointer.name !== 'jawaban')}
        topPointers={pointers.filter((pointer) => pointer.name === 'jawaban')}
        pointerRoles={{ mid: 'khusus', i: 'khusus', jawaban: 'khusus' }}
        pointerRows={pointers.length > 1 ? 3 : 1}
        edges
        label={`Data: ${values}. Dicari ${x}.`}
      />
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
        <InfoBox title="Dicari">
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">x = {x}</span>
        </InfoBox>
        <InfoBox title="Elemen diperiksa">
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{checks}</span>
          <span className="ml-1 text-xs text-fd-muted-foreground">dari {items.length}</span>
        </InfoBox>
        {showJawaban && 'jawaban' in step.state ? (
          <InfoBox title="jawaban">
            <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{step.state.jawaban}</span>
          </InfoBox>
        ) : null}
        <InfoBox title="Hasil">
          <ResultValue result={step.result} stepKey={String(index)} error={step.status === 'error'} />
        </InfoBox>
      </div>
    </div>
  );
}

function pickCase<T extends { id: string }>(cases: readonly T[], id: string | undefined, component: string): string {
  if (id === undefined) return cases[0].id;
  if (cases.some((item) => item.id === id)) return id;
  reportPropError(component, 'kasus', `pilih salah satu dari ${cases.map((item) => item.id).join(', ')}.`);
  return cases[0].id;
}

interface VisualisasiPencarianProps {
  /** Lock the method. Without it the reader can switch between linear and binary search. */
  metode?: MetodeCari;
  /** Starting case id: ada, tidak-ada, paling-kiri, paling-kanan, tidak-urut. */
  kasus?: string;
  judul?: string;
}

/** Linear and binary search on the lesson's data, with several targets. MDX: `<VisualisasiPencarian />`. */
export function VisualisasiPencarian({ metode, kasus, judul }: VisualisasiPencarianProps) {
  const [chosenMetode, setMetode] = useState<MetodeCari>(metode ?? 'biner');
  const [caseId, setCaseId] = useState(() => pickCase(cariCases, kasus, 'VisualisasiPencarian'));
  const current = cariCases.find((item) => item.id === caseId) ?? cariCases[0];
  const steps = useMemo(() => searchSteps(chosenMetode, current.values, current.x), [chosenMetode, current]);

  const legend: LegendItem[] =
    chosenMetode === 'linear'
      ? [
          { role: 'aktif', label: 'sedang diperiksa' },
          { role: 'dibuang', label: 'sudah diperiksa' },
          { role: 'selesai', label: 'ketemu' },
        ]
      : [
          { role: 'aktif', label: 'data[mid]' },
          { role: 'dibuang', label: 'dicoret' },
          { role: 'selesai', label: 'ketemu' },
          ...(isSorted(current.values) ? [] : [{ role: 'error' as const, label: 'terlewat' }]),
        ];

  return (
    <Visualizer
      title={judul ?? (metode === 'linear' ? 'Visualisasi pencarian linear' : metode === 'biner' ? 'Visualisasi pencarian biner' : 'Visualisasi pencarian')}
      steps={steps}
      pseudocode={chosenMetode === 'linear' ? linearPseudocode : binerPseudocode}
      legend={legend}
      renderHeader={() => (
        <PickerStack>
          {metode ? null : <ChoicePicker label="Cara mencari" choices={metodeChoices} value={chosenMetode} onChange={setMetode} />}
          <ChoicePicker
            label="Kasus"
            choices={cariCases.map((item) => ({ value: item.id, label: item.label }))}
            value={caseId}
            onChange={setCaseId}
          />
        </PickerStack>
      )}
      render={(step, index) => <SearchDrawing step={step} index={index} />}
    />
  );
}

const jenisChoices: Choice<JenisBatas>[] = [
  { value: 'bawah', label: 'Batas bawah (pertama ≥ x)' },
  { value: 'atas', label: 'Batas atas (pertama > x)' },
];

interface VisualisasiBatasPencarianProps {
  /** Lock the variant. Without it the reader can switch between lower and upper bound. */
  jenis?: JenisBatas;
  /** Starting case id: kembar, tidak-ada, terkecil, terbesar. */
  kasus?: string;
  judul?: string;
}

/** Lower and upper bound on `2 4 4 4 7 9`, with the lesson's x values. MDX: `<VisualisasiBatasPencarian />`. */
export function VisualisasiBatasPencarian({ jenis, kasus, judul = 'Visualisasi batas bawah dan batas atas' }: VisualisasiBatasPencarianProps) {
  const [chosenJenis, setJenis] = useState<JenisBatas>(jenis ?? 'bawah');
  const [caseId, setCaseId] = useState(() => pickCase(batasCases, kasus, 'VisualisasiBatasPencarian'));
  const current = batasCases.find((item) => item.id === caseId) ?? batasCases[0];
  const steps = useMemo(() => batasSteps(lessonBatasData, current.x, chosenJenis), [current, chosenJenis]);

  const legend: LegendItem[] = [
    { role: 'aktif', label: 'data[mid]' },
    { role: 'khusus', label: 'kandidat jawaban' },
    { role: 'dibuang', label: 'dicoret' },
    { role: 'selesai', label: 'jawaban' },
  ];

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={batasPseudocode(chosenJenis)}
      legend={legend}
      renderHeader={() => (
        <PickerStack>
          {jenis ? null : <ChoicePicker label="Cari" choices={jenisChoices} value={chosenJenis} onChange={setJenis} />}
          <ChoicePicker
            label="Nilai x"
            choices={batasCases.map((item) => ({ value: item.id, label: item.label }))}
            value={caseId}
            onChange={setCaseId}
          />
        </PickerStack>
      )}
      render={(step, index) => <SearchDrawing step={step} index={index} showJawaban />}
    />
  );
}
