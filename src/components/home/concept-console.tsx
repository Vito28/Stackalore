'use client';

import { useEffect, useState } from 'react';
import { Activity, Binary, Cpu, LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  documentationDomains,
  type DomainKey,
} from '@/components/home/domain-data';

const domainOrder = Object.keys(documentationDomains) as DomainKey[];

const domainMeta = {
  dsa: { signal: 'INDEX / ORDER', icon: Binary },
  ml: { signal: 'PATTERN / FIT', icon: Activity },
  dl: { signal: 'LAYER / SIGNAL', icon: Cpu },
  crypto: { signal: 'KEY / VERIFY', icon: LockKeyhole },
} as const;

export function ConceptConsole() {
  const [activeDomain, setActiveDomain] = useState<DomainKey>('dsa');

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const interval = window.setInterval(() => {
      setActiveDomain((current) => {
        const index = domainOrder.indexOf(current);
        return domainOrder[(index + 1) % domainOrder.length];
      });
    }, 6200);

    return () => window.clearInterval(interval);
  }, []);

  const domain = documentationDomains[activeDomain];
  const meta = domainMeta[activeDomain];
  const Icon = meta.icon;

  return (
    <div className="relative border border-cyan-400/30 bg-[#030a12]/88 shadow-[0_28px_100px_-55px_rgb(34_211_238/0.65)] backdrop-blur-xl">
      <span className="pointer-events-none absolute -top-px -left-px z-20 size-5 border-t-2 border-l-2 border-cyan-300" />
      <span className="pointer-events-none absolute -right-px -bottom-px z-20 size-5 border-r-2 border-b-2 border-cyan-300" />

      <div className="flex items-center justify-between border-b border-cyan-400/20 px-4 py-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] sm:px-5">
        <span className="inline-flex items-center gap-2 text-cyan-200">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-300 opacity-35 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-cyan-300" />
          </span>
          Concept monitor
        </span>
        <span className="text-slate-500">SYS.{domain.index}</span>
      </div>

      <div className="relative min-h-[25rem] overflow-hidden border-b border-cyan-400/20 bg-[linear-gradient(to_right,rgb(34_211_238/0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgb(34_211_238/0.055)_1px,transparent_1px)] bg-[size:32px_32px] p-5 sm:p-7">
        <div className="absolute inset-0 bg-[#030a12]/82" />
        <div className="relative flex items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="flex items-center gap-3">
            <span className={cn('grid size-9 place-items-center border border-current/25 bg-current/5', domain.accent)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-slate-500">Active module</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{domain.label}</p>
            </div>
          </div>
          <span className={cn('font-mono text-[0.625rem] font-bold tracking-[0.14em]', domain.accent)}>{meta.signal}</span>
        </div>

        <div className="relative h-64 py-5 sm:h-72">
          <DomainVisual domain={activeDomain} />
        </div>

        <div className="relative flex items-center justify-between gap-4 border-t border-slate-800/90 pt-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-slate-500">
          <span>{domain.topics[0]} → {domain.topics[1]}</span>
          <span className={domain.accent}>Signal stable</span>
        </div>
      </div>

      <div className="grid grid-cols-4 bg-slate-900/35">
        {domainOrder.map((key) => {
          const item = documentationDomains[key];
          const active = key === activeDomain;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveDomain(key)}
              className={cn(
                'relative min-w-0 border-r border-cyan-400/15 px-2 py-3 text-left last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300 sm:px-4',
                active ? 'bg-cyan-400/[0.055]' : 'hover:bg-white/[0.025]',
              )}
              aria-pressed={active}
            >
              <span className={cn('block font-mono text-[0.625rem] font-bold', active ? item.accent : 'text-slate-600')}>{item.index}</span>
              <span className={cn('mt-1 block truncate text-[0.625rem] font-medium sm:text-xs', active ? 'text-slate-100' : 'text-slate-500')}>{item.shortLabel}</span>
              {active && <span className={cn('absolute inset-x-0 bottom-0 h-px', item.indicator)} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DomainVisual({ domain }: { domain: DomainKey }) {
  if (domain === 'dsa') return <DataStructureVisual />;
  if (domain === 'ml') return <MachineLearningVisual />;
  if (domain === 'dl') return <DeepLearningVisual />;
  return <CryptographyVisual />;
}

function DataStructureVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-8" aria-label="Array sorting concept">
      <div className="flex items-end justify-center gap-2 sm:gap-3">
        {[17, 4, 23, 8, 12].map((value, index) => (
          <div key={value} className="text-center">
            <div
              className={cn(
                'grid size-10 place-items-center border font-mono text-xs sm:size-12 sm:text-sm',
                index === 1
                  ? 'border-amber-300/60 bg-amber-300/10 text-amber-200 shadow-[0_0_22px_-9px_rgb(251_191_36)]'
                  : index === 3
                    ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-200 shadow-[0_0_22px_-9px_rgb(34_211_238)]'
                    : 'border-slate-700 bg-slate-950/70 text-slate-400',
              )}
            >
              {value}
            </div>
            <span className="mt-2 block font-mono text-[0.55rem] text-slate-600">0{index}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-cyan-300">
        <span className="h-px flex-1 bg-cyan-400/25" />
        compare → reorder
        <span className="h-px flex-1 bg-cyan-400/25" />
      </div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {[4, 8, 12, 17, 23].map((value) => (
          <div key={value} className="grid size-10 place-items-center border border-emerald-300/35 bg-emerald-300/8 font-mono text-xs text-emerald-200 sm:size-12 sm:text-sm">{value}</div>
        ))}
      </div>
    </div>
  );
}

function MachineLearningVisual() {
  const left = [[68, 65], [108, 106], [85, 168], [155, 145], [175, 72]];
  const right = [[300, 54], [352, 95], [282, 139], [390, 160], [345, 190]];

  return (
    <svg viewBox="0 0 460 245" className="h-full w-full" role="img" aria-label="Classification boundary concept">
      <path d="M242 20 205 225" className="stroke-slate-700" strokeWidth="1" />
      <path d="M242 20 205 225" className="stroke-emerald-300" strokeWidth="2" />
      {left.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" className="fill-emerald-300" opacity=".82" />)}
      {right.map(([cx, cy]) => <rect key={`${cx}-${cy}`} x={cx - 5} y={cy - 5} width="10" height="10" className="fill-blue-300" opacity=".82" />)}
      <text x="54" y="225" className="fill-slate-500 font-mono text-[10px]">CLASS A</text>
      <text x="346" y="225" className="fill-slate-500 font-mono text-[10px]">CLASS B</text>
    </svg>
  );
}

function DeepLearningVisual() {
  const layers = [[55, 70, 140, 210], [200, 45, 100, 155, 215], [350, 80, 140, 200], [430, 140]];
  const points = layers.map((layer, column) => layer.map((y) => ({ x: [36, 165, 300, 410][column], y })));

  return (
    <svg viewBox="0 0 450 260" className="h-full w-full" role="img" aria-label="Neural network concept">
      {points.slice(0, -1).flatMap((layer, layerIndex) =>
        layer.flatMap((start) => points[layerIndex + 1].map((end) => (
          <line key={`${start.x}-${start.y}-${end.x}-${end.y}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="stroke-violet-300" strokeWidth=".8" opacity=".18" />
        ))),
      )}
      {points.flatMap((layer, layerIndex) => layer.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}`}
          cx={point.x}
          cy={point.y}
          r="8"
          className={layerIndex === 0 || index === 1 ? 'fill-violet-300 stroke-violet-200' : 'fill-slate-950 stroke-slate-600'}
          strokeWidth="1.5"
        />
      )))}
    </svg>
  );
}

function CryptographyVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center font-mono">
      <p className="text-[0.625rem] uppercase tracking-[0.22em] text-slate-500">Plaintext input</p>
      <p className="mt-4 text-xl font-bold tracking-[0.24em] text-slate-100 sm:text-2xl">STACKLORE</p>
      <div className="my-7 flex w-full items-center gap-3 text-[0.625rem] font-bold tracking-[0.14em] text-amber-300">
        <span className="h-px flex-1 bg-amber-300/25" />
        AES / 256
        <span className="h-px flex-1 bg-amber-300/25" />
      </div>
      <p className="text-center text-sm leading-7 tracking-[0.16em] text-amber-200 sm:text-base">
        8F A2 91 0D FF 32<br />4B C7 18 E1 63 A9
      </p>
    </div>
  );
}
