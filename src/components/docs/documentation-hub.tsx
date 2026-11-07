'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Braces,
  Clock3,
  Route,
  Search,
} from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { cn } from '@/lib/cn';
import {
  documentationDomains,
  type DomainKey,
} from '@/components/home/domain-data';
import { LiveBadge } from '@/components/home/live-badge';

const domainPaths: Record<DomainKey, string> = {
  dsa: '/docs/data-structures',
  ml: '/docs/machine-learning',
  dl: '/docs/deep-learning',
  crypto: '/docs/cryptography',
};

const domainDetails: Record<DomainKey, { intro: string; topics: string[] }> = {
  dsa: {
    intro: 'Organize information and reason about the cost of every operation.',
    topics: ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Sorting & Searching'],
  },
  ml: {
    intro: 'Discover how models learn patterns, make predictions, and are evaluated.',
    topics: ['Regression', 'Classification', 'Clustering', 'Decision Trees', 'Feature Engineering', 'Model Evaluation'],
  },
  dl: {
    intro: 'Build intuition for neural networks and the representations they learn.',
    topics: ['Neural Networks', 'Activation Functions', 'Backpropagation', 'CNN', 'RNN', 'Transformers'],
  },
  crypto: {
    intro: 'Understand the tools used to protect, authenticate, and verify information.',
    topics: ['Encryption Basics', 'Hashing', 'Symmetric Keys', 'Public Keys', 'Digital Signatures', 'Key Exchange'],
  },
};

const learningPaths = [
  {
    domain: 'dsa' as const,
    title: 'Programming foundations',
    steps: ['Arrays', 'Searching', 'Sorting'],
  },
  {
    domain: 'ml' as const,
    title: 'First machine learning model',
    steps: ['Learning from data', 'Linear regression', 'Model evaluation'],
  },
  {
    domain: 'dl' as const,
    title: 'Inside a neural network',
    steps: ['Neurons', 'Activation functions', 'Backpropagation'],
  },
  {
    domain: 'crypto' as const,
    title: 'Modern cryptography',
    steps: ['Encryption basics', 'Hash functions', 'Public key systems'],
  },
];

const popularTopics = [
  { domain: 'dsa' as const, title: 'Binary Search', description: 'Reduce the search space by half.', time: '8 min' },
  { domain: 'ml' as const, title: 'Linear Regression', description: 'Fit a relationship between variables.', time: '12 min' },
  { domain: 'dl' as const, title: 'Backpropagation', description: 'Follow gradients through a network.', time: '15 min' },
  { domain: 'crypto' as const, title: 'SHA-256', description: 'Turn data into a fixed fingerprint.', time: '10 min' },
];

function DataStructurePreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-6" aria-label="Sorted array preview">
      <div className="flex items-center justify-center gap-2">
        {[12, 7, 19, 3, 25].map((value, index) => (
          <div key={value} className={cn('flex size-10 items-center justify-center rounded-lg border bg-fd-background font-mono text-sm sm:size-12', index === 3 ? 'border-domain-dsa/60 bg-domain-dsa/15 text-domain-dsa shadow-glow-current' : 'border-fd-border text-fd-foreground/70')}>
            {value}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 font-mono text-xs font-medium text-domain-dsa">
        <span className="h-px flex-1 bg-domain-dsa/25" />sorted in place<span className="h-px flex-1 bg-domain-dsa/25" />
      </div>
      <div className="flex items-center justify-center gap-2">
        {[3, 7, 12, 19, 25].map((value) => (
          <div key={value} className="flex size-10 items-center justify-center rounded-lg border border-domain-dsa/45 bg-domain-dsa/15 font-mono text-sm font-medium text-domain-dsa sm:size-12">{value}</div>
        ))}
      </div>
    </div>
  );
}

function MachineLearningPreview() {
  const pointsA = [[55, 46], [85, 73], [114, 48], [130, 100], [75, 125]];
  const pointsB = [[208, 55], [245, 82], [282, 48], [260, 122], [315, 96]];
  return (
    <svg viewBox="0 0 370 170" className="h-full w-full" role="img" aria-label="Classification preview">
      <path d="M190 15 167 156" className="stroke-domain-ml" strokeWidth="2" />
      {pointsA.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" className="fill-domain-ml" opacity="0.8" />)}
      {pointsB.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" className="fill-viz-selected" opacity="0.8" />)}
      <text x="38" y="154" className="fill-domain-ml text-[11px] font-medium">CLASS A</text>
      <text x="285" y="154" className="fill-viz-selected text-[11px] font-medium">CLASS B</text>
    </svg>
  );
}

function DeepLearningPreview() {
  const nodes = [[32, 35], [32, 88], [32, 141], [142, 24], [142, 65], [142, 106], [142, 147], [250, 42], [250, 92], [250, 142], [335, 92]];
  const edges = [[0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6], [3, 7], [4, 7], [4, 8], [5, 8], [5, 9], [6, 9], [7, 10], [8, 10], [9, 10]];
  return (
    <svg viewBox="0 0 370 175" className="h-full w-full" role="img" aria-label="Neural network preview">
      {edges.map(([from, to], index) => <line key={`${from}-${to}`} x1={nodes[from][0]} y1={nodes[from][1]} x2={nodes[to][0]} y2={nodes[to][1]} className={index % 5 === 0 ? 'stroke-domain-dl' : 'stroke-fd-border'} opacity={index % 5 === 0 ? 0.9 : 0.55} />)}
      {nodes.map(([cx, cy], index) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" className={index % 4 === 0 ? 'fill-domain-dl stroke-domain-dl' : 'fill-fd-background stroke-fd-border'} strokeWidth="2" />)}
    </svg>
  );
}

function CryptographyPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 font-mono" aria-label="Encryption preview">
      <span className="text-sm tracking-[0.2em] text-fd-foreground">STACKLORE</span>
      <div className="flex w-full items-center gap-3 text-xs font-medium text-domain-crypto"><span className="h-px flex-1 bg-domain-crypto/35" />SHA-256<span className="h-px flex-1 bg-domain-crypto/35" /></div>
      <span className="text-sm font-medium leading-7 tracking-[0.14em] text-domain-crypto">A9 F4 10 CC 72 8E<br />31 D0 6B 9A 17 F2</span>
    </div>
  );
}

const previews: Record<DomainKey, React.ReactNode> = {
  dsa: <DataStructurePreview />,
  ml: <MachineLearningPreview />,
  dl: <DeepLearningPreview />,
  crypto: <CryptographyPreview />,
};

export function DocumentationHub() {
  const { setOpenSearch } = useSearchContext();
  const domains = Object.entries(documentationDomains) as [DomainKey, (typeof documentationDomains)[DomainKey]][];

  return (
    <div className="flex-1 text-fd-foreground">
      <header className="relative isolate overflow-hidden border-b border-fd-border/70">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fd-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_94%)] dark:opacity-15" />
        <div className="pointer-events-none absolute top-20 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand-indigo/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[88rem] px-5 pt-20 pb-16 sm:px-8 md:pt-28 md:pb-20 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
            <div>
              <LiveBadge>Documentation hub</LiveBadge>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance text-fd-foreground sm:text-5xl lg:text-6xl">
                Explore computer science{' '}
                <span className="bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-violet bg-clip-text text-transparent">one concept at a time.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-fd-foreground/72 md:text-xl">
                Choose a subject, build the theory, run examples, and visualize what happens beneath the code.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setOpenSearch(true)}
                className="group flex w-full items-center gap-4 rounded-xl border border-brand-indigo/20 bg-fd-background/90 px-5 py-5 text-left shadow-[0_20px_60px_-40px_rgb(99_102_241/0.7)] backdrop-blur-sm transition-colors hover:border-brand-indigo/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
              >
                <Search className="size-5 text-brand-indigo" aria-hidden="true" />
                <span className="flex-1 text-base text-fd-foreground/65">Search documentation, topics, and concepts...</span>
                <kbd className="rounded-md border border-brand-indigo/20 bg-brand-indigo/5 px-2 py-1 font-mono text-xs text-brand-indigo dark:text-brand-blue">Ctrl K</kbd>
              </button>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fd-foreground/65">
                <span className="inline-flex items-center gap-2"><Route className="size-4 text-brand-blue" />4 learning paths</span>
                <span className="inline-flex items-center gap-2"><BookOpen className="size-4 text-brand-indigo" />Guided lessons</span>
                <span className="inline-flex items-center gap-2"><Braces className="size-4 text-brand-violet" />Interactive examples</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
        <section className="py-20 md:py-28">
          <div className="mb-12 grid gap-5 md:grid-cols-[0.7fr_1.3fr]">
            <p className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-brand-indigo dark:text-brand-blue">01 · Subjects</p>
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-fd-foreground md:text-5xl">Choose what you want to understand.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-fd-foreground/68">Each subject is a focused learning space with its own concepts, examples, and visual tools.</p>
            </div>
          </div>

          <div className="border-t border-fd-border">
            {domains.map(([key, domain]) => {
              const details = domainDetails[key];
              return (
                <article key={key} className="relative grid gap-8 border-b border-fd-border py-14 md:grid-cols-[72px_minmax(0,1fr)_minmax(320px,0.85fr)] md:items-center md:py-20">
                  <span className={cn('absolute top-14 left-0 h-16 w-0.5 rounded-full md:top-20', domain.indicator)} aria-hidden="true" />
                  <span className={cn('inline-flex size-10 items-center justify-center rounded-lg border font-mono text-sm font-semibold', domain.border, domain.background, domain.accent)}>{domain.index}</span>
                  <div>
                    <h3 className="max-w-xl text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">{domain.label}</h3>
                    <p className="mt-5 max-w-xl text-lg leading-8 text-fd-foreground/70">{details.intro}</p>
                    <div className="mt-6 grid max-w-xl grid-cols-2 gap-x-8 gap-y-2">
                      {details.topics.map((topic) => <span key={topic} className="border-b border-fd-border py-2.5 text-base font-medium text-fd-foreground/72">{topic}</span>)}
                    </div>
                    <Link href={domainPaths[key]} className={cn('mt-8 inline-flex items-center gap-2 text-base font-semibold transition-colors focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring', domain.accent)}>
                      Explore {domain.shortLabel}<ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <div className={cn('h-64 overflow-hidden rounded-xl border bg-[linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fd-border)_1px,transparent_1px)] bg-[size:32px_32px] p-6 [background-color:var(--color-fd-background)]', domain.border)}>
                    <div className="h-full rounded-lg bg-fd-background/90 px-4">{previews[key]}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-fd-border py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-brand-indigo dark:text-brand-blue">02 · Suggested routes</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-fd-foreground md:text-5xl">Not sure where to start?</h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-fd-foreground/68">Follow a short sequence designed to build one idea naturally on top of the previous one.</p>
            </div>
            <div className="border-t border-fd-border">
              {learningPaths.map((path) => {
                const domain = documentationDomains[path.domain];
                return (
                  <Link key={path.title} href={domainPaths[path.domain]} className={cn('group grid gap-4 border-b border-fd-border border-l-2 py-7 pl-5 transition-colors hover:bg-fd-accent/40 sm:grid-cols-[minmax(210px,0.75fr)_1fr_auto] sm:items-center sm:pr-3', domain.border)}>
                    <div className="flex items-center gap-3"><span className={cn('size-2 rounded-full', domain.indicator)} /><span className="text-base font-semibold text-fd-foreground">{path.title}</span></div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-fd-foreground/65">{path.steps.map((step, index) => <span key={step}>{index > 0 && <span className={cn('mr-2 font-semibold', domain.accent)}>→</span>}{step}</span>)}</div>
                    <ArrowRight className={cn('size-5 transition-transform group-hover:translate-x-1', domain.accent)} aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-fd-border py-20 md:py-28">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-brand-indigo dark:text-brand-blue">03 · Popular now</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-fd-foreground md:text-5xl">Frequently explored concepts.</h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-fd-foreground/65">A quick place to begin when you want one focused lesson.</p>
          </div>
          <div className="grid border-t border-fd-border sm:grid-cols-2 lg:grid-cols-4">
            {popularTopics.map((topic, index) => {
              const domain = documentationDomains[topic.domain];
              return (
                <Link key={topic.title} href={domainPaths[topic.domain]} className={cn('group border-b border-fd-border py-6 sm:px-6', index % 2 === 0 ? 'sm:border-r' : '', index < 3 ? 'lg:border-r' : '', 'lg:border-b-0 lg:first:pl-0 lg:last:pr-0')}>
                  <div className="flex items-center justify-between gap-3"><span className={cn('font-mono text-xs font-semibold uppercase tracking-wider', domain.accent)}>{domain.shortLabel}</span><span className="inline-flex items-center gap-1 text-xs text-fd-foreground/60"><Clock3 className="size-3.5" />{topic.time}</span></div>
                  <h3 className="mt-5 text-xl font-semibold text-fd-foreground">{topic.title}</h3>
                  <p className="mt-3 text-base leading-7 text-fd-foreground/68">{topic.description}</p>
                  <ArrowRight className={cn('mt-6 size-5 transition-transform group-hover:translate-x-1', domain.accent)} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-4 px-5 py-8 text-xs text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div><span className="font-semibold text-fd-foreground">Stacklore Docs</span><span className="ml-3">Read · Visualize · Experiment</span></div>
          <Link href="/" className="transition-colors hover:text-fd-foreground">Back to home</Link>
        </div>
      </footer>
    </div>
  );
}
