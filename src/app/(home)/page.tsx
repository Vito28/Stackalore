import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Box,
  Braces,
  CheckCircle2,
  Eye,
  GitFork,
  Network,
} from 'lucide-react';
import { ConceptConsole } from '@/components/home/concept-console';
import {
  documentationDomains,
  type DomainKey,
} from '@/components/home/domain-data';
import { TraceLab } from '@/components/home/trace-lab';
import {
  CornerCard,
  TechBadge,
  TechnicalNavigation,
  buttonVariants,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { gitConfig } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Stacklore — Computer Science, made visual',
  description:
    'Interactive computer science documentation for data structures, machine learning, deep learning, and cryptography.',
};

const domainLinks: Record<DomainKey, string> = {
  dsa: '/docs/data-structures/welcome',
  ml: '/docs/machine-learning',
  dl: '/docs/deep-learning',
  crypto: '/docs/cryptography',
};

const domainStatus: Record<DomainKey, string> = {
  dsa: '10 lessons',
  ml: 'Foundation',
  dl: 'Foundation',
  crypto: 'Foundation',
};

const learningSteps = [
  {
    index: '01',
    label: 'Understand',
    copy: 'Begin with the problem, the mental model, and the reason an approach works.',
    icon: BookOpen,
    color: 'text-cyan-300',
    bar: 'bg-cyan-300',
  },
  {
    index: '02',
    label: 'Visualize',
    copy: 'Watch values, pointers, and decisions change together, one operation at a time.',
    icon: Eye,
    color: 'text-blue-300',
    bar: 'bg-blue-300',
  },
  {
    index: '03',
    label: 'Experiment',
    copy: 'Change the input and trace how the execution path responds to a new condition.',
    icon: Braces,
    color: 'text-violet-300',
    bar: 'bg-violet-300',
  },
  {
    index: '04',
    label: 'Explain',
    copy: 'Connect observed behavior to correctness, complexity, and practical tradeoffs.',
    icon: CheckCircle2,
    color: 'text-emerald-300',
    bar: 'bg-emerald-300',
  },
] as const;

