import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowRight, Hourglass } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------------- */
/* Pipeline: horizontal steps (vertical on phones), e.g. source → compiler.  */
/* ------------------------------------------------------------------------- */

interface PipelineStep {
  label: string;
  note?: string;
  /** Highlights the step as the tool doing the work (compiler, interpreter). */
  tool?: boolean;
}

export function Pipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="not-prose my-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {steps.map((step, index) => (
        <Fragment key={step.label}>
          {index > 0 ? (
            <ArrowRight
              className="size-4 shrink-0 rotate-90 self-center text-fd-muted-foreground sm:rotate-0"
              aria-hidden="true"
            />
          ) : null}
          <div
            className={cn(
              'flex-1 rounded-lg border px-3 py-2.5 text-center',
              step.tool ? 'border-fd-primary/35 bg-fd-primary/8' : 'bg-fd-card',
            )}
          >
            <div
              className={cn(
                'text-sm font-medium',
                step.tool ? 'text-fd-primary' : 'font-mono text-fd-foreground',
              )}
            >
              {step.label}
            </div>
            {step.note ? <div className="mt-0.5 text-xs leading-5 text-fd-muted-foreground">{step.note}</div> : null}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* MemoryBoxes: variables drawn as labelled boxes (type, value, name).       */
/* ------------------------------------------------------------------------- */

interface MemoryItem {
  name: string;
  type: string;
  value: string;
}

export function MemoryBoxes({ items, caption }: { items: MemoryItem[]; caption?: string }) {
  return (
    <figure className="not-prose my-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-3">
        {items.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg border bg-fd-card">
            <div className="border-b px-3 py-1.5 font-mono text-[0.6875rem] text-fd-muted-foreground">
              {item.type}
            </div>
            <div className="px-3 py-4 text-center font-mono text-lg font-semibold text-fd-foreground">
              {item.value}
            </div>
            <div className="border-t bg-fd-muted/50 px-3 py-1.5 text-center font-mono text-xs font-medium text-fd-foreground">
              {item.name}
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-center text-sm text-fd-muted-foreground">
        {caption ?? 'Setiap kotak: tipe data (atas), nilai (tengah), dan nama variabel (bawah).'}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------------- */
/* TruthTable: AND / OR / NOT for two conditions, C++ and Python notation.   */
/* ------------------------------------------------------------------------- */

const rows: [boolean, boolean][] = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
];

function Bool({ value }: { value: boolean }) {
  return (
    <span
      className={cn(
        'inline-block min-w-12 rounded px-1.5 py-0.5 text-center font-mono text-xs font-medium',
        value
          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
      )}
    >
      {value ? 'true' : 'false'}
    </span>
  );
}

export function TruthTable() {
  const headers = [
    { cpp: 'A', py: '' },
    { cpp: 'B', py: '' },
    { cpp: 'A && B', py: 'A and B' },
    { cpp: 'A || B', py: 'A or B' },
    { cpp: '!A', py: 'not A' },
  ];

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[28rem] text-sm">
        <thead className="bg-fd-muted/50">
          <tr>
            {headers.map((header) => (
              <th key={header.cpp} className="px-3 py-2 text-left font-medium text-fd-foreground">
                <code className="font-mono text-[0.8125rem]">{header.cpp}</code>
                {header.py ? (
                  <span className="block font-mono text-[0.6875rem] font-normal text-fd-muted-foreground">
                    {header.py}
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(([a, b]) => (
            <tr key={`${a}-${b}`}>
              <td className="px-3 py-2"><Bool value={a} /></td>
              <td className="px-3 py-2"><Bool value={b} /></td>
              <td className="px-3 py-2"><Bool value={a && b} /></td>
              <td className="px-3 py-2"><Bool value={a || b} /></td>
              <td className="px-3 py-2"><Bool value={!a} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------------- */

export function ComingSoon({ subject }: { subject: string }) {
  return (
    <div className="not-prose my-8 rounded-xl border border-dashed p-8 text-center">
      <span className="mx-auto grid size-11 place-items-center rounded-full border bg-fd-card text-fd-muted-foreground">
        <Hourglass className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-base font-semibold text-fd-foreground">Materi {subject} sedang disiapkan</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-fd-muted-foreground">
        Bagian ini memang sengaja dikosongkan dulu. Sambil menunggu, mulailah dari dasar pemrograman di seri C++.
      </p>
      <Link
        href="/docs/cpp"
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
      >
        Belajar C++
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
