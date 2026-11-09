import Link from 'next/link';
import { ExternalLink, Scale } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getReference, licenses, type ReferenceKey } from '@/lib/references';

export interface PageSourceEntry {
  ref: ReferenceKey;
  judul?: string;
  url?: string;
  jenis: 'rujukan' | 'diadaptasi';
  perubahan?: string;
}

/** "Rujukan & atribusi" box shown at the end of every documentation page. */
export function PageSources({ entries }: { entries?: PageSourceEntry[] }) {
  const adapted = entries?.some((entry) => entry.jenis === 'diadaptasi') ?? false;

  return (
    <section aria-labelledby="rujukan-atribusi" className="mt-16 rounded-xl border bg-fd-card p-5 text-sm">
      {entries && entries.length > 0 ? (
        <>
          <h2 id="rujukan-atribusi" className="font-semibold text-fd-foreground">
            Rujukan &amp; atribusi
          </h2>
          <p className="mt-1 leading-6 text-fd-muted-foreground">
            {adapted
              ? 'Sebagian halaman ini diadaptasi dari sumber di bawah (ditandai “Diadaptasi”). Bagian lainnya ditulis oleh tim Stacklore.'
              : 'Penjelasan di halaman ini ditulis oleh tim Stacklore. Sumber berikut dipakai sebagai acuan dan bacaan lanjut.'}
          </p>
          <ul className="mt-4 space-y-3.5">
            {entries.map((entry, index) => {
              const reference = getReference(entry.ref);
              const license = licenses[reference.license];
              const isAdapted = entry.jenis === 'diadaptasi';

              return (
                <li key={`${entry.ref}-${index}`}>
                  <a
                    href={entry.url ?? reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-baseline gap-1 font-medium text-fd-foreground hover:underline"
                  >
                    {entry.judul ? `${reference.title}: ${entry.judul}` : reference.title}
                    <ExternalLink className="size-3 shrink-0 translate-y-px opacity-50" aria-hidden="true" />
                  </a>
                  <span className="text-fd-muted-foreground"> · {reference.author}</span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-px font-medium',
                        isAdapted
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'text-fd-muted-foreground',
                      )}
                    >
                      {isAdapted ? 'Diadaptasi' : 'Rujukan'}
                    </span>
                    <a
                      href={license.url}
                      target="_blank"
                      rel="noopener noreferrer license"
                      className="rounded-full border px-2 py-px text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                    >
                      {reference.license}
                    </a>
                    {reference.licenseNote ? (
                      <span className="text-fd-muted-foreground">({reference.licenseNote})</span>
                    ) : null}
                  </div>
                  {entry.perubahan ? (
                    <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">Perubahan: {entry.perubahan}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <p
        className={cn(
          'flex items-start gap-2 text-xs leading-5 text-fd-muted-foreground',
          entries && entries.length > 0 && 'mt-5 border-t pt-4',
        )}
      >
        <Scale className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Teks halaman ini berlisensi{' '}
          <a
            href={licenses['CC BY-SA 4.0'].url}
            target="_blank"
            rel="noopener noreferrer license"
            className="underline underline-offset-2 hover:text-fd-foreground"
          >
            CC BY-SA 4.0
          </a>
. Contoh kodenya berlisensi{' '}
          <a
            href={licenses['MIT-0'].url}
            target="_blank"
            rel="noopener noreferrer license"
            className="underline underline-offset-2 hover:text-fd-foreground"
          >
            MIT-0
          </a>{' '}
          dan boleh langsung dipakai tanpa mencantumkan sumber.{' '}
          <Link href="/lisensi" className="underline underline-offset-2 hover:text-fd-foreground">
            Selengkapnya tentang lisensi
          </Link>
          .
        </span>
      </p>
    </section>
  );
}
