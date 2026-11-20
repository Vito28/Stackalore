import { graphVisualizations } from './keluarga-graph';
import { linearVisualizations } from './keluarga-linear';
import { pohonVisualizations } from './keluarga-pohon';
import { rekursiVisualizations } from './keluarga-rekursi';
import { VisualisasiStack } from './stack-visualizer';

/** Every visualization available in MDX. Each family file owns its own components. */
export const visualisasiComponents = {
  VisualisasiStack,
  ...linearVisualizations,
  ...pohonVisualizations,
  ...graphVisualizations,
  ...rekursiVisualizations,
};
