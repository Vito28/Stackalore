'use client';

import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

type Range = [start: number, end: number];

interface BufferStep {
  /** 0-based index of the code line being executed. */
  line: number;
  /** Everything typed so far, including spaces and '\n'. */
  buffer: string;
  /** How many characters `cin` has already taken from the buffer. */
  consumed: number;
  /** Characters taken in this step. */
  read?: Range;
  /** Whitespace skipped in this step. */
  skipped?: Range;
  /** Characters left behind that deserve attention. */
  leftover?: Range;
  vars: Record<string, string>;
  terminal: string;
  /** Program is blocked, waiting for the user to type. */
  waiting?: boolean;
  /** Explanation. Supports `code` and **bold**. */
  note: string;
}

interface BufferStepperProps {
  code: string;
  steps: BufferStep[];
}

function inRange(index: number, range?: Range) {
  return range !== undefined && index >= range[0] && index < range[1];
}

function renderNote(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

function displayChar(char: string) {
  if (char === ' ') return '␣';
  if (char === '\n') return '\\n';
  if (char === '\t') return '\\t';
  return char;
}

export function BufferStepper({ code, steps }: BufferStepperProps) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const previous = index > 0 ? steps[index - 1] : undefined;
  const lines = code.split('\n');
  const atEnd = index === steps.length - 1;

  return (
    <div className="buffer-stepper not-prose my-6 overflow-hidden rounded-xl border bg-fd-card">
      <div className="grid md:grid-cols-2">
        {/* Source code */}
        <div className="border-b md:border-r md:border-b-0">
          <p className="border-b px-4 py-2 text-xs font-medium text-fd-muted-foreground">Kode</p>
          <pre className="overflow-x-auto py-2 font-mono text-[0.8125rem] leading-6">
            {lines.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className={cn(
                  'flex border-l-2 pr-4 transition-colors duration-200',
                  lineIndex === step.line
                    ? 'border-fd-primary bg-fd-primary/10 text-fd-foreground'
                    : 'border-transparent text-fd-muted-foreground',
                )}
              >
                <span className="w-9 shrink-0 pr-3 text-right text-fd-muted-foreground/60 select-none">
                  {lineIndex + 1}
                </span>
                <code>{line || ' '}</code>
              </div>
            ))}
          </pre>
        </div>

        {/* Terminal */}
        <div className="flex flex-col">
          <p className="border-b px-4 py-2 text-xs font-medium text-fd-muted-foreground">Layar (terminal)</p>
          <pre className="m-3 min-h-28 flex-1 overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-[0.8125rem] leading-6 whitespace-pre-wrap text-zinc-100">
            {step.terminal}
            {step.waiting ? (
              <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-zinc-100" aria-label="menunggu input" />
            ) : null}
          </pre>
        </div>
      </div>

      {/* Buffer + variables */}
      <div className="space-y-4 border-t px-4 py-4">
        <div>
          <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Buffer input</p>
          {step.buffer.length === 0 ? (
            <div className="flex h-11 items-center rounded-lg border border-dashed px-3 text-sm text-fd-muted-foreground">
              (kosong)
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-1">
              {[...step.buffer].map((char, charIndex) => {
                const read = inRange(charIndex, step.read);
                const skipped = inRange(charIndex, step.skipped);
                const leftover = inRange(charIndex, step.leftover);
                const taken = charIndex < step.consumed && !read && !skipped;
                const isCursor = charIndex === step.consumed;

                return (
                  <div key={charIndex} className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        'grid h-10 min-w-9 place-items-center rounded-md border px-1.5 font-mono text-sm transition-all duration-300',
                        read && 'border-fd-primary bg-fd-primary/15 font-semibold text-fd-primary',
                        skipped && 'border-dashed text-fd-muted-foreground line-through',
                        leftover && 'border-amber-500 bg-amber-500/15 font-semibold text-amber-700 dark:text-amber-300',
                        taken && 'border-dashed text-fd-muted-foreground/50',
                        !read && !skipped && !leftover && !taken && 'bg-fd-background text-fd-foreground',
                        char === '\n' && 'text-xs',
                      )}
                    >
                      {displayChar(char)}
                    </span>
                    <span
                      className={cn(
                        'text-[0.625rem] leading-none text-fd-primary transition-opacity',
                        isCursor ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden={!isCursor}
                    >
                      ▲
                    </span>
                  </div>
                );
              })}
              {step.consumed >= step.buffer.length ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="grid h-10 w-3 place-items-center" />
                  <span className="text-[0.625rem] leading-none text-fd-primary">▲</span>
                </div>
              ) : null}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-fd-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-fd-primary bg-fd-primary/15" /> baru dibaca
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-dashed" /> sudah diambil / dilewati
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-amber-500 bg-amber-500/15" /> tertinggal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-fd-primary">▲</span> posisi baca berikutnya
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-fd-muted-foreground">Variabel</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(step.vars).map(([name, value]) => {
              const changed = previous !== undefined && previous.vars[name] !== value;
              return (
                <span
                  key={name}
                  className={cn(
                    'rounded-md border px-2.5 py-1 font-mono text-sm transition-colors duration-300',
                    changed ? 'border-emerald-500/50 bg-emerald-500/12 text-fd-foreground' : 'bg-fd-background',
                  )}
                >
                  <span className="text-fd-muted-foreground">{name} =</span>{' '}
                  <span className={cn('font-semibold', value === '?' && 'text-fd-muted-foreground')}>{value}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanation + controls */}
      <div className="border-t bg-fd-muted/40 px-4 py-3">
        <p className="min-h-12 text-sm leading-6 text-fd-foreground" aria-live="polite">
          <span className="mr-2 font-mono text-xs text-fd-muted-foreground">
            {index + 1}/{steps.length}
          </span>
          {renderNote(step.note)}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
            className="inline-flex h-8 items-center gap-1 rounded-lg border bg-fd-background px-2.5 text-sm text-fd-foreground transition-colors hover:bg-fd-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Sebelumnya
          </button>
          <div className="hidden items-center gap-1.5 sm:flex" aria-label="Pilih langkah">
            {steps.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                aria-current={dotIndex === index ? 'step' : undefined}
                aria-label={`Langkah ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  dotIndex === index ? 'w-5 bg-fd-primary' : 'w-1.5 bg-fd-foreground/20 hover:bg-fd-foreground/40',
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((value) => (atEnd ? 0 : value + 1))}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-fd-primary px-3 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            {atEnd ? (
              <>
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Ulangi
              </>
            ) : (
              <>
                Berikutnya
                <ChevronRight className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
