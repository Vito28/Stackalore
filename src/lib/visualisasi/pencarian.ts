import { makeItems, type ArrayItem, type Pointer } from './array.ts';
import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Searching from the Algoritma Pencarian lesson: linear search, binary search
 * (including what goes wrong on unsorted data), and the lower/upper bound
 * variants. Binary search gets two steps per round: pick `mid`, then decide
 * which half to cross out, so the reader sees the comparison before the cut.
 */

export type MetodeCari = 'linear' | 'biner';

export interface CariState {
  items: ArrayItem[];
  x: number;
  pointers: Pointer[];
  /** Elements compared with `x` so far. */
  checks: number;
}

export type CariStep = Step<CariState>;

export const lessonCariData = [5, 12, 18, 23, 31, 40, 47, 56, 64, 78];

/** The lesson's warning example: binary search on unsorted data. */
export const unsortedCariData = [8, 3, 9, 1, 5];

export interface CariCase {
  id: string;
  label: string;
  values: number[];
  x: number;
}

export const cariCases: CariCase[] = [
  { id: 'ada', label: 'cari 47 (ada)', values: lessonCariData, x: 47 },
  { id: 'tidak-ada', label: 'cari 20 (tidak ada)', values: lessonCariData, x: 20 },
  { id: 'paling-kiri', label: 'cari 5 (paling depan)', values: lessonCariData, x: 5 },
  { id: 'paling-kanan', label: 'cari 78 (paling belakang)', values: lessonCariData, x: 78 },
  { id: 'tidak-urut', label: 'data tidak urut', values: unsortedCariData, x: 3 },
];

export const linearPseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'cariLinear(data, x):', indent: 0 },
  { id: 'ulang', text: 'untuk i = 0 .. n - 1:', indent: 1 },
  { id: 'cek', text: 'jika data[i] == x:', indent: 2 },
  { id: 'ketemu', text: 'kembalikan i', indent: 3 },
  { id: 'gagal', text: 'kembalikan -1', indent: 1 },
];

export const binerPseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'cariBiner(data, x):', indent: 0 },
  { id: 'awal', text: 'lo = 0, hi = n - 1', indent: 1 },
  { id: 'ulang', text: 'selama lo <= hi:', indent: 1 },
  { id: 'mid', text: 'mid = lo + (hi - lo) / 2', indent: 2 },
  { id: 'sama', text: 'jika data[mid] == x:', indent: 2 },
  { id: 'ketemu', text: 'kembalikan mid', indent: 3 },
  { id: 'kurang', text: 'jika data[mid] < x:', indent: 2 },
  { id: 'geserLo', text: 'lo = mid + 1', indent: 3 },
  { id: 'lebih', text: 'selain itu:', indent: 2 },
  { id: 'geserHi', text: 'hi = mid - 1', indent: 3 },
  { id: 'gagal', text: 'kembalikan -1', indent: 1 },
];

export const isSorted = (values: readonly number[]) => values.every((value, index) => index === 0 || values[index - 1] <= value);

/** "indeks 3" or "indeks 0 sampai 4". */
const indexRange = (from: number, to: number) => (from === to ? `indeks ${from}` : `indeks ${from} sampai ${to}`);

/** Every index outside `lo..hi` is crossed out. */
function crossedOut(items: ArrayItem[], lo: number, hi: number): Record<string, Role> {
  const highlights: Record<string, Role> = {};
  items.forEach((item, index) => {
    if (index < lo || index > hi) highlights[item.id] = 'dibuang';
  });
  return highlights;
}

export function linearSearchSteps(values: number[], x: number): CariStep[] {
  const items = makeItems(values, 'i');
  const n = values.length;
  const steps: CariStep[] = [];
  const state = (pointers: Pointer[], checks: number): CariState => ({ items, x, pointers, checks });

  steps.push({
    state: state([], 0),
    highlights: {},
    caption: `Cari \`x = ${x}\`. Pencarian linear memeriksa elemen satu per satu dari depan, dan tidak peduli datanya urut atau tidak.`,
    lines: ['fungsi'],
    status: 'normal',
  });

  for (let i = 0; i < n; i++) {
    const highlights = crossedOut(items, i, n - 1);
    const value = values[i];
    if (value === x) {
      highlights[items[i].id] = 'selesai';
      steps.push({
        state: state([{ name: 'i', index: i }], i + 1),
        highlights,
        caption: `\`data[${i}] = ${value}\`, sama dengan \`x\`. Ketemu di indeks ${i} setelah memeriksa ${i + 1} elemen.`,
        lines: ['cek', 'ketemu'],
        result: `indeks ${i}`,
        status: 'normal',
      });
      return steps;
    }
    highlights[items[i].id] = 'aktif';
    const start = i === 0 ? 'Mulai dari `i = 0`. ' : '';
    steps.push({
      state: state([{ name: 'i', index: i }], i + 1),
      highlights,
      caption: `${start}\`data[${i}] = ${value}\`, bukan ${x}. Lanjut ke indeks berikutnya.`,
      lines: ['ulang', 'cek'],
      status: 'normal',
    });
  }

  steps.push({
    state: state([{ name: 'i', index: n }], n),
    highlights: crossedOut(items, n, n - 1),
    caption: `\`i = ${n}\` sudah melewati elemen terakhir. Semua ${n} elemen sudah diperiksa dan tidak ada yang sama dengan ${x}, jadi kembalikan -1. Untuk yakin sebuah nilai tidak ada, pencarian linear harus memeriksa semuanya.`,
    lines: ['gagal'],
    result: '-1 (tidak ada)',
    status: 'normal',
  });
  return steps;
}

