import type { ComponentType } from 'react';
import { VisualisasiBatasPencarian, VisualisasiPencarian } from './pencarian-visualizer';
import { VisualisasiMergeSort } from './merge-sort-visualizer';
import { VisualisasiPengurutan } from './pengurutan-visualizer';
import { VisualisasiQuickSort } from './quick-sort-visualizer';

/** MDX components for: Algoritma Pencarian, Algoritma Pengurutan, Divide & Conquer. */
export const algoritmaVisualizations: Record<string, ComponentType<any>> = {
  VisualisasiPencarian,
  VisualisasiBatasPencarian,
  VisualisasiPengurutan,
  VisualisasiMergeSort,
  VisualisasiQuickSort,
};
