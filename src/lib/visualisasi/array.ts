/**
 * Shared pieces for visualizations drawn as one row of array cells:
 * searching and the sorting algorithms.
 */

/** One array element. `id` stays with the value while it moves, so the view can animate swaps. */
export interface ArrayItem {
  id: string;
  value: number;
}

/** A named index drawn under the row, e.g. `lo`, `mid`, `hi`, `i`, `j`. May be -1 or n (just outside the data). */
export interface Pointer {
  name: string;
  index: number;
}

/** A labelled bracket drawn above cells `from` to `to` (inclusive), e.g. "sudah urut" or "< pivot". */
export interface Bracket {
  id: string;
  from: number;
  to: number;
  label: string;
}

/** Elements with ids `e0`, `e1`, ... by their starting position. */
export function makeItems(values: number[], prefix = 'e'): ArrayItem[] {
  return values.map((value, index) => ({ id: `${prefix}${index}`, value }));
}

export const valuesOf = (items: readonly (ArrayItem | null)[]) => items.map((item) => item?.value ?? null);

/** `[a, b]` → `a b`, the way the lessons write arrays. */
export const formatValues = (values: readonly number[]) => values.join(' ');

/** A preset input the reader can pick, e.g. the lesson example or already-sorted data. */
export interface ArrayCase {
  id: string;
  label: string;
  values: number[];
}

/**
 * Random whole numbers from 1 to `max` for the "Acak" button. Called from a
 * click handler, never during render, so server and client markup match.
 */
export function randomValues(length: number, max = 9, random: () => number = Math.random): number[] {
  return Array.from({ length }, () => 1 + Math.floor(random() * max));
}
