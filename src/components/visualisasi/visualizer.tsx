'use client';

import { Fragment, useEffect, useReducer, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ListOrdered, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SPEEDS, initialPlayerState, playerReducer, stepDelay, type Speed } from '@/lib/visualisasi/player';
import type { PseudocodeLine, Role, Step } from '@/lib/visualisasi/types';

export interface LegendItem {
  role: Role;
  label: string;
}

interface VisualizerProps<State> {
  title: string;
  steps: Step<State>[];
  pseudocode: PseudocodeLine[];
  legend: LegendItem[];
  /** Draws one step. Receives the clamped current step. */
  render: (step: Step<State>, index: number) => ReactNode;
  /** Optional strip above the drawing, e.g. the list of operations. */
  renderHeader?: (step: Step<State>, index: number) => ReactNode;
  /** Data editor shown in a collapsible section. */
  editor?: ReactNode;
  editorLabel?: string;
}

const speedKey = 'stacklore:visualisasi:kecepatan';
const speedLabel = (speed: Speed) => `${speed.toLocaleString('id-ID')}×`;

/** Shows text between backticks as inline code. */
export function Caption({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code key={index} className="rounded bg-fd-muted px-1 py-0.5 font-mono text-[0.8125em]">
            {part}
          </code>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Pseudocode({ lines, active, error }: { lines: PseudocodeLine[]; active: string[]; error: boolean }) {
  return (
    <ol className="py-1.5 font-mono text-[0.8125rem] leading-6" aria-label="Pseudocode">
      {lines.map((line) => {
        const isActive = active.includes(line.id);
        return (
          <li
            key={line.id}
            className="viz-line px-3 text-fd-muted-foreground transition-colors"
            style={{ paddingLeft: `${0.75 + line.indent}rem` }}
            data-active={isActive}
            data-error={error}
            aria-current={isActive ? 'step' : undefined}
          >
            {line.text}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Shared player for every step-by-step visualization: controls, speed,
 * keyboard shortcuts, caption, pseudocode, legend and a text version of all
 * steps. It knows nothing about the data structure; `render` draws a step.
 */
export function Visualizer<State>({
  title,
  steps,
  pseudocode,
  legend,
  render,
  renderHeader,
  editor,
  editorLabel = 'Ubah data',
}: VisualizerProps<State>) {
  const [player, dispatch] = useReducer(playerReducer, steps.length, (total) => initialPlayerState(total));

  // New data → back to the first step, in the same render so the old step
  // number never flashes with the new data.
  const [loadedSteps, setLoadedSteps] = useState(steps);
  if (loadedSteps !== steps) {
    setLoadedSteps(steps);
    dispatch({ type: 'load', total: steps.length });
  }

  // Remember the speed across visualizations and visits.
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(speedKey));
      if (saved) dispatch({ type: 'speed', speed: saved });
    } catch {
      // Storage unavailable: keep 1×.
    }
  }, []);

  useEffect(() => {
    if (!player.playing) return;
    const timer = setTimeout(() => dispatch({ type: 'tick' }), stepDelay(player.speed));
    return () => clearTimeout(timer);
  }, [player.playing, player.index, player.speed]);

  const changeSpeed = (speed: Speed) => {
    dispatch({ type: 'speed', speed });
    try {
      window.localStorage.setItem(speedKey, String(speed));
    } catch {
      // Not remembered, still applied.
    }
  };

  const index = Math.min(player.index, steps.length - 1);
  const step = steps[index];
  const last = steps.length - 1;
  const isError = step.status === 'error';

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
    switch (event.key) {
      case 'ArrowRight':
        dispatch({ type: 'next' });
        break;
      case 'ArrowLeft':
        dispatch({ type: 'prev' });
        break;
      case 'Home':
        dispatch({ type: 'reset' });
        break;
      case ' ':
        // Space on a button or summary already activates it.
        if (target.closest('button, summary')) return;
        dispatch({ type: 'toggle' });
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const controlButton =
    'inline-flex size-10 items-center justify-center rounded-lg border bg-fd-background text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

  return (
    <div
      role="group"
      aria-roledescription="visualisasi"
      aria-label={title}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="visualizer not-prose my-6 overflow-hidden rounded-xl border bg-fd-card text-sm focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5">
        <span className="font-medium text-fd-foreground">{title}</span>
        <ul className="ml-auto flex flex-wrap gap-x-3 gap-y-1 text-xs text-fd-muted-foreground" aria-label="Keterangan warna">
          {legend.map((item) => (
            <li key={item.role} className="flex items-center gap-1.5">
              <span className="viz-swatch size-2.5 rounded-sm" data-role={item.role} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_17.5rem]">
        <div className="min-w-0 px-4 py-4">
          {renderHeader ? <div className="mb-4">{renderHeader(step, index)}</div> : null}
          {render(step, index)}
        </div>
        <aside className="hidden border-l bg-fd-background/50 md:block" aria-label="Pseudocode">
          <div className="border-b px-3 py-2 text-xs font-medium text-fd-muted-foreground">Pseudocode</div>
          <Pseudocode lines={pseudocode} active={step.lines} error={isError} />
        </aside>
      </div>

      <div
        className={cn(
          'border-t px-4 py-3 leading-6',
          isError ? 'bg-rose-500/8 text-fd-foreground' : 'bg-fd-background/50 text-fd-foreground',
        )}
      >
        <div className="mb-0.5 text-xs font-medium text-fd-muted-foreground">
          Langkah {index + 1} dari {steps.length}
        </div>
        <p aria-live="polite" aria-atomic="true">
          {isError ? <strong className="viz-text-error font-semibold">✗ </strong> : null}
          <Caption text={step.caption} />
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
        <button type="button" className={controlButton} onClick={() => dispatch({ type: 'reset' })} disabled={index === 0 && !player.playing} aria-label="Reset ke langkah pertama" title="Reset (Home)">
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className={controlButton} onClick={() => dispatch({ type: 'prev' })} disabled={index === 0} aria-label="Langkah sebelumnya" title="Sebelumnya (←)">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'toggle' })}
          disabled={last === 0}
          aria-label={player.playing ? 'Jeda' : 'Putar otomatis'}
          title={player.playing ? 'Jeda (Spasi)' : 'Putar (Spasi)'}
          className="inline-flex h-10 min-w-24 items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-4 font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        >
          {player.playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          {player.playing ? 'Jeda' : index === last && last > 0 ? 'Ulangi' : 'Putar'}
        </button>
        <button type="button" className={controlButton} onClick={() => dispatch({ type: 'next' })} disabled={index === last} aria-label="Langkah berikutnya" title="Berikutnya (→)">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>

        <div className="flex w-full items-center gap-3 sm:w-auto sm:flex-1">
          <input
            type="range"
            min={0}
            max={last}
            value={index}
            onChange={(event) => dispatch({ type: 'jump', index: Number(event.target.value) })}
            aria-label="Pilih langkah"
            className="h-10 min-w-0 flex-1 rounded-full accent-[var(--color-fd-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-fd-ring)]"
          />

          <div role="radiogroup" aria-label="Kecepatan" className="flex shrink-0 rounded-lg border bg-fd-background p-0.5">
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                role="radio"
                aria-checked={player.speed === speed}
                onClick={() => changeSpeed(speed)}
                className={cn(
                  'h-9 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none',
                  player.speed === speed ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {speedLabel(speed)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <details className="group border-t md:hidden">
        <summary className="cursor-pointer px-4 py-2.5 text-xs font-medium text-fd-muted-foreground">Pseudocode</summary>
        <Pseudocode lines={pseudocode} active={step.lines} error={isError} />
      </details>

      {editor ? (
        <details className="border-t">
          <summary className="cursor-pointer px-4 py-2.5 text-xs font-medium text-fd-primary">{editorLabel}</summary>
          <div className="px-4 pb-4">{editor}</div>
        </details>
      ) : null}

      <details className="border-t">
        <summary className="flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-fd-muted-foreground">
          <ListOrdered className="size-3.5" aria-hidden="true" />
          Lihat semua langkah (teks)
        </summary>
        <ol className="list-decimal space-y-1.5 px-4 pb-4 pl-9 leading-6 text-fd-muted-foreground">
          {steps.map((item, itemIndex) => (
            <li key={itemIndex} className={itemIndex === index ? 'text-fd-foreground' : undefined}>
              <Caption text={item.caption} />
              {item.result ? <span className="ml-1 font-mono text-xs">[{item.result}]</span> : null}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
