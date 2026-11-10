import type { ComponentProps } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { CodeBlockTabs } from 'fumadocs-ui/components/codeblock';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import { LessonList } from '@/components/docs/lesson-list';
import { BackToLesson } from '@/components/mdx/back-to-lesson';
import { BufferStepper } from '@/components/mdx/buffer-stepper';
import { DeepDive, Term } from '@/components/mdx/deep-dive';
import { ComingSoon, MemoryBoxes, Pipeline, TruthTable } from '@/components/mdx/diagrams';
import { Pembahasan, Petunjuk, Soal } from '@/components/mdx/exercise';
import { Flowchart, FlowchartSymbols } from '@/components/mdx/flowchart';

const languageTabs = new Set(['C++', 'Python']);

/**
 * Code blocks written with `tab="C++"` / `tab="Python"` share one selection:
 * picking Python once switches every code group on every page, and the choice
 * is remembered between visits.
 */
function LanguageCodeTabs(props: ComponentProps<typeof CodeBlockTabs>) {
  const synced = typeof props.defaultValue === 'string' && languageTabs.has(props.defaultValue);
  return <CodeBlockTabs {...(synced ? { groupId: 'stacklore-bahasa', persist: true } : {})} {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    CodeBlockTabs: LanguageCodeTabs,
    Accordion,
    Accordions,
    Tab,
    Tabs,
    BackToLesson,
    BufferStepper,
    ComingSoon,
    DeepDive,
    Flowchart,
    FlowchartSymbols,
    LessonList,
    MemoryBoxes,
    Pembahasan,
    Petunjuk,
    Pipeline,
    Soal,
    Term,
    TruthTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
