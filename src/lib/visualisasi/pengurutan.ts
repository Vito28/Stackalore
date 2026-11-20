import { formatValues, makeItems, type ArrayCase, type ArrayItem, type Bracket, type Pointer } from './array.ts';
import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Bubble, selection and insertion sort from the Algoritma Pengurutan lesson,
 * following the lesson's code line by line. Every comparison is one step, so
 * the counters at the end match the lesson's comparison table.
 */

export type AlgoritmaUrut = 'bubble' | 'selection' | 'insertion';

export const ALGORITMA_URUT: readonly AlgoritmaUrut[] = ['bubble', 'selection', 'insertion'];

export const namaAlgoritma: Record<AlgoritmaUrut, string> = {
  bubble: 'bubble sort',
  selection: 'selection sort',
  insertion: 'insertion sort',
};

export interface UrutState {
  /** `null` is the empty slot insertion sort leaves behind while the key is lifted. */
  items: (ArrayItem | null)[];
  /** Insertion sort's key, held above the slot at `index`. */
  floating: { item: ArrayItem; index: number } | null;
  pointers: Pointer[];
  brackets: Bracket[];
  comparisons: number;
  /** Swaps for bubble and selection sort, shifts for insertion sort. */
  moves: number;
}

export type UrutStep = Step<UrutState>;

/** The lesson traces every algorithm on this data. */
export const lessonUrutData = [4, 9, 2, 7, 5, 8];

export const urutCases: ArrayCase[] = [
  { id: 'materi', label: 'Contoh materi', values: lessonUrutData },
  { id: 'urut', label: 'Sudah urut', values: [1, 2, 3, 4, 5, 6] },
  { id: 'terbalik', label: 'Terbalik', values: [6, 5, 4, 3, 2, 1] },
  { id: 'hampir', label: 'Hampir urut', values: [1, 2, 4, 3, 5, 6] },
];

export const URUT_LIMITS = { minLength: 2, maxLength: 8, min: 1, max: 99 } as const;

/** Length of the data made by the "Acak" button. */
export const URUT_RANDOM_LENGTH = 6;

/** Checks data for the sorting visualization; returns an Indonesian message when invalid. */
export function validateUrutValues(values: readonly number[]): string | null {
  const { minLength, maxLength, min, max } = URUT_LIMITS;
  if (values.length < minLength || values.length > maxLength) {
    return `Isi data harus ${minLength} sampai ${maxLength} bilangan.`;
  }
  if (values.some((value) => !Number.isInteger(value) || value < min || value > max)) {
    return `Setiap bilangan harus bilangan bulat ${min} sampai ${max}.`;
  }
  return null;
}

/** Lines are kept short enough for the 17.5rem pseudocode panel; long conditions continue on a deeper line. */
export const urutPseudocode: Record<AlgoritmaUrut, PseudocodeLine[]> = {
  bubble: [
    { id: 'fungsi', text: 'bubbleSort(data):', indent: 0 },
    { id: 'putaran', text: 'untuk putaran = 0 .. n-2:', indent: 1 },
    { id: 'reset', text: 'adaTukar = salah', indent: 2 },
    { id: 'ulang', text: 'untuk j = 0 .. n-2-putaran:', indent: 2 },
    { id: 'banding', text: 'jika data[j] > data[j+1]:', indent: 3 },
    { id: 'tukar', text: 'tukar keduanya', indent: 4 },
    { id: 'catat', text: 'adaTukar = benar', indent: 4 },
    { id: 'cekTukar', text: 'jika tidak adaTukar:', indent: 2 },
    { id: 'berhenti', text: 'berhenti', indent: 3 },
  ],
  selection: [
    { id: 'fungsi', text: 'selectionSort(data):', indent: 0 },
    { id: 'luar', text: 'untuk i = 0 .. n-2:', indent: 1 },
    { id: 'awal', text: 'terkecil = i', indent: 2 },
    { id: 'dalam', text: 'untuk j = i+1 .. n-1:', indent: 2 },
    { id: 'banding', text: 'jika data[j] <', indent: 3 },
    { id: 'banding2', text: 'data[terkecil]:', indent: 5 },
    { id: 'catat', text: 'terkecil = j', indent: 4 },
    { id: 'cekTukar', text: 'jika terkecil != i:', indent: 2 },
    { id: 'tukar', text: 'tukar data[i] dan', indent: 3 },
    { id: 'tukar2', text: 'data[terkecil]', indent: 5 },
  ],
  insertion: [
    { id: 'fungsi', text: 'insertionSort(data):', indent: 0 },
    { id: 'luar', text: 'untuk i = 1 .. n-1:', indent: 1 },
    { id: 'ambil', text: 'kunci = data[i]', indent: 2 },
    { id: 'mulaiJ', text: 'j = i - 1', indent: 2 },
    { id: 'selama', text: 'selama j >= 0 dan', indent: 2 },
    { id: 'selama2', text: 'data[j] > kunci:', indent: 4 },
    { id: 'geser', text: 'data[j+1] = data[j]', indent: 3 },
    { id: 'mundur', text: 'j = j - 1', indent: 3 },
    { id: 'taruh', text: 'data[j+1] = kunci', indent: 2 },
  ],
};

