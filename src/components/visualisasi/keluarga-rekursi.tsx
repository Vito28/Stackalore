import type { ComponentType } from 'react';
import { VisualisasiCallStack } from './call-stack-visualizer';
import { VisualisasiFibonacci } from './fibonacci-visualizer';
import { VisualisasiHanoi } from './hanoi-visualizer';

/** MDX components for: Rekursi (call stack faktorial, pohon panggilan Fibonacci, Menara Hanoi). */
export const rekursiVisualizations: Record<string, ComponentType<any>> = {
  VisualisasiCallStack,
  VisualisasiFibonacci,
  VisualisasiHanoi,
};
