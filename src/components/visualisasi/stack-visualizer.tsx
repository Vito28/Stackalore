'use client';

import { useMemo, useState } from 'react';
import { Plus, RotateCcw, Shuffle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  STACK_LIMITS,
  formatStackOperation,
  lessonStackOperations,
  parseStackOperations,
  parseStackValue,
  randomStackOperations,
  stackPseudocode,
  stackSteps,
  type StackOperation,
  type StackStep,
} from '@/lib/visualisasi/stack';
import { StackView } from './stack-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiStackProps {
  /** Starting operations, e.g. "push(3) push(7) top pop size". Defaults to the lesson's table. */
  operasi?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang diproses' },
  { role: 'khusus', label: 'top / hasil' },
  { role: 'error', label: 'error' },
];

/** The list of operations above the drawing; the current one is highlighted. */
function OperationStrip({ operations, step }: { operations: StackOperation[]; step: StackStep }) {
  if (operations.length === 0) return null;
  const current = step.state.operation;
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Urutan operasi">
      {operations.map((operation, index) => (
        <li
          key={index}
          aria-current={index === current ? 'step' : undefined}
          className={cn(
            'viz-cell rounded-md px-2 py-0.5 font-mono text-xs',
            current !== null && index > current && 'opacity-45',
          )}
          data-role={index === current ? (step.status === 'error' ? 'error' : 'aktif') : undefined}
        >
          {formatStackOperation(operation)}
        </li>
      ))}
    </ol>
  );
}

function initialOperations(operasi: string | undefined): StackOperation[] {
  if (operasi === undefined) return lessonStackOperations;
  const parsed = parseStackOperations(operasi);
  if ('error' in parsed) {
    // A typo in MDX should be visible to the author, not silently replaced.
    if (process.env.NODE_ENV !== 'production') console.error(`<VisualisasiStack operasi>: ${parsed.error}`);
    return lessonStackOperations;
  }
  return parsed.operations;
}

/** Stack push/pop/top/size visualization with an operation editor. MDX: `<VisualisasiStack />`. */
export function VisualisasiStack({ operasi, judul = 'Visualisasi operasi stack' }: VisualisasiStackProps) {
  const defaults = useMemo(() => initialOperations(operasi), [operasi]);
  const [operations, setOperations] = useState<StackOperation[]>(defaults);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const steps = useMemo(() => stackSteps(operations), [operations]);

  const full = operations.length >= STACK_LIMITS.maxOperations;

  const add = (operation: StackOperation) => {
    if (full) {
      setMessage(`Maksimal ${STACK_LIMITS.maxOperations} operasi. Hapus salah satu dulu.`);
      return;
    }
    setOperations((current) => [...current, operation]);
    setMessage(null);
  };

  const push = () => {
    const parsed = parseStackValue(value);
    if ('error' in parsed) {
      setMessage(parsed.error);
      return;
    }
    add({ type: 'push', value: parsed.value });
    setValue('');
  };

  const smallButton =
    'inline-flex h-10 items-center gap-1.5 rounded-lg border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

  const editor = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex">
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                push();
              }
            }}
            placeholder="angka"
            aria-label="Angka untuk push"
            className="h-10 w-20 rounded-l-lg border border-r-0 bg-fd-background px-3 font-mono text-base text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:text-sm"
          />
          <button type="button" onClick={push} disabled={full} className={cn(smallButton, 'rounded-l-none')}>
            <Plus className="size-4" aria-hidden="true" />
            Push
          </button>
        </div>
        <button type="button" onClick={() => add({ type: 'pop' })} disabled={full} className={smallButton}>
          Pop
        </button>
        <button type="button" onClick={() => add({ type: 'top' })} disabled={full} className={smallButton}>
          Top
        </button>
        <button type="button" onClick={() => add({ type: 'size' })} disabled={full} className={smallButton}>
          Size
        </button>
      </div>

      <p className={cn('text-xs', message ? 'viz-text-error' : 'text-fd-muted-foreground')} aria-live="polite">
        {message ?? `${operations.length} dari ${STACK_LIMITS.maxOperations} operasi. Coba juga pop saat stack kosong.`}
      </p>

      {operations.length > 0 ? (
        <ol className="flex flex-wrap gap-1.5" aria-label="Operasi yang akan dijalankan">
          {operations.map((operation, index) => (
            <li key={index} className="viz-cell flex items-center rounded-md pl-2 font-mono text-xs">
              {formatStackOperation(operation)}
              <button
                type="button"
                onClick={() => setOperations((current) => current.filter((_, i) => i !== index))}
                aria-label={`Hapus operasi ke-${index + 1}, ${formatStackOperation(operation)}`}
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
            setOperations(randomStackOperations());
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
      pseudocode={stackPseudocode}
      legend={legend}
      renderHeader={(step) => <OperationStrip operations={operations} step={step} />}
      render={(step) => <StackView step={step} />}
      editor={editor}
      editorLabel="Ubah operasi"
    />
  );
}
