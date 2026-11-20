import type { ComponentType } from 'react';
import { VisualisasiBFS } from './bfs-visualizer';
import { VisualisasiDFS } from './dfs-visualizer';

/** MDX components for: DFS dan BFS. */
export const graphVisualizations: Record<string, ComponentType<any>> = {
  VisualisasiDFS,
  VisualisasiBFS,
};
