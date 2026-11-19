'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { layoutBinaryTree, treeFrame, type TreeLayout } from '@/lib/visualisasi/tree-layout';
import {
  HEAP_LIMITS,
  formatHeapOperation,
  heapLeft,
  heapPseudocode,
  heapRight,
  heapSteps,
  lessonHeapOperations,
  parseHeapOperations,
  parseHeapValue,
  randomHeapOperations,
  type HeapOperation,
  type HeapStep,
} from '@/lib/visualisasi/heap';
import {
  EditorActions,
  EditorMessage,
  InfoBox,
  OperationChips,
  OperationStrip,
  ResultValue,
  editorButton,
  editorInput,
  reportPropError,
} from './tree-editor';
import { TreeView, treeSpring } from './tree-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiHeapProps {
  /** Operations, e.g. "push(35) push(20) pop top size". Defaults to the lesson's example. */
  operasi?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'elemen yang bergerak' },
  { role: 'khusus', label: 'pembanding / hasil' },
  { role: 'error', label: 'error' },
];

const slot = (index: number) => `s${index}`;

/** The heap's shape depends only on its size: slot i has children 2i + 1 and 2i + 2. */
const layoutOfSize = (size: number): TreeLayout =>
  layoutBinaryTree(size > 0 ? slot(0) : null, (id) => {
    const i = Number(id.slice(1));
    return [heapLeft(i) < size ? slot(heapLeft(i)) : null, heapRight(i) < size ? slot(heapRight(i)) : null];
  });

