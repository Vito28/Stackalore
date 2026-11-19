import type { ComponentProps } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { CodeBlockTabs } from 'fumadocs-ui/components/codeblock';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import { LessonList } from '@/components/docs/lesson-list';
// Shared lesson components, usable in every subject.
import { BackToLesson } from '@/components/mdx/back-to-lesson';
import { ComingSoon } from '@/components/mdx/coming-soon';
import { DeepDive, Term } from '@/components/mdx/deep-dive';
import { Pembahasan, Petunjuk, Soal } from '@/components/mdx/exercise';
import { Flowchart, FlowchartSymbols } from '@/components/mdx/flowchart';
import { Pipeline } from '@/components/mdx/pipeline';
// Subject-specific components live in a folder named after the subject.
import { BufferStepper } from '@/components/mdx/cpp/buffer-stepper';
import { MemoryBoxes } from '@/components/mdx/cpp/memory-boxes';
import { TruthTable } from '@/components/mdx/cpp/truth-table';
import { RunnableCodeBlock } from '@/components/playground/runnable-code-block';

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

/** Code blocks marked by `remarkRunnable` get a "Jalankan" button; others stay static. */
function CodeBlockPre(props: ComponentProps<'pre'> & { 'data-run'?: 'cpp' | 'python'; 'data-input'?: string }) {
  if (props['data-run']) return <RunnableCodeBlock {...props} data-run={props['data-run']} />;
  const DefaultPre = defaultMdxComponents.pre;
  return <DefaultPre {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: CodeBlockPre,
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
