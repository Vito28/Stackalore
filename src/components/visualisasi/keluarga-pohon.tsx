import type { ComponentType } from 'react';
import { VisualisasiBST } from './bst-visualizer';
import { VisualisasiHeap } from './heap-visualizer';
import { VisualisasiTraversal } from './traversal-visualizer';
import { VisualisasiTrie } from './trie-visualizer';

/** MDX components for: Binary tree traversal, BST, Heap/Priority Queue, Trie. */
export const pohonVisualizations: Record<string, ComponentType<any>> = {
  VisualisasiTraversal,
  VisualisasiBST,
  VisualisasiHeap,
  VisualisasiTrie,
};
