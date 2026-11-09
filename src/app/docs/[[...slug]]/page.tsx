import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { Clock3 } from 'lucide-react';
import { TocRegistrar } from '@/components/docs/docs-context';
import { PageNav } from '@/components/docs/page-nav';
import { PageSources } from '@/components/docs/page-sources';
import { SubjectGrid } from '@/components/docs/subject-grid';
import { getMDXComponents } from '@/components/mdx';
import {
  findSubjectFolder,
  formatLessonNumber,
  getNeighbours,
  getSubjectEntries,
} from '@/lib/docs-tree';
import { getPageImage, source } from '@/lib/source';
import { getSubject } from '@/lib/subjects';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  if (!params.slug || params.slug.length === 0) return <DocsIndex />;

  const page = source.getPage(params.slug);
  if (!page) notFound();

  const subject = getSubject(params.slug[0]);
  const folder = findSubjectFolder(source.getPageTree(), params.slug[0]);
  const entries = folder ? getSubjectEntries(folder) : [];
  const { current, previous, next } = getNeighbours(entries, page.url);
  const minutes = estimateReadingMinutes(await page.data.getText('processed'));
  const MDX = page.data.body;

  const badge =
    current?.kind === 'lesson' && current.number
      ? `Materi ${formatLessonNumber(current.number)}`
      : current?.kind === 'reference'
        ? current.section
        : current?.kind === 'intro'
          ? 'Pengantar'
          : null;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 sm:px-6 md:pt-12 lg:px-8">
      <TocRegistrar toc={page.data.toc} />

      <header className="border-b pb-7">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-fd-muted-foreground">
          <span>{subject?.name ?? 'Dokumentasi'}</span>
          {current?.section ? (
            <>
              <span aria-hidden="true">/</span>
              <span>{current.section}</span>
            </>
          ) : null}
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight text-balance text-fd-foreground sm:text-4xl">
          {page.data.title}
        </h1>
        {page.data.description ? (
          <p className="mt-3 text-lg leading-8 text-fd-muted-foreground">{page.data.description}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-fd-muted-foreground">
          {badge ? (
            <span className="rounded-full border border-fd-primary/25 bg-fd-primary/10 px-2.5 py-0.5 font-medium text-fd-primary">
              {badge}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5">
            <Clock3 className="size-3.5" aria-hidden="true" />± {minutes} menit baca
          </span>
        </div>
      </header>

      <div className="prose docs-prose mt-8 max-w-none">
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </div>

      <PageSources entries={page.data.sumber} />

      <PageNav
        previous={previous}
        next={next}
        showUpcoming={current?.kind === 'lesson' && !next && subject?.status === 'available'}
      />
    </article>
  );
}

function DocsIndex() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 sm:px-6 md:pt-12 lg:px-8">
      <header className="border-b pb-7">
        <h1 className="text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">Dokumentasi</h1>
        <p className="mt-3 text-lg leading-8 text-fd-muted-foreground">
          Pilih materi yang ingin kamu pelajari. Seri C++ sudah bisa dibaca, sedangkan materi lainnya sedang disiapkan.
        </p>
      </header>
      <SubjectGrid className="mt-8" />
    </div>
  );
}

function estimateReadingMinutes(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateStaticParams() {
  return [{ slug: [] }, ...source.generateParams()];
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  if (!params.slug || params.slug.length === 0) {
    return {
      title: 'Dokumentasi',
      description: 'Dokumentasi C++, kriptografi, machine learning, dan deep learning dalam bahasa Indonesia.',
    };
  }

  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
