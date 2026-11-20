'use client';

import { useId, type CSSProperties } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { edgeId, type TreeFrame, type TreeLayout } from '@/lib/visualisasi/tree-layout';
import type { Role } from '@/lib/visualisasi/types';

/** One spring for nodes and edges, so lines stay attached while nodes move. */
export const treeSpring = { type: 'spring', stiffness: 360, damping: 34, mass: 0.9 } as const;

export interface TreeViewNode {
  /** Identity for animation. A node that keeps its id glides to its new place. */
  id: string;
  /** Layout position to draw it at; defaults to `id` (the heap draws elements at slot ids). */
  at?: string;
  label: string;
  role?: Role;
  /** Small number in the corner, e.g. the visit order. */
  badge?: string;
  /** Double ring, e.g. the end-of-word mark in a trie. */
  ring?: boolean;
}

export interface TreeViewMarker {
  id: string;
  /** Layout id the label sits above. */
  at: string;
  label: string;
  tone?: 'khusus' | 'biasa';
  /** `kiri` keeps the label clear of edge labels coming from above (trie letters). */
  side?: 'atas' | 'kiri';
}

/** An empty child that the algorithm just looked at, drawn as a short dashed stub. */
export interface TreeViewGhost {
  from: string;
  side: 'kiri' | 'kanan' | 'bawah';
  label: string;
}

interface TreeViewProps {
  layout: TreeLayout;
  /** Size that fits every step, so the drawing does not jump between steps. */
  frame: TreeFrame;
  nodes: TreeViewNode[];
  /** Screen reader description of the whole drawing. */
  label: string;
  edgeRoles?: Record<string, Role>;
  /** Text on edges, e.g. trie letters. Keyed by `edgeId(from, to)`. */
  edgeLabels?: Record<string, string>;
  markers?: TreeViewMarker[];
  ghost?: TreeViewGhost | null;
  /** Small fixed text under layout positions, e.g. array indexes of heap slots. */
  slotLabels?: Record<string, string>;
  variant?: 'biasa' | 'kecil';
  emptyText?: string;
}

const variants = {
  // Node size and row height shrink on phones through CSS variables.
  biasa: {
    className: '[--viz-node:34px] [--viz-row:56px] sm:[--viz-node:40px] sm:[--viz-row:64px]',
    unitMin: 42,
    unitMax: 76,
    padX: 32,
    padTop: 36,
    padBottom: 46,
    text: 'text-[0.8125rem] sm:text-sm',
  },
  kecil: {
    className: '[--viz-node:26px] [--viz-row:48px] sm:[--viz-node:30px] sm:[--viz-row:54px]',
    unitMin: 38,
    unitMax: 62,
    padX: 30,
    padTop: 34,
    padBottom: 44,
    text: 'text-xs',
  },
} as const;

const edgeColor = (role: Role | undefined) =>
  role ? `var(--viz-${role})` : 'color-mix(in oklab, var(--color-fd-muted-foreground) 45%, transparent)';

/**
 * Draws one step of any tree: HTML circles for nodes, SVG lines for edges.
 * Positions come from `layoutBinaryTree`/`layoutNaryTree` and are expressed
 * as percentages of a frame that fits every step, so the drawing scales with
 * the column, scrolls inside itself on very small screens, and needs no
 * measuring (the first step renders on the server).
 */
