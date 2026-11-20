import type { ComponentType } from 'react';
import { VisualisasiBFS } from './bfs-visualizer';
import { VisualisasiDFS } from './dfs-visualizer';
import { VisualisasiFloodFill } from './flood-fill-visualizer';
import { VisualisasiLabirin } from './labirin-visualizer';

/** MDX components for: DFS dan BFS, including flood fill and the BFS maze. */
export const graphVisualizations: Record<string, ComponentType<any>> = {
  VisualisasiDFS,
  VisualisasiBFS,
  VisualisasiFloodFill,
  VisualisasiLabirin,
};
