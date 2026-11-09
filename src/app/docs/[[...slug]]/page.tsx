import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { Clock3 } from 'lucide-react';
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

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  if (!params.slug || params.slug.length === 0) return <DocsIndex />;

  const page = source.getPage(params.slug);
  if (!page) notFound();

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
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ style: 'clerk' }}
      tableOfContentPopover={{ style: 'clerk' }}
      footer={{ items: { previous, next } }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-wrap items-center gap-2 border-b pb-6 text-xs text-fd-muted-foreground">
        {badge ? (
          <span className="rounded-full border border-fd-primary/25 bg-fd-primary/10 px-2.5 py-0.5 font-medium text-fd-primary">
            {badge}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5">
          <Clock3 className="size-3.5" aria-hidden="true" />± {minutes} menit baca
        </span>
      </div>

      <DocsBody className="docs-prose">
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>

      <PageSources entries={page.data.sumber} />
    </DocsPage>
  );
}

function DocsIndex() {
  return (
    <DocsPage>
      <DocsTitle>Dokumentasi</DocsTitle>
      <DocsDescription>
        Pilih materi yang ingin kamu pelajari. Seri C++ sudah bisa dibaca, sedangkan materi lainnya sedang
        disiapkan.
      </DocsDescription>
      <SubjectGrid />
    </DocsPage>
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
