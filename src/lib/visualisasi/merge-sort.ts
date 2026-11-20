import { formatValues, makeItems, type ArrayCase, type ArrayItem } from './array.ts';
import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Merge sort from the Divide & Conquer lesson, drawn as a grid with one
 * column per index and one row per recursion depth. A range at depth d sits
 * in row d over its own columns. Dividing moves the range's elements down
 * into its two halves; merging takes one element per step from the front of
 * the halves back up into the range. Every element is on screen exactly once,
 * so the view can animate it flying down and back up.
 */

export interface MergeSegment {
  /** `s<kiri>-<kanan>`. */
  id: string;
  kiri: number;
  kanan: number;
  depth: number;
  /** One cell per index kiri..kanan; null is an empty slot. */
  cells: (ArrayItem | null)[];
}

export interface MergeHead {
  /** `i` for the left half, `j` for the right half, as in the lesson's `gabung`. */
  name: 'i' | 'j';
  /** Item id at the front of that half. */
  id: string;
}

export interface MergeState {
  /** Sorted by depth, then by `kiri`. */
  segments: MergeSegment[];
  n: number;
  /** Rows the drawing needs for this input, the same in every step. */
  rows: number;
  /** The call this step belongs to, e.g. `mergeSort(0, 3)` or `gabung(0, 1, 3)`. */
  call: string | null;
  /** Fronts of the two halves while merging. */
  heads: MergeHead[];
  comparisons: number;
}

export type MergeStep = Step<MergeState>;

export const lessonMergeData = [7, 2, 9, 4, 3, 8, 6, 1];

export const mergeCases: ArrayCase[] = [
  { id: 'materi', label: 'Contoh materi', values: lessonMergeData },
  { id: 'urut', label: 'Sudah urut', values: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 'terbalik', label: 'Terbalik', values: [8, 7, 6, 5, 4, 3, 2, 1] },
  { id: 'ganjil', label: 'Jumlah ganjil', values: [5, 1, 4, 2, 3] },
];

/** Size of the "Acak" data, the same as the lesson example. */
export const MERGE_RANDOM_LENGTH = 8;

export const mergePseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'mergeSort(kiri, kanan):', indent: 0 },
  { id: 'dasar', text: 'jika kiri >= kanan → selesai', indent: 1 },
  { id: 'tengah', text: 'tengah = kiri + (kanan-kiri)/2', indent: 1 },
  { id: 'kiri', text: 'mergeSort(kiri, tengah)', indent: 1 },
  { id: 'kanan', text: 'mergeSort(tengah + 1, kanan)', indent: 1 },
  { id: 'gabung', text: 'gabung(kiri, tengah, kanan)', indent: 1 },
  { id: 'gabungFungsi', text: 'gabung(kiri, tengah, kanan):', indent: 0 },
  { id: 'ulang', text: 'selama kedua bagian berisi:', indent: 1 },
  { id: 'cek', text: 'jika a[i] <= a[j]:', indent: 2 },
  { id: 'ambilI', text: 'ambil a[i], i++', indent: 3 },
  { id: 'lain', text: 'selain itu:', indent: 2 },
  { id: 'ambilJ', text: 'ambil a[j], j++', indent: 3 },
  { id: 'sisa', text: 'salin sisa yang belum habis', indent: 1 },
];

export const segmentId = (kiri: number, kanan: number) => `s${kiri}-${kanan}`;

/** Depth of the deepest call that still has to be drawn (a range of one element). */
function deepest(kiri: number, kanan: number, depth: number): number {
  if (kiri >= kanan) return depth;
  const tengah = kiri + Math.floor((kanan - kiri) / 2);
  return Math.max(deepest(kiri, tengah, depth + 1), deepest(tengah + 1, kanan, depth + 1));
}

