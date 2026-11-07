'use client';

import { Check, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, TechBadge } from '@/components/ui';
import { cn } from '@/lib/cn';

const values = [3, 8, 13, 21, 34, 55, 89, 144] as const;

const trace = [
  {
    low: 0,
    high: 7,
    midpoint: 3,
    line: 5,
    title: 'Inspect the middle value',
    detail: '21 is smaller than 89, so the target can only exist to its right.',
    state: 'low = midpoint + 1',
  },
  {
    low: 4,
    high: 7,
    midpoint: 5,
    line: 6,
    title: 'Discard another half',
    detail: '55 is still smaller than 89. Everything through index 5 is eliminated.',
    state: 'low = 6',
  },
  {
    low: 6,
    high: 7,
    midpoint: 6,
    line: 4,
    title: 'Target found',
    detail: 'The candidate equals the target, so the algorithm returns index 6.',
    state: 'return 6',
  },
] as const;

const code = [
  'while (low <= high) {',
  '  const midpoint = low + Math.floor((high - low) / 2);',
  '  const candidate = values[midpoint];',
  '',
  '  if (candidate === target) return midpoint;',
  '  if (candidate < target) low = midpoint + 1;',
  '  else high = midpoint - 1;',
  '}',
] as const;

export function TraceLab() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = trace[step];

  useEffect(() => {
    if (!playing) return;

    const timeout = window.setTimeout(() => {
      if (step === trace.length - 1) {
        setPlaying(false);
      } else {
        setStep((value) => value + 1);
      }
    }, 950);

    return () => window.clearTimeout(timeout);
  }, [playing, step]);

  function runTrace() {
    setStep(0);
    setPlaying(true);
  }

  return (
    <div className="border border-cyan-400/25 bg-[#030a12]/88 shadow-[0_30px_100px_-60px_rgb(34_211_238/0.7)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-cyan-400/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <TechBadge marker="//">Binary search / target 89</TechBadge>
          <p className="mt-2 text-sm text-slate-400">Trace boundary updates through one complete search.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0 || playing}
            aria-label="Previous trace step"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-14 text-center font-mono text-[0.625rem] font-bold tracking-[0.14em] text-slate-500">0{step + 1} / 03</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setStep((value) => Math.min(trace.length - 1, value + 1))}
            disabled={step === trace.length - 1 || playing}
            aria-label="Next trace step"
          >
            <ChevronRight />
          </Button>
          <Button size="sm" onClick={runTrace} disabled={playing}>
            {step === trace.length - 1 && !playing ? <RotateCcw /> : <Play />}
            {playing ? 'Tracing' : step === trace.length - 1 ? 'Replay' : 'Run trace'}
          </Button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="border-b border-cyan-400/20 p-5 sm:p-8 xl:border-r xl:border-b-0">
          <div className="flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.14em] text-slate-500">
            <span>Search space</span>
            <span className="text-amber-300">target = 89</span>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-px border border-slate-800 bg-slate-800 sm:grid-cols-8">
            {values.map((value, index) => {
              const outside = index < current.low || index > current.high;
              const midpoint = index === current.midpoint;
              const found = midpoint && value === 89;

              return (
                <div
                  key={value}
                  className={cn(
                    'relative grid min-h-24 place-items-center bg-[#050b13] font-mono text-sm transition-all duration-300',
                    outside && 'text-slate-700',
                    !outside && !midpoint && 'text-slate-300',
                    midpoint && !found && 'bg-amber-300/10 text-amber-200 shadow-[inset_0_0_24px_rgb(251_191_36/0.06)]',
                    found && 'bg-emerald-300/10 text-emerald-200 shadow-[inset_0_0_28px_rgb(110_231_183/0.08)]',
                  )}
                >
                  <span>{value}</span>
                  <span className="absolute bottom-2 text-[0.55rem] text-slate-600">0{index}</span>
                  {midpoint && <span className={cn('absolute inset-x-0 top-0 h-px', found ? 'bg-emerald-300' : 'bg-amber-300')} />}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 border-t border-slate-800 pt-6 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <p className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.16em] text-cyan-300">{current.title}</p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">{current.detail}</p>
            </div>
            <span className={cn('border px-3 py-2 font-mono text-xs', step === trace.length - 1 ? 'border-emerald-300/30 bg-emerald-300/8 text-emerald-200' : 'border-cyan-300/25 bg-cyan-300/5 text-cyan-200')}>
              {current.state}
            </span>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-px border border-slate-800 bg-slate-800 font-mono text-[0.625rem] uppercase tracking-[0.12em]">
            {[
              ['low', current.low],
              ['mid', current.midpoint],
              ['high', current.high],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#050b13] px-4 py-3">
                <dt className="text-slate-600">{label}</dt>
                <dd className="mt-1 text-cyan-200">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex min-h-[30rem] flex-col">
          <div className="flex h-12 items-center justify-between border-b border-cyan-400/15 px-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-slate-500">
            <span>binary-search.ts</span>
            <span>TypeScript</span>
          </div>
          <pre className="tech-code-scroll flex-1 overflow-x-auto py-5 font-mono text-[0.72rem] leading-7 sm:text-xs">
            <code>
              {code.map((line, index) => (
                <span
                  key={`${index}-${line}`}
                  className={cn(
                    'flex min-w-[34rem] border-l-2 border-transparent pr-5 transition-colors',
                    index === current.line && 'border-cyan-300 bg-cyan-300/[0.07]',
                  )}
                >
                  <span className="w-11 shrink-0 select-none pr-3 text-right text-slate-700">{index + 1}</span>
                  <span className={index === current.line ? 'text-emerald-200' : 'text-slate-400'}>{line || ' '}</span>
                </span>
              ))}
            </code>
          </pre>
          <div className="border-t border-cyan-400/15 px-4 py-4 font-mono text-[0.625rem] uppercase tracking-[0.12em]">
            {step === trace.length - 1 ? (
              <span className="inline-flex items-center gap-2 text-emerald-300"><Check className="size-3.5" /> Target found at index 6</span>
            ) : (
              <span className="text-slate-500">Output pending / trace in progress</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
