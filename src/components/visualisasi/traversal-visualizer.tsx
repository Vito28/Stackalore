'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { layoutBinaryTree } from '@/lib/visualisasi/tree-layout';
import {
  TRAVERSAL_MODES,
  lessonTree,
  parseTraversalMode,
  randomBinaryTree,
  traversalModeLabels,
  traversalPseudocode,
  traversalSteps,
  type BinaryTree,
  type TraversalMode,
  type TraversalStep,
} from '@/lib/visualisasi/traversal';
import { EditorActions, EditorMessage, reportPropError } from './tree-editor';
import { TreeView, describeBinaryTree, treeSpring } from './tree-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiTraversalProps {
  /** `preorder`, `inorder`, `postorder`, `level-order`, or `semua` (default). Picks the starting mode; the picker always shows all four. */
  mode?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang diproses' },
  { role: 'khusus', label: 'menunggu (call stack / queue)' },
  { role: 'selesai', label: 'sudah dicetak' },
];

function ModePicker({ mode, onChange }: { mode: TraversalMode; onChange: (mode: TraversalMode) => void }) {
  return (
    <div role="radiogroup" aria-label="Jenis penelusuran" className="inline-flex max-w-full flex-wrap rounded-lg border bg-fd-background p-0.5">
      {TRAVERSAL_MODES.map((item) => (
        <button
          key={item}
          type="button"
          role="radio"
          aria-checked={mode === item}
          onClick={() => onChange(item)}
          className={cn(
            'h-9 rounded-md px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none',
            mode === item ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
          )}
        >
          {traversalModeLabels[item]}
        </button>
      ))}
    </div>
  );
}

const cellBase = 'viz-cell grid h-8 min-w-8 place-items-center rounded-md px-1.5 font-mono text-sm font-semibold tabular-nums';

function TraversalView({ step }: { step: TraversalStep }) {
  const { tree, output, stack, queue, current, ghost, mode } = step.state;
  const layout = useMemo(() => layoutBinaryTree(tree.root, (id) => [tree.nodes[id].left, tree.nodes[id].right]), [tree]);
  const value = (id: string) => tree.nodes[id].value;
  const order = new Map(output.map((id, index) => [id, index + 1]));
  const recursive = mode !== 'level-order';

  const nodes = layout.order.map((id) => ({
    id,
    label: String(value(id)),
    role: step.highlights[id],
    badge: order.has(id) ? String(order.get(id)) : undefined,
  }));

  return (
    <MotionConfig reducedMotion="user" transition={treeSpring}>
      <div className="space-y-4">
        <TreeView
          layout={layout}
          frame={layout}
          nodes={nodes}
          label={describeBinaryTree(tree.root, (id) => tree.nodes[id])}
          markers={!recursive && current !== null ? [{ id: 'p', at: current, label: 'p' }] : []}
          ghost={ghost ? { from: ghost.from, side: ghost.side, label: '∅' } : null}
        />

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="text-xs text-fd-muted-foreground">Urutan kunjungan ({traversalModeLabels[mode]})</div>
            <ol className="mt-1.5 flex min-h-8 flex-wrap gap-1.5" aria-label="Urutan kunjungan">
              <AnimatePresence initial={false}>
                {output.map((id) => (
                  <motion.li
                    key={id}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    className={cellBase}
                    data-role={id === current ? 'aktif' : 'selesai'}
                  >
                    {value(id)}
                  </motion.li>
                ))}
              </AnimatePresence>
              {output.length === 0 ? <li className="text-xs leading-8 text-fd-muted-foreground italic">belum ada</li> : null}
            </ol>
          </div>

          {recursive ? (
            <div className="sm:min-w-40">
              <div className="text-xs text-fd-muted-foreground">Call stack (atas = panggilan terbaru)</div>
              <ol className="mt-1.5 flex min-h-8 flex-col-reverse gap-1" aria-label="Call stack dari bawah ke atas">
                <AnimatePresence initial={false} mode="popLayout">
                  {stack.map((frame, index) => {
                    const top = index === stack.length - 1;
                    return (
                      <motion.li
                        key={frame ?? `kosong-${index}`}
                        layout
                        initial={{ opacity: 0, y: -14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
                        className={cn('viz-cell rounded-md px-2 py-1 font-mono text-xs', frame === null && 'border-dashed')}
                        data-role={top ? 'aktif' : frame !== null && order.has(frame) ? 'selesai' : 'khusus'}
                      >
                        {mode}({frame === null ? '∅' : value(frame)})
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
                {stack.length === 0 ? <li className="text-xs leading-8 text-fd-muted-foreground italic">kosong</li> : null}
              </ol>
            </div>
          ) : (
            <div className="min-w-0 sm:min-w-40">
              <div className="text-xs text-fd-muted-foreground">Queue (depan → belakang)</div>
              <ol className="mt-1.5 flex min-h-8 flex-wrap gap-1.5" aria-label="Isi queue dari depan ke belakang">
                <AnimatePresence initial={false} mode="popLayout">
                  {queue.map((id) => (
                    <motion.li
                      key={id}
                      layout
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }}
                      className={cellBase}
                      data-role="khusus"
                    >
                      {value(id)}
                    </motion.li>
                  ))}
                </AnimatePresence>
                {queue.length === 0 ? <li className="text-xs leading-8 text-fd-muted-foreground italic">kosong</li> : null}
              </ol>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}

/**
 * Preorder, inorder, postorder and level-order on the Tree lesson's example.
 * MDX: `<VisualisasiTraversal />` or `<VisualisasiTraversal mode="inorder" />`.
 */
export function VisualisasiTraversal({ mode, judul = 'Visualisasi penelusuran binary tree' }: VisualisasiTraversalProps) {
  const startMode = useMemo<TraversalMode>(() => {
    const parsed = parseTraversalMode(mode);
    if (parsed === null) {
      reportPropError('VisualisasiTraversal', 'mode', `mode tidak dikenal: ${mode}. Gunakan ${TRAVERSAL_MODES.join(', ')}, atau semua.`);
      return 'preorder';
    }
    return parsed === 'semua' ? 'preorder' : parsed;
  }, [mode]);
  const [selected, setSelected] = useState<TraversalMode>(startMode);
  const [tree, setTree] = useState<BinaryTree>(lessonTree);
  const steps = useMemo(() => traversalSteps(tree, selected), [tree, selected]);

  const editor = (
    <div className="space-y-3">
      <EditorMessage message={null} hint="Pakai tree contoh dari materi, atau acak tree baru berisi 5 sampai 9 node." />
      <EditorActions onReset={() => setTree(lessonTree)} onRandom={() => setTree(randomBinaryTree())} />
    </div>
  );

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={traversalPseudocode[selected]}
      legend={legend}
      renderHeader={() => <ModePicker mode={selected} onChange={setSelected} />}
      render={(step) => <TraversalView step={step} />}
      editor={editor}
      editorLabel="Ubah tree"
    />
  );
}
