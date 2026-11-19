'use client';

import { useId, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import type { Role } from '@/lib/visualisasi/types';

/** Small caption above a panel. */
export function PanelLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-1.5 text-xs font-medium text-fd-muted-foreground">
      {children}
      {hint ? <span className="font-normal opacity-80">{hint}</span> : null}
    </div>
  );
}

const chip = 'viz-cell inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-mono text-sm font-semibold';

/**
 * `adj[u]` with the loop's position: neighbours already looked at are faded,
 * the one being looked at is `aktif`. Shows which order DFS/BFS follow.
 */
export function AdjacencyStrip({
  adj,
  scan,
  fallback,
}: {
  adj: number[][];
  scan: { node: number; index: number } | null;
  fallback: number | null;
}) {
  const node = scan?.node ?? fallback;
  const position = scan?.index ?? -1;
  return (
    <div
      className="flex min-h-8 min-w-0 flex-wrap items-center gap-1.5"
      aria-label={node === null ? 'Adjacency list' : `Tetangga simpul ${node}`}
    >
      <span className="mr-0.5 font-mono text-xs text-fd-muted-foreground">{node === null ? 'adj[u]' : `adj[${node}]`}:</span>
      {node === null ? (
        <span className="text-xs text-fd-muted-foreground">—</span>
      ) : adj[node].length === 0 ? (
        <span className="text-xs text-fd-muted-foreground italic">kosong</span>
      ) : (
        adj[node].map((v, index) => (
          <span
            key={index}
            className={cn(chip, 'h-7 min-w-7 px-1.5 text-xs', index < position && 'opacity-45')}
            data-role={index === position ? 'aktif' : undefined}
            aria-current={index === position ? 'true' : undefined}
          >
            {v}
          </span>
        ))
      )}
    </div>
  );
}

export interface StripItem {
  id: string;
  text: string;
  /** Extra mark after the text, e.g. ↩ for a call that returns at once. */
  mark?: string;
}

interface ChipStripProps {
  items: StripItem[];
  highlights: Record<string, Role>;
  label: string;
  /** Which end carries the marker (`top` on a stack, `depan` on a queue). */
  markerAt: 'first' | 'last';
  markerText: string;
  /** Stack entries drop in from above and lift out; queue entries join at the back and leave at the front. */
  motionStyle: 'stack' | 'queue';
  emptyText?: string;
}

/** A horizontal stack or queue whose entries animate in and out, with a sliding end marker. */
export function ChipStrip({ items, highlights, label, markerAt, markerText, motionStyle, emptyText = 'kosong' }: ChipStripProps) {
  const groupId = useId();
  const markerIndex = markerAt === 'first' ? 0 : items.length - 1;
  const enter = motionStyle === 'stack' ? { opacity: 0, y: -18, scale: 0.9 } : { opacity: 0, x: 18, scale: 0.9 };
  const leave =
    motionStyle === 'stack'
      ? { opacity: 0, y: -18, scale: 0.9, transition: { duration: 0.22, ease: 'easeIn' as const } }
      : { opacity: 0, x: -18, scale: 0.9, transition: { duration: 0.22, ease: 'easeIn' as const } };

  return (
    <LayoutGroup id={groupId}>
      <ol
        className="relative flex min-h-[3.25rem] flex-wrap items-start gap-x-1.5 gap-y-1"
        aria-label={items.length ? `${label}: ${items.map((item) => item.text).join(', ')}` : `${label}: kosong`}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              layout
              initial={enter}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={leave}
              className="flex flex-col items-center"
            >
              <span className={chip} data-role={highlights[item.id]}>
                {item.text}
                {item.mark ? (
                  <span className="ml-1 font-sans text-xs font-normal text-fd-muted-foreground">{item.mark}</span>
                ) : null}
              </span>
              <span className="h-4 text-[0.6875rem] leading-4">
                {index === markerIndex ? (
                  <motion.span layoutId="penanda" className="viz-text-khusus inline-block font-semibold">
                    {markerText}
                  </motion.span>
                ) : null}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        {items.length === 0 ? (
          <li className="flex h-8 items-center text-xs text-fd-muted-foreground italic">{emptyText}</li>
        ) : null}
      </ol>
    </LayoutGroup>
  );
}

interface OrderStripProps {
  order: number[];
  /** Layer of each entry; when given, entries are grouped per layer (BFS). */
  groups?: number[];
  label: string;
  /** Role of an entry; `selesai` when not given. */
  roleOf?: (node: number) => Role | undefined;
}

/** Visit order. New entries pop in. */
export function OrderStrip({ order, groups, label, roleOf }: OrderStripProps) {
  if (order.length === 0) {
    return <p className="flex h-8 items-center text-xs text-fd-muted-foreground italic">belum ada</p>;
  }
  const chipFor = (node: number) => (
    <motion.li
      key={node}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      className={chip}
      data-role={roleOf?.(node) ?? 'selesai'}
    >
      {node}
    </motion.li>
  );

  if (!groups) {
    return (
      <ol className="flex flex-wrap gap-1.5" aria-label={`${label}: ${order.join(' ')}`}>
        <AnimatePresence initial={false}>{order.map(chipFor)}</AnimatePresence>
      </ol>
    );
  }

  const layers: { layer: number; nodes: number[] }[] = [];
  order.forEach((node, index) => {
    const layer = groups[index];
    const last = layers.at(-1);
    if (last && last.layer === layer) last.nodes.push(node);
    else layers.push({ layer, nodes: [node] });
  });
  return (
    <ol className="flex flex-wrap gap-x-3 gap-y-2" aria-label={`${label}: ${order.join(' ')}`}>
      <AnimatePresence initial={false}>
        {layers.map(({ layer, nodes }) => (
          <motion.li
            key={layer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-0.5"
          >
            <span className="text-[0.6875rem] text-fd-muted-foreground">lapis {layer}</span>
            <ol className="flex gap-1">
              <AnimatePresence initial={false}>{nodes.map(chipFor)}</AnimatePresence>
            </ol>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}

/** Value produced by the step, e.g. `cetak 4` or `dist[3] = 2`. */
export function ResultPill({ result, stepKey }: { result?: string; stepKey: number }) {
  return (
    <div className="flex min-h-8 items-center gap-2">
      <span className="text-xs text-fd-muted-foreground">Hasil</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={`${stepKey}-${result ?? ''}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
          className={cn(
            'viz-cell inline-flex min-h-8 items-center rounded-md px-2.5 font-mono text-xs',
            !result && 'text-fd-muted-foreground',
          )}
          data-role={result ? 'khusus' : undefined}
        >
          {result ?? '—'}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
