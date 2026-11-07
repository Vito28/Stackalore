'use client';

import type { ReactNode } from 'react';
import {
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Mail,
  Radio,
  Share2,
} from 'lucide-react';
import {
  ArticleHeader,
  ArticleSection,
  Button,
  CodePanel,
  CornerCard,
  InformationPanel,
  TechBadge,
  TechnicalNavigation,
} from '@/components/ui';

const navigationItems = [
  { label: 'Buttons', href: '#buttons', active: true },
  {
    label: 'Badges',
    href: '#badges',
    trailing: <ChevronDown className="size-3 opacity-60" aria-hidden="true" />,
  },
  { label: 'Cards', href: '#cards' },
  { label: 'Information', href: '#information' },
  { label: 'Material', href: '#material' },
];

const binarySearchCode = `// Trace a binary search without mutating the input.
export function binarySearch(values: readonly number[], target: number) {
  let low = 0;
  let high = values.length - 1;

  while (low <= high) {
    const midpoint = low + Math.floor((high - low) / 2);
    const candidate = values[midpoint];

    console.log({ low, high, midpoint, candidate, target });

    if (candidate === target) return midpoint;
    if (candidate < target) low = midpoint + 1;
    else high = midpoint - 1;
  }

  return -1;
}

const index = binarySearch([3, 8, 13, 21, 34, 55, 89, 144, 233, 377], 89);`;

const cards = [
  {
    accent: 'info' as const,
    eyebrow: 'Foundation',
    title: 'Structured navigation',
    copy: 'Square geometry, precise spacing, and a cyan signal for the active system state.',
  },
  {
    accent: 'attention' as const,
    eyebrow: 'Attention',
    title: 'Visible constraints',
    copy: 'Amber accents bring important limits forward without making the interface feel alarming.',
  },
  {
    accent: 'urgent' as const,
    eyebrow: 'Critical path',
    title: 'Clear escalation',
    copy: 'Red is reserved for destructive or urgent moments where the user must make a decision.',
  },
  {
    accent: 'neutral' as const,
    eyebrow: 'Supporting',
    title: 'Quiet context',
    copy: 'Neutral cards hold secondary information while preserving the same technical visual system.',
  },
];