export function binarySearchSteps(values: number[], x: number): CariStep[] {
  const items = makeItems(values, 'i');
  const n = values.length;
  const sorted = isSorted(values);
  const steps: CariStep[] = [];
  const state = (pointers: Pointer[], checks: number): CariState => ({ items, x, pointers, checks });
  let lo = 0;
  let hi = n - 1;
  let checks = 0;
  let explainedRounding = false;

  steps.push({
    state: state(
      [
        { name: 'lo', index: lo },
        { name: 'hi', index: hi },
      ],
      0,
    ),
    highlights: {},
    caption: sorted
      ? `Data sudah terurut, dan kita mencari \`x = ${x}\`. Awalnya semua indeks masih kandidat: \`lo = 0\` dan \`hi = ${hi}\`.`
      : `Data ini tidak terurut, tetapi kita tetap mencoba pencarian biner untuk \`x = ${x}\`. Awalnya semua indeks masih kandidat: \`lo = 0\` dan \`hi = ${hi}\`.`,
    lines: ['awal'],
    status: 'normal',
  });

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = values[mid];
    checks++;
    const pointers: Pointer[] = [
      { name: 'lo', index: lo },
      { name: 'mid', index: mid },
      { name: 'hi', index: hi },
    ];

    const midHighlights = crossedOut(items, lo, hi);
    midHighlights[items[mid].id] = 'aktif';
    let rounding = '';
    if (!explainedRounding && (hi - lo) % 2 === 1) {
      rounding = ` (pembagian bulat: ${((hi - lo) / 2).toLocaleString('id-ID')} dibulatkan ke bawah menjadi ${Math.floor((hi - lo) / 2)})`;
      explainedRounding = true;
    }
    steps.push({
      state: state(pointers, checks),
      highlights: midHighlights,
      caption: `\`lo = ${lo}\` dan \`hi = ${hi}\`, jadi masih ada kandidat. \`mid = ${lo} + (${hi} - ${lo}) / 2 = ${mid}\`${rounding}, dan \`data[${mid}] = ${value}\`.`,
      lines: ['ulang', 'mid'],
      status: 'normal',
    });

    if (value === x) {
      const found = crossedOut(items, lo, hi);
      found[items[mid].id] = 'selesai';
      steps.push({
        state: state(pointers, checks),
        highlights: found,
        caption: `\`${value} == ${x}\`. Ketemu di indeks ${mid} setelah memeriksa ${checks} elemen.`,
        lines: ['sama', 'ketemu'],
        result: `indeks ${mid}`,
        status: 'normal',
      });
      return steps;
    }

    if (value < x) {
      const from = lo;
      lo = mid + 1;
      const side = sorted ? `jadi \`${x}\` pasti di kanan \`mid\`` : `jadi pencarian biner menganggap \`${x}\` ada di kanan \`mid\``;
      steps.push({
        state: state(
          [
            { name: 'lo', index: lo },
            { name: 'mid', index: mid },
            { name: 'hi', index: hi },
          ],
          checks,
        ),
        highlights: crossedOut(items, lo, hi),
        caption: `\`${value} < ${x}\`, ${side}. Coret ${indexRange(from, mid)}: \`lo = mid + 1 = ${lo}\`.`,
        lines: ['kurang', 'geserLo'],
        status: 'normal',
      });
    } else {
      const to = hi;
      hi = mid - 1;
      const side = sorted ? `jadi \`${x}\` pasti di kiri \`mid\`` : `jadi pencarian biner menganggap \`${x}\` ada di kiri \`mid\``;
      steps.push({
        state: state(
          [
            { name: 'lo', index: lo },
            { name: 'mid', index: mid },
            { name: 'hi', index: hi },
          ],
          checks,
        ),
        highlights: crossedOut(items, lo, hi),
        caption: `\`${value} > ${x}\`, ${side}. Coret ${indexRange(mid, to)}: \`hi = mid - 1 = ${hi}\`.`,
        lines: ['lebih', 'geserHi'],
        status: 'normal',
      });
    }
  }

  const pointers: Pointer[] = [
    { name: 'lo', index: lo },
    { name: 'hi', index: hi },
  ];
  const ended = `Sekarang \`lo = ${lo}\` lebih besar dari \`hi = ${hi}\`: tidak ada kandidat lagi, jadi kembalikan -1 setelah memeriksa ${checks} elemen.`;
  const missed = values.flatMap((value, index) => (value === x ? [index] : []));

  if (!sorted && missed.length > 0) {
    const highlights = crossedOut(items, lo, hi);
    for (const index of missed) highlights[items[index].id] = 'error';
    steps.push({
      state: state(pointers, checks),
      highlights,
      caption: `${ended} Padahal ${x} ada di indeks ${missed[0]}! Karena datanya tidak terurut, bagian yang dicoret ternyata berisi jawabannya. Pencarian biner hanya benar untuk data yang terurut.`,
      lines: ['gagal'],
      result: '-1 (salah!)',
      status: 'error',
    });
    return steps;
  }

  let where = '';
  if (sorted) {
    if (lo === 0) where = ` Perhatikan \`lo = 0\`: ${x} lebih kecil dari semua elemen, jadi tempatnya di paling depan.`;
    else if (lo === n) where = ` Perhatikan \`lo = ${n}\`: ${x} lebih besar dari semua elemen, jadi tempatnya sesudah elemen terakhir.`;
    else where = ` Perhatikan \`lo = ${lo}\`: ${x} seharusnya berada di antara ${values[lo - 1]} dan ${values[lo]}, tepat di indeks ${lo}.`;
  }
  steps.push({
    state: state(pointers, checks),
    highlights: crossedOut(items, lo, hi),
    caption: `${ended}${where}`,
    lines: ['ulang', 'gagal'],
    result: '-1 (tidak ada)',
    status: 'normal',
  });
  return steps;
}

