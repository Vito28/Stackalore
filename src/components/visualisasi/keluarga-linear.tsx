import type { ComponentType } from 'react';
import { VisualisasiHashTable } from './hash-table-visualizer';
import { VisualisasiLinkedList } from './linked-list-visualizer';
import { VisualisasiQueue } from './queue-visualizer';

/** MDX components for: Queue, Linked List (4 jenis), Hash Table. */
export const linearVisualizations: Record<string, ComponentType<any>> = {
  VisualisasiQueue,
  VisualisasiLinkedList,
  VisualisasiHashTable,
};