/** Comparisons `a[i] <= a[j]` made by the lesson's merge sort, for checking. */
export function countMergeComparisons(values: readonly number[]): number {
  const a = [...values];
  let comparisons = 0;
  const sort = (kiri: number, kanan: number) => {
    if (kiri >= kanan) return;
    const tengah = kiri + Math.floor((kanan - kiri) / 2);
    sort(kiri, tengah);
    sort(tengah + 1, kanan);
    const merged: number[] = [];
    let i = kiri;
    let j = tengah + 1;
    while (i <= tengah && j <= kanan) {
      comparisons++;
      if (a[i] <= a[j]) merged.push(a[i++]);
      else merged.push(a[j++]);
    }
    while (i <= tengah) merged.push(a[i++]);
    while (j <= kanan) merged.push(a[j++]);
    merged.forEach((value, t) => (a[kiri + t] = value));
  };
  sort(0, a.length - 1);
  return comparisons;
}

const range = (kiri: number, kanan: number) => `[${kiri}, ${kanan}]`;
const cellValues = (segment: MergeSegment) => formatValues(segment.cells.filter((cell): cell is ArrayItem => cell !== null).map((cell) => cell.value));

export function mergeSortSteps(values: number[]): MergeStep[] {
  const n = values.length;
  const items = makeItems(values);
  const steps: MergeStep[] = [];
  const rows = n === 0 ? 1 : deepest(0, n - 1, 0) + 1;
  const segments = new Map<string, MergeSegment>();
  let comparisons = 0;

  const top: MergeSegment = { id: segmentId(0, n - 1), kiri: 0, kanan: n - 1, depth: 0, cells: [...items] };
  segments.set(top.id, top);

  const snapshot = (call: string | null, heads: MergeHead[]): MergeState => ({
    segments: [...segments.values()]
      .map((segment) => ({ ...segment, cells: [...segment.cells] }))
      .sort((a, b) => a.depth - b.depth || a.kiri - b.kiri),
    n,
    rows,
    call,
    heads,
    comparisons,
  });

  steps.push({
    state: snapshot(null, []),
    highlights: {},
    caption:
      n > 1
        ? `Mulai \`mergeSort(0, ${n - 1})\` pada data \`${formatValues(values)}\`. Setiap rentang dibagi dua sampai tinggal 1 elemen, lalu digabung kembali dengan urut.`
        : `Data hanya berisi ${n} elemen, jadi sudah urut tanpa perlu dibagi.`,
    lines: ['fungsi'],
    status: 'normal',
  });

  const sort = (kiri: number, kanan: number, depth: number) => {
    if (kiri >= kanan) return;
    const parent = segments.get(segmentId(kiri, kanan))!;
    const tengah = kiri + Math.floor((kanan - kiri) / 2);
    const left: MergeSegment = {
      id: segmentId(kiri, tengah),
      kiri,
      kanan: tengah,
      depth: depth + 1,
      cells: parent.cells.slice(0, tengah - kiri + 1),
    };
    const right: MergeSegment = {
      id: segmentId(tengah + 1, kanan),
      kiri: tengah + 1,
      kanan,
      depth: depth + 1,
      cells: parent.cells.slice(tengah - kiri + 1),
    };
    parent.cells = parent.cells.map(() => null);
    segments.set(left.id, left);
    segments.set(right.id, right);

    const singles = [left, right].filter((half) => half.kiri === half.kanan);
    let base = '';
    if (singles.length === 2) base = ' Kedua bagian tinggal 1 elemen, jadi sudah pasti urut (kasus dasar).';
    else if (singles.length === 1) base = ` Bagian \`${range(singles[0].kiri, singles[0].kanan)}\` tinggal 1 elemen, jadi sudah pasti urut (kasus dasar).`;
    steps.push({
      state: snapshot(`mergeSort(${kiri}, ${kanan})`, []),
      highlights: { [parent.id]: 'aktif' },
      caption: `\`mergeSort(${kiri}, ${kanan})\`: \`tengah = ${kiri} + (${kanan} - ${kiri}) / 2 = ${tengah}\`. Bagi menjadi \`${range(kiri, tengah)}\` berisi \`${cellValues(left)}\` dan \`${range(tengah + 1, kanan)}\` berisi \`${cellValues(right)}\`.${base}`,
      lines: singles.length > 0 ? ['tengah', 'dasar'] : ['tengah'],
      status: 'normal',
    });

    sort(kiri, tengah, depth + 1);
    sort(tengah + 1, kanan, depth + 1);

    // gabung: take from the fronts of both halves into the parent's slots.
    const call = `gabung(${kiri}, ${tengah}, ${kanan})`;
    const front = (half: MergeSegment) => half.cells.findIndex((cell) => cell !== null);
    let first = true;
    for (let slot = 0; slot < parent.cells.length; slot++) {
      const i = front(left);
      const j = front(right);
      const a = i === -1 ? null : left.cells[i];
      const b = j === -1 ? null : right.cells[j];
      const highlights: Record<string, Role> = { [parent.id]: 'aktif' };
      let taken: ArrayItem;
      let caption: string;
      let lines: string[];
      const intro = first ? `Kedua bagian sudah urut, sekarang \`${call}\`. ` : '';

      if (a && b) {
        comparisons++;
        if (a.value <= b.value) {
          taken = a;
          left.cells[i] = null;
          highlights[b.id] = 'khusus';
          caption =
            a.value === b.value
              ? `${intro}Bandingkan \`a[i] = ${a.value}\` dan \`a[j] = ${b.value}\`: sama besar, dan karena syaratnya \`<=\`, ambil yang kiri dulu supaya urutan aslinya terjaga.`
              : `${intro}Bandingkan \`a[i] = ${a.value}\` dan \`a[j] = ${b.value}\`: ${a.value} lebih kecil, jadi ambil ${a.value} dan majukan \`i\`.`;
          lines = ['ulang', 'cek', 'ambilI'];
        } else {
          taken = b;
          right.cells[j] = null;
          highlights[a.id] = 'khusus';
          caption = `${intro}Bandingkan \`a[i] = ${a.value}\` dan \`a[j] = ${b.value}\`: ${b.value} lebih kecil, jadi ambil ${b.value} dan majukan \`j\`.`;
          lines = ['ulang', 'lain', 'ambilJ'];
        }
      } else {
        const fromLeft = a !== null;
        taken = (fromLeft ? a : b)!;
        if (fromLeft) left.cells[i] = null;
        else right.cells[j] = null;
        const emptySide = fromLeft ? 'kanan' : 'kiri';
        caption = `${intro}Bagian ${emptySide} sudah habis, jadi sisa bagian ${fromLeft ? 'kiri' : 'kanan'} tinggal disalin tanpa dibandingkan: ambil ${taken.value}.`;
        lines = ['sisa'];
      }
      first = false;
      parent.cells[slot] = taken;
      highlights[taken.id] = 'aktif';

      const done = slot === parent.cells.length - 1;
      if (done) {
        segments.delete(left.id);
        segments.delete(right.id);
        caption += ` Rentang \`${range(kiri, kanan)}\` sekarang urut: \`${cellValues(parent)}\`.`;
      }
      const heads: MergeHead[] = [];
      const nextI = front(left);
      const nextJ = front(right);
      if (!done && nextI !== -1) heads.push({ name: 'i', id: left.cells[nextI]!.id });
      if (!done && nextJ !== -1) heads.push({ name: 'j', id: right.cells[nextJ]!.id });

      steps.push({
        state: snapshot(call, heads),
        highlights,
        caption,
        lines,
        result: `ambil ${taken.value}`,
        status: 'normal',
      });
    }
  };

  sort(0, n - 1, 0);

  if (n > 1) {
    const done: Record<string, Role> = {};
    for (const item of items) done[item.id] = 'selesai';
    const sorted = [...values].sort((a, b) => a - b);
    const levels =
      (n & (n - 1)) === 0
        ? `Ada ${rows - 1} tingkat pembagian, dan di setiap tingkat semua ${n} elemen dipindah tepat sekali.`
        : `Ada ${rows - 1} tingkat pembagian. Karena ${n} tidak bisa dibagi dua sama rata terus, bagian kirinya selalu kebagian satu elemen lebih banyak.`;
    steps.push({
      state: snapshot(null, []),
      highlights: done,
      caption: `Selesai! Data sudah urut: \`${formatValues(sorted)}\`, dengan total ${comparisons} perbandingan. ${levels}`,
      lines: [],
      result: formatValues(sorted),
      status: 'normal',
    });
  }

  return steps;
}
