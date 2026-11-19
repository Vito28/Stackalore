'use client';

import { useMemo, useState } from 'react';
import { Plus, RotateCcw, Shuffle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  QUEUE_LIMITS,
  formatQueueOperation,
  lessonQueueOperations,
  parseQueueName,
  parseQueueOperations,
  queuePseudocode,
  queueSteps,
  randomQueueOperations,
  type QueueOperation,
  type QueueStep,
} from '@/lib/visualisasi/queue';
import { QueueView } from './queue-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiQueueProps {
  /** Starting operations, e.g. "enqueue(Ani) enqueue(Budi) front dequeue". Defaults to the lesson's table. */
  operasi?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang diproses' },
  { role: 'khusus', label: 'depan / belakang / hasil' },
  { role: 'error', label: 'error' },
];

/** The list of operations above the drawing; the current one is highlighted. */
function OperationStrip({ operations, step }: { operations: QueueOperation[]; step: QueueStep }) {
  if (operations.length === 0) return null;
  const current = step.state.operation;
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Urutan operasi">
      {operations.map((operation, index) => (
        <li
          key={index}
          aria-current={index === current ? 'step' : undefined}
          className={cn('viz-cell rounded-md px-2 py-0.5 font-mono text-xs', current !== null && index > current && 'opacity-45')}
          data-role={index === current ? (step.status === 'error' ? 'error' : 'aktif') : undefined}
        >
          {formatQueueOperation(operation)}
        </li>
      ))}
    </ol>
  );
}

function initialOperations(operasi: string | undefined): QueueOperation[] {
  if (operasi === undefined) return lessonQueueOperations;
  const parsed = parseQueueOperations(operasi);
  if ('error' in parsed) {
    // A typo in MDX should be visible to the author, not silently replaced.
    if (process.env.NODE_ENV !== 'production') console.error(`<VisualisasiQueue operasi>: ${parsed.error}`);
    return lessonQueueOperations;
  }
  return parsed.operations;
}

const smallButton =
  'inline-flex h-10 items-center gap-1.5 rounded-lg border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

/** Queue enqueue/dequeue/front/back/size/empty visualization with an operation editor. MDX: `<VisualisasiQueue />`. */
export function VisualisasiQueue({ operasi, judul = 'Visualisasi operasi queue' }: VisualisasiQueueProps) {
  const defaults = useMemo(() => initialOperations(operasi), [operasi]);
  const [operations, setOperations] = useState<QueueOperation[]>(defaults);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const steps = useMemo(() => queueSteps(operations), [operations]);

  const full = operations.length >= QUEUE_LIMITS.maxOperations;

  const add = (operation: QueueOperation) => {
    if (full) {
      setMessage(`Maksimal ${QUEUE_LIMITS.maxOperations} operasi. Hapus salah satu dulu.`);
      return;
    }
    setOperations((current) => [...current, operation]);
    setMessage(null);
  };

  const enqueue = () => {
    const parsed = parseQueueName(name);
    if ('error' in parsed) {
      setMessage(parsed.error);
      return;
    }
    add({ type: 'enqueue', value: parsed.value });
    setName('');
  };

  const editor = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                enqueue();
              }
            }}
            placeholder="nama"
            aria-label="Nama untuk enqueue"
            maxLength={QUEUE_LIMITS.maxNameLength + 4}
            autoComplete="off"
            spellCheck={false}
            className="h-10 w-24 rounded-l-lg border border-r-0 bg-fd-background px-3 font-mono text-base text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:text-sm"
          />
          <button type="button" onClick={enqueue} disabled={full} className={cn(smallButton, 'rounded-l-none')}>
            <Plus className="size-4" aria-hidden="true" />
            Enqueue
          </button>
        </div>
        {(['dequeue', 'front', 'back', 'size', 'empty'] as const).map((type) => (
          <button key={type} type="button" onClick={() => add({ type })} disabled={full} className={smallButton}>
            {type[0].toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <p className={cn('text-xs', message ? 'viz-text-error' : 'text-fd-muted-foreground')} aria-live="polite">
        {message ?? `${operations.length} dari ${QUEUE_LIMITS.maxOperations} operasi. Coba juga dequeue saat queue kosong.`}
      </p>

      {operations.length > 0 ? (
        <ol className="flex flex-wrap gap-1.5" aria-label="Operasi yang akan dijalankan">
          {operations.map((operation, index) => (
            <li key={index} className="viz-cell flex items-center rounded-md pl-2 font-mono text-xs">
              {formatQueueOperation(operation)}
              <button
                type="button"
                onClick={() => setOperations((current) => current.filter((_, i) => i !== index))}
                aria-label={`Hapus operasi ke-${index + 1}, ${formatQueueOperation(operation)}`}
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
            setOperations(randomQueueOperations());
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
      pseudocode={queuePseudocode}
      legend={legend}
      renderHeader={(step) => <OperationStrip operations={operations} step={step} />}
      render={(step) => <QueueView step={step} />}
      editor={editor}
      editorLabel="Ubah operasi"
    />
  );
}
