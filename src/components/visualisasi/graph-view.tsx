'use client';

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { NODE_RADIUS, edgeId, nodeId, type Graph, type GraphLayout, type Point } from '@/lib/visualisasi/graph';
import type { Role } from '@/lib/visualisasi/types';

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const;
const colorTransition = 'fill 250ms ease, stroke 250ms ease, stroke-width 250ms ease, opacity 250ms ease';
const R = NODE_RADIUS;

/** A small label that follows a node, e.g. `u` or `v`. It glides when it moves to another node. */
export interface NodeTag {
  node: number;
  text: string;
  role: Role;
}

interface GraphViewProps {
  graph: Graph;
  layout: GraphLayout;
  highlights: Record<string, Role>;
  tags?: NodeTag[];
  /** Small badge at a node's lower right, e.g. ✓ or a distance. */
  badges?: Record<number, string>;
  /** Edge being walked; drawn as an arrow from `from` to `to`. */
  move?: { from: number; to: number } | null;
  /** Node reached in this step; a ripple spreads from it. */
  ripple?: number | null;
  /** Node drawn slightly larger, usually `u`. */
  focus?: number | null;
  /** Changes every step so one-off animations replay. */
  stepIndex: number;
  label: string;
}

const strong = (role: Role) => `var(--viz-${role})`;
const soft = (role: Role) => `color-mix(in oklab, var(--viz-${role}) var(--viz-soft), var(--color-fd-background))`;

function edgeStyle(role: Role | undefined) {
  switch (role) {
    case 'aktif':
      return { stroke: strong('aktif'), strokeWidth: 3, opacity: 0.4 };
    case 'khusus':
      return { stroke: strong('khusus'), strokeWidth: 4, opacity: 1 };
    case 'selesai':
      return { stroke: strong('selesai'), strokeWidth: 3.5, opacity: 0.9 };
    case 'dibuang':
      return { stroke: strong('dibuang'), strokeWidth: 2, opacity: 0.6, strokeDasharray: '5 5' };
    default:
      return { stroke: 'var(--color-fd-muted-foreground)', strokeWidth: 2, opacity: 0.4 };
  }
}

function nodeStyle(role: Role | undefined) {
  if (!role)
    return { fill: 'var(--color-fd-background)', stroke: 'var(--color-fd-muted-foreground)', strokeWidth: 1.5, opacity: 1 };
  if (role === 'dibuang')
    return { fill: 'var(--color-fd-background)', stroke: strong('dibuang'), strokeWidth: 1.5, opacity: 0.55 };
  return { fill: soft(role), stroke: strong(role), strokeWidth: 2.5, opacity: 1 };
}

/** The segment between two node centres, trimmed so it starts and ends at the circles. */
function trimmed(a: Point, b: Point, startGap: number, endGap: number) {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const dx = (b.x - a.x) / length;
  const dy = (b.y - a.y) / length;
  return {
    x1: a.x + dx * startGap,
    y1: a.y + dy * startGap,
    x2: b.x - dx * endGap,
    y2: b.y - dy * endGap,
    dx,
    dy,
  };
}

/**
 * Draws an undirected graph as SVG that scales with its container. Colors
 * come from `highlights` (ids `v1`, `e1-2`), the edge being walked gets an
 * animated arrow, and tags such as `u`/`v` glide between nodes. Positions
 * never change between steps, so the reader's eye can stay put.
 */
