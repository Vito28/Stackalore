/**
 * Shared pieces for visualizations on a character grid (flood fill, BFS on a
 * maze). Lessons read a grid as `r c` followed by rows of `.` (floor) and `#`
 * (wall); other letters such as `S` and `E` are floor with a name.
 */

export interface Grid {
  rows: number;
  cols: number;
  /** One string per row, exactly as in the lesson input. */
  text: string[];
}

/** The four directions in the lessons' order: atas, bawah, kiri, kanan. */
export const DIRECTIONS = [
  { name: 'atas', dr: -1, dc: 0 },
  { name: 'bawah', dr: 1, dc: 0 },
  { name: 'kiri', dr: 0, dc: -1 },
  { name: 'kanan', dr: 0, dc: 1 },
] as const;

export type DirectionName = (typeof DIRECTIONS)[number]['name'];

export const cellId = (r: number, c: number) => `r${r}c${c}`;

/** `(1, 0)`, the way the lessons write a cell. */
export const formatCell = (r: number, c: number) => `(${r}, ${c})`;

export function parseGrid(text: readonly string[]): Grid {
  const cols = text[0]?.length ?? 0;
  if (text.some((row) => row.length !== cols)) throw new Error('Semua baris grid harus sama panjang.');
  return { rows: text.length, cols, text: [...text] };
}

export const inside = (grid: Grid, r: number, c: number) => r >= 0 && r < grid.rows && c >= 0 && c < grid.cols;

export const isWall = (grid: Grid, r: number, c: number) => grid.text[r][c] === '#';

/** Position of the first cell holding `char`, e.g. `S`. */
export function findChar(grid: Grid, char: string): { r: number; c: number } | null {
  for (let r = 0; r < grid.rows; r++) {
    const c = grid.text[r].indexOf(char);
    if (c !== -1) return { r, c };
  }
  return null;
}

/** A preset grid the reader can pick. */
export interface GridCase {
  id: string;
  label: string;
  rows: string[];
}
