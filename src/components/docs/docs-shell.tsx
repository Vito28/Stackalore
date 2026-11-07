'use client';

import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { BookOpenIcon, MessageCircleIcon } from 'lucide-react';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { cn } from '@/lib/cn';
import { baseOptions } from '@/lib/layout.shared';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import {
  docsDomains,
  DomainSidebarBanner,
  DomainSidebarFooter,
  DomainSidebarItem,
  DomainSidebarSeparator,
  type DocsDomainSlug,
} from '@/components/docs/domain-sidebar';

interface DocsShellProps {
  children: ReactNode;
  tree: ComponentProps<typeof DocsLayout>['tree'];
}

export function DocsShell({ children, tree }: DocsShellProps) {
  const pathname = usePathname();
  const isHub = pathname === '/docs' || pathname === '/docs/';
  const domainSlug = pathname.split('/')[2];
  const activeDomain = domainSlug in docsDomains
    ? (domainSlug as DocsDomainSlug)
    : undefined;
  const activeNode = tree.children.find(
    (node) =>
      node.type === 'folder' &&
      (node.$ref?.folder === domainSlug ||
        node.children.some(
          (child) =>
            child.type === 'page' &&
            child.url === `/docs/${domainSlug}`,
        )),
  );
  const activeFolder = activeNode?.type === 'folder' ? activeNode : undefined;
  const folderPages = activeFolder
    ? [
        ...(activeFolder.index ? [activeFolder.index] : []),
        ...activeFolder.children,
      ].filter(
        (node, index, nodes) =>
          node.type !== 'page' ||
          nodes.findIndex(
            (candidate) =>
              candidate.type === 'page' && candidate.url === node.url,
          ) === index,
      )
    : tree.children;
  const normalizedFolderPages = folderPages.map((node) =>
    node.type === 'page' && node.url === `/docs/${domainSlug}`
      ? { ...node, name: 'Overview' }
      : node,
  );
  const overviewChildren = [
    normalizedFolderPages.find(
      (node) =>
        node.type === 'page' &&
        node.url === '/docs/data-structures/welcome',
    ),
    normalizedFolderPages.find(
      (node) =>
        node.type === 'page' &&
        node.url === '/docs/data-structures/learning-path',
    ),
  ].filter((node) => node !== undefined);
  const groupedFolderPages =
    activeDomain === 'data-structures' &&
    overviewChildren.length > 0
      ? [
          {
            $id: 'data-structures-overview',
            type: 'folder' as const,
            name: 'Overview',
            icon: <BookOpenIcon />,
            defaultOpen: true,
            collapsible: true,
            children: overviewChildren,
          },
          ...normalizedFolderPages.filter(
            (node) =>
              node.type !== 'page' ||
              ![
                '/docs/data-structures',
                '/docs/data-structures/welcome',
                '/docs/data-structures/learning-path',
              ].includes(node.url),
          ),
        ]
      : normalizedFolderPages;
  const scopedTree = activeFolder
    ? {
        ...tree,
        name: activeFolder.name,
        children: groupedFolderPages,
      }
    : tree;
  const materialCount = normalizedFolderPages.filter(
    (node) =>
      node.type === 'page' &&
      (activeDomain !== 'data-structures' ||
        node.url !== `/docs/${domainSlug}`),
  ).length;
  const options = baseOptions();
  const navOnlyLinks = options.links?.map((link) => ({
    ...link,
    on: 'nav' as const,
  }));

  if (isHub) {
    return <HomeLayout {...options}>{children}</HomeLayout>;
  }

  return (
    <DocsLayout
      tree={scopedTree}
      {...options}
      links={navOnlyLinks}
      containerProps={
        activeDomain
          ? {
              className: `docs-domain-${activeDomain}`,
              style: {
                '--color-fd-primary': docsDomains[activeDomain].accent,
                '--color-fd-ring': docsDomains[activeDomain].accent,
              } as CSSProperties,
            }
          : undefined
      }
      sidebar={
        activeDomain
          ? {
              className: 'docs-domain-sidebar md:layout:[--fd-sidebar-width:304px]',
              collapsible: true,
              defaultOpenLevel: 2,
              banner: (
                <DomainSidebarBanner
                  domain={activeDomain}
                  materialCount={materialCount}
                />
              ),
              footer: <DomainSidebarFooter domain={activeDomain} />,
              components: {
                Item: (props) => (
                  <DomainSidebarItem {...props} domain={activeDomain} />
                ),
                Separator: DomainSidebarSeparator,
              },
            }
          : undefined
      }
    >
      <AISearch>
        <AISearchPanel />
        <AISearchTrigger
          position="float"
          className={cn(
            buttonVariants({
              variant: 'secondary',
              className: 'rounded-2xl text-fd-muted-foreground',
            }),
          )}
        >
          <MessageCircleIcon className="size-4.5" />
          Ask AI
        </AISearchTrigger>
      </AISearch>
      {children}
    </DocsLayout>
  );
}
