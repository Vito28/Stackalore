import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import {
  AlgorithmLearningDemo,
  BigPicture,
  DataStructureMap,
  DependencyExplorer,
  DependencyNotes,
  LanguageBridge,
  LearningPathCTA,
  LearningPathHero,
  LearningRoadmap,
} from '@/components/learning/learning-path/learning-path-components';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    AlgorithmLearningDemo,
    BigPicture,
    DataStructureMap,
    DependencyExplorer,
    DependencyNotes,
    LanguageBridge,
    LearningPathCTA,
    LearningPathHero,
    LearningRoadmap,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