/** The plain algorithm, for tests and for the final caption. */
export function sortedCopy(values: readonly number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

const placeWord = (count: number, word: string) => `${count} ${word}`;

/** Builds snapshots: copies the mutable working state into a step. */
function recorder(start: (ArrayItem | null)[]) {
  const items = [...start];
  let floating: UrutState['floating'] = null;
  let comparisons = 0;
  let moves = 0;
  const steps: UrutStep[] = [];

  const snapshot = (pointers: Pointer[] = [], brackets: Bracket[] = []): UrutState => ({
    items: [...items],
    floating: floating ? { item: floating.item, index: floating.index } : null,
    pointers,
    brackets,
    comparisons,
    moves,
  });

  return {
    items,
    steps,
    snapshot,
    get floating() {
      return floating;
    },
    set floating(value: UrutState['floating']) {
      floating = value;
    },
    compare() {
      comparisons++;
    },
    move() {
      moves++;
    },
    get comparisons() {
      return comparisons;
    },
    get moves() {
      return moves;
    },
    push(step: Omit<UrutStep, 'status'>) {
      steps.push({ ...step, status: 'normal' });
    },
  };
}

const item = (items: (ArrayItem | null)[], index: number) => items[index] as ArrayItem;

/** Marks `from..to` (inclusive) as in their final place. */
function finalRange(items: (ArrayItem | null)[], from: number, to: number, into: Record<string, Role> = {}) {
  for (let index = from; index <= to; index++) {
    const current = items[index];
    if (current) into[current.id] = 'selesai';
  }
  return into;
}

function startCaption(algoritma: AlgoritmaUrut, values: number[]) {
  const data = `\`${formatValues(values)}\``;
  switch (algoritma) {
    case 'bubble':
      return `Data awal ${data}. Bubble sort berjalan dari kiri ke kanan, membandingkan setiap pasangan bersebelahan, dan menukarnya jika yang kiri lebih besar.`;
    case 'selection':
      return `Data awal ${data}. Selection sort mencari elemen terkecil dari bagian yang belum urut, lalu menukarnya ke depan bagian itu.`;
    case 'insertion':
      return `Data awal ${data}. Insertion sort menyusun data seperti kartu di tangan: \`data[0]\` dianggap kartu pertama, lalu setiap kartu berikutnya diselipkan ke tempat yang tepat.`;
  }
}

function finish(rec: ReturnType<typeof recorder>, algoritma: AlgoritmaUrut, brackets: Bracket[] = []) {
  const n = rec.items.length;
  const moveWord = algoritma === 'insertion' ? 'pergeseran' : 'pertukaran';
  const values = rec.items.map((entry) => entry?.value ?? 0);
  rec.push({
    state: rec.snapshot([], brackets),
    highlights: finalRange(rec.items, 0, n - 1),
    caption: `Selesai! Data sudah urut menjadi \`${formatValues(values)}\` setelah ${placeWord(rec.comparisons, 'perbandingan')} dan ${placeWord(rec.moves, moveWord)}.`,
    lines: [],
    result: formatValues(values),
  });
}

function bubbleSteps(values: number[]): UrutStep[] {
  const rec = recorder(makeItems(values));
  const { items } = rec;
  const n = items.length;

  rec.push({ state: rec.snapshot(), highlights: {}, caption: startCaption('bubble', values), lines: ['fungsi'] });

  // Elements from `settled` to the end are in their final place.
  let settled = n;
  for (let putaran = 0; putaran < n - 1; putaran++) {
    let adaTukar = false;
    let swaps = 0;
    const last = n - 2 - putaran;
    for (let j = 0; j <= last; j++) {
      const left = item(items, j);
      const right = item(items, j + 1);
      rec.compare();
      const swap = left.value > right.value;
      if (swap) {
        items[j] = right;
        items[j + 1] = left;
        rec.move();
        adaTukar = true;
        swaps++;
      }
      const highlights = finalRange(items, settled, n - 1);
      highlights[left.id] = 'aktif';
      highlights[right.id] = 'aktif';
      const opening =
        j === 0
          ? `Putaran ${putaran + 1} dimulai dengan \`adaTukar = salah\`${putaran > 0 ? `, dan cukup sampai indeks ${last + 1}` : ''}. `
          : '';
      const verdict = swap
        ? `\`${left.value} > ${right.value}\`, jadi keduanya ditukar.`
        : `\`${left.value} > ${right.value}\` salah, jadi tidak ditukar.`;
      rec.push({
        state: rec.snapshot([
          { name: 'j', index: j },
          { name: 'j+1', index: j + 1 },
        ]),
        highlights,
        caption: `${opening}Bandingkan \`data[${j}] = ${left.value}\` dan \`data[${j + 1}] = ${right.value}\`: ${verdict}`,
        lines: [...(j === 0 ? ['putaran', 'reset'] : []), ...(swap ? ['banding', 'tukar', 'catat'] : ['ulang', 'banding'])],
        result: swap ? `${left.value} > ${right.value} → tukar` : `${left.value} ≤ ${right.value} → tetap`,
      });
    }

    if (!adaTukar) {
      rec.push({
        state: rec.snapshot(),
        highlights: finalRange(items, 0, n - 1),
        caption: `Putaran ${putaran + 1} tidak menukar apa pun, jadi \`adaTukar\` masih salah. Artinya setiap pasangan bersebelahan sudah urut, sehingga seluruh data sudah urut: berhenti lebih awal.`,
        lines: ['cekTukar', 'berhenti'],
        result: 'berhenti lebih awal',
      });
      finish(rec, 'bubble');
      return rec.steps;
    }

    settled = n - 1 - putaran;
    const lastPass = putaran === n - 2;
    if (lastPass) settled = 0;
    const biggest = item(items, n - 1 - putaran).value;
    rec.push({
      state: rec.snapshot(),
      highlights: finalRange(items, settled, n - 1),
      caption: lastPass
        ? `Putaran ${putaran + 1} selesai dengan ${placeWord(swaps, 'pertukaran')}. Ini putaran terakhir: elemen paling kiri pasti yang terkecil, jadi semua sudah di tempatnya.`
        : `Putaran ${putaran + 1} selesai dengan ${placeWord(swaps, 'pertukaran')}. \`${biggest}\`, yang terbesar di antara yang belum urut, sudah terdorong ke tempat akhirnya, jadi putaran berikutnya tidak perlu menyentuhnya lagi.`,
      lines: ['cekTukar'],
      result: `${placeWord(swaps, 'pertukaran')}`,
    });
  }

  finish(rec, 'bubble');
  return rec.steps;
}

function selectionSteps(values: number[]): UrutStep[] {
  const rec = recorder(makeItems(values));
  const { items } = rec;
  const n = items.length;

  rec.push({ state: rec.snapshot(), highlights: {}, caption: startCaption('selection', values), lines: ['fungsi'] });

  for (let i = 0; i < n - 1; i++) {
    let terkecil = i;
    const roundStart = finalRange(items, 0, i - 1);
    roundStart[item(items, i).id] = 'khusus';
    rec.push({
      state: rec.snapshot([
        { name: 'i', index: i },
        { name: 'terkecil', index: i },
      ]),
      highlights: roundStart,
      caption: `\`i = ${i}\`: cari yang terkecil di indeks ${i} sampai ${n - 1}. Mulai dengan \`terkecil = ${i}\`, yaitu nilai ${item(items, i).value}.`,
      lines: ['luar', 'awal'],
    });

    for (let j = i + 1; j < n; j++) {
      const candidate = item(items, j);
      const best = item(items, terkecil);
      rec.compare();
      const smaller = candidate.value < best.value;
      if (smaller) terkecil = j;
      const highlights = finalRange(items, 0, i - 1);
      highlights[item(items, terkecil).id] = 'khusus';
      if (!smaller) highlights[candidate.id] = 'aktif';
      rec.push({
        state: rec.snapshot([
          { name: 'i', index: i },
          { name: 'j', index: j },
          { name: 'terkecil', index: terkecil },
        ]),
        highlights,
        caption: smaller
          ? `Bandingkan \`data[${j}] = ${candidate.value}\` dengan yang terkecil sejauh ini, ${best.value}. \`${candidate.value} < ${best.value}\`, jadi \`terkecil = ${j}\`.`
          : `Bandingkan \`data[${j}] = ${candidate.value}\` dengan yang terkecil sejauh ini, ${best.value}. \`${candidate.value} < ${best.value}\` salah, jadi \`terkecil\` tetap di indeks ${terkecil}.`,
        lines: smaller ? ['dalam', 'banding', 'banding2', 'catat'] : ['dalam', 'banding', 'banding2'],
        result: `terkecil = ${terkecil}`,
      });
    }

    const lastRound = i === n - 2;
    const smallest = item(items, terkecil);
    const tail = lastRound ? ` Tinggal satu elemen di kanan, dan elemen itu pasti yang terbesar.` : '';
    if (terkecil !== i) {
      const displaced = item(items, i);
      items[i] = smallest;
      items[terkecil] = displaced;
      rec.move();
      const highlights = finalRange(items, 0, lastRound ? n - 1 : i);
      if (!lastRound) highlights[displaced.id] = 'aktif';
      rec.push({
        state: rec.snapshot([
          { name: 'i', index: i },
          { name: 'terkecil', index: terkecil },
        ]),
        highlights,
        caption: `Yang terkecil adalah ${smallest.value} di indeks ${terkecil}. Tukar \`data[${i}]\` dan \`data[${terkecil}]\`, jadi ${smallest.value} sekarang di tempat akhirnya dan ${displaced.value} pindah ke indeks ${terkecil}.${tail}`,
        lines: ['cekTukar', 'tukar', 'tukar2'],
        result: `tukar ${displaced.value} ↔ ${smallest.value}`,
      });
    } else {
      rec.push({
        state: rec.snapshot([
          { name: 'i', index: i },
          { name: 'terkecil', index: terkecil },
        ]),
        highlights: finalRange(items, 0, lastRound ? n - 1 : i),
        caption: `Yang terkecil, ${smallest.value}, sudah berada di indeks ${i}. Karena \`terkecil == i\`, tidak perlu ditukar.${tail}`,
        lines: ['cekTukar'],
        result: 'tidak ditukar',
      });
    }
  }

  finish(rec, 'selection');
  return rec.steps;
}

function insertionSteps(values: number[]): UrutStep[] {
  const rec = recorder(makeItems(values));
  const { items } = rec;
  const n = items.length;
  const sortedPart = (to: number): Bracket[] => [{ id: 'urut', from: 0, to, label: to >= 2 ? 'sudah urut' : 'urut' }];

  rec.push({
    state: rec.snapshot([], sortedPart(0)),
    highlights: {},
    caption: startCaption('insertion', values),
    lines: ['fungsi'],
  });

  for (let i = 1; i < n; i++) {
    const kunci = item(items, i);
    items[i] = null;
    rec.floating = { item: kunci, index: i };
    let j = i - 1;
    const pointerJ = (): Pointer[] => (j >= 0 ? [{ name: 'j', index: j }] : []);
    rec.push({
      state: rec.snapshot(pointerJ(), sortedPart(i)),
      highlights: { [kunci.id]: 'khusus' },
      caption: `\`i = ${i}\`: ambil \`kunci = data[${i}] = ${kunci.value}\` dan angkat dari barisan, sehingga tempatnya kosong. Bandingkan mulai dari \`j = ${j}\`.`,
      lines: ['luar', 'ambil', 'mulaiJ'],
      result: `kunci = ${kunci.value}`,
    });

    let shifted = 0;
    while (j >= 0) {
      const current = item(items, j);
      rec.compare();
      if (current.value <= kunci.value) break;
      items[j + 1] = current;
      items[j] = null;
      rec.move();
      shifted++;
      rec.floating = { item: kunci, index: j };
      const from = j;
      j--;
      rec.push({
        state: rec.snapshot(pointerJ(), sortedPart(i)),
        highlights: { [kunci.id]: 'khusus', [current.id]: 'aktif' },
        caption: `\`data[${from}] = ${current.value}\` lebih besar dari \`kunci = ${kunci.value}\`, jadi ${current.value} digeser satu posisi ke kanan ke indeks ${from + 1}. Celahnya pindah ke indeks ${from}, dan \`j\` mundur ke ${j}.`,
        lines: ['selama', 'selama2', 'geser', 'mundur'],
        result: `geser ${current.value} →`,
      });
    }

    if (j < 0) {
      rec.push({
        state: rec.snapshot(pointerJ(), sortedPart(i)),
        highlights: { [kunci.id]: 'khusus' },
        caption: `\`j = -1\`: sudah tidak ada elemen di kiri, jadi berhenti. \`${kunci.value}\` lebih kecil dari semua kartu di tangan.`,
        lines: ['selama'],
        result: 'berhenti: j < 0',
      });
    } else {
      const stopper = item(items, j);
      rec.push({
        state: rec.snapshot(pointerJ(), sortedPart(i)),
        highlights: { [kunci.id]: 'khusus', [stopper.id]: 'aktif' },
        caption: `\`data[${j}] = ${stopper.value}\` tidak lebih besar dari \`kunci = ${kunci.value}\`, jadi berhenti${shifted === 0 ? ' tanpa menggeser apa pun' : ''}.`,
        lines: ['selama', 'selama2'],
        result: `${stopper.value} ≤ ${kunci.value} → berhenti`,
      });
    }

    items[j + 1] = kunci;
    rec.floating = null;
    rec.push({
      state: rec.snapshot(pointerJ(), sortedPart(i)),
      highlights: { [kunci.id]: 'khusus' },
      caption:
        shifted === 0
          ? `\`data[j+1] = kunci\`: ${kunci.value} kembali ke tempatnya sendiri, indeks ${j + 1}. Indeks 0 sampai ${i} sekarang urut.`
          : `\`data[j+1] = kunci\`: letakkan ${kunci.value} di celah indeks ${j + 1}. Indeks 0 sampai ${i} sekarang urut.`,
      lines: ['taruh'],
      result: `kunci → indeks ${j + 1}`,
    });
  }

  finish(rec, 'insertion', sortedPart(n - 1));
  return rec.steps;
}

export function urutSteps(algoritma: AlgoritmaUrut, values: number[]): UrutStep[] {
  switch (algoritma) {
    case 'bubble':
      return bubbleSteps(values);
    case 'selection':
      return selectionSteps(values);
    case 'insertion':
      return insertionSteps(values);
  }
}
