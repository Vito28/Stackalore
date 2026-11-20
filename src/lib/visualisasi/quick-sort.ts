import { formatValues, makeItems, type ArrayCase, type ArrayItem, type Bracket, type Pointer } from './array.ts';
import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Quick sort with Lomuto partition from the Divide & Conquer lesson. Each
 * call picks the rightmost element as pivot, scans `j` from left to right
 * (one step per element, swapping smaller ones to the front at `i`), then puts
 * the pivot in its final place. Ranges of one element are a step of their
 * own; empty ranges return straight away and get no step.
 */

export interface QuickState {
  /** The whole array, sorted in place. */
  items: ArrayItem[];
  /** Range of the call this step belongs to. */
  range: { kiri: number; kanan: number } | null;
  pointers: Pointer[];
  /** `< pivot` over `kiri..i-1` and `≥ pivot` over `i..j` while partitioning. */
  brackets: Bracket[];
  /** Item ids already in their final position. */
  final: string[];
  comparisons: number;
  /** Calls still running, outermost first, e.g. `quickSort(0, 6)`. */
  stack: string[];
  maxDepth: number;
}

export type QuickStep = Step<QuickState>;

export const lessonQuickData = [6, 3, 8, 1, 9, 2, 5];

export const quickCases: ArrayCase[] = [
  { id: 'materi', label: 'Contoh materi', values: lessonQuickData },
  { id: 'urut', label: 'Sudah urut (terburuk)', values: [1, 2, 3, 4, 5, 6, 7] },
  { id: 'terbalik', label: 'Terbalik', values: [7, 6, 5, 4, 3, 2, 1] },
  { id: 'kembar', label: 'Banyak kembar', values: [4, 2, 4, 1, 4, 3, 4] },
];

/** Size of the "Acak" data, the same as the lesson example. */
export const QUICK_RANDOM_LENGTH = 7;

export const quickPseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'quickSort(kiri, kanan):', indent: 0 },
  { id: 'dasar', text: 'jika kiri >= kanan → selesai', indent: 1 },
  { id: 'partisi', text: 'p = partisi(kiri, kanan)', indent: 1 },
  { id: 'kiri', text: 'quickSort(kiri, p - 1)', indent: 1 },
  { id: 'kanan', text: 'quickSort(p + 1, kanan)', indent: 1 },
  { id: 'partisiFungsi', text: 'partisi(kiri, kanan):', indent: 0 },
  { id: 'pivot', text: 'pivot = a[kanan], i = kiri', indent: 1 },
  { id: 'ulang', text: 'untuk j = kiri .. kanan - 1:', indent: 1 },
  { id: 'cek', text: 'jika a[j] < pivot:', indent: 2 },
  { id: 'tukar', text: 'tukar a[i], a[j]; i++', indent: 3 },
  { id: 'tukarPivot', text: 'tukar a[i], a[kanan]', indent: 1 },
  { id: 'hasil', text: 'kembalikan i', indent: 1 },
];

/** Comparisons `a[j] < pivot` made by the lesson's quick sort, for checking. */
export function countQuickComparisons(values: readonly number[]): number {
  const a = [...values];
  let comparisons = 0;
  const sort = (kiri: number, kanan: number) => {
    if (kiri >= kanan) return;
    const pivot = a[kanan];
    let i = kiri;
    for (let j = kiri; j < kanan; j++) {
      comparisons++;
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
      }
    }
    [a[i], a[kanan]] = [a[kanan], a[i]];
    sort(kiri, i - 1);
    sort(i + 1, kanan);
  };
  sort(0, a.length - 1);
  return comparisons;
}

const valuesIn = (items: ArrayItem[], from: number, to: number) => formatValues(items.slice(from, to + 1).map((item) => item.value));

