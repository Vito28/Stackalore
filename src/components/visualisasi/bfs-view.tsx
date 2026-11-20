'use client';

import { useId } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import type { Graph, GraphLayout } from '@/lib/visualisasi/graph';
import { distId, parentId, type BfsState, type BfsStep } from '@/lib/visualisasi/bfs';
import type { Role } from '@/lib/visualisasi/types';
import { AdjacencyStrip, ChipStrip, OrderStrip, PanelLabel, ResultPill } from './graph-panels';
import { GraphView, type NodeTag } from './graph-view';

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const;

interface BfsViewProps {
  step: BfsStep;
  index: number;
  graph: Graph;
  layout: GraphLayout;
  adj: number[][];
}

/** A value that slides in when it changes, e.g. `dist[3]` going from -1 to 2. */
function CellValue({ value, muted }: { value: number; muted: boolean }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
        className={cn('block', muted && 'text-fd-muted-foreground')}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

/** The `dist` array (and `induk` when a route is rebuilt), indexed by node. */
function ArrayTable({ state, highlights, n }: { state: BfsState; highlights: Record<string, Role>; n: number }) {
  const nodes = Array.from({ length: n }, (_, i) => i + 1);
  const rows: { name: string; values: number[]; id: (node: number) => string; empty: number }[] = [
    { name: 'dist', values: state.dist, id: distId, empty: -1 },
  ];
  if (state.parent) rows.push({ name: 'induk', values: state.parent, id: parentId, empty: 0 });
  const cell = 'viz-cell relative flex size-7 items-center justify-center overflow-hidden rounded-md';

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <table className="border-separate border-spacing-1 font-mono text-xs">
        <thead>
          <tr>
            <th scope="col" className="pr-1 text-left font-sans text-[0.6875rem] font-normal text-fd-muted-foreground">
              simpul
            </th>
            {nodes.map((node) => (
              <th key={node} scope="col" className="font-normal text-fd-muted-foreground">
                {node}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row" className="pr-1 text-left font-semibold text-fd-foreground">
                {row.name}
              </th>
              {nodes.map((node) => (
                <td key={node} className="p-0">
                  <span className={cell} data-role={highlights[row.id(node)]}>
                    <CellValue value={row.values[node]} muted={row.values[node] === row.empty} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The route rebuilt with `induk`; on reversal the same chips glide into the new order. */
function RouteStrip({ state }: { state: BfsState }) {
  const groupId = useId();
  const walking = state.phase === 'rute';
  const empty =
    state.phase === 'rute-selesai' && state.route.length === 0
      ? 'tidak ada rute'
      : state.phase === 'bfs' || state.phase === 'selesai'
        ? 'disusun setelah BFS selesai'
        : 'belum ada';
  return (
    <div className="min-w-0">
      <PanelLabel hint={walking ? `(mundur dari ${state.target} lewat induk)` : undefined}>Rute ke {state.target}</PanelLabel>
      <LayoutGroup id={groupId}>
        <ol
          className="flex min-h-8 flex-wrap items-center gap-1"
          aria-label={state.route.length ? `Rute: ${state.route.join(', ')}` : `Rute: ${empty}`}
        >
          <AnimatePresence initial={false}>
            {state.route.map((node, position) => (
              <motion.li
                key={node}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="flex items-center gap-1"
              >
                {position > 0 ? (
                  <span className="text-xs text-fd-muted-foreground" aria-hidden="true">
                    →
                  </span>
                ) : null}
                <span
                  className="viz-cell inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-mono text-sm font-semibold"
                  data-role="khusus"
                >
                  {node}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
          {state.route.length === 0 ? <li className="text-xs text-fd-muted-foreground italic">{empty}</li> : null}
        </ol>
      </LayoutGroup>
    </div>
  );
}

/**
 * One BFS step: the graph with each found node's `dist` as a badge, the
 * queue, the order nodes leave the queue grouped per layer, the `dist`
 * (and `induk`) array, and the rebuilt route when there is a target.
 */
export function BfsView({ step, index, graph, layout, adj }: BfsViewProps) {
  const { state } = step;
  const groupId = useId();

  const tags: NodeTag[] = [];
  if (state.current !== null) tags.push({ node: state.current, text: 'u', role: 'khusus' });
  // Checking `dist[t]` names the target `t`; walking back along `induk` uses `v`, as in the lesson's code.
  const checkingTarget = state.phase !== 'bfs' && state.route.length === 0;
  if (state.neighbor !== null) tags.push({ node: state.neighbor, text: checkingTarget ? 't' : 'v', role: 'aktif' });

  const badges: Record<number, string> = {};
  for (let node = 1; node <= graph.n; node++) if (state.dist[node] !== -1) badges[node] = String(state.dist[node]);

  const found = Array.from({ length: graph.n }, (_, i) => i + 1).filter((node) => state.dist[node] !== -1);
  const label = [
    `Graph dengan ${graph.n} simpul dan ${graph.edges.length} sisi. Angka kecil di tiap simpul adalah dist.`,
    found.length
      ? `Sudah ditemukan: ${found.map((node) => `${node} (dist ${state.dist[node]})`).join(', ')}.`
      : 'Belum ada simpul yang ditemukan.',
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
              <PanelLabel hint="(depan → belakang)">Queue</PanelLabel>
              <ChipStrip
                items={state.queue.map((item) => ({ id: item.id, text: String(item.node) }))}
                highlights={step.highlights}
                label="Isi queue dari depan ke belakang"
                markerAt="first"
                markerText="depan"
                motionStyle="queue"
              />
            </div>
            <div className="min-w-0">
              <PanelLabel hint="(per lapis jarak)">Urutan BFS</PanelLabel>
              <OrderStrip
                order={state.order}
                groups={state.order.map((node) => state.dist[node])}
                label="Urutan keluar dari queue"
                roleOf={(node) => (node === state.current ? 'khusus' : 'selesai')}
              />
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-3 @md:grid-cols-[auto_minmax(0,1fr)]">
            <div className="min-w-0">
              <PanelLabel hint={state.parent ? '(-1 = belum ditemukan, 0 = tanpa induk)' : '(-1 = belum ditemukan)'}>
                Array
              </PanelLabel>
              <ArrayTable state={state} highlights={step.highlights} n={graph.n} />
            </div>
            {state.target !== null ? <RouteStrip state={state} /> : null}
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
