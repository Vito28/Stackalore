'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Database,
  Gauge,
  GitFork,
  Lightbulb,
  Network,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  SquareTerminal,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  bigPictureSteps,
  dependencyPaths,
  learningStages,
  type DependencyPathId,
  type LearningStage,
} from './data';

const stageIcons: ComponentType<{ className?: string }>[] = [
  SquareTerminal,
  Database,
  GitFork,
  Boxes,
  Gauge,
  Network,
  Search,
  Lightbulb,
  Sparkles,
];

export function LearningPathHero() {
  return (
    <div className="not-prose relative my-8 overflow-hidden rounded-2xl border border-domain-dsa/25 bg-fd-card px-5 py-7 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-domain-dsa)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-domain-dsa)_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.035] dark:opacity-[0.055]" />
      <div className="pointer-events-none absolute -top-20 right-12 size-48 rounded-full bg-domain-dsa/10 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.16em] text-domain-dsa uppercase">
          <span className="size-1.5 rounded-full bg-domain-dsa shadow-[0_0_12px_rgb(6_182_212/0.7)]" />
          Learning path · 00 → 09
        </div>
        <h2 className="max-w-2xl text-2xl leading-tight font-semibold tracking-[-0.03em] text-fd-foreground sm:text-3xl">
          From your first instruction to strong algorithmic thinking.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-fd-muted-foreground sm:text-base">
          Start from zero. Every stage explains what comes before it, why the new idea exists, and where you will use it next.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/docs/data-structures/welcome"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-domain-dsa px-4 text-xs font-semibold text-slate-950 transition-colors hover:bg-domain-dsa/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-domain-dsa"
          >
            Start from the beginning
            <ArrowRight className="size-3.5" />
          </Link>
          <a
            href="#your-roadmap"
            className="inline-flex h-9 items-center rounded-lg border border-domain-dsa/25 bg-fd-background/70 px-4 text-xs font-semibold text-fd-foreground transition-colors hover:bg-domain-dsa/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-domain-dsa"
          >
            Explore the roadmap
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-fd-border/75 pt-4 font-mono text-[10px] tracking-wide text-fd-muted-foreground uppercase">
          <span><strong className="text-fd-foreground">09</strong> connected stages</span>
          <span><strong className="text-fd-foreground">68</strong> guided lessons</span>
          <span><strong className="text-fd-foreground">03</strong> language examples</span>
        </div>
      </div>
    </div>
  );
}

