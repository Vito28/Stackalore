/**
 * Shared types for step-by-step visualizations.
 *
 * Every visualization is driven by a pure "step generator": input data in,
 * a complete list of steps out. Each step is a full snapshot, so moving
 * backwards, resetting or rendering on the server is just picking step i.
 *
 * Files in this folder are plain TypeScript without React, DOM or `@/` path
 * aliases, so `node --test` can run their tests directly.
 */

/** Meaning of a highlight. The same role always has the same color everywhere. */
export type Role = 'aktif' | 'khusus' | 'selesai' | 'dibuang' | 'error';

export interface PseudocodeLine {
  /** Stable id that steps refer to, so the text can change without breaking steps. */
  id: string;
  text: string;
  /** Indentation level, 0 for headers. */
  indent: number;
}

export interface Step<State> {
  state: State;
  /** Element id → role. Elements not listed are drawn normally. */
  highlights: Record<string, Role>;
  /** One Indonesian sentence (or two). Text between backticks is shown as code. */
  caption: string;
  /** Pseudocode line ids that light up during this step. */
  lines: string[];
  /** Short result shown next to the drawing, e.g. "top → 5". */
  result?: string;
  status: 'normal' | 'error';
}