export function GraphView({
  graph,
  layout,
  highlights,
  tags = [],
  badges = {},
  move,
  ripple,
  focus,
  stepIndex,
  label,
}: GraphViewProps) {
  const reduce = useReducedMotion();
  const { positions, viewBox } = layout;
  const nodes = Array.from({ length: graph.n }, (_, i) => i + 1);
  // The shaft stops where the arrowhead begins; the tip touches the target circle.
  const arrow = move ? trimmed(positions[move.from], positions[move.to], R + 3, R + 2 + 8) : null;
  const head = arrow
    ? (() => {
        const tip = { x: arrow.x2 + arrow.dx * 8, y: arrow.y2 + arrow.dy * 8 };
        const side = { x: -arrow.dy * 5.5, y: arrow.dx * 5.5 };
        const base = { x: arrow.x2 - arrow.dx * 1, y: arrow.y2 - arrow.dy * 1 };
        return `${tip.x},${tip.y} ${base.x + side.x},${base.y + side.y} ${base.x - side.x},${base.y - side.y}`;
      })()
    : null;

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="mx-auto block h-auto w-full max-w-[26rem] select-none"
        role="img"
        aria-label={label}
      >
        <g>
          {graph.edges.map(([u, v]) => {
            const id = edgeId(u, v);
            const a = positions[u];
            const b = positions[v];
            return (
              <line
                key={id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeLinecap="round"
                style={{ ...edgeStyle(highlights[id]), transition: colorTransition }}
              />
            );
          })}
        </g>

        {arrow && head ? (
          <g key={`gerak-${stepIndex}`}>
            <motion.line
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.x2}
              y2={arrow.y2}
              strokeLinecap="round"
              style={{ stroke: strong('aktif'), strokeWidth: 3.5 }}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.polygon
              points={head}
              style={{ fill: strong('aktif') }}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.12 }}
            />
          </g>
        ) : null}

        {ripple != null && !reduce ? (
          <motion.circle
            key={`riak-${stepIndex}`}
            cx={positions[ripple].x}
            cy={positions[ripple].y}
            style={{ fill: 'none', stroke: strong('selesai'), strokeWidth: 2 }}
            initial={{ r: R, opacity: 0.7 }}
            animate={{ r: R + 18, opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.15 }}
          />
        ) : null}

        <g>
          {nodes.map((node) => {
            const role = highlights[nodeId(node)];
            const p = positions[node];
            const badge = badges[node];
            const style = nodeStyle(role);
            return (
              <g
                key={node}
                transform={`translate(${p.x} ${p.y})`}
                style={{ opacity: style.opacity, transition: colorTransition }}
              >
                <motion.g initial={false} animate={{ scale: focus === node ? 1.12 : 1 }}>
                  <circle
                    r={R}
                    style={{
                      fill: style.fill,
                      stroke: style.stroke,
                      strokeWidth: style.strokeWidth,
                      transition: colorTransition,
                    }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono"
                    style={{ fontSize: 15, fontWeight: 600, fill: 'var(--color-fd-foreground)' }}
                  >
                    {node}
                  </text>
                </motion.g>
                <AnimatePresence initial={false}>
                  {badge !== undefined ? (
                    <motion.g
                      key={`lencana-${badge}`}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.12 } }}
                    >
                      <circle
                        cx={R - 3}
                        cy={R - 3}
                        r={8.5}
                        style={{ fill: strong('selesai'), stroke: 'var(--color-fd-background)', strokeWidth: 1.5 }}
                      />
                      <text
                        x={R - 3}
                        y={R - 3}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-mono"
                        style={{ fontSize: 10.5, fontWeight: 700, fill: 'var(--color-fd-background)' }}
                      >
                        {badge}
                      </text>
                    </motion.g>
                  ) : null}
                </AnimatePresence>
              </g>
            );
          })}
        </g>

        <AnimatePresence initial={false}>
          {tags.map((tag) => {
            const p = positions[tag.node];
            const at = { x: p.x, y: p.y - R - 13 };
            return (
              <motion.g
                key={tag.text}
                initial={{ opacity: 0, x: at.x, y: at.y - 6 }}
                animate={{ opacity: 1, x: at.x, y: at.y }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <rect
                  x={-9}
                  y={-8.5}
                  width={18}
                  height={17}
                  rx={5}
                  style={{ fill: soft(tag.role), stroke: strong(tag.role), strokeWidth: 1.5, transition: colorTransition }}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-mono"
                  style={{ fontSize: 12, fontWeight: 700, fill: 'var(--color-fd-foreground)' }}
                >
                  {tag.text}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
    </MotionConfig>
  );
}
