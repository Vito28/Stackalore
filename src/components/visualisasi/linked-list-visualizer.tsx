'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { Check, RotateCcw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  LINKED_LIST_JENIS,
  LINKED_LIST_OPERASI,
  lessonLinkedListExamples,
  linkedListPseudocode,
  linkedListSteps,
  normalizeJenis,
  normalizeOperasi,
  parseLinkedListData,
  parseLinkedListValue,
  randomLinkedListInput,
  validateLinkedListInput,
  type LinkedListJenis,
  type LinkedListOperasi,
} from '@/lib/visualisasi/linked-list';
import type { Role } from '@/lib/visualisasi/types';
import { LinkedListView, linkedListWidth } from './linked-list-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiLinkedListProps {
  /** `singly`, `doubly`, `circular-singly` or `circular-doubly` locks the variant; `semua` (default) shows a picker. */
  jenis?: string;
  /** Operation shown first: `telusuri` (default), `depan`, `belakang`, `cari` or `hapus`. */
  operasi?: string;
  /** Starting list for that operation, e.g. "3 7 9". Defaults to the lesson's example. */
  data?: string;
  /** Value to add, search or remove. Defaults to the lesson's example. */
  nilai?: number | string;
  judul?: string;
}

interface Scenario {
  operasi: LinkedListOperasi;
  data: number[];
  nilai: number;
  /** Changed by the reader: switching operation keeps their data instead of loading the lesson example. */
  edited: boolean;
}

const legends: Record<LinkedListOperasi, LegendItem[]> = {
  telusuri: [
    { role: 'aktif', label: 'sedang dicetak' },
    { role: 'khusus', label: 'penunjuk p' },
    { role: 'selesai', label: 'sudah dicetak' },
  ],
  depan: [{ role: 'aktif', label: 'node baru / panah yang berubah' }],
  belakang: [
    { role: 'aktif', label: 'node baru / panah yang berubah' },
    { role: 'khusus', label: 'penunjuk p' },
    { role: 'dibuang', label: 'sudah dilewati' },
  ],
  cari: [
    { role: 'aktif', label: 'sedang dibandingkan' },
    { role: 'khusus', label: 'penunjuk p' },
    { role: 'selesai', label: 'ketemu' },
    { role: 'dibuang', label: 'sudah diperiksa' },
  ],
  hapus: [
    { role: 'aktif', label: 'sedang diperiksa / panah yang berubah' },
    { role: 'khusus', label: 'penunjuk p / prev' },
    { role: 'dibuang', label: 'dilewati / dihapus' },
  ],
};

const example = (operasi: LinkedListOperasi): Scenario => ({
  operasi,
  data: lessonLinkedListExamples[operasi].data,
  nilai: lessonLinkedListExamples[operasi].nilai ?? 0,
  edited: false,
});

function initialScenario(operasi?: string, data?: string, nilai?: number | string): Scenario {
  const warn = (message: string) => {
    // A typo in MDX should be visible to the author, not silently replaced.
    if (process.env.NODE_ENV !== 'production') console.error(`<VisualisasiLinkedList>: ${message}`);
  };
  const chosen = operasi === undefined ? 'telusuri' : normalizeOperasi(operasi);
  if (!chosen) warn(`operasi "${operasi}" tidak dikenal.`);
  const scenario = example(chosen ?? 'telusuri');
  if (data !== undefined) {
    const parsed = parseLinkedListData(data);
    if ('error' in parsed) warn(parsed.error);
    else scenario.data = parsed.data;
  }
  if (nilai !== undefined) {
    const parsed = parseLinkedListValue(String(nilai));
    if ('error' in parsed) warn(parsed.error);
    else scenario.nilai = parsed.value;
  }
  const invalid = validateLinkedListInput({ jenis: 'singly', ...scenario });
  if (invalid) {
    warn(invalid);
    return example(scenario.operasi);
  }
  return scenario;
}

const pill =
  'inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none';
const pillState = (selected: boolean) =>
  selected
    ? 'border-transparent bg-fd-primary text-fd-primary-foreground'
    : 'bg-fd-background text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground';
const smallButton =
  'inline-flex h-10 items-center gap-1.5 rounded-lg border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';
const textInput =
  'h-10 rounded-lg border bg-fd-background px-3 font-mono text-base text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:text-sm';

/**
 * Linked list operations step by step. `jenis="singly"` (or another variant)
 * locks the variant, as in the main Linked List lesson; `jenis="semua"` shows
 * all four for the Variasi Linked List deep dive.
 * MDX: `<VisualisasiLinkedList jenis="singly" />`.
 */
