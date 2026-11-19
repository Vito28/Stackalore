'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { edgeId, layoutBinaryTree, treeFrame, type TreeLayout } from '@/lib/visualisasi/tree-layout';
import {
  BST_LIMITS,
  bstPseudocode,
  bstSteps,
  formatBstOperation,
  lessonBstOperations,
  parseBstOperations,
  parseBstValue,
  parseBstValues,
  randomBstData,
  validateBst,
  type BstOperation,
  type BstState,
  type BstStep,
} from '@/lib/visualisasi/bst';
import type { Role } from '@/lib/visualisasi/types';
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
import { TreeView, describeBinaryTree, treeSpring } from './tree-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiBSTProps {
  /** Operations, e.g. "sisip(45) sisip(23) cari(36) hapus(45)". Defaults to the lesson's inserts and searches. */
  operasi?: string;
  /** Values inserted before the first step, e.g. "45 23 71 11 30 58 36 64". */
  awal?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang dibandingkan' },
  { role: 'khusus', label: 'node yang dihapus' },
  { role: 'selesai', label: 'ketemu' },
  { role: 'dibuang', label: 'subtree yang dilewati' },
];

const layoutOf = (state: Pick<BstState, 'root' | 'nodes'>): TreeLayout =>
  layoutBinaryTree(state.root, (id) => [state.nodes[id].left, state.nodes[id].right]);

const cellBase = 'viz-cell grid h-8 min-w-8 place-items-center rounded-md px-1.5 font-mono text-sm font-semibold tabular-nums';

function BstView({ step, frame }: { step: BstStep; frame: ReturnType<typeof treeFrame> }) {
  const { state } = step;
  const layout = useMemo(() => layoutOf(state), [state]);
  const edgeRoles: Record<string, Role> = {};
  for (let i = 1; i < state.path.length; i++) edgeRoles[edgeId(state.path[i - 1], state.path[i])] = 'aktif';

  // Inorder reads the circles from left to right: always sorted.
  const inorder: string[] = [];
  const walk = (id: string | null) => {
    if (id === null) return;
    walk(state.nodes[id].left);
    inorder.push(id);
    walk(state.nodes[id].right);
  };
  walk(state.root);

  return (
    <MotionConfig reducedMotion="user" transition={treeSpring}>
      <div className="space-y-4">
        <TreeView
          layout={layout}
          frame={frame}
          nodes={layout.order.map((id) => ({ id, label: String(state.nodes[id].value), role: step.highlights[id] }))}
          label={describeBinaryTree(state.root, (id) => state.nodes[id])}
          edgeRoles={edgeRoles}
          markers={state.tags.map((tag) => ({ id: tag.id, at: tag.at, label: tag.label }))}
          ghost={state.ghost ? { ...state.ghost, label: '∅' } : null}
        />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="text-xs text-fd-muted-foreground">Inorder (selalu terurut)</div>
            <ol className="mt-1.5 flex min-h-8 flex-wrap gap-1.5" aria-label="Isi tree secara inorder">
              <AnimatePresence initial={false} mode="popLayout">
                {inorder.map((id) => (
                  <motion.li
                    key={id}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
                    className={cellBase}
                    data-role={step.highlights[id] === 'dibuang' ? undefined : step.highlights[id]}
                  >
                    {state.nodes[id].value}
                  </motion.li>
                ))}
              </AnimatePresence>
              {inorder.length === 0 ? <li className="self-center text-xs text-fd-muted-foreground italic">tree kosong</li> : null}
            </ol>
          </div>
          <InfoBox title="Hasil operasi" className="sm:min-w-40">
            <ResultValue result={step.result} stepKey={String(state.operation)} error={false} />
          </InfoBox>
        </div>
      </div>
    </MotionConfig>
  );
}

function initialData(operasi: string | undefined, awal: string | undefined) {
  if (operasi === undefined && awal === undefined) return { initial: [], operations: lessonBstOperations };
  let initial: number[] = [];
  let operations: BstOperation[] = [];
  if (awal !== undefined) {
    const parsed = parseBstValues(awal);
    if ('error' in parsed) reportPropError('VisualisasiBST', 'awal', parsed.error);
    else initial = parsed.values;
  }
  if (operasi !== undefined) {
    const parsed = parseBstOperations(operasi);
    if ('error' in parsed) reportPropError('VisualisasiBST', 'operasi', parsed.error);
    else operations = parsed.operations;
  }
  const invalid = validateBst(initial, operations);
  if (invalid) {
    reportPropError('VisualisasiBST', 'operasi', invalid);
    return { initial: [], operations: lessonBstOperations };
  }
  return { initial, operations };
}

