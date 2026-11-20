'use client';

import { useState, type ReactNode } from 'react';
import { Check, RotateCcw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { GRAPH_LIMITS, formatEdges, parseGraph, randomGraph, validateNode, type Graph } from '@/lib/visualisasi/graph';

/** Everything the reader can change: the graph, the start node and (BFS route) the target. */
export interface GraphSetup {
  graph: Graph;
  start: number;
  target: number | null;
}

interface GraphProps {
  simpul?: number | string;
  sisi?: string;
  mulai?: number | string;
  tujuan?: number | string;
}

/**
 * Turns MDX props into a setup. Missing props fall back to the lesson's graph
 * and start node 1. A typo in MDX is reported to the author in development
 * and replaced by the lesson's data instead of breaking the page.
 */
export function resolveGraphSetup(props: GraphProps, lesson: Graph, component: string, withTarget: boolean): GraphSetup {
  const report = (message: string) => {
    if (process.env.NODE_ENV !== 'production') console.error(`<${component}>: ${message}`);
  };

  let graph = lesson;
  if (props.simpul !== undefined || props.sisi !== undefined) {
    const parsed = parseGraph(Number(props.simpul ?? lesson.n), props.sisi ?? formatEdges(lesson.edges));
    if ('error' in parsed) report(parsed.error);
    else graph = parsed.graph;
  }

  let start = 1;
  if (props.mulai !== undefined) {
    const error = validateNode(graph, Number(props.mulai), 'Simpul awal (mulai)');
    if (error) report(error);
    else start = Number(props.mulai);
  }

  let target: number | null = null;
  if (withTarget) {
    target = graph.n;
    if (props.tujuan !== undefined) {
      const error = validateNode(graph, Number(props.tujuan), 'Simpul tujuan');
      if (error) report(error);
      else target = Number(props.tujuan);
    }
  }
  return { graph, start, target };
}

interface GraphEditorProps {
  value: GraphSetup;
  defaults: GraphSetup;
  /** Shows the target field (BFS with a route). */
  withTarget?: boolean;
  onChange: (setup: GraphSetup) => void;
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const field =
  'h-10 rounded-lg border bg-fd-background px-3 text-base text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:text-sm';
const button =
  'inline-flex h-10 items-center gap-1.5 rounded-lg border bg-fd-background px-3 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1 text-xs font-medium text-fd-muted-foreground', className)}>
      {label}
      {children}
    </label>
  );
}

/**
 * Editor for `n`, the edge list, the start node and optionally the target.
 * The edge list is applied with Enter or "Terapkan"; the selects apply at
 * once. Invalid input is rejected with an Indonesian message.
 */
export function GraphEditor({ value, defaults, withTarget = false, onChange }: GraphEditorProps) {
  const [n, setN] = useState(value.graph.n);
  const [edgesText, setEdgesText] = useState(formatEdges(value.graph.edges));
  const [start, setStart] = useState(value.start);
  const [target, setTarget] = useState(value.target ?? value.graph.n);
  const [message, setMessage] = useState<string | null>(null);

  const load = (setup: GraphSetup) => {
    setN(setup.graph.n);
    setEdgesText(formatEdges(setup.graph.edges));
    setStart(setup.start);
    setTarget(setup.target ?? setup.graph.n);
    setMessage(null);
    onChange(setup);
  };

  const apply = (draft: { n: number; edgesText: string; start: number; target: number }) => {
    const parsed = parseGraph(draft.n, draft.edgesText);
    const error =
      'error' in parsed
        ? parsed.error
        : (validateNode(parsed.graph, draft.start, 'Simpul awal') ??
          (withTarget ? validateNode(parsed.graph, draft.target, 'Simpul tujuan') : null));
    if (error || 'error' in parsed) {
      setMessage(error);
      return;
    }
    setMessage(null);
    onChange({ graph: parsed.graph, start: draft.start, target: withTarget ? draft.target : null });
  };

  const draft = { n, edgesText, start, target };
  const edgeCount = (() => {
    const parsed = parseGraph(n, edgesText);
    return 'error' in parsed ? null : parsed.graph.edges.length;
  })();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        apply(draft);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
        <Field label="Banyak simpul (n)">
          <select
            value={n}
            onChange={(event) => {
              const next = Number(event.target.value);
              const nextDraft = { ...draft, n: next, start: Math.min(start, next), target: Math.min(target, next) };
              setN(next);
              setStart(nextDraft.start);
              setTarget(nextDraft.target);
              apply(nextDraft);
            }}
            className={cn(field, 'w-24')}
          >
            {range(GRAPH_LIMITS.minNodes, GRAPH_LIMITS.maxNodes).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Sisi (maksimal ${GRAPH_LIMITS.maxEdges})`}>
          <input
            type="text"
            value={edgesText}
            onChange={(event) => setEdgesText(event.target.value)}
            placeholder="1-2 1-3 2-4"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className={cn(field, 'w-full font-mono')}
            aria-invalid={message !== null}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Mulai dari">
          <select
            value={start}
            onChange={(event) => {
              const next = Number(event.target.value);
              setStart(next);
              apply({ ...draft, start: next });
            }}
            className={cn(field, 'w-24')}
          >
            {range(1, n).map((node) => (
              <option key={node} value={node}>
                {node}
              </option>
            ))}
          </select>
        </Field>
        {withTarget ? (
          <Field label="Rute ke">
            <select
              value={target}
              onChange={(event) => {
                const next = Number(event.target.value);
                setTarget(next);
                apply({ ...draft, target: next });
              }}
              className={cn(field, 'w-24')}
            >
              {range(1, n).map((node) => (
                <option key={node} value={node}>
                  {node}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <button
          type="submit"
          className={cn(button, 'border-transparent bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90')}
        >
          <Check className="size-4" aria-hidden="true" />
          Terapkan
        </button>
      </div>

      <p className={cn('text-xs', message ? 'viz-text-error' : 'text-fd-muted-foreground')} aria-live="polite">
        {message ??
          `${n} simpul${edgeCount === null ? '' : `, ${edgeCount} sisi`}. Tulis sisi seperti 1-2 2-3, dipisah spasi. Urutan sisi menentukan urutan tetangga. Tekan Enter atau Terapkan.`}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => load(defaults)} className={button}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Kembalikan contoh materi
        </button>
        <button
          type="button"
          onClick={() => {
            const graph = randomGraph(n);
            load({ graph, start: 1, target: withTarget ? graph.n : null });
          }}
          className={button}
        >
          <Shuffle className="size-4" aria-hidden="true" />
          Acak
        </button>
      </div>
    </form>
  );
}