export function VisualisasiLinkedList({ jenis = 'semua', operasi, data, nilai, judul }: VisualisasiLinkedListProps) {
  const locked = jenis.trim().toLowerCase() === 'semua' ? null : normalizeJenis(jenis);
  if (process.env.NODE_ENV !== 'production' && locked === null && jenis.trim().toLowerCase() !== 'semua') {
    console.error(`<VisualisasiLinkedList jenis>: "${jenis}" tidak dikenal. Gunakan singly, doubly, circular-singly, circular-doubly, atau semua.`);
  }
  const defaults = useMemo(() => initialScenario(operasi, data, nilai), [operasi, data, nilai]);
  const [picked, setPicked] = useState<LinkedListJenis>('singly');
  const [scenario, setScenario] = useState<Scenario>(defaults);
  const [dataText, setDataText] = useState(defaults.data.join(' '));
  const [valueText, setValueText] = useState(String(defaults.nilai));
  const [message, setMessage] = useState<string | null>(null);

  const current = locked ?? picked;
  const usesValue = LINKED_LIST_OPERASI.find((item) => item.id === scenario.operasi)!.pakaiNilai;
  const steps = useMemo(
    () => linkedListSteps({ jenis: current, operasi: scenario.operasi, data: scenario.data, nilai: scenario.nilai }),
    [current, scenario],
  );
  const pseudocode = useMemo(() => linkedListPseudocode(current, scenario.operasi), [current, scenario.operasi]);
  // Keep one width for the whole run so the drawing does not shift between steps.
  const width = useMemo(() => Math.max(...steps.map((step) => linkedListWidth(step.state))), [steps]);

  const load = (next: Scenario) => {
    setScenario(next);
    setDataText(next.data.join(' '));
    setValueText(String(next.nilai));
    setMessage(null);
  };

  const chooseOperation = (operasiBaru: LinkedListOperasi) => {
    if (operasiBaru === scenario.operasi) return;
    // Untouched data follows the lesson's example for each operation; the reader's own data is kept.
    load(scenario.edited ? { ...scenario, operasi: operasiBaru } : example(operasiBaru));
  };

  const apply = () => {
    const parsedData = parseLinkedListData(dataText);
    if ('error' in parsedData) {
      setMessage(parsedData.error);
      return;
    }
    let value = scenario.nilai;
    if (usesValue) {
      const parsedValue = parseLinkedListValue(valueText);
      if ('error' in parsedValue) {
        setMessage(parsedValue.error);
        return;
      }
      value = parsedValue.value;
    }
    load({ ...scenario, data: parsedData.data, nilai: value, edited: true });
  };

  const onEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      apply();
    }
  };

  const header = (
    <div className="space-y-2">
      {locked === null ? (
        <div role="group" aria-label="Jenis linked list" className="flex flex-wrap gap-1.5">
          {LINKED_LIST_JENIS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={current === item.id}
              onClick={() => setPicked(item.id)}
              className={cn(pill, pillState(current === item.id))}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <div role="group" aria-label="Operasi" className="flex flex-wrap gap-1.5">
        {LINKED_LIST_OPERASI.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={scenario.operasi === item.id}
            onClick={() => chooseOperation(item.id)}
            className={cn(pill, pillState(scenario.operasi === item.id))}
          >
            {item.label}
            {item.pakaiNilai && scenario.operasi === item.id ? <span className="ml-1.5 font-mono opacity-80">{scenario.nilai}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-xs text-fd-muted-foreground">
          Isi list awal
          <input
            type="text"
            value={dataText}
            onChange={(event) => setDataText(event.target.value)}
            onKeyDown={onEnter}
            placeholder="kosongkan untuk list kosong"
            autoComplete="off"
            spellCheck={false}
            className={cn(textInput, 'w-48')}
          />
        </label>
        {usesValue ? (
          <label className="grid gap-1 text-xs text-fd-muted-foreground">
            Nilai
            <input
              type="text"
              inputMode="numeric"
              value={valueText}
              onChange={(event) => setValueText(event.target.value)}
              onKeyDown={onEnter}
              autoComplete="off"
              className={cn(textInput, 'w-20')}
            />
          </label>
        ) : null}
        <button type="button" onClick={apply} className={smallButton}>
          <Check className="size-4" aria-hidden="true" />
          Terapkan
        </button>
      </div>

      <p className={cn('text-xs', message ? 'viz-text-error' : 'text-fd-muted-foreground')} aria-live="polite">
        {message ??
          `Tulis bilangan bulat dipisah spasi, paling banyak 7 node. Coba juga list kosong, nilai yang tidak ada, atau nilai di head.`}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => load(example(scenario.operasi))} className={smallButton}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Kembalikan contoh materi
        </button>
        <button
          type="button"
          onClick={() => load({ ...scenario, ...randomLinkedListInput(scenario.operasi), edited: true })}
          className={smallButton}
        >
          <Shuffle className="size-4" aria-hidden="true" />
          Acak
        </button>
      </div>
    </div>
  );

  const title =
    judul ?? (locked ? `Visualisasi ${LINKED_LIST_JENIS.find((item) => item.id === locked)!.label.toLowerCase()} linked list` : 'Visualisasi variasi linked list');
  // Only singly walks to the last node when adding at the back; the others jump there directly.
  const legend = legends[scenario.operasi].filter(
    (item: { role: Role }) => scenario.operasi !== 'belakang' || current === 'singly' || item.role === 'aktif',
  );

  return (
    <Visualizer
      title={title}
      steps={steps}
      pseudocode={pseudocode}
      legend={legend}
      renderHeader={() => header}
      render={(step) => <LinkedListView step={step} width={width} />}
      editor={editor}
      editorLabel="Ubah data"
    />
  );
}