export function searchSteps(metode: MetodeCari, values: number[], x: number): CariStep[] {
  return metode === 'linear' ? linearSearchSteps(values, x) : binarySearchSteps(values, x);
}

// ---------------------------------------------------------------------------
// Lower and upper bound
// ---------------------------------------------------------------------------

export type JenisBatas = 'bawah' | 'atas';

export interface BatasState extends CariState {
  /** Best candidate so far; `n` means "none yet". */
  jawaban: number;
}

export type BatasStep = Step<BatasState>;

export const lessonBatasData = [2, 4, 4, 4, 7, 9];

/** The x values from the lesson's table. */
export const batasCases = [
  { id: 'kembar', label: 'x = 4 (ada 3 kembar)', x: 4 },
  { id: 'tidak-ada', label: 'x = 5 (tidak ada)', x: 5 },
  { id: 'terkecil', label: 'x = 1 (lebih kecil dari semua)', x: 1 },
  { id: 'terbesar', label: 'x = 10 (lebih besar dari semua)', x: 10 },
] as const;

export function batasPseudocode(jenis: JenisBatas): PseudocodeLine[] {
  return [
    { id: 'fungsi', text: jenis === 'bawah' ? 'batasBawah(data, x):' : 'batasAtas(data, x):', indent: 0 },
    { id: 'awal', text: 'lo = 0, hi = n - 1', indent: 1 },
    { id: 'jawaban', text: 'jawaban = n', indent: 1 },
    { id: 'ulang', text: 'selama lo <= hi:', indent: 1 },
    { id: 'mid', text: 'mid = lo + (hi - lo) / 2', indent: 2 },
    { id: 'cek', text: jenis === 'bawah' ? 'jika data[mid] >= x:' : 'jika data[mid] > x:', indent: 2 },
    { id: 'simpan', text: 'jawaban = mid', indent: 3 },
    { id: 'kiri', text: 'hi = mid - 1', indent: 3 },
    { id: 'lain', text: 'selain itu:', indent: 2 },
    { id: 'kanan', text: 'lo = mid + 1', indent: 3 },
    { id: 'hasil', text: 'kembalikan jawaban', indent: 1 },
  ];
}

