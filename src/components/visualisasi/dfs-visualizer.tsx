'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { DFS_LESSON_GRAPH, adjacencyList, graphLayout } from '@/lib/visualisasi/graph';
import { dfsPseudocode, dfsSteps, type DfsMode, type DfsStep } from '@/lib/visualisasi/dfs';
import { DfsView } from './dfs-view';
import { GraphEditor, resolveGraphSetup, type GraphSetup } from './graph-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiDFSProps {
  /** Number of nodes, 2–9. Defaults to the DFS lesson's graph. */
  simpul?: number;
  /** Edges in input order, e.g. "1-2 1-3 2-4". */
  sisi?: string;
  /** Start node; defaults to 1. */
  mulai?: number;
  /** Version shown first: the recursive one, or the one with its own stack. */
  mode?: DfsMode;
  judul?: string;
}

const modes: { value: DfsMode; label: string }[] = [
  { value: 'rekursif', label: 'Rekursif' },
  { value: 'stack', label: 'Dengan stack sendiri' },
];

/** Shows only the roles the current steps use. */
function legendFor(steps: DfsStep[], mode: DfsMode): LegendItem[] {
  const unreachable = steps.at(-1)!.state.done && Object.values(steps.at(-1)!.highlights).includes('dibuang');
  const returning = steps.some((step) => step.state.stack.some((frame) => frame.returning));
  const legend: LegendItem[] = [
    { role: 'aktif', label: 'sedang diperiksa (v)' },
    { role: 'khusus', label: mode === 'rekursif' ? 'u dan jalur di call stack' : 'u (hasil pop)' },
    { role: 'selesai', label: 'sudah dikunjungi (✓)' },
  ];
  const discarded = [returning ? 'langsung kembali (↩)' : '', unreachable ? 'tidak terjangkau' : ''].filter(Boolean);
  if (discarded.length) legend.push({ role: 'dibuang', label: discarded.join(' / ') });
  return legend;
}

function ModePicker({ mode, onChange }: { mode: DfsMode; onChange: (mode: DfsMode) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-fd-muted-foreground">Versi</span>
      <div role="radiogroup" aria-label="Versi DFS" className="flex rounded-lg border bg-fd-background p-0.5">
        {modes.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={mode === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-9 rounded-md px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none',
              mode === option.value
                ? 'bg-fd-primary text-fd-primary-foreground'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * DFS on an undirected graph, recursive or with its own stack, with a graph
 * editor. MDX: `<VisualisasiDFS />` or `<VisualisasiDFS mode="stack" />`.
 */
export function VisualisasiDFS({ simpul, sisi, mulai, mode = 'rekursif', judul = 'Visualisasi DFS' }: VisualisasiDFSProps) {
  const defaults = useMemo(
    () => resolveGraphSetup({ simpul, sisi, mulai }, DFS_LESSON_GRAPH, 'VisualisasiDFS', false),
    [simpul, sisi, mulai],
  );
  const [setup, setSetup] = useState<GraphSetup>(defaults);
  const [version, setVersion] = useState<DfsMode>(mode === 'stack' ? 'stack' : 'rekursif');

  const steps = useMemo(() => dfsSteps(setup.graph, setup.start, version), [setup, version]);
  const layout = useMemo(() => graphLayout(setup.graph), [setup.graph]);
  const adj = useMemo(() => adjacencyList(setup.graph), [setup.graph]);
  const legend = useMemo(() => legendFor(steps, version), [steps, version]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={dfsPseudocode[version]}
      legend={legend}
      renderHeader={() => <ModePicker mode={version} onChange={setVersion} />}
      render={(step, index) => <DfsView step={step} index={index} graph={setup.graph} layout={layout} adj={adj} />}
      editor={<GraphEditor value={setup} defaults={defaults} onChange={setSetup} />}
      editorLabel="Ubah graph"
    />
  );
}