export function quickSortSteps(values: number[]): QuickStep[] {
  const n = values.length;
  const items = makeItems(values);
  const steps: QuickStep[] = [];
  const final = new Set<string>();
  const stack: string[] = [];
  let comparisons = 0;
  let maxDepth = 0;

  const snapshot = (range: QuickState['range'], pointers: Pointer[], brackets: Bracket[]): QuickState => ({
    items: [...items],
    range,
    pointers,
    brackets,
    final: [...final],
    comparisons,
    stack: [...stack],
    maxDepth,
  });
  const highlights = (extra: [string, Role][] = []) => {
    const result: Record<string, Role> = {};
    for (const id of final) result[id] = 'selesai';
    for (const [id, role] of extra) result[id] = role;
    return result;
  };
  const zones = (kiri: number, i: number, j: number, pivot: number): Bracket[] => [
    { id: 'kecil', from: kiri, to: i - 1, label: `< ${pivot}` },
    { id: 'besar', from: i, to: j, label: `≥ ${pivot}` },
  ];

  steps.push({
    state: snapshot(null, [], []),
    highlights: {},
    caption:
      n > 1
        ? `Mulai \`quickSort(0, ${n - 1})\` pada data \`${formatValues(values)}\`. Setiap panggilan memilih pivot, menyusun yang lebih kecil ke kiri pivot, lalu mengurutkan kedua sisinya.`
        : `Data hanya berisi ${n} elemen, jadi sudah urut.`,
    lines: ['fungsi'],
    status: 'normal',
  });

  const sort = (kiri: number, kanan: number) => {
    const call = `quickSort(${kiri}, ${kanan})`;
    stack.push(call);
    maxDepth = Math.max(maxDepth, stack.length);
    const range = { kiri, kanan };

    if (kiri > kanan) {
      stack.pop();
      return;
    }
    if (kiri === kanan) {
      final.add(items[kiri].id);
      steps.push({
        state: snapshot(range, [], []),
        highlights: highlights(),
        caption: `\`${call}\`: rentangnya hanya 1 elemen, jadi sudah urut (kasus dasar). ${items[kiri].value} sudah di posisi akhirnya.`,
        lines: ['fungsi', 'dasar'],
        status: 'normal',
      });
      stack.pop();
      return;
    }

    const pivotItem = items[kanan];
    const pivot = pivotItem.value;
    let i = kiri;
    steps.push({
      state: snapshot(
        range,
        [
          { name: 'i', index: i },
          { name: 'pivot', index: kanan },
        ],
        [],
      ),
      highlights: highlights([[pivotItem.id, 'khusus']]),
      caption: `\`${call}\` mempartisi \`${valuesIn(items, kiri, kanan)}\`. Pivot adalah elemen paling kanan, \`a[${kanan}] = ${pivot}\`, dan \`i = ${kiri}\` karena belum ada elemen yang dipastikan lebih kecil dari pivot.`,
      lines: ['partisi', 'pivot'],
      status: 'normal',
    });

    for (let j = kiri; j < kanan; j++) {
      comparisons++;
      const checked = items[j];
      let caption: string;
      let lines: string[];
      if (checked.value < pivot) {
        const from = i;
        if (from === j) {
          caption = `\`j = ${j}\`: \`a[${j}] = ${checked.value} < ${pivot}\`. Karena \`i\` dan \`j\` sama-sama ${j}, menukar \`a[${i}]\` dengan dirinya sendiri tidak memindahkan apa pun. \`i\` maju ke ${i + 1}.`;
        } else {
          const other = items[from];
          [items[from], items[j]] = [items[j], items[from]];
          caption = `\`j = ${j}\`: \`a[${j}] = ${checked.value} < ${pivot}\`, jadi tukar \`a[${from}]\` dan \`a[${j}]\` (${checked.value} ke depan, ${other.value} ke belakang). \`i\` maju ke ${from + 1}.`;
        }
        i++;
        lines = ['ulang', 'cek', 'tukar'];
      } else {
        caption = `\`j = ${j}\`: \`a[${j}] = ${checked.value}\` tidak lebih kecil dari ${pivot}, jadi dibiarkan di tempatnya.`;
        lines = ['ulang', 'cek'];
      }
      steps.push({
        state: snapshot(
          range,
          [
            { name: 'i', index: i },
            { name: 'j', index: j },
            { name: 'pivot', index: kanan },
          ],
          zones(kiri, i, j, pivot),
        ),
        highlights: highlights([
          [pivotItem.id, 'khusus'],
          [checked.id, 'aktif'],
        ]),
        caption,
        lines,
        status: 'normal',
      });
    }

    // The pivot goes between the two zones, which is its final position.
    [items[i], items[kanan]] = [items[kanan], items[i]];
    final.add(pivotItem.id);
    const p = i;
    const left = p > kiri ? `kirinya \`${valuesIn(items, kiri, p - 1)}\` semuanya lebih kecil` : 'kirinya kosong';
    const right = p < kanan ? `kanannya \`${valuesIn(items, p + 1, kanan)}\` tidak ada yang lebih kecil` : 'kanannya kosong';
    const move = p === kanan ? `Pivot ${pivot} sudah berada di \`a[${p}]\`, jadi tidak perlu dipindah.` : `Tukar pivot ke \`a[${p}]\`.`;
    steps.push({
      state: snapshot(range, [{ name: 'i', index: p }], [
        { id: 'kecil', from: kiri, to: p - 1, label: `< ${pivot}` },
        { id: 'besar', from: p + 1, to: kanan, label: `≥ ${pivot}` },
      ]),
      highlights: highlights(),
      caption: `${move} ${pivot} kini di posisi akhirnya: ${left}, ${right}. Kedua sisi diurutkan dengan rekursi.`,
      lines: ['tukarPivot', 'hasil'],
      result: `p = ${p}`,
      status: 'normal',
    });

    sort(kiri, p - 1);
    sort(p + 1, kanan);
    stack.pop();
  };

  if (n > 0) sort(0, n - 1);

  if (n > 1) {
    const done: Record<string, Role> = {};
    for (const item of items) done[item.id] = 'selesai';
    const worst = comparisons === (n * (n - 1)) / 2;
    const note = worst
      ? ` Ini kasus terburuk: pivot selalu jatuh di ujung, jadi setiap partisi hanya mengurangi rentang satu elemen dan perbandingannya ${n - 1} + ${n - 2} + ... + 1.`
      : '';
    steps.push({
      state: snapshot(null, [], []),
      highlights: done,
      caption: `Selesai! Data sudah urut: \`${valuesIn(items, 0, n - 1)}\`, dengan ${comparisons} perbandingan dan rekursi paling dalam ${maxDepth} panggilan.${note}`,
      lines: [],
      result: valuesIn(items, 0, n - 1),
      status: 'normal',
    });
  }

  return steps;
}