/** Index of the first element `>= x` (bawah) or `> x` (atas), or n. */
export function batas(values: readonly number[], x: number, jenis: JenisBatas): number {
  const index = values.findIndex((value) => (jenis === 'bawah' ? value >= x : value > x));
  return index === -1 ? values.length : index;
}

export function batasSteps(values: number[], x: number, jenis: JenisBatas): BatasStep[] {
  const items = makeItems(values, 'i');
  const n = values.length;
  const op = jenis === 'bawah' ? '>=' : '>';
  const name = jenis === 'bawah' ? 'batasBawah' : 'batasAtas';
  const meets = (value: number) => (jenis === 'bawah' ? value >= x : value > x);
  const steps: BatasStep[] = [];
  let lo = 0;
  let hi = n - 1;
  let jawaban = n;
  let checks = 0;

  const state = (pointers: Pointer[]): BatasState => ({
    items,
    x,
    pointers: [...pointers, { name: 'jawaban', index: jawaban }],
    checks,
    jawaban,
  });
  const highlights = (extra?: [number, Role]) => {
    const result = crossedOut(items, lo, hi);
    if (jawaban < n) result[items[jawaban].id] = 'khusus';
    if (extra) result[items[extra[0]].id] = extra[1];
    return result;
  };

  steps.push({
    state: state([
      { name: 'lo', index: lo },
      { name: 'hi', index: hi },
    ]),
    highlights: {},
    caption: `Cari indeks pertama dengan \`data[i] ${op} ${x}\`. Belum ada kandidat, jadi \`jawaban = n = ${n}\`, artinya "sesudah elemen terakhir".`,
    lines: ['awal', 'jawaban'],
    status: 'normal',
  });

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = values[mid];
    checks++;
    const withMid = (): Pointer[] => [
      { name: 'lo', index: lo },
      { name: 'mid', index: mid },
      { name: 'hi', index: hi },
    ];
    steps.push({
      state: state(withMid()),
      highlights: highlights([mid, 'aktif']),
      caption: `\`lo = ${lo}\` dan \`hi = ${hi}\`. \`mid = ${lo} + (${hi} - ${lo}) / 2 = ${mid}\`, dan \`data[${mid}] = ${value}\`.`,
      lines: ['ulang', 'mid'],
      status: 'normal',
    });

    if (meets(value)) {
      jawaban = mid;
      const to = hi;
      hi = mid - 1;
      const crossed = mid < to ? ` Indeks ${mid + 1} sampai ${to} tidak mungkin lebih kiri, jadi dicoret.` : '';
      steps.push({
        state: state(withMid()),
        highlights: highlights(),
        caption: `\`${value} ${op} ${x}\`, jadi indeks ${mid} memenuhi syarat dan menjadi kandidat: \`jawaban = ${mid}\`. Mungkin masih ada yang lebih kiri, jadi lanjut mencari di kiri: \`hi = ${hi}\`.${crossed}`,
        lines: ['cek', 'simpan', 'kiri'],
        status: 'normal',
      });
    } else {
      const from = lo;
      lo = mid + 1;
      steps.push({
        state: state(withMid()),
        highlights: highlights(),
        caption: `\`${value}\` tidak \`${op} ${x}\`, jadi jawabannya pasti di kanan \`mid\`. Coret ${indexRange(from, mid)}: \`lo = ${lo}\`.`,
        lines: ['cek', 'lain', 'kanan'],
        status: 'normal',
      });
    }
  }

  const final: Record<string, Role> = crossedOut(items, lo, hi);
  if (jawaban < n) final[items[jawaban].id] = 'selesai';
  let meaning: string;
  if (jawaban === n) {
    meaning = `Tidak ada elemen yang \`${op} ${x}\`, jadi jawabannya tetap \`n = ${n}\`: sesudah elemen terakhir.`;
  } else if (jenis === 'bawah') {
    const first = values[jawaban] === x ? ` dan ${x} pertama kali muncul di indeks ${jawaban}` : `, dan ${x} sendiri tidak ada di data`;
    meaning = `Artinya ada ${jawaban} elemen yang lebih kecil dari ${x}${first}.`;
  } else {
    meaning = `Artinya ada ${jawaban} elemen yang \`<= ${x}\`.`;
  }
  steps.push({
    state: state([
      { name: 'lo', index: lo },
      { name: 'hi', index: hi },
    ]),
    highlights: final,
    caption: `\`lo = ${lo}\` lebih besar dari \`hi = ${hi}\`, jadi pencarian selesai dan kembalikan \`jawaban = ${jawaban}\`. ${meaning}`,
    lines: ['ulang', 'hasil'],
    result: `${name}(${x}) = ${jawaban}`,
    status: 'normal',
  });
  return steps;
}
