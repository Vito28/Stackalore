'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import {
  MEMO_LIMITS,
  countCellId,
  lessonMemoN,
  memoCellId,
  memoisasiSteps,
  pseudocodeFor,
  validateMemoN,
  type MemoStep,
  type ModeMemo,
} from '@/lib/visualisasi/memoisasi';
import { edgeId, layoutBinaryTree } from '@/lib/visualisasi/tree-layout';
import type { Role } from '@/lib/visualisasi/types';
import { ChoicePicker, PickerStack, type Choice } from './choice-picker';
import { NumberPicker } from './number-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { TreeView, treeSpring } from './tree-view';
import { Visualizer, type LegendItem } from './visualizer';

const modeChoices: Choice<ModeMemo>[] = [
  { value: 'tanpa', label: 'Tanpa memo' },
  { value: 'memo', label: 'Dengan memo' },
];

/** A table cell whose number pops when it changes. */
function TableCell({ value, role, muted = false }: { value: string; role?: Role; muted?: boolean }) {
  return (
    <div className="viz-cell flex h-9 items-center justify-center overflow-hidden rounded-md font-mono text-sm tabular-nums" data-role={role}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
          className={cn(muted ? 'text-fd-muted-foreground' : 'font-semibold text-fd-foreground')}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function MemoView({ step, index }: { step: MemoStep; index: number }) {
  const { tree, called, results, stack, memo, counts, n, mode } = step.state;
  const full = useMemo(() => layoutBinaryTree(tree.root, (id) => [tree.calls[id].left, tree.calls[id].right]), [tree]);
  const made = new Set(called);
  const layout = { ...full, edges: full.edges.filter((edge) => made.has(edge.to)) };
  const withMemo = mode === 'memo';

  const nodes = called.map((id) => ({
    id,
    label: String(tree.calls[id].n),
    role: step.highlights[id],
    badge: id in results ? String(results[id]) : undefined,
    ring: tree.calls[id].hit,
  }));

  const edgeRoles: Record<string, Role> = {};
  for (let depth = 1; depth < stack.length; depth++) edgeRoles[edgeId(stack[depth - 1], stack[depth])] = 'khusus';

  const ks = Array.from({ length: n + 1 }, (_, k) => k);
  const columns = `auto repeat(${n + 1}, minmax(0, 2.75rem))`;

  return (
    <MotionConfig reducedMotion="user" transition={treeSpring}>
      <div className="space-y-4">
        <div>
          <TreeView
            layout={layout}
            frame={full}
            nodes={nodes}
            edgeRoles={edgeRoles}
            variant="rapat"
            label={`Pohon panggilan fib(${n}) ${withMemo ? 'dengan' : 'tanpa'} memo. Sudah ${called.length} dari ${tree.order.length} panggilan.`}
            emptyText="belum ada panggilan"
          />
          <p className="mt-1 text-center text-xs text-fd-muted-foreground">
            Angka di lingkaran = <code className="font-mono">n</code>, angka hijau kecil = hasil
            {withMemo ? ', lingkaran ganda = diambil dari memo' : ''}
          </p>
        </div>

        <div className="grid items-center gap-1 text-xs" style={{ gridTemplateColumns: columns }} role="table" aria-label="Tabel per nilai k">
          <div role="row" className="contents">
            <span role="columnheader" className="pr-2 text-fd-muted-foreground">
              <code className="font-mono">k</code>
            </span>
            {ks.map((k) => (
              <span key={k} role="columnheader" className="text-center font-mono text-fd-muted-foreground">
                {k}
              </span>
            ))}
          </div>
          <div role="row" className="contents">
            <span role="rowheader" className="pr-2 text-fd-muted-foreground">
              dipanggil
            </span>
            {ks.map((k) => (
              <div role="cell" key={k}>
                <TableCell value={`${counts[k]}×`} role={step.highlights[countCellId(k)]} muted={counts[k] === 0} />
              </div>
            ))}
          </div>
          {withMemo ? (
            <div role="row" className="contents">
              <span role="rowheader" className="pr-2 text-fd-muted-foreground">
                <code className="font-mono">memo[k]</code>
              </span>
              {ks.map((k) => (
                <div role="cell" key={k}>
                  {k < 2 ? (
                    <div className="flex h-9 items-center justify-center text-[0.6875rem] text-fd-muted-foreground" title="kasus dasar, tidak dicatat">
                      dasar
                    </div>
                  ) : (
                    <TableCell value={String(memo[k] ?? -1)} role={step.highlights[memoCellId(k)]} muted={memo[k] === null} />
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          <InfoBox title="Banyak panggilan">
            <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{called.length}</span>
            <span className="ml-1 text-xs text-fd-muted-foreground">dari {tree.order.length}</span>
          </InfoBox>
          <InfoBox title="Kedalaman call stack">
            <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{stack.length}</span>
          </InfoBox>
          <InfoBox title="Hasil">
            <ResultValue result={step.result} stepKey={String(index)} error={false} />
          </InfoBox>
        </div>
      </div>
    </MotionConfig>
  );
}

interface VisualisasiMemoisasiProps {
  /** Starting `n`, 1 to 6. Defaults to 5 as in the deep dive. */
  n?: number;
  /** Starting mode: `memo` (default) or `tanpa`. */
  mode?: ModeMemo;
  judul?: string;
}

function startingN(n: number | undefined): number {
  if (n === undefined) return lessonMemoN;
  const error = validateMemoN(n);
  if (error) {
    reportPropError('VisualisasiMemoisasi', 'n', error);
    return lessonMemoN;
  }
  return n;
}

/** `fib(n)` with or without a memo: the call tree, the memo table and the call counts. MDX: `<VisualisasiMemoisasi />`. */
export function VisualisasiMemoisasi({ n, mode, judul = 'Visualisasi memoisasi Fibonacci' }: VisualisasiMemoisasiProps) {
  const [value, setValue] = useState(() => startingN(n));
  const [chosen, setChosen] = useState<ModeMemo>(mode === 'tanpa' ? 'tanpa' : 'memo');
  const steps = useMemo(() => memoisasiSteps(value, chosen), [value, chosen]);

  const legend: LegendItem[] = [
    { role: 'aktif', label: 'sedang berjalan' },
    { role: 'khusus', label: 'menunggu hasil' },
    { role: 'selesai', label: 'selesai' },
    ...(chosen === 'tanpa' ? [{ role: 'error' as const, label: 'dihitung ulang' }] : []),
  ];

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={pseudocodeFor(chosen)}
      legend={legend}
      renderHeader={() => (
        <PickerStack>
          <ChoicePicker label="Cara" choices={modeChoices} value={chosen} onChange={setChosen} />
          <NumberPicker
            label={
              <>
                Nilai <code className="font-mono">n</code> untuk <code className="font-mono">fib(n)</code>
              </>
            }
            min={MEMO_LIMITS.min}
            max={MEMO_LIMITS.max}
            value={value}
            onChange={setValue}
          />
        </PickerStack>
      )}
      render={(step, index) => <MemoView step={step} index={index} />}
    />
  );
}
