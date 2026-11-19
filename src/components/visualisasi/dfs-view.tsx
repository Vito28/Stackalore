'use client';

import { useId } from 'react';
import { LayoutGroup, MotionConfig } from 'motion/react';
import type { Graph, GraphLayout } from '@/lib/visualisasi/graph';
import type { DfsStep } from '@/lib/visualisasi/dfs';
import { AdjacencyStrip, ChipStrip, OrderStrip, PanelLabel, ResultPill } from './graph-panels';
import { GraphView, type NodeTag } from './graph-view';

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const;

interface DfsViewProps {
  step: DfsStep;
  index: number;
  graph: Graph;
  layout: GraphLayout;
  adj: number[][];
}

/**
 * One DFS step: the graph with ✓ on visited nodes and `u`/`v` tags, the
 * adjacency list being walked, the call stack (or explicit stack) and the
 * visit order.
 */
export function DfsView({ step, index, graph, layout, adj }: DfsViewProps) {
  const { state } = step;
  const groupId = useId();
  const recursive = state.mode === 'rekursif';

  const tags: NodeTag[] = [];
  if (state.current !== null) tags.push({ node: state.current, text: 'u', role: 'khusus' });
  // A node popped and skipped is `u` in the lesson's code; a neighbour being looked at is `v`.
  if (state.neighbor !== null) tags.push({ node: state.neighbor, text: state.current === null ? 'u' : 'v', role: 'aktif' });

  const badges: Record<number, string> = {};
  for (const node of state.order) badges[node] = '✓';

  const label = [
    `Graph dengan ${graph.n} simpul dan ${graph.edges.length} sisi.`,
    state.order.length ? `Sudah dikunjungi: ${state.order.join(', ')}.` : 'Belum ada simpul yang dikunjungi.',
    state.current !== null ? `u = ${state.current}.` : '',
    state.neighbor !== null ? `Sedang diperiksa: ${state.neighbor}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <LayoutGroup id={groupId}>
        <div className="@container space-y-4">
          <GraphView
            graph={graph}
            layout={layout}
            highlights={step.highlights}
            tags={tags}
            badges={badges}
            move={state.move}
            ripple={state.fresh}
            focus={state.current}
            stepIndex={index}
            label={label}
          />

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <AdjacencyStrip adj={adj} scan={state.scan} fallback={state.current} />
            <ResultPill result={step.result} stepKey={index} />
          </div>

          <div className="grid gap-x-6 gap-y-3 @md:grid-cols-2">
            <div className="min-w-0">
              <PanelLabel hint="(bawah → atas)">{recursive ? 'Call stack' : 'Stack'}</PanelLabel>
              <ChipStrip
                items={state.stack.map((frame) => ({
                  id: frame.id,
                  text: recursive ? `dfs(${frame.node})` : String(frame.node),
                  mark: frame.returning ? '↩' : undefined,
                }))}
                highlights={step.highlights}
                label={recursive ? 'Call stack dari bawah ke atas' : 'Isi stack dari bawah ke atas'}
                markerAt="last"
                markerText="top"
                motionStyle="stack"
              />
            </div>
            <div className="min-w-0">
              <PanelLabel>Urutan kunjungan (output)</PanelLabel>
              <OrderStrip
                order={state.order}
                label="Urutan kunjungan"
                roleOf={(node) => (node === state.fresh ? 'aktif' : 'selesai')}
              />
            </div>
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
