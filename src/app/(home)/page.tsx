import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, Layers, ListChecks } from 'lucide-react';
import { LessonList } from '@/components/docs/lesson-list';
import { SubjectGrid } from '@/components/docs/subject-grid';
import { SearchTrigger } from '@/components/site/search-trigger';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { buttonVariants } from '@/components/ui/button';
import { appName } from '@/lib/shared';

export const metadata: Metadata = {
  title: { absolute: `${appName} — Dokumentasi belajar pemrograman` },
};

const features = [
  {
    icon: Code2,
    title: 'C++ dan Python berdampingan',
    description: 'Setiap contoh kode tersedia dalam dua bahasa. Pilih sekali, semua halaman ikut.',
  },
  {
    icon: Layers,
    title: 'Pendalaman terpisah',
    description: 'Topik panjang seperti buffer dan getline punya halaman sendiri, jadi materi utama tetap ringan.',
  },
  {
    icon: ListChecks,
    title: 'Latihan di setiap materi',
    description: 'Sepuluh soal bertingkat, dari mudah sampai sulit, lengkap dengan petunjuk dan pembahasan.',
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto w-full max-w-5xl px-4 pt-16 pb-16 sm:px-6 md:pt-24 md:pb-20">
            <p className="inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Seri dasar pemrograman C++ sudah tersedia
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-fd-foreground sm:text-5xl">
              Belajar pemrograman dari dasar, satu konsep demi satu konsep.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
              Dokumentasi berbahasa Indonesia untuk C++, kriptografi, machine learning, dan deep learning. Lengkap
              dengan contoh kode, ilustrasi, dan latihan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/docs/cpp" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Mulai belajar C++
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <SearchTrigger size="large" className="sm:w-72" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">Dokumentasi</h2>
          <p className="mt-2 text-fd-muted-foreground">
            Empat topik utama. Mulai dari C++, topik lainnya menyusul.
          </p>
          <SubjectGrid className="mt-8" />
        </section>

        <section className="border-t bg-fd-card/60">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-14 md:py-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">Mulai dari sini</h2>
              <p className="mt-2 leading-7 text-fd-muted-foreground">
                Urutan materi dasar C++. Ikuti sesuai nomor, karena setiap materi memakai konsep dari materi
                sebelumnya.
              </p>
              <ul className="mt-8 space-y-5">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <li key={feature.title} className="flex gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-fd-background text-fd-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-fd-foreground">{feature.title}</p>
                        <p className="mt-0.5 text-sm leading-6 text-fd-muted-foreground">{feature.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <LessonList hideReferences className="my-0 bg-fd-background" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
