'use client';

import { useMemo, useState } from 'react';
import { Plus, RotateCcw, Search, Shuffle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  HASH_LIMITS,
  formatHashOperation,
  hashPseudocode,
  hashTableSteps,
  lessonHashOperations,
  parseHashKey,
  parseHashOperations,
  parseHashValue,
  randomHashOperations,
  type HashOperation,
  type HashTableStep,
} from '@/lib/visualisasi/hash-table';
import { HashTableView } from './hash-table-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiHashTableProps {
  /** Starting operations, e.g. "tambah(budi,21) cari(dina) hapus(andi)". Defaults to the lesson's example. */
  operasi?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'khusus', label: 'loker tujuan' },
  { role: 'aktif', label: 'sedang dibandingkan / baru' },
  { role: 'selesai', label: 'ketemu' },
  { role: 'dibuang', label: 'dibuang' },
];

/** The list of operations above the drawing; the current one is highlighted. */
function OperationStrip({ operations, step }: { operations: HashOperation[]; step: HashTableStep }) {
  if (operations.length === 0) return null;
  const current = step.state.operation;
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Urutan operasi">
      {operations.map((operation, index) => (
        <li
          key={index}
          aria-current={index === current ? 'step' : undefined}
          className={cn('viz-cell rounded-md px-2 py-0.5 font-mono text-xs', current !== null && index > current && 'opacity-45')}
          data-role={index === current ? 'aktif' : undefined}
        >
          {formatHashOperation(operation)}
        </li>
      ))}
    </ol>
  );
}

function initialOperations(operasi: string | undefined): HashOperation[] {
  if (operasi === undefined) return lessonHashOperations;
  const parsed = parseHashOperations(operasi);
  if ('error' in parsed) {
    // A typo in MDX should be visible to the author, not silently replaced.
    if (process.env.NODE_ENV !== 'production') console.error(`<VisualisasiHashTable operasi>: ${parsed.error}`);
    return lessonHashOperations;
  }
  return parsed.operations;
}

const smallButton =
  'inline-flex h-10 items-center gap-1.5 rounded-lg border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';
const textInput =
  'h-10 rounded-lg border bg-fd-background px-3 font-mono text-base text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:text-sm';

/** Hash table (10 lockers, separate chaining) with an operation editor. MDX: `<VisualisasiHashTable />`. */
export function VisualisasiHashTable({ operasi, judul = 'Visualisasi hash table' }: VisualisasiHashTableProps) {
  const defaults = useMemo(() => initialOperations(operasi), [operasi]);
  const [operations, setOperations] = useState<HashOperation[]>(defaults);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const steps = useMemo(() => hashTableSteps(operations), [operations]);

  const full = operations.length >= HASH_LIMITS.maxOperations;

  const add = (type: HashOperation['type']) => {
    if (full) {
      setMessage(`Maksimal ${HASH_LIMITS.maxOperations} operasi. Hapus salah satu dulu.`);
      return;
    }
    const parsedKey = parseHashKey(key);
    if ('error' in parsedKey) {
      setMessage(parsedKey.error);
      return;
    }
    if (type === 'tambah') {
      const parsedValue = parseHashValue(value);
      if ('error' in parsedValue) {
        setMessage(parsedValue.error);
        return;
      }
      setOperations((current) => [...current, { type, key: parsedKey.key, value: parsedValue.value }]);
    } else {
      setOperations((current) => [...current, { type, key: parsedKey.key }]);
    }
    setMessage(null);
  };

  const editor = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add('tambah');
            }
          }}
          placeholder="kunci"
          aria-label="Kunci, huruf kecil"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          maxLength={HASH_LIMITS.maxKeyLength + 4}
          className={cn(textInput, 'w-28')}
        />
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add('tambah');
            }
          }}
          placeholder="nilai"
          aria-label="Nilai untuk tambah"
          className={cn(textInput, 'w-20')}
        />
        <button type="button" onClick={() => add('tambah')} disabled={full} className={smallButton}>
          <Plus className="size-4" aria-hidden="true" />
          Tambah
        </button>
        <button type="button" onClick={() => add('cari')} disabled={full} className={smallButton}>
          <Search className="size-4" aria-hidden="true" />
          Cari
        </button>
        <button type="button" onClick={() => add('hapus')} disabled={full} className={smallButton}>
          <X className="size-4" aria-hidden="true" />
          Hapus
        </button>
      </div>

      <p className={cn('text-xs', message ? 'viz-text-error' : 'text-fd-muted-foreground')} aria-live="polite">
        {message ??
          `${operations.length} dari ${HASH_LIMITS.maxOperations} operasi. Cari dan Hapus cukup memakai kunci. Coba kunci yang hurufnya sama dengan urutan berbeda, misalnya nadi.`}
      </p>

      {operations.length > 0 ? (
        <ol className="flex flex-wrap gap-1.5" aria-label="Operasi yang akan dijalankan">
          {operations.map((operation, index) => (
            <li key={index} className="viz-cell flex items-center rounded-md pl-2 font-mono text-xs">
              {formatHashOperation(operation)}
              <button
                type="button"
                onClick={() => setOperations((current) => current.filter((_, i) => i !== index))}
                aria-label={`Hapus operasi ke-${index + 1}, ${formatHashOperation(operation)}`}
                className="ml-0.5 grid size-8 place-items-center rounded-md text-fd-muted-foreground hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setOperations(defaults);
            setMessage(null);
          }}
          className={smallButton}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Kembalikan contoh materi
        </button>
        <button
          type="button"
          onClick={() => {
            setOperations(randomHashOperations());
            setMessage(null);
          }}
          className={smallButton}
        >
          <Shuffle className="size-4" aria-hidden="true" />
          Acak
        </button>
        <button
          type="button"
          onClick={() => {
            setOperations([]);
            setMessage(null);
          }}
          disabled={operations.length === 0}
          className={smallButton}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Kosongkan
        </button>
      </div>
    </div>
  );

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={hashPseudocode}
      legend={legend}
      renderHeader={(step) => <OperationStrip operations={operations} step={step} />}
      render={(step) => <HashTableView step={step} />}
      editor={editor}
      editorLabel="Ubah operasi"
    />
  );
}
