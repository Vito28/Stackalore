import type { ReactNode } from 'react';
import { BookOpenCheck, ChevronRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/cn';

const levels = {
  mudah: {
    label: 'Mudah',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  menengah: {
    label: 'Menengah',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  sulit: {
    label: 'Sulit',
    className: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  },
} as const;

interface SoalProps {
  no: number;
  level: keyof typeof levels;
  judul: string;
  children: ReactNode;
}

/**
 * One exercise in a lesson's "Latihan" section. The statement is the body;
 * `<Petunjuk>` and `<Pembahasan>` inside it stay collapsed until opened.
 */
export function Soal({ no, level, judul, children }: SoalProps) {
  const { label, className } = levels[level];

  return (
    <section id={`soal-${no}`} className="soal my-6 scroll-mt-20 rounded-xl border bg-fd-card">
      <header className="not-prose flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b px-4 py-3">
        <span className="font-mono text-xs font-medium text-fd-muted-foreground">Soal {no}</span>
        <span className={cn('rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium', className)}>{label}</span>
        <span className="basis-full font-semibold text-fd-foreground sm:basis-auto">{judul}</span>
      </header>
      <div className="soal-body px-4 pb-1">{children}</div>
    </section>
  );
}

function Reveal({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <details className="soal-reveal group my-4 rounded-lg border bg-fd-background">
      <summary className="not-prose flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-fd-muted-foreground transition-colors select-none hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden="true" />
        {icon}
        {label}
      </summary>
      <div className="soal-reveal-body border-t px-3 pb-1">{children}</div>
    </details>
  );
}

export function Petunjuk({ children }: { children: ReactNode }) {
  return (
    <Reveal label="Petunjuk" icon={<Lightbulb className="size-4 shrink-0" aria-hidden="true" />}>
      {children}
    </Reveal>
  );
}

export function Pembahasan({ children }: { children: ReactNode }) {
  return (
    <Reveal label="Lihat pembahasan" icon={<BookOpenCheck className="size-4 shrink-0" aria-hidden="true" />}>
      {children}
    </Reveal>
  );
}
