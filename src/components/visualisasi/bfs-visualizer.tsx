'use client';

import { useMemo, useState } from 'react';
import { BFS_LESSON_GRAPH, adjacencyList, graphLayout } from '@/lib/visualisasi/graph';
import { bfsPseudocode, bfsSteps, type BfsStep } from '@/lib/visualisasi/bfs';
import { BfsView } from './bfs-view';
import { GraphEditor, resolveGraphSetup, type GraphSetup } from './graph-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiBFSProps {
  /** Number of nodes, 2–9. Defaults to the BFS lesson's station graph. */
  simpul?: number;
  /** Edges in input order, e.g. "1-2 1-4 2-3". */
  sisi?: string;
  /** Start node; defaults to 1. */
  mulai?: number;
  /**
   * Target node. When given, `induk` is tracked and the shortest route is
   * rebuilt after BFS, as in the lesson's section on `induk`.
   */
  tujuan?: number;
  judul?: string;
}

/** Shows only the roles the current steps use. */
function legendFor(steps: BfsStep[], withRoute: boolean): LegendItem[] {
  const legend: LegendItem[] = [
    { role: 'aktif', label: 'sedang diperiksa (v)' },
    { role: 'khusus', label: withRoute ? 'u (diambil dari queue) / rute' : 'u (diambil dari queue)' },
    { role: 'selesai', label: 'sudah ditemukan (angka = dist)' },
  ];
  if (steps.some((step) => Object.values(step.highlights).includes('dibuang'))) {
    legend.push({ role: 'dibuang', label: 'tidak terjangkau' });
  }
  return legend;
}

/**
 * BFS with a queue, `dist` marked when a node enters the queue, and an
 * optional route rebuilt with `induk`. MDX: `<VisualisasiBFS />` or
 * `<VisualisasiBFS tujuan={8} />`.
 */
export function VisualisasiBFS({ simpul, sisi, mulai, tujuan, judul = 'Visualisasi BFS' }: VisualisasiBFSProps) {
  const withRoute = tujuan !== undefined;
  const defaults = useMemo(
    () => resolveGraphSetup({ simpul, sisi, mulai, tujuan }, BFS_LESSON_GRAPH, 'VisualisasiBFS', withRoute),
    [simpul, sisi, mulai, tujuan, withRoute],
  );
  const [setup, setSetup] = useState<GraphSetup>(defaults);

  const steps = useMemo(() => bfsSteps(setup.graph, setup.start, setup.target), [setup]);
  const layout = useMemo(() => graphLayout(setup.graph), [setup.graph]);
  const adj = useMemo(() => adjacencyList(setup.graph), [setup.graph]);
  const legend = useMemo(() => legendFor(steps, withRoute), [steps, withRoute]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={bfsPseudocode(withRoute)}
      legend={legend}
      render={(step, index) => <BfsView step={step} index={index} graph={setup.graph} layout={layout} adj={adj} />}
      editor={<GraphEditor value={setup} defaults={defaults} withTarget={withRoute} onChange={setSetup} />}
      editorLabel="Ubah graph"
    />
  );
}