export function ComponentShowcase() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-fd-background text-fd-foreground">
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fd-border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_95%)] dark:opacity-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -top-40 left-[8%] size-[32rem] rounded-full bg-cyan-400/15 blur-[120px] dark:bg-cyan-500/8"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-[40%] -right-48 size-[34rem] rounded-full bg-violet-400/12 blur-[130px] dark:bg-violet-500/8"
        aria-hidden="true"
      />

      <TechnicalNavigation
        sticky
        brand={
          <span className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.18em]">
            <span className="grid size-9 place-items-center border border-cyan-500/45 bg-cyan-500/10 text-cyan-700 shadow-[0_0_20px_-8px_rgb(6_182_212/0.75)] dark:text-cyan-300">
              <Box className="size-4.5" aria-hidden="true" />
            </span>
            <span className="hidden text-base tracking-[0.08em] text-cyan-800 sm:inline dark:text-cyan-200">
              Stacklore
              <span className="ml-2 text-[0.625rem] tracking-[0.18em] text-fd-muted-foreground">UI Lab</span>
            </span>
          </span>
        }
        items={navigationItems}
        actions={
          <>
            <Button className="hidden lg:inline-flex" size="default">Contact</Button>
            <Button variant="secondary" size="default" className="hidden gap-3 xl:inline-flex">
              <span className="grid size-6 place-items-center bg-cyan-500 text-[0.6875rem] text-slate-950">G</span>
              Guest
              <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
            </Button>
          </>
        }
      />

      <main className="relative mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
        <section className="grid gap-10 border-b border-fd-border/80 pb-16 md:grid-cols-[1.25fr_0.75fr] md:items-end md:pb-24">
          <div>
            <TechBadge surface="soft">Component laboratory</TechBadge>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
              Technical foundations,
              <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-300 dark:to-violet-300">
                built for the dark.
              </span>
            </h1>
          </div>
          <div className="border-l border-cyan-500/60 pl-5 shadow-[-10px_0_30px_-18px_rgb(6_182_212/0.8)]">
            <p className="text-sm leading-7 text-fd-muted-foreground">
              Halaman review untuk memeriksa hierarchy, contrast, hover, focus,
              glassmorphism, dan semantic colors sebelum dipakai di halaman utama.
            </p>
            <p className="mt-4 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
              <Radio className="size-3.5" aria-hidden="true" />
              Live theme preview
            </p>
          </div>
        </section>

        <section id="buttons" className="scroll-mt-28 border-b border-fd-border/80 py-16 md:py-24">
          <SectionHeading
            index="01"
            label="Actions"
            title="Button system"
            description="Primary untuk aksi utama, secondary untuk alternatif, outline untuk aksi ringan, dan ghost untuk kontrol yang tidak dominan."
          />

          <CornerCard className="mt-10" padding="lg">
            <div className="grid gap-10 lg:grid-cols-2">
              <ShowcaseGroup title="Variants">
                <Button>
                  Primary <ArrowRight aria-hidden="true" />
                </Button>
                <Button variant="secondary">
                  Secondary <ChevronRight aria-hidden="true" />
                </Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button disabled>Disabled</Button>
              </ShowcaseGroup>
              <ShowcaseGroup title="Sizes">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button variant="secondary" size="icon" aria-label="Confirm">
                  <Check aria-hidden="true" />
                </Button>
              </ShowcaseGroup>
            </div>
          </CornerCard>
        </section>

        <section id="badges" className="scroll-mt-28 border-b border-fd-border/80 py-16 md:py-24">
          <SectionHeading
            index="02"
            label="Status"
            title="Technical badges"
            description="Label monospace yang ringkas untuk eyebrow, status, category, maupun metadata singkat."
          />

          <div className="mt-10 grid gap-px overflow-hidden border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-4">
            {(['info', 'attention', 'urgent', 'neutral'] as const).map((variant) => (
              <div key={variant} className="tech-glass flex min-h-32 flex-col justify-between p-5">
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-fd-muted-foreground">
                  {variant}
                </span>
                <div className="flex flex-col items-start gap-3">
                  <TechBadge variant={variant}>{variant} signal</TechBadge>
                  <TechBadge variant={variant} surface="soft">Soft surface</TechBadge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="cards" className="scroll-mt-28 border-b border-fd-border/80 py-16 md:py-24">
          <SectionHeading
            index="03"
            label="Containers"
            title="Corner cards"
            description="Panel glass dengan aksen siku di kiri atas dan kanan bawah. Hover card untuk melihat detail garis berkembang."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <CornerCard key={card.title} accent={card.accent} interactive className="min-h-64">
                <TechBadge variant={card.accent === 'neutral' ? 'neutral' : card.accent}>
                  {card.eyebrow}
                </TechBadge>
                <h3 className="mt-8 text-xl font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">{card.copy}</p>
              </CornerCard>
            ))}
          </div>
        </section>

        <section id="information" className="scroll-mt-28 border-b border-fd-border/80 py-16 md:py-24">
          <SectionHeading
            index="04"
            label="Feedback"
            title="Information panels"
            description="Tiga tingkat komunikasi dengan garis glow di sisi kiri: informasi, perlu perhatian, dan urgent."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <InformationPanel title="System information">
              Proses sinkronisasi aktif dan akan berjalan otomatis setiap sepuluh menit.
            </InformationPanel>
            <InformationPanel variant="attention" title="Review required">
              Beberapa data belum diverifikasi. Periksa kembali sebelum melakukan publish.
            </InformationPanel>
            <InformationPanel variant="urgent" title="Deployment blocked">
              Production key tidak tersedia. Deployment dihentikan untuk mencegah kegagalan.
            </InformationPanel>
          </div>
        </section>

        <section id="material" className="scroll-mt-28 pt-16 md:pt-24">
          <SectionHeading
            index="05"
            label="Reading experience"
            title="Material article & code"
            description="Preview struktur materi panjang dengan header editorial, metadata, share actions, section heading, dan code panel yang dapat di-scroll."
          />

          <div className="relative mx-auto mt-14 max-w-5xl border-x border-fd-border/35 px-5 sm:px-10 lg:px-16">
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-fd-background/65 shadow-[0_0_100px_80px_var(--color-fd-background)]"
              aria-hidden="true"
            />

            <ArticleHeader
              backHref="#material"
              eyebrow="Data structures / Searching"
              title="Inside binary search: bounds, midpoint, and termination"
              metadata={['Oct 20, 2026', '8 min read', 'By Stacklore']}
              notice={
                <>
                  Learning objective:{' '}
                  <strong className="text-red-400">trace every boundary update</strong>
                </>
              }
            />

            <div className="flex flex-wrap items-center gap-2 border-b border-fd-border/80 py-7">
              <span className="mr-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-fd-muted-foreground">
                Share
              </span>
              <Button variant="outline" size="sm">
                <Copy aria-hidden="true" /> Copy link
              </Button>
              <Button variant="outline" size="sm">
                <Share2 aria-hidden="true" /> Share
              </Button>
              <Button variant="outline" size="sm">X / Twitter</Button>
              <Button variant="outline" size="sm">
                <Mail aria-hidden="true" /> Email
              </Button>
            </div>

            <ArticleSection title="Abstract" accent="urgent">
              <p>
                Binary search is fast because it discards half of the remaining search
                space after every comparison. The speed is simple; keeping the bounds
                correct is the part that deserves careful attention.
              </p>
              <p>
                This material follows one search from its initial range to the final
                answer, showing exactly why the loop terminates and where off-by-one
                errors usually enter the implementation.
              </p>
            </ArticleSection>

            <ArticleSection title="Reader box: trace it in one function" accent="urgent">
              <p>
                Run the function and inspect every logged state. The input stays
                unchanged; only the two boundary pointers move toward the target.
              </p>

              <CodePanel
                code={binarySearchCode}
                filename="binary-search.ts"
                language="TypeScript"
                caption="The panel keeps long lines scrollable and preserves the dark terminal treatment used throughout technical materials."
              />

              <p>
                <strong className="text-fd-foreground">What a correct trace looks like.</strong>{' '}
                When the candidate is smaller than the target,{' '}
                <code className="border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-300">
                  low = midpoint + 1
                </code>{' '}
                removes the candidate and every smaller value from the next search.
              </p>
            </ArticleSection>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-fd-border/80">
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-5 py-7 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-fd-muted-foreground sm:px-8 lg:px-12">
          <span>Stacklore UI Lab</span>
          <span>Dark interface system</span>
        </div>
      </footer>
    </div>
  );
}

interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  description: string;
}

function SectionHeading({ index, label, title, description }: SectionHeadingProps) {
  return (
    <div className="grid gap-5 md:grid-cols-[0.65fr_1.35fr] md:items-end">
      <div>
        <TechBadge>{index} / {label}</TechBadge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm leading-7 text-fd-muted-foreground md:justify-self-end">
        {description}
      </p>
    </div>
  );
}

interface ShowcaseGroupProps {
  title: string;
  children: ReactNode;
}

function ShowcaseGroup({ title, children }: ShowcaseGroupProps) {
  return (
    <div>
      <p className="mb-5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-fd-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
