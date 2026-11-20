'use client';

import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import {
  isCircular,
  isDoubly,
  linkId,
  listValues,
  type LinkedListNode,
  type LinkedListState,
  type LinkedListStep,
} from '@/lib/visualisasi/linked-list';

const spring = { type: 'spring', stiffness: 380, damping: 34, mass: 0.8 } as const;

// Geometry, in pixels. Everything is placed from these numbers so the SVG
// arrows and the HTML nodes always line up.
const H = 40; // node height
const VALUE_W = 34;
const NEXT_W = 20;
const PREV_W = 18;
const BORDER = 1.5; // .viz-cell border
const PAD_X = 24; // room for the arrows that loop around a circular list
const LABEL_H = 28; // pointer name plus its small arrow
const NULL_W = 30;
const NULL_H = 26;
const CHAR_W = 7; // 11px monospace, rounded up
const RADIUS = 6;

/** Fixed order of pointer names when several point at the same node. */
const pointerOrder = ['head', 'tail', 'prev', 'p', 'baru', 'sisa', 'target'];
const pointerColor: Record<string, string> = {
  head: 'text-fd-foreground',
  tail: 'text-fd-foreground',
  p: 'viz-text-khusus',
  prev: 'viz-text-khusus',
  baru: 'text-[var(--viz-aktif)]',
};

type ArrowColor = 'biasa' | 'aktif' | 'dibuang';
const arrowStroke: Record<ArrowColor, string> = {
  biasa: 'var(--color-fd-muted-foreground)',
  aktif: 'var(--viz-aktif)',
  dibuang: 'var(--viz-dibuang)',
};

function geometry(state: LinkedListState) {
  const doubly = isDoubly(state.jenis);
  const circular = isCircular(state.jenis);
  const W = VALUE_W + NEXT_W + (doubly ? PREV_W : 0);
  const G = doubly ? 34 : 30;
  const rowY = (circular ? 18 : 2) + LABEL_H;
  const drop = H + LABEL_H + 6;
  const n = state.nodes.length;
  const hasNull = state.pointers.some((pointer) => pointer.target === null);
  const nullX = PAD_X + n * (W + G);
  const right = hasNull ? nullX + NULL_W : PAD_X + Math.max(0, n * (W + G) - G);
  const below = Math.max(state.operasi === 'hapus' ? drop : 0, state.jenis === 'circular-doubly' ? 26 : 0);
  return {
    doubly,
    W,
    G,
    rowY,
    hasNull,
    nullX,
    width: right + PAD_X,
    height: rowY + H + below + 8,
    /** Arrow heights inside a node: next on the upper half, prev (doubly) on the lower half. */
    nextY: doubly ? 13 : H / 2,
    prevY: doubly ? 28 : H / 2,
    x: (index: number) => PAD_X + index * (W + G),
    y: (node: LinkedListNode) => rowY + (node.terlepas ? drop : 0),
  };
}

