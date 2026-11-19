import Link from 'next/link';
import { ArrowRight, Hourglass } from 'lucide-react';

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