export function TreeView({
  layout,
  frame,
  nodes,
  label,
  edgeRoles = {},
  edgeLabels = {},
  markers = [],
  ghost = null,
  slotLabels = {},
  variant = 'biasa',
  emptyText = 'tree kosong',
}: TreeViewProps) {
  const size = variants[variant];
  const groupId = useId();
  const reduce = useReducedMotion();
  const lineTransition = reduce ? { duration: 0 } : treeSpring;

  const offset = (frame.width - layout.width) / 2;
  /** Percent position inside the inner box that spans all node centers. */
  const pos = (id: string) => {
    const point = layout.positions[id];
    if (!point) return { x: 50, y: 0 };
    return {
      x: frame.width === 0 ? 50 : ((point.x + offset) / frame.width) * 100,
      y: frame.depth === 0 ? 0 : (point.depth / frame.depth) * 100,
    };
  };

  const roleOf = new Map(nodes.map((node) => [node.at ?? node.id, node.role]));
  const edgeRole = (from: string, to: string) =>
    edgeRoles[edgeId(from, to)] ?? (roleOf.get(to) === 'dibuang' ? 'dibuang' : undefined);

  const outer: CSSProperties = {
    width: '100%',
    minWidth: frame.width * size.unitMin + 2 * size.padX,
    maxWidth: frame.width * size.unitMax + 2 * size.padX,
    height: `calc(${frame.depth} * var(--viz-row) + ${size.padTop + size.padBottom}px)`,
  };
  const inner: CSSProperties = {
    left: size.padX,
    right: size.padX,
    top: size.padTop,
    height: `calc(${frame.depth} * var(--viz-row))`,
  };
  const nodeBox: CSSProperties = {
    width: 'var(--viz-node)',
    height: 'var(--viz-node)',
    marginLeft: 'calc(var(--viz-node) / -2)',
    marginTop: 'calc(var(--viz-node) / -2)',
  };

  const markersAt = new Map<string, number>();

  return (
    <MotionConfig reducedMotion="user" transition={treeSpring}>
      <LayoutGroup id={groupId}>
        <div className={cn('overflow-x-auto overscroll-x-contain', size.className)}>
          <div className="relative mx-auto" style={outer} role="img" aria-label={label}>
            <div className="absolute" style={inner}>
              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <AnimatePresence initial={false}>
                  {layout.edges.map((edge) => {
                    const a = pos(edge.from);
                    const b = pos(edge.to);
                    const role = edgeRole(edge.from, edge.to);
                    const strong = role === 'aktif' || role === 'selesai' || role === 'khusus';
                    return (
                      <motion.line
                        key={edge.id}
                        initial={{ x1: a.x, y1: a.y, x2: a.x, y2: a.y, opacity: 0 }}
                        animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: role === 'dibuang' ? 0.45 : 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        transition={lineTransition}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeDasharray={role === 'dibuang' ? '4 4' : undefined}
                        style={{
                          stroke: edgeColor(role),
                          strokeWidth: strong ? 2.75 : 1.75,
                          transition: 'stroke 250ms ease, stroke-width 250ms ease',
                        }}
                      />
                    );
                  })}
                </AnimatePresence>
              </svg>

              {/* Fixed labels under positions (e.g. heap indexes); they stay while elements move. */}
              <AnimatePresence initial={false}>
                {Object.entries(slotLabels).map(([at, text]) => {
                  const p = pos(at);
                  return (
                    <motion.span
                      key={`slot-${at}`}
                      aria-hidden="true"
                      className="absolute -translate-x-1/2 font-mono text-[0.625rem] leading-none text-fd-muted-foreground"
                      style={{ marginTop: 'calc(var(--viz-node) / 2 + 3px)' }}
                      initial={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 0 }}
                      animate={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {text}
                    </motion.span>
                  );
                })}
              </AnimatePresence>

              {Object.entries(edgeLabels).map(([id, text]) => {
                const edge = layout.edges.find((item) => item.id === id);
                if (!edge) return null;
                const a = pos(edge.from);
                const b = pos(edge.to);
                const role = edgeRole(edge.from, edge.to);
                return (
                  <motion.span
                    key={`label-${id}`}
                    aria-hidden="true"
                    className="viz-cell absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded px-1 font-mono text-[0.6875rem] leading-4 font-semibold"
                    data-role={role === 'dibuang' ? undefined : role}
                    initial={{ left: `${a.x}%`, top: `${a.y}%`, opacity: 0 }}
                    animate={{ left: `${(a.x + b.x) / 2}%`, top: `${(a.y + b.y) / 2}%`, opacity: 1 }}
                  >
                    {text}
                  </motion.span>
                );
              })}

              <AnimatePresence initial={false}>
                {ghost && layout.positions[ghost.from] ? (
                  <Ghost key={`ghost-${ghost.from}-${ghost.side}`} ghost={ghost} at={pos(ghost.from)} compact={variant === 'kecil'} />
                ) : null}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {nodes.map((node) => {
                  const p = pos(node.at ?? node.id);
                  return (
                    <motion.div
                      key={node.id}
                      aria-hidden="true"
                      className="absolute z-10"
                      style={nodeBox}
                      initial={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 0, scale: 0.4 }}
                      animate={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.22, ease: 'easeIn' } }}
                    >
                      <div
                        className={cn(
                          'viz-cell relative grid size-full place-items-center overflow-visible rounded-full font-mono font-semibold tabular-nums',
                          size.text,
                        )}
                        data-role={node.role}
                        style={
                          node.ring
                            ? {
                                outline: '2px solid color-mix(in oklab, var(--color-fd-foreground) 55%, transparent)',
                                outlineOffset: 2,
                              }
                            : undefined
                        }
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={node.label}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            {node.label}
                          </motion.span>
                        </AnimatePresence>
                        <AnimatePresence initial={false}>
                          {node.badge ? (
                            <motion.span
                              key="badge"
                              initial={{ opacity: 0, scale: 0.3 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.3 }}
                              className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full font-sans text-[0.5625rem] leading-none font-bold text-fd-background"
                              style={{ background: 'var(--viz-selesai)' }}
                            >
                              {node.badge}
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {markers.map((marker) => {
                  if (!layout.positions[marker.at]) return null;
                  const p = pos(marker.at);
                  const left = marker.side === 'kiri';
                  const stack = left ? 0 : (markersAt.get(marker.at) ?? 0);
                  if (!left) markersAt.set(marker.at, stack + 1);
                  return (
                    <motion.span
                      key={`marker-${marker.id}`}
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute z-20 rounded bg-fd-card px-1 font-sans text-[0.6875rem] leading-4 font-semibold whitespace-nowrap',
                        left ? '-translate-x-full -translate-y-1/2' : '-translate-x-1/2',
                        marker.tone === 'biasa' ? 'text-fd-muted-foreground' : 'viz-text-khusus',
                      )}
                      style={
                        left
                          ? { marginLeft: 'calc(var(--viz-node) / -2 - 4px)' }
                          : { marginTop: `calc(var(--viz-node) / -2 - ${19 + stack * 16}px)` }
                      }
                      initial={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 0 }}
                      animate={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      {marker.label}
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            </div>

            {nodes.length === 0 ? (
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-fd-muted-foreground italic">
                {emptyText}
              </span>
            ) : null}
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

/**
 * The stub is short enough to stay clear of other nodes: in a binary layout
 * the only node within half a unit is an ancestor, and in the compact (trie)
 * layout the stub goes sideways so it misses the child straight below.
 */
function Ghost({ ghost, at, compact }: { ghost: TreeViewGhost; at: { x: number; y: number }; compact: boolean }) {
  const side = ghost.side === 'kiri' ? -1 : ghost.side === 'kanan' ? 1 : 0;
  const dx = side * (compact ? 30 : 16);
  const dy = compact && side !== 0 ? 16 : 30;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute z-0"
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <svg className="absolute overflow-visible" width="1" height="1">
        <line
          x1={0}
          y1={0}
          x2={dx}
          y2={dy}
          strokeDasharray="3 3"
          strokeWidth={1.75}
          style={{ stroke: 'var(--viz-aktif)' }}
        />
      </svg>
      <span
        className="absolute -translate-x-1/2 rounded-full border border-dashed bg-fd-card px-1.5 font-mono text-[0.6875rem] leading-4 whitespace-nowrap text-fd-muted-foreground"
        style={{ left: dx, top: dy, borderColor: 'var(--viz-aktif)' }}
      >
        {ghost.label}
      </span>
    </motion.div>
  );
}

/** Text description of a binary tree for screen readers, e.g. "12: kiri 7, kanan 30". */
export function describeBinaryTree(
  root: string | null,
  get: (id: string) => { value: number | string; left: string | null; right: string | null },
): string {
  if (root === null) return 'Tree kosong.';
  const parts: string[] = [];
  const walk = (id: string) => {
    const node = get(id);
    const kids = [
      node.left !== null ? `kiri ${get(node.left).value}` : null,
      node.right !== null ? `kanan ${get(node.right).value}` : null,
    ].filter(Boolean);
    if (kids.length > 0) parts.push(`${node.value}: ${kids.join(', ')}`);
    if (node.left !== null) walk(node.left);
    if (node.right !== null) walk(node.right);
  };
  walk(root);
  return `Tree dengan root ${get(root).value}.${parts.length > 0 ? ` ${parts.join('. ')}.` : ''}`;
}
