'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  FIB_LIMITS,
  fibPseudocode,
  fibonacciSteps,
  lessonFibN,
  validateFibN,
  type FibStep,
} from '@/lib/visualisasi/fibonacci';
import { edgeId, layoutBinaryTree } from '@/lib/visualisasi/tree-layout';
import type { Role } from '@/lib/visualisasi/types';
import { NumberPicker } from './number-picker';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { TreeView, treeSpring } from './tree-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiFibonacciProps {
  /** Starting `n` of `fib(n)`, 1 to 6. Defaults to 5 as in the lesson. */
  n?: number;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang berjalan' },
  { role: 'khusus', label: 'menunggu hasil' },
  { role: 'selesai', label: 'selesai' },
  { role: 'error', label: 'dihitung ulang' },
];

/**
 * The call tree grows one call at a time. Positions come from the layout of
 * the whole tree, so a call never moves once it has appeared.
 */
function FibonacciView({ step, index }: { step: FibStep; index: number }) {
  const { tree, called, results, stack, n } = step.state;
  const full = useMemo(() => layoutBinaryTree(tree.root, (id) => [tree.calls[id].left, tree.calls[id].right]), [tree]);
  const made = new Set(called);
  const layout = { ...full, edges: full.edges.filter((edge) => made.has(edge.to)) };

  const nodes = called.map((id) => ({
    id,
    label: String(tree.calls[id].n),
    role: step.highlights[id],
    badge: id in results ? String(results[id]) : undefined,
  }));

  // The call stack is one path from the first call to the running one.
  const edgeRoles: Record<string, Role> = {};
  for (let depth = 1; depth < stack.length; depth++) edgeRoles[edgeId(stack[depth - 1], stack[depth])] = 'khusus';

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
            label={`Pohon panggilan fib(${n}). Sudah ${called.length} dari ${tree.order.length} panggilan.`}
            emptyText="belum ada panggilan"
          />
          <p className="mt-1 text-center text-xs text-fd-muted-foreground">
            Angka di lingkaran = <code className="font-mono">n</code>, angka hijau kecil = hasil{' '}
            <code className="font-mono">fib(n)</code>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="text-xs text-fd-muted-foreground">Call stack (atas = panggilan terbaru)</div>
            <ol className="mt-1.5 flex min-h-8 flex-col-reverse gap-1" aria-label="Call stack dari bawah ke atas">
              <AnimatePresence initial={false} mode="popLayout">
                {stack.map((id, depth) => (
                  <motion.li
                    key={id}
                    layout
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
                    className="viz-cell w-fit min-w-24 rounded-md px-2 py-1 font-mono text-xs"
                    data-role={depth === stack.length - 1 ? 'aktif' : 'khusus'}
                  >
                    fib({tree.calls[id].n})
                  </motion.li>
                ))}
              </AnimatePresence>
              {stack.length === 0 ? <li className="text-xs leading-8 text-fd-muted-foreground italic">kosong</li> : null}
            </ol>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 sm:grid sm:min-w-40 sm:content-start sm:gap-3">
            <InfoBox title="Banyak panggilan">
              <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{called.length}</span>
              <span className="ml-1 text-xs text-fd-muted-foreground">dari {tree.order.length}</span>
            </InfoBox>
            <InfoBox title="Hasil">
              <ResultValue result={step.result} stepKey={String(index)} error={false} />
            </InfoBox>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function startingN(n: number | undefined): number {
  if (n === undefined) return lessonFibN;
  const error = validateFibN(n);
  if (error) {
    reportPropError('VisualisasiFibonacci', 'n', error);
    return lessonFibN;
  }
  return n;
}

/** Call tree of the plain recursive `fib(n)`, ending with the repeated work. MDX: `<VisualisasiFibonacci />`. */
export function VisualisasiFibonacci({ n, judul = 'Visualisasi pohon panggilan Fibonacci' }: VisualisasiFibonacciProps) {
  const [value, setValue] = useState(() => startingN(n));
  const steps = useMemo(() => fibonacciSteps(value), [value]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={fibPseudocode}
      legend={legend}
      renderHeader={() => (
        <NumberPicker
          label={
            <>
              Nilai <code className="font-mono">n</code> untuk <code className="font-mono">fib(n)</code>
            </>
          }
          min={FIB_LIMITS.min}
          max={FIB_LIMITS.max}
          value={value}
          onChange={setValue}
        />
      )}
      render={(step, index) => <FibonacciView step={step} index={index} />}
    />
  );
}
