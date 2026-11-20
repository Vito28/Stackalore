import type { ComponentType } from 'react';
import { VisualisasiCallStack } from './call-stack-visualizer';
import { VisualisasiFibonacci } from './fibonacci-visualizer';
import { VisualisasiHanoi } from './hanoi-visualizer';
import { VisualisasiMemoisasi } from './memoisasi-visualizer';

/** MDX components for: Rekursi (call stack faktorial, pohon panggilan Fibonacci, Menara Hanoi) and the Memoisasi deep dive. */
export const rekursiVisualizations: Record<string, ComponentType<any>> = {
  VisualisasiCallStack,
  VisualisasiFibonacci,
  VisualisasiHanoi,
  VisualisasiMemoisasi,
};