export function BigPicture() {
  return (
    <div className="not-prose my-7 overflow-x-auto rounded-xl border border-fd-border bg-fd-card p-4 fd-scroll-container sm:p-5">
      <div className="flex min-w-[780px] items-stretch">
        {bigPictureSteps.map(([title, description], index) => (
          <div key={title} className="flex min-w-0 flex-1 items-center">
            <div className="group flex h-full min-w-0 flex-1 flex-col rounded-lg px-2.5 py-3 transition-colors hover:bg-domain-dsa/5">
              <span className="font-mono text-[9px] font-semibold text-domain-dsa">{String(index + 1).padStart(2, '0')}</span>
              <span className="mt-2 text-xs font-semibold text-fd-foreground">{title}</span>
              <span className="mt-1 text-[10px] leading-4 text-fd-muted-foreground">{description}</span>
            </div>
            {index < bigPictureSteps.length - 1 ? (
              <ChevronRight className="mx-0.5 size-3.5 shrink-0 text-domain-dsa/50" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LearningRoadmap() {
  const [activeId, setActiveId] = useState(learningStages[0].id);
  const [explored, setExplored] = useState(() => new Set([learningStages[0].id]));
  const activeIndex = learningStages.findIndex((stage) => stage.id === activeId);
  const activeStage = learningStages[activeIndex];

  function selectStage(stage: LearningStage) {
    setActiveId(stage.id);
    setExplored((current) => {
      const next = new Set(current);
      next.add(stage.id);
      return next;
    });
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card shadow-[0_24px_70px_-58px_rgb(6_182_212/0.45)]">
      <div className="flex flex-col gap-4 border-b border-fd-border bg-fd-background/35 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-base font-semibold tracking-tight text-fd-foreground">Your connected journey</p>
          <p className="mt-1.5 text-sm leading-6 text-fd-muted-foreground">Select a milestone to see how it connects with the next concept.</p>
        </div>
        <div className="flex min-w-40 items-center gap-3 text-xs text-fd-muted-foreground">
          <span className="whitespace-nowrap"><strong className="text-fd-foreground">{explored.size}</strong> / {learningStages.length} explored</span>
          <div className="h-1.5 min-w-20 flex-1 overflow-hidden rounded-full bg-fd-muted">
            <div
              className="h-full rounded-full bg-domain-dsa transition-[width] duration-300"
              style={{ width: `${(explored.size / learningStages.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(310px,0.95fr)_minmax(0,1.05fr)]">
        <div className="relative border-b border-fd-border p-5 lg:border-r lg:border-b-0">
          <span className="absolute top-10 bottom-10 left-[52px] w-px bg-gradient-to-b from-domain-dsa/50 via-fd-border to-fd-border" aria-hidden="true" />
          <div className="relative space-y-2">
            {learningStages.map((stage, index) => {
              const Icon = stageIcons[index];
              const active = stage.id === activeId;
              const wasExplored = explored.has(stage.id);

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => selectStage(stage)}
                  aria-pressed={active}
                  className={cn(
                    'group relative flex w-full items-center gap-3.5 rounded-xl border border-transparent px-3 py-3 text-left transition-colors',
                    active ? 'border-domain-dsa/30 bg-domain-dsa/8 shadow-sm' : 'hover:border-fd-border hover:bg-fd-accent/55',
                  )}
                >
                  <span
                    className={cn(
                      'relative z-1 flex size-10 shrink-0 items-center justify-center rounded-xl border bg-fd-background transition-colors',
                      active
                        ? 'border-domain-dsa/35 text-domain-dsa shadow-[0_0_18px_rgb(6_182_212/0.12)]'
                        : wasExplored
                          ? 'border-domain-dsa/20 text-domain-dsa/75'
                          : 'border-fd-border text-fd-muted-foreground',
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className={cn('mt-0.5 font-mono text-[10px] font-semibold', active ? 'text-domain-dsa' : 'text-fd-muted-foreground')}>
                        {stage.number}
                      </span>
                      <span className="text-sm leading-5 font-semibold text-fd-foreground">{stage.title}</span>
                    </span>
                    <span className="mt-1 block text-[11px] text-fd-muted-foreground">
                      {stage.lessons} lessons · {stage.level}
                    </span>
                  </span>
                  <ChevronRight className={cn('size-3.5 shrink-0 transition-transform', active ? 'translate-x-0.5 text-domain-dsa' : 'text-fd-muted-foreground/60')} />
                </button>
              );
            })}
          </div>
        </div>

        <RoadmapStageDetail stage={activeStage} index={activeIndex} />
      </div>
    </div>
  );
}

function RoadmapStageDetail({ stage, index }: { stage: LearningStage; index: number }) {
  const Icon = stageIcons[index];

  return (
    <div key={stage.id} className="animate-fd-fade-in p-6 sm:p-8">
      <div className="flex items-start gap-4 sm:gap-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-domain-dsa/30 bg-domain-dsa/10 text-domain-dsa">
          <Icon className="size-[22px]" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-domain-dsa uppercase">
            Stage {stage.number} · {stage.level}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-fd-foreground">{stage.title}</h3>
          <p className="mt-3 text-[0.9375rem] leading-7 text-fd-muted-foreground">{stage.description}</p>
        </div>
      </div>

      <div className="mt-7 border-l-2 border-domain-dsa/40 pl-4 sm:pl-5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-fd-muted-foreground uppercase">Why it comes next</p>
        <p className="mt-2 text-sm leading-7 text-fd-foreground/85">{stage.reason}</p>
      </div>

      <div className="mt-7">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-fd-muted-foreground uppercase">Topics unlocked</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.topics.map((topic) => (
            <span key={topic} className="rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-xs text-fd-foreground">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-7 rounded-xl border border-domain-dsa/15 bg-domain-dsa/5 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-domain-dsa uppercase">
          <Check className="size-4" />
          Stage outcome
        </p>
        <p className="mt-2.5 text-sm leading-6 text-fd-muted-foreground">{stage.outcome}</p>
      </div>

      <Link href={stage.href} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-domain-dsa hover:underline">
        Start this stage
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function DependencyExplorer() {
  const [selected, setSelected] = useState<DependencyPathId>('linked-list');
  const path = dependencyPaths[selected];

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
      <div className="border-b border-fd-border p-4 sm:p-5">
        <p className="text-sm font-semibold text-fd-foreground">Choose a destination</p>
        <p className="mt-1 text-xs text-fd-muted-foreground">Stacklore highlights the knowledge path that makes the topic possible.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 fd-scroll-container">
          {(Object.entries(dependencyPaths) as [DependencyPathId, (typeof dependencyPaths)[DependencyPathId]][]).map(([id, item]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              aria-pressed={selected === id}
              className={cn(
                'shrink-0 rounded-lg border px-3 py-2 text-[11px] font-medium transition-colors',
                selected === id
                  ? 'border-domain-dsa/35 bg-domain-dsa/10 text-domain-dsa'
                  : 'border-fd-border bg-fd-background text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div key={selected} className="animate-fd-fade-in p-4 sm:p-6">
        <div className="overflow-x-auto fd-scroll-container">
          <div className="flex min-w-max items-center py-3">
            {path.nodes.map((node, index) => {
              const finalNode = index === path.nodes.length - 1;
              return (
                <div key={node} className="flex items-center">
                  <div
                    className={cn(
                      'flex min-h-14 min-w-28 flex-col items-center justify-center rounded-xl border px-3 text-center transition-colors',
                      finalNode
                        ? 'border-domain-dsa/40 bg-domain-dsa/10 text-domain-dsa shadow-[0_0_24px_rgb(6_182_212/0.12)]'
                        : 'border-fd-border bg-fd-background text-fd-foreground',
                    )}
                  >
                    <span className="font-mono text-[9px] text-fd-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                    <span className="mt-1 text-[11px] font-semibold">{node}</span>
                  </div>
                  {index < path.nodes.length - 1 ? (
                    <div className="relative mx-1.5 h-px w-8 bg-domain-dsa/35">
                      <ChevronRight className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 text-domain-dsa/70" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-fd-border pt-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-xs leading-5 text-fd-muted-foreground">{path.description}</p>
          <Link href={path.href} className="inline-flex items-center gap-2 text-xs font-semibold text-domain-dsa hover:underline">
            Start topic <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DependencyNotes() {
  const notes = [
    ['Why pointers before linked lists?', 'A linked list connects nodes using memory references. Pointers turn that connection into something you can reason about.'],
    ['Why trees before DFS?', 'DFS becomes concrete after you understand nodes, children, branches, and traversal through a hierarchy.'],
    ['Why recursion before backtracking?', 'Backtracking explores choices through nested function calls, then returns to try a different path.'],
  ];

  return (
    <div className="not-prose my-7 divide-y divide-fd-border border-y border-fd-border">
      {notes.map(([title, description], index) => (
        <div key={title} className="grid gap-2 py-4 sm:grid-cols-[32px_220px_1fr] sm:items-start sm:gap-4">
          <span className="font-mono text-[10px] font-semibold text-domain-dsa">0{index + 1}</span>
          <p className="text-xs font-semibold text-fd-foreground">{title}</p>
          <p className="text-xs leading-5 text-fd-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );
}

export function DataStructureMap() {
  const groups = [
    { label: 'Linear', accent: 'text-brand-blue', border: 'border-brand-blue/25', items: ['Array', 'Linked List', 'Stack', 'Queue'] },
    { label: 'Hash-based', accent: 'text-domain-dsa', border: 'border-domain-dsa/25', items: ['Hash Table', 'Set', 'Map'] },
    { label: 'Non-linear', accent: 'text-brand-violet', border: 'border-brand-violet/25', items: ['Tree', 'Heap', 'Graph'] },
  ];

  return (
    <div className="not-prose my-8 rounded-2xl border border-fd-border bg-fd-card p-4 sm:p-6">
      <div className="flex items-center justify-center">
        <div className="rounded-lg border border-domain-dsa/30 bg-domain-dsa/10 px-4 py-2 text-xs font-semibold text-domain-dsa">
          Data Structures
        </div>
      </div>
      <div className="mx-auto h-7 w-px bg-fd-border" />
      <div className="relative grid gap-3 sm:grid-cols-3">
        <span className="absolute top-0 right-[16.5%] left-[16.5%] hidden h-px bg-fd-border sm:block" aria-hidden="true" />
        {groups.map((group) => (
          <div key={group.label} className="relative pt-3">
            <span className="absolute top-0 left-1/2 hidden h-3 w-px -translate-x-1/2 bg-fd-border sm:block" aria-hidden="true" />
            <div className={cn('h-full rounded-xl border bg-fd-background p-3.5', group.border)}>
              <p className={cn('font-mono text-[10px] font-semibold tracking-wider uppercase', group.accent)}>{group.label}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span key={item} className="rounded-md border border-fd-border bg-fd-card px-2 py-1 text-[10px] text-fd-muted-foreground transition-colors hover:text-fd-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const searchCode = [
  'let left = 0;',
  'let right = values.length - 1;',
  'while (left <= right) {',
  '  const mid = Math.floor((left + right) / 2);',
  '  if (values[mid] === target) return mid;',
  '  if (values[mid] < target) left = mid + 1;',
  '  else right = mid - 1;',
  '}',
];

const searchSteps = [
  { line: 1, left: 0, right: null, mid: null, discarded: [] as number[], found: null, description: 'Initialize the left boundary at the first value.' },
  { line: 2, left: 0, right: 5, mid: null, discarded: [] as number[], found: null, description: 'Initialize the right boundary at the final value.' },
  { line: 4, left: 0, right: 5, mid: 2, discarded: [] as number[], found: null, description: 'Inspect the middle value: 8.' },
  { line: 6, left: 3, right: 5, mid: 2, discarded: [0, 1, 2], found: null, description: '8 is smaller than 19, so discard the left half.' },
  { line: 4, left: 3, right: 5, mid: 4, discarded: [0, 1, 2], found: null, description: 'Recalculate the middle of the remaining search area.' },
  { line: 5, left: 3, right: 5, mid: 4, discarded: [0, 1, 2], found: 4, description: 'The middle value is 19. Target found at index 4.' },
];

export function AlgorithmLearningDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = searchSteps[stepIndex];
  const values = [2, 5, 8, 12, 19, 24];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= searchSteps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1350);
    return () => window.clearInterval(timer);
  }, [playing]);

  function reset() {
    setPlaying(false);
    setStepIndex(0);
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-domain-dsa/20 bg-fd-card shadow-[0_24px_70px_-52px_rgb(6_182_212/0.7)]">
      <div className="flex flex-col gap-2 border-b border-fd-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold text-fd-foreground">
            <span className="relative flex size-2">
              <span className={cn('absolute inline-flex size-full rounded-full bg-domain-dsa opacity-30', playing && 'animate-ping motion-reduce:animate-none')} />
              <span className="relative size-2 rounded-full bg-domain-dsa" />
            </span>
            Binary Search · target 19
          </p>
          <p className="mt-1 text-[10px] text-fd-muted-foreground">Code and state advance together.</p>
        </div>
        <span className="font-mono text-[10px] text-fd-muted-foreground">STEP {stepIndex + 1} / {searchSteps.length}</span>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-fd-border bg-[#0d1117] py-3 text-[11px] text-slate-300 lg:border-r lg:border-b-0">
          {searchCode.map((line, index) => {
            const lineNumber = index + 1;
            const active = step.line === lineNumber;
            return (
              <div
                key={lineNumber}
                className={cn(
                  'grid min-h-7 grid-cols-[34px_1fr] items-center border-l-2 border-transparent px-3 font-mono transition-colors',
                  active && 'border-domain-dsa bg-domain-dsa/10 text-cyan-100',
                )}
              >
                <span className={cn('select-none text-right text-slate-600', active && 'text-domain-dsa')}>{lineNumber}</span>
                <code className="pl-3">{line}</code>
              </div>
            );
          })}
        </div>

        <div className="flex min-h-72 flex-col justify-center p-4 sm:p-6">
          <div className="flex justify-center gap-1.5 sm:gap-2">
            {values.map((value, index) => {
              const isMid = step.mid === index;
              const isFound = step.found === index;
              const discarded = step.discarded.includes(index);
              return (
                <div key={value} className="flex flex-col items-center gap-2">
                  <span className="h-4 font-mono text-[8px] text-domain-dsa">
                    {isMid ? (isFound ? 'found' : 'mid') : index === step.left ? 'left' : index === step.right ? 'right' : ''}
                  </span>
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg border bg-fd-background font-mono text-xs transition-all sm:size-10',
                      discarded && !isMid && 'opacity-25 grayscale',
                      isMid && 'border-domain-dsa/50 bg-domain-dsa/10 text-domain-dsa shadow-[0_0_18px_rgb(6_182_212/0.16)]',
                      isFound && 'border-domain-ml/50 bg-domain-ml/10 text-domain-ml shadow-[0_0_18px_rgb(16_185_129/0.16)]',
                    )}
                  >
                    {value}
                  </div>
                  <span className="font-mono text-[8px] text-fd-muted-foreground">{index}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-fd-border bg-fd-background/65 p-3">
            <div className="flex gap-4 font-mono text-[9px] text-fd-muted-foreground">
              <span>left = <strong className="text-fd-foreground">{step.left ?? '—'}</strong></span>
              <span>mid = <strong className="text-domain-dsa">{step.mid ?? '—'}</strong></span>
              <span>right = <strong className="text-fd-foreground">{step.right ?? '—'}</strong></span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-fd-muted-foreground">{step.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-fd-border bg-fd-background/60 px-4 py-3">
        <button
          type="button"
          onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          disabled={stepIndex === 0}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-fd-border text-fd-muted-foreground transition-colors hover:text-fd-foreground disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous step"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setPlaying((current) => !current)}
          className="inline-flex h-8 items-center gap-2 rounded-lg bg-domain-dsa px-3 text-[11px] font-semibold text-slate-950 transition-colors hover:bg-domain-dsa/85"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((current) => Math.min(searchSteps.length - 1, current + 1))}
          disabled={stepIndex === searchSteps.length - 1}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-fd-border px-3 text-[11px] font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next <ChevronRight className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="ml-auto inline-flex size-8 items-center justify-center rounded-lg border border-fd-border text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          aria-label="Reset demonstration"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function LanguageBridge() {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
      <div className="grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="p-5 sm:p-6">
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-domain-dsa uppercase">One learning path</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-fd-foreground">The concept remains the same.</p>
          <p className="mt-2 text-xs leading-5 text-fd-muted-foreground">Choose the syntax you know while keeping the same mental model.</p>
        </div>
        <div className="hidden h-20 w-px bg-fd-border sm:block" />
        <div className="flex flex-wrap gap-2 border-t border-fd-border p-5 sm:border-t-0 sm:p-6">
          {['C++', 'Python', 'Java'].map((language, index) => (
            <span key={language} className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-xs font-semibold text-fd-foreground">
              <span className={cn('size-1.5 rounded-full', index === 0 ? 'bg-domain-dsa' : index === 1 ? 'bg-brand-blue' : 'bg-brand-violet')} />
              {language}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-3 border-t border-domain-dsa/15 bg-domain-dsa/5 p-4 sm:px-6">
        <Braces className="mt-0.5 size-4 shrink-0 text-domain-dsa" />
        <p className="text-xs leading-5 text-fd-muted-foreground">
          <strong className="text-fd-foreground">Why does Stacklore often use C++?</strong> It makes memory, references, pointers, and manual data-structure implementation visible. Python and Java still express the same algorithms.
        </p>
      </div>
    </div>
  );
}

export function LearningPathCTA() {
  return (
    <div className="not-prose relative my-8 overflow-hidden rounded-2xl border border-domain-dsa/25 bg-domain-dsa/5 px-5 py-7 text-center sm:px-8 sm:py-9">
      <CircleDot className="mx-auto size-5 text-domain-dsa" />
      <p className="mt-4 text-xl font-semibold tracking-tight text-fd-foreground">Begin with one clear mental model.</p>
      <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-fd-muted-foreground">
        You do not need to understand the entire roadmap today. Start at the beginning and let every concept unlock the next one.
      </p>
      <Link
        href="/docs/data-structures/welcome"
        className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-domain-dsa px-4 text-xs font-semibold text-slate-950 transition-colors hover:bg-domain-dsa/85"
      >
        Open the welcome lesson
        <BookOpen className="size-3.5" />
      </Link>
    </div>
  );
}