export default function HomePage() {
  const domains = Object.entries(documentationDomains) as [
    DomainKey,
    (typeof documentationDomains)[DomainKey],
  ][];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-fd-background text-fd-foreground">
      <HomeBackdrop />

      <TechnicalNavigation
        sticky
        brand={
          <span className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.18em]">
            <span className="relative grid size-9 place-items-center border border-cyan-400/50 bg-cyan-400/8 text-cyan-200 shadow-[0_0_20px_-8px_rgb(34_211_238/0.8)]">
              <Box className="size-4" aria-hidden="true" />
              <span className="absolute -top-px -left-px size-2 border-t border-l border-cyan-200" />
              <span className="absolute -right-px -bottom-px size-2 border-r border-b border-cyan-200" />
            </span>
            <span className="hidden text-sm tracking-[0.12em] text-cyan-100 sm:inline">
              Stacklore
            </span>
          </span>
        }
        items={[
          { label: 'Subjects', href: '#explore' },
          { label: 'Visualize', href: '#visualizations' },
          { label: 'Method', href: '#about' },
          { label: 'Playground', href: '#playground' },
        ]}
        actions={
          <Link
            href="/docs"
            className={cn(
              buttonVariants({ variant: 'primary', size: 'sm' }),
              'hidden sm:inline-flex',
            )}
          >
            Open docs
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <main className="relative z-10">
        <section className="border-b border-fd-border/80">
          <div className="mx-auto grid min-h-[calc(100svh-6rem)] w-full max-w-[92rem] gap-14 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[minmax(0,0.86fr)_minmax(520px,1.14fr)] lg:items-center lg:gap-20 lg:px-12">
            <div>
              <TechBadge surface="soft" marker="//">
                Interactive computer science
              </TechBadge>
              <h1 className="mt-7 max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
                Learn the system.
                <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                  See every decision.
                </span>
              </h1>
              <p className="mt-7 max-w-xl border-l border-cyan-400/70 pl-5 text-base leading-8 text-fd-muted-foreground shadow-[-12px_0_32px_-22px_rgb(34_211_238/0.9)] sm:text-lg">
                Clear material, executable examples, and visual traces for the computer science concepts that are hardest to picture.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/docs" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  Start learning
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="#playground" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  Run a trace
                  <Braces aria-hidden="true" />
                </Link>
              </div>

              <dl className="mt-12 grid max-w-xl grid-cols-3 border-y border-fd-border/80">
                {[
                  ['04', 'Subjects'],
                  ['10', 'DSA lessons'],
                  ['01', 'Live lab'],
                ].map(([value, label], index) => (
                  <div
                    key={label}
                    className={cn('py-4', index > 0 && 'border-l border-fd-border/80 pl-5')}
                  >
                    <dt className="font-mono text-xl font-bold text-cyan-200">{value}</dt>
                    <dd className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-fd-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ConceptConsole />
          </div>
        </section>

        <section id="explore" className="scroll-mt-24 border-b border-fd-border/80">
          <div className="mx-auto w-full max-w-[92rem] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
            <SectionHeading
              index="01"
              label="Subjects"
              title="Choose a system to understand."
              description="Each subject is a focused learning space. Start with the structure, inspect its operations, then connect the theory to executable code."
            />

            <div className="mt-12 grid gap-px border border-fd-border bg-fd-border md:grid-cols-2 xl:grid-cols-4">
              {domains.map(([key, domain]) => (
                <Link
                  key={key}
                  href={domainLinks[key]}
                  className="group bg-fd-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400"
                >
                  <CornerCard
                    accent={key === 'crypto' ? 'attention' : 'info'}
                    interactive
                    className="min-h-[22rem] border-0"
                    padding="lg"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className={cn('font-mono text-xs font-bold', domain.accent)}>{domain.index}</span>
                      <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-fd-muted-foreground">{domainStatus[key]}</span>
                    </div>
                    <h2 className="mt-12 text-2xl font-semibold tracking-tight text-fd-foreground">{domain.label}</h2>
                    <p className="mt-4 text-sm leading-7 text-fd-muted-foreground">{domain.description}</p>
                    <div className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
                      {domain.topics.slice(0, 4).map((topic) => (
                        <span key={topic} className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-fd-muted-foreground/80">{topic}</span>
                      ))}
                    </div>
                    <span className={cn('mt-10 inline-flex items-center gap-2 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em]', domain.accent)}>
                      Open subject
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </CornerCard>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="visualizations" className="scroll-mt-24 border-b border-fd-border/80">
          <div className="mx-auto w-full max-w-[92rem] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
            <SectionHeading
              index="02"
              label="Visualize"
              title="Follow the algorithm, not just the answer."
              description="The active range, selected value, source line, and explanation stay synchronized so every update has a visible reason."
            />
            <div className="mt-12">
              <TraceLab />
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 border-b border-fd-border/80">
          <div className="mx-auto w-full max-w-[92rem] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
            <SectionHeading
              index="03"
              label="Learning method"
              title="One concept. Four deliberate passes."
              description="Stacklore turns passive reading into a repeatable loop that moves from intuition to independent reasoning."
            />

            <ol className="mt-12 grid gap-px border border-fd-border bg-fd-border md:grid-cols-2 xl:grid-cols-4">
              {learningSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.label} className="relative min-h-64 bg-fd-background p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-fd-muted-foreground">{step.index}</span>
                      <Icon className={cn('size-5', step.color)} aria-hidden="true" />
                    </div>
                    <h3 className="mt-14 text-xl font-semibold tracking-tight text-fd-foreground">{step.label}</h3>
                    <p className="mt-4 text-sm leading-7 text-fd-muted-foreground">{step.copy}</p>
                    <span className={cn('absolute inset-x-0 bottom-0 h-px', step.bar)} aria-hidden="true" />
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="playground" className="scroll-mt-24">
          <div className="mx-auto w-full max-w-[92rem] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
            <div className="relative overflow-hidden border border-cyan-400/25 bg-[#030a12]/82 px-6 py-14 text-center shadow-[0_28px_100px_-56px_rgb(34_211_238/0.65)] backdrop-blur-xl sm:px-10 md:py-20">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(34_211_238/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(34_211_238/0.06)_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
              <div className="relative mx-auto max-w-3xl">
                <TechBadge surface="soft" marker="//">Ready to inspect the next system?</TechBadge>
                <h2 className="mt-7 text-4xl font-semibold tracking-[-0.04em] text-balance text-slate-50 sm:text-5xl md:text-6xl">
                  Build understanding from the inside out.
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                  Open the learning path, choose a lesson from the left sidebar, and move from explanation to execution at your own pace.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link href="/docs/data-structures/welcome" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                    <Network aria-hidden="true" />
                    Open learning path
                  </Link>
                  <Link href="/docs" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                    Browse all docs
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-fd-border/80 bg-fd-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Stacklore</p>
            <p className="mt-2 text-xs text-fd-muted-foreground">Read · Visualize · Experiment · Explain</p>
          </div>
          <nav className="flex items-center gap-5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-fd-muted-foreground" aria-label="Footer navigation">
            <Link href="/docs" className="transition-colors hover:text-cyan-200">Docs</Link>
            <a href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-200">
              <GitFork className="size-3.5" aria-hidden="true" /> GitHub
            </a>
            <Link href="#about" className="transition-colors hover:text-cyan-200">Method</Link>
          </nav>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-fd-muted-foreground">© {new Date().getFullYear()} Stacklore</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  description,
  index,
  label,
  title,
}: {
  description: string;
  index: string;
  label: string;
  title: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:items-end">
      <div>
        <TechBadge marker={`${index} /`}>{label}</TechBadge>
        <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{title}</h2>
      </div>
      <p className="max-w-2xl border-l border-fd-border pl-5 text-sm leading-7 text-fd-muted-foreground md:justify-self-end sm:text-base">{description}</p>
    </div>
  );
}

function HomeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(34_211_238/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(34_211_238/0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_96%)]" />
      <div className="absolute -top-56 left-[10%] size-[36rem] rounded-full bg-cyan-500/8 blur-[130px]" />
      <div className="absolute top-[34rem] -right-56 size-[38rem] rounded-full bg-violet-500/8 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-fd-background)_88%)] opacity-70" />
    </div>
  );
}
