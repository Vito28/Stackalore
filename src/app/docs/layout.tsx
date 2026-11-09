import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { Sparkles } from 'lucide-react';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { ReadingHistoryTracker } from '@/components/docs/reading-history';
import { LogoMark } from '@/components/site/logo';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { appName, repoUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        title: (
          <>
            <LogoMark />
            <span className="font-semibold tracking-tight">{appName}</span>
          </>
        ),
        url: '/',
      }}
      githubUrl={repoUrl}
      themeSwitch={{ component: <ThemeToggle /> }}
    >
      <ReadingHistoryTracker />
      <AISearch>
        <AISearchPanel />
        <AISearchTrigger
          position="float"
          className="inline-flex w-auto items-center gap-2 rounded-2xl border bg-fd-secondary px-3.5 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Tanya AI
        </AISearchTrigger>
      </AISearch>
      {children}
    </DocsLayout>
  );
}