/** Width of the drawing for one step; the visualizer keeps the widest one so the drawing does not jump. */
export function linkedListWidth(state: LinkedListState): number {
  return geometry(state).width;
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Orthogonal path through `points` with rounded corners. Same point count → same command structure, so it can morph. */
function roundedPath(points: [number, number][]): string {
  let d = `M ${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const inLength = Math.hypot(cx - px, cy - py) || 1;
    const outLength = Math.hypot(nx - cx, ny - cy) || 1;
    const r = Math.min(RADIUS, inLength / 2, outLength / 2);
    const ax = cx - ((cx - px) / inLength) * r;
    const ay = cy - ((cy - py) / inLength) * r;
    const bx = cx + ((nx - cx) / outLength) * r;
    const by = cy + ((ny - cy) / outLength) * r;
    d += ` L ${round(ax)} ${round(ay)} Q ${round(cx)} ${round(cy)} ${round(bx)} ${round(by)}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${round(last[0])} ${round(last[1])}`;
}

interface Arrow {
  key: string;
  d: string;
  dashed: boolean;
  color: ArrowColor;
}

function arrows(step: LinkedListStep, geo: ReturnType<typeof geometry>): Arrow[] {
  const { nodes } = step.state;
  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const color = (node: LinkedListNode, field: 'next' | 'prev'): ArrowColor =>
    step.highlights[linkId(node.id, field)] === 'aktif' ? 'aktif' : node.terlepas ? 'dibuang' : 'biasa';
  const result: Arrow[] = [];
  const nextWraps: { node: LinkedListNode; from: number; to: number }[] = [];
  const prevWraps: { node: LinkedListNode; from: number; to: number }[] = [];

  nodes.forEach((node, from) => {
    if (node.next !== null) {
      const to = index.get(node.next)!;
      if (to > from) {
        const target = nodes[to];
        result.push({
          key: `${node.id}:next:lurus`,
          d: roundedPath([
            [geo.x(from) + geo.W - BORDER - NEXT_W / 2, geo.y(node) + geo.nextY],
            [geo.x(to) - 1, geo.y(target) + geo.nextY],
          ]),
          dashed: false,
          color: color(node, 'next'),
        });
      } else nextWraps.push({ node, from, to });
    }
    if (node.prev !== null) {
      const to = index.get(node.prev)!;
      if (to < from) {
        const target = nodes[to];
        result.push({
          key: `${node.id}:prev:lurus`,
          d: roundedPath([
            [geo.x(from) + BORDER + PREV_W / 2, geo.y(node) + geo.prevY],
            [geo.x(to) + geo.W + 1, geo.y(target) + geo.prevY],
          ]),
          dashed: true,
          color: color(node, 'prev'),
        });
      } else prevWraps.push({ node, from, to });
    }
  });

  // Links back to the start of a circular list loop over the top (next) or
  // under the row (prev). Longer loops go outside shorter ones.
  const bySpan = (a: { from: number; to: number }, b: { from: number; to: number }) => b.from - b.to - (a.from - a.to);
  nextWraps.sort(bySpan).forEach(({ node, from, to }, rank) => {
    const offset = 8 + (nextWraps.length - 1 - rank) * 5;
    const top = 4 + rank * 5;
    const sy = geo.y(node) + geo.nextY;
    const ey = geo.y(nodes[to]) + geo.nextY;
    result.push({
      key: `${node.id}:next:putar`,
      d: roundedPath([
        [geo.x(from) + geo.W - BORDER - NEXT_W / 2, sy],
        [geo.x(from) + geo.W + offset, sy],
        [geo.x(from) + geo.W + offset, top],
        [geo.x(to) - offset, top],
        [geo.x(to) - offset, ey],
        [geo.x(to) - 1, ey],
      ]),
      dashed: false,
      color: color(node, 'next'),
    });
  });
  prevWraps.sort(bySpan).forEach(({ node, from, to }, rank) => {
    const offset = 8 + (prevWraps.length - 1 - rank) * 5;
    const bottom = geo.rowY + H + 8 + (prevWraps.length - 1 - rank) * 5;
    const sy = geo.y(node) + geo.prevY;
    const ey = geo.y(nodes[to]) + geo.prevY;
    result.push({
      key: `${node.id}:prev:putar`,
      d: roundedPath([
        [geo.x(from) + BORDER + PREV_W / 2, sy],
        [geo.x(from) - offset, sy],
        [geo.x(from) - offset, bottom],
        [geo.x(to) + geo.W + offset, bottom],
        [geo.x(to) + geo.W + offset, ey],
        [geo.x(to) + geo.W + 1, ey],
      ]),
      dashed: true,
      color: color(node, 'prev'),
    });
  });
  return result;
}

interface Label {
  name: string;
  x: number;
  y: number;
  width: number;
}

function labels(state: LinkedListState, geo: ReturnType<typeof geometry>): Label[] {
  const groups = new Map<string, string[]>();
  for (const pointer of state.pointers) {
    const key = pointer.target ?? '∅';
    groups.set(key, [...(groups.get(key) ?? []), pointer.name]);
  }
  const result: Label[] = [];
  for (const [target, names] of groups) {
    names.sort((a, b) => pointerOrder.indexOf(a) - pointerOrder.indexOf(b));
    const nodeIndex = state.nodes.findIndex((node) => node.id === target);
    const node = state.nodes[nodeIndex];
    const center = node ? geo.x(nodeIndex) + geo.W / 2 : geo.nullX + NULL_W / 2;
    const top = (node ? geo.y(node) : geo.rowY) - LABEL_H;
    const widths = names.map((name) => name.length * CHAR_W + 10);
    let left = center - (widths.reduce((sum, width) => sum + width, 0) + (names.length - 1) * 2) / 2;
    names.forEach((name, i) => {
      result.push({ name, x: left, y: top, width: widths[i] });
      left += widths[i] + 2;
    });
  }
  return result;
}

function describe(state: LinkedListState): string {
  const values = listValues(state);
  const list = values.length ? values.join(' → ') : 'kosong';
  const pointers = state.pointers
    .map((pointer) => {
      const node = state.nodes.find((other) => other.id === pointer.target);
      return `${pointer.name} di ${node ? `node ${node.value}` : 'nullptr'}`;
    })
    .join(', ');
  const removed = state.nodes.filter((node) => node.terlepas).map((node) => node.value);
  return `List: ${list}${isCircular(state.jenis) && values.length ? ', lalu kembali ke awal' : ''}. ${pointers}.${
    removed.length ? ` Node ${removed.join(', ')} sudah dilepas dari list.` : ''
  }`;
}

/** Horizontal centre of what a step is about: the walking pointer, else a new or highlighted node, else a removed one. */
function focusX(step: LinkedListStep, geo: ReturnType<typeof geometry>): number | null {
  const { nodes, pointers } = step.state;
  const center = (index: number) => geo.x(index) + geo.W / 2;
  for (const name of ['p', 'prev', 'baru']) {
    const pointer = pointers.find((other) => other.name === name);
    if (!pointer) continue;
    if (pointer.target === null) return geo.nullX + NULL_W / 2;
    const index = nodes.findIndex((node) => node.id === pointer.target);
    if (index >= 0) return center(index);
  }
  const active = nodes.findIndex((node) => step.highlights[node.id] === 'aktif');
  if (active >= 0) return center(active);
  const removed = nodes.findIndex((node) => node.terlepas);
  return removed >= 0 ? center(removed) : null;
}

function Field({ empty, side, width, y }: { empty: boolean; side: 'left' | 'right'; width: number; y: number }) {
  return (
    <span className={cn('relative shrink-0 border-fd-border', side === 'left' ? 'border-r' : 'border-l')} style={{ width }}>
      {empty ? (
        <span className="absolute inset-x-0 text-center text-[10px] leading-none text-fd-muted-foreground" style={{ top: y - BORDER - 5 }}>
          ∅
        </span>
      ) : (
        <span
          className="absolute size-[5px] rounded-full bg-fd-foreground/70"
          style={{ left: (width - 5) / 2 - (side === 'left' ? 0.5 : 0), top: y - BORDER - 2.5 }}
        />
      )}
    </span>
  );
}

/**
 * Nodes as boxes (`data | next`, or `prev | data | next` for doubly), `next`
 * as solid arrows and `prev` as dashed ones, links of a circular list looping
 * around, pointer names above the nodes they point to, and a removed node
 * dropping out of the row before it disappears.
 */
export function LinkedListView({ step, width }: { step: LinkedListStep; width?: number }) {
  const { state } = step;
  const geo = geometry(state);
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const pathTransition = reduce ? { duration: 0 } : spring;
  const drawWidth = Math.max(width ?? 0, geo.width);
  const scroller = useRef<HTMLDivElement>(null);
  const focus = focusX(step, geo);

  // A long list scrolls inside its box: keep the node this step is about in view.
  useEffect(() => {
    const container = scroller.current;
    if (!container || focus === null || container.scrollWidth <= container.clientWidth) return;
    container.scrollTo({ left: Math.max(0, focus - container.clientWidth / 2), behavior: reduce ? 'auto' : 'smooth' });
  }, [focus, reduce]);

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <div ref={scroller} className="overflow-x-auto">
        <div className="relative mx-auto" style={{ width: drawWidth, height: geo.height }} role="img" aria-label={describe(state)}>
          <AnimatePresence initial={false}>
            {state.nodes.map((node, index) => {
              const x = geo.x(index);
              const y = geo.y(node);
              return (
                <motion.div
                  key={node.id}
                  initial={{ x, y: y - 16, opacity: 0, scale: 0.85 }}
                  animate={{ x, y, opacity: 1, scale: 1 }}
                  exit={{ y: y + 18, opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: 'easeIn' } }}
                  className="viz-cell absolute top-0 left-0 flex overflow-hidden rounded-md"
                  style={{ width: geo.W, height: H }}
                  data-role={step.highlights[node.id]}
                >
                  {geo.doubly ? <Field empty={node.prev === null} side="left" width={PREV_W} y={geo.prevY} /> : null}
                  <span className="flex min-w-0 flex-1 items-center justify-center font-mono text-sm font-semibold tabular-nums">
                    {node.value}
                  </span>
                  <Field empty={node.next === null} side="right" width={NEXT_W} y={geo.nextY} />
                </motion.div>
              );
            })}

            {geo.hasNull ? (
              <motion.div
                key="null"
                initial={{ x: geo.nullX, y: geo.rowY + (H - NULL_H) / 2, opacity: 0 }}
                animate={{ x: geo.nullX, y: geo.rowY + (H - NULL_H) / 2, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-0 flex items-center justify-center rounded-md border border-dashed border-fd-muted-foreground/50 font-mono text-xs text-fd-muted-foreground"
                style={{ width: NULL_W, height: NULL_H }}
              >
                ∅
              </motion.div>
            ) : null}

            {labels(state, geo).map((label) => (
              <motion.div
                key={`label-${label.name}`}
                initial={{ x: label.x, y: label.y - 8, opacity: 0 }}
                animate={{ x: label.x, y: label.y, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className={cn(
                  'absolute top-0 left-0 flex flex-col items-center font-mono text-[11px] leading-4 font-semibold',
                  pointerColor[label.name] ?? 'text-fd-muted-foreground',
                )}
                style={{ width: label.width, height: LABEL_H }}
              >
                <span className="whitespace-nowrap">{label.name}</span>
                <svg width="8" height="11" viewBox="0 0 8 11" aria-hidden="true" className="mt-px">
                  <path d="M4 0 V9 M1 6.5 L4 10 L7 6.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            ))}
          </AnimatePresence>

          <svg
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={drawWidth}
            height={geo.height}
            aria-hidden="true"
          >
            <defs>
              {(Object.keys(arrowStroke) as ArrowColor[]).map((color) => (
                <marker
                  key={color}
                  id={`${uid}-${color}`}
                  viewBox="0 0 8 8"
                  refX="7.5"
                  refY="4"
                  markerWidth="7"
                  markerHeight="7"
                  markerUnits="userSpaceOnUse"
                  orient="auto"
                >
                  <path d="M0 0.5 L8 4 L0 7.5 z" style={{ fill: arrowStroke[color] }} />
                </marker>
              ))}
            </defs>
            <AnimatePresence initial={false}>
              {arrows(step, geo).map((arrow) => (
                <motion.path
                  key={arrow.key}
                  initial={{ d: arrow.d, opacity: 0, ...(arrow.dashed || reduce ? {} : { pathLength: 0 }) }}
                  animate={{ d: arrow.d, opacity: 1, ...(arrow.dashed || reduce ? {} : { pathLength: 1 }) }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={pathTransition}
                  fill="none"
                  strokeWidth={arrow.color === 'aktif' ? 2 : 1.6}
                  strokeLinecap="round"
                  strokeDasharray={arrow.dashed ? '4 3' : undefined}
                  markerEnd={`url(#${uid}-${arrow.color})`}
                  data-warna={arrow.color}
                  className="stroke-[var(--color-fd-muted-foreground)] transition-[stroke] duration-250 data-[warna=aktif]:stroke-[var(--viz-aktif)] data-[warna=dibuang]:stroke-[var(--viz-dibuang)]"
                />
              ))}
            </AnimatePresence>
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fd-muted-foreground">
        {state.variables.map((variable) => (
          <span key={variable.name} className="flex items-center gap-1.5">
            {variable.name}
            <motion.span
              key={variable.value}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="viz-cell rounded-md px-1.5 py-0.5 font-mono text-fd-foreground"
            >
              {variable.name === 'dicetak' ? `"${variable.value}"` : variable.value}
            </motion.span>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-2">
          Hasil
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={step.result ?? ''}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              className={cn(
                'viz-cell inline-flex min-h-8 items-center rounded-md px-2.5 font-mono text-sm',
                !step.result && 'text-fd-muted-foreground',
              )}
              data-role={step.result ? 'khusus' : undefined}
            >
              {step.result ?? '—'}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </MotionConfig>
  );
}