/**
 * Binary search tree: sisip, cari and hapus, one comparison per step, as in
 * the BST lesson. MDX: `<VisualisasiBST />` or
 * `<VisualisasiBST awal="45 23 71" operasi="hapus(45)" />`.
 */
export function VisualisasiBST({ operasi, awal, judul = 'Visualisasi binary search tree' }: VisualisasiBSTProps) {
  const defaults = useMemo(() => initialData(operasi, awal), [operasi, awal]);
  const [initial, setInitial] = useState<number[]>(defaults.initial);
  const [initialText, setInitialText] = useState(defaults.initial.join(' '));
  const [operations, setOperations] = useState<BstOperation[]>(defaults.operations);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const steps = useMemo(() => bstSteps(initial, operations), [initial, operations]);
  const frame = useMemo(() => treeFrame(steps.map((step) => layoutOf(step.state))), [steps]);
  const full = operations.length >= BST_LIMITS.maxOperations;

  const add = (type: BstOperation['type']) => {
    if (full) {
      setMessage(`Maksimal ${BST_LIMITS.maxOperations} operasi. Hapus salah satu dulu.`);
      return;
    }
    const parsed = parseBstValue(value);
    if ('error' in parsed) {
      setMessage(parsed.error);
      return;
    }
    const next = [...operations, { type, value: parsed.value }];
    const invalid = validateBst(initial, next);
    if (invalid) {
      setMessage(invalid);
      return;
    }
    setOperations(next);
    setMessage(null);
  };

  const applyInitial = () => {
    const parsed = parseBstValues(initialText);
    if ('error' in parsed) {
      setMessage(parsed.error);
      return;
    }
    const invalid = validateBst(parsed.values, operations);
    if (invalid) {
      setMessage(invalid);
      return;
    }
    setInitial(parsed.values);
    setInitialText(parsed.values.join(' '));
    setMessage(null);
  };

  const load = (data: { initial: number[]; operations: BstOperation[] }) => {
    setInitial(data.initial);
    setInitialText(data.initial.join(' '));
    setOperations(data.operations);
    setMessage(null);
  };

  const editor = (
    <div className="space-y-3">
      <label className="flex flex-wrap items-center gap-2 text-xs text-fd-muted-foreground">
        <span className="w-full sm:w-auto">Tree awal (disisipkan sebelum langkah pertama)</span>
        <input
          type="text"
          inputMode="numeric"
          value={initialText}
          onChange={(event) => setInitialText(event.target.value)}
          onBlur={applyInitial}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              applyInitial();
            }
          }}
          placeholder="kosong"
          className={cn(editorInput, 'min-w-0 flex-1')}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add('sisip');
            }
          }}
          placeholder="angka"
          aria-label="Angka untuk operasi"
          className={cn(editorInput, 'w-20')}
        />
        <button type="button" onClick={() => add('sisip')} disabled={full} className={editorButton}>
          <Plus className="size-4" aria-hidden="true" />
          Sisip
        </button>
        <button type="button" onClick={() => add('cari')} disabled={full} className={editorButton}>
          <Search className="size-4" aria-hidden="true" />
          Cari
        </button>
        <button type="button" onClick={() => add('hapus')} disabled={full} className={editorButton}>
          <Trash2 className="size-4" aria-hidden="true" />
          Hapus
        </button>
      </div>

      <EditorMessage
        message={message}
        hint={`${operations.length} dari ${BST_LIMITS.maxOperations} operasi, angka ${BST_LIMITS.minValue} sampai ${BST_LIMITS.maxValue}. Coba juga hapus node yang punya dua anak.`}
      />
      <OperationChips
        labels={operations.map(formatBstOperation)}
        onRemove={(index) => setOperations((current) => current.filter((_, i) => i !== index))}
      />
      <EditorActions
        onReset={() => load(defaults)}
        onRandom={() => load(randomBstData(Math.random, defaults.initial.length > 0))}
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
      pseudocode={bstPseudocode}
      legend={legend}
      renderHeader={(step) => (
        <OperationStrip labels={operations.map(formatBstOperation)} current={step.state.operation} error={step.status === 'error'} />
      )}
      render={(step) => <BstView step={step} frame={frame} />}
      editor={editor}
      editorLabel="Ubah operasi"
    />
  );
}