function HeapArray({ step }: { step: HeapStep }) {
  const { items, tags } = step.state;
  const tagOf = new Map(tags.map((tag) => [tag.at, tag.label]));
  const cell = 'w-[2.125rem] shrink-0 sm:w-10';
  return (
    <div className="overflow-x-auto overscroll-x-contain pb-1">
      <div className="inline-flex flex-col gap-1">
        <ol className="flex gap-1" aria-label={items.length ? `Array heap: ${items.map((item) => item.value).join(', ')}` : 'Array heap kosong'}>
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                className={cn('relative flex flex-col items-center', cell)}
              >
                <span className="viz-text-khusus h-4 font-sans text-[0.6875rem] leading-4 font-semibold" aria-hidden="true">
                  {tagOf.get(item.id) ?? ''}
                </span>
                <span
                  className="viz-cell grid h-9 w-full place-items-center rounded-md font-mono text-[0.8125rem] font-semibold tabular-nums sm:text-sm"
                  data-role={step.highlights[item.id]}
                >
                  {item.value}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
          {items.length === 0 ? <li className="self-end py-2 text-xs text-fd-muted-foreground italic">array kosong</li> : null}
        </ol>
        <div className="flex gap-1" aria-hidden="true">
          {items.map((_, index) => (
            <span key={index} className={cn('text-center font-mono text-[0.625rem] text-fd-muted-foreground', cell)}>
              {index}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeapView({ step, frame }: { step: HeapStep; frame: ReturnType<typeof treeFrame> }) {
  const { items, tags, taken, operation } = step.state;
  const layout = useMemo(() => layoutOfSize(items.length), [items.length]);
  const slotOf = new Map(items.map((item, index) => [item.id, slot(index)]));
  const isError = step.status === 'error';

  return (
    <MotionConfig reducedMotion="user" transition={treeSpring}>
      <div className="space-y-4">
        <TreeView
          layout={layout}
          frame={frame}
          nodes={items.map((item, index) => ({ id: item.id, at: slot(index), label: String(item.value), role: step.highlights[item.id] }))}
          label={
            items.length
              ? `Min-heap sebagai tree. Root ${items[0].value}. Isi array: ${items.map((item) => item.value).join(', ')}.`
              : 'Heap kosong.'
          }
          markers={tags.filter((tag) => slotOf.has(tag.at)).map((tag) => ({ id: tag.id, at: slotOf.get(tag.at) as string, label: tag.label }))}
          slotLabels={Object.fromEntries(items.map((_, index) => [slot(index), String(index)]))}
          emptyText="heap kosong"
        />

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="text-xs text-fd-muted-foreground">Array di balik heap (angka kecil = indeks)</div>
            <div className="mt-1">
              <HeapArray step={step} />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 sm:grid sm:min-w-40 sm:content-start sm:gap-3">
            <InfoBox title="size">
              <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{items.length}</span>
            </InfoBox>
            <InfoBox title="Hasil operasi">
              <ResultValue result={step.result} stepKey={String(operation)} error={isError} />
            </InfoBox>
            <AnimatePresence initial={false}>
              {taken ? (
                <motion.div
                  key={taken.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  <div className="text-xs text-fd-muted-foreground">Diambil dari root</div>
                  <div className="viz-cell mt-1 inline-grid h-9 min-w-9 place-items-center rounded-md px-2 font-mono text-sm font-semibold" data-role="khusus">
                    {taken.value}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function initialOperations(operasi: string | undefined): HeapOperation[] {
  if (operasi === undefined) return lessonHeapOperations;
  const parsed = parseHeapOperations(operasi);
  if ('error' in parsed) {
    reportPropError('VisualisasiHeap', 'operasi', parsed.error);
    return lessonHeapOperations;
  }
  return parsed.operations;
}

/**
 * Min-heap as a priority queue: push, pop, top and size, every comparison
 * and swap as its own step, tree and array side by side.
 * MDX: `<VisualisasiHeap />` or `<VisualisasiHeap operasi="push(5) push(3) pop" />`.
 */
export function VisualisasiHeap({ operasi, judul = 'Visualisasi min-heap (priority queue)' }: VisualisasiHeapProps) {
  const defaults = useMemo(() => initialOperations(operasi), [operasi]);
  const [operations, setOperations] = useState<HeapOperation[]>(defaults);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const steps = useMemo(() => heapSteps(operations), [operations]);
  const frame = useMemo(() => treeFrame(steps.map((step) => layoutOfSize(step.state.items.length))), [steps]);
  const full = operations.length >= HEAP_LIMITS.maxOperations;

  const add = (operation: HeapOperation) => {
    if (full) {
      setMessage(`Maksimal ${HEAP_LIMITS.maxOperations} operasi. Hapus salah satu dulu.`);
      return;
    }
    setOperations((current) => [...current, operation]);
    setMessage(null);
  };

  const push = () => {
    const parsed = parseHeapValue(value);
    if ('error' in parsed) {
      setMessage(parsed.error);
      return;
    }
    add({ type: 'push', value: parsed.value });
    setValue('');
  };

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
            className={cn(editorInput, 'w-20 rounded-r-none border-r-0')}
          />
          <button type="button" onClick={push} disabled={full} className={cn(editorButton, 'rounded-l-none')}>
            <Plus className="size-4" aria-hidden="true" />
            Push
          </button>
        </div>
        <button type="button" onClick={() => add({ type: 'pop' })} disabled={full} className={editorButton}>
          Pop
        </button>
        <button type="button" onClick={() => add({ type: 'top' })} disabled={full} className={editorButton}>
          Top
        </button>
        <button type="button" onClick={() => add({ type: 'size' })} disabled={full} className={editorButton}>
          Size
        </button>
      </div>
      <EditorMessage
        message={message}
        hint={`${operations.length} dari ${HEAP_LIMITS.maxOperations} operasi, angka ${HEAP_LIMITS.minValue} sampai ${HEAP_LIMITS.maxValue}. Coba juga pop saat heap kosong.`}
      />
      <OperationChips
        labels={operations.map(formatHeapOperation)}
        onRemove={(index) => setOperations((current) => current.filter((_, i) => i !== index))}
      />
      <EditorActions
        onReset={() => {
          setOperations(defaults);
          setMessage(null);
        }}
        onRandom={() => {
          setOperations(randomHeapOperations());
          setMessage(null);
        }}
        onClear={() => {
          setOperations([]);
          setMessage(null);
        }}
        clearDisabled={operations.length === 0}
      />
    </div>
  );

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={heapPseudocode}
      legend={legend}
      renderHeader={(step) => (
        <OperationStrip labels={operations.map(formatHeapOperation)} current={step.state.operation} error={step.status === 'error'} />
      )}
      render={(step) => <HeapView step={step} frame={frame} />}
      editor={editor}
      editorLabel="Ubah operasi"
    />
  );
}
