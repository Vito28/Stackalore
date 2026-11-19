import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Min-heap used as a priority queue. Algorithm (must match the lesson):
 * 0-based array, parent (i - 1) / 2, children 2i + 1 and 2i + 2.
 * push: append, then sift up while strictly smaller than the parent.
 * pop: take index 0, move the last element to index 0, then sift down to the
 * smaller child (the left one on a tie) while that child is strictly smaller.
 */
export type HeapOperation = { type: 'push'; value: number } | { type: 'pop' } | { type: 'top' } | { type: 'size' };

export interface HeapItem {
  /** Stable identity so an element can be followed while it moves. */
  id: string;
  value: number;
}

export interface HeapTag {
  id: string;
  /** Element id the label belongs to. */
  at: string;
  label: string;
}

export interface HeapState {
  /** The backing array: index 0 is the root. */
  items: HeapItem[];
  /** Index of the operation this step belongs to, or null for the starting step. */
  operation: number | null;
  /** Element just removed by pop, shown beside the heap. */
  taken: HeapItem | null;
  /** Small labels: `i` for the moving element, `p` for its parent, `c` for the chosen child. */
  tags: HeapTag[];
}

export type HeapStep = Step<HeapState>;

export const HEAP_LIMITS = { maxOperations: 12, minValue: -99, maxValue: 999 } as const;

export const lessonHeapOperations: HeapOperation[] = [
  ...[35, 20, 50, 10, 40, 5, 30].map((value) => ({ type: 'push' as const, value })),
  { type: 'pop' },
  { type: 'pop' },
];

export const heapPseudocode: PseudocodeLine[] = [
  { id: 'push', text: 'push(x):', indent: 0 },
  { id: 'push-taruh', text: 'taruh x di akhir, i ← indeksnya', indent: 1 },
  { id: 'push-ulang', text: 'selama i > 0:', indent: 1 },
  { id: 'push-parent', text: 'p ← (i - 1) / 2, dibulatkan', indent: 2 },
  { id: 'push-cek', text: 'jika a[i] ≥ a[p] → berhenti', indent: 2 },
  { id: 'push-tukar', text: 'tukar a[i], a[p]; i ← p', indent: 2 },
  { id: 'pop', text: 'pop():', indent: 0 },
  { id: 'pop-kosong', text: 'jika heap kosong → error', indent: 1 },
  { id: 'pop-ambil', text: 'ambil a[0] (terkecil)', indent: 1 },
  { id: 'pop-pindah', text: 'a[0] ← elemen terakhir, i ← 0', indent: 1 },
  { id: 'pop-ulang', text: 'selama i punya anak:', indent: 1 },
  { id: 'pop-anak', text: 'c ← anak yang lebih kecil (kiri jika sama)', indent: 2 },
  { id: 'pop-cek', text: 'jika a[c] ≥ a[i] → berhenti', indent: 2 },
  { id: 'pop-tukar', text: 'tukar a[i], a[c]; i ← c', indent: 2 },
  { id: 'top', text: 'top():', indent: 0 },
  { id: 'top-kosong', text: 'jika heap kosong → error', indent: 1 },
  { id: 'top-lihat', text: 'kembalikan a[0]', indent: 1 },
  { id: 'size', text: 'size():', indent: 0 },
  { id: 'size-hitung', text: 'kembalikan banyak elemen', indent: 1 },
];

export const heapParent = (i: number) => Math.floor((i - 1) / 2);
export const heapLeft = (i: number) => 2 * i + 1;
export const heapRight = (i: number) => 2 * i + 2;

export function formatHeapOperation(operation: HeapOperation): string {
  return operation.type === 'push' ? `push(${operation.value})` : operation.type;
}

/**
 * Steps for a list of heap operations. Every comparison and every swap is a
 * separate step. pop and top on an empty heap are error steps that change
 * nothing, and the remaining operations still run.
 */
export function heapSteps(operations: HeapOperation[]): HeapStep[] {
  const steps: HeapStep[] = [];
  let items: HeapItem[] = [];
  let pushes = 0;
  let operation: number | null = null;
  let taken: HeapItem | null = null;
  let tags: HeapTag[] = [];
  let result: string | undefined;

  const emit = (caption: string, lines: string[], highlights: Record<string, Role>, status: 'normal' | 'error' = 'normal') => {
    steps.push({
      state: { items: [...items], operation, taken, tags: tags.map((tag) => ({ ...tag })) },
      highlights,
      caption,
      lines,
      result,
      status,
    });
  };

  const swap = (a: number, b: number) => {
    const next = [...items];
    [next[a], next[b]] = [next[b], next[a]];
    items = next;
  };

  emit(
    operations.length === 0
      ? 'Heap masih kosong dan belum ada operasi. Tambahkan operasi di bawah untuk mulai.'
      : `Heap masih kosong. Ada ${operations.length} operasi yang akan dijalankan dari kiri ke kanan.`,
    [],
    {},
  );

  const push = (value: number) => {
    const item = { id: `h${pushes++}`, value };
    items = [...items, item];
    let i = items.length - 1;
    tags = [{ id: 'i', at: item.id, label: 'i' }];
    emit(
      `\`push(${value})\`: taruh ${value} di akhir array, indeks \`i = ${i}\`.${i === 0 ? ` Heap tadinya kosong, jadi ${value} langsung menjadi root dan tidak perlu naik.` : ''}`,
      i === 0 ? ['push', 'push-taruh', 'push-ulang'] : ['push', 'push-taruh'],
      { [item.id]: 'aktif' },
    );

    while (i > 0) {
      const p = heapParent(i);
      const parent = items[p];
      tags = [
        { id: 'i', at: item.id, label: 'i' },
        { id: 'p', at: parent.id, label: 'p' },
      ];
      const where = `Parent dari indeks ${i} ada di \`(${i} - 1) / 2 = ${p}\`${(i - 1) % 2 === 1 ? ' (dibulatkan ke bawah)' : ''}, isinya ${parent.value}.`;
      if (!(value < parent.value)) {
        emit(
          `${where} Apakah \`${value} < ${parent.value}\`? Tidak, jadi ${value} sudah di tempat yang benar. Berhenti.`,
          ['push-ulang', 'push-parent', 'push-cek'],
          { [item.id]: 'aktif', [parent.id]: 'khusus' },
        );
        return;
      }
      emit(
        `${where} Apakah \`${value} < ${parent.value}\`? Ya, jadi keduanya harus ditukar.`,
        ['push-ulang', 'push-parent', 'push-cek'],
        { [item.id]: 'aktif', [parent.id]: 'khusus' },
      );
      swap(i, p);
      i = p;
      tags = [{ id: 'i', at: item.id, label: 'i' }];
      emit(
        `Tukar ${value} dan ${parent.value}. Sekarang ${value} ada di indeks ${i}, jadi \`i = ${i}\`.${i === 0 ? ` ${value} sampai di root, jadi berhenti.` : ''}`,
        i === 0 ? ['push-tukar', 'push-ulang'] : ['push-tukar'],
        { [item.id]: 'aktif', [parent.id]: 'khusus' },
      );
    }
  };

  const emptyError = (type: 'pop' | 'top') => {
    result = '✗ heap kosong';
    const cpp = type === 'pop' ? '`pq.pop()`' : '`pq.top()`';
    const python = type === 'pop' ? '`heapq.heappop(h)`' : '`h[0]`';
    emit(
      `\`${type}\` pada heap kosong! Tidak ada elemen yang bisa ${type === 'pop' ? 'diambil' : 'dilihat'}. Di C++, ${cpp} pada \`priority_queue\` kosong adalah perilaku tak terdefinisi, jadi periksa \`empty()\` dulu. Di Python, ${python} pada list kosong menghasilkan \`IndexError\`.`,
      [type, `${type}-kosong`],
      {},
      'error',
    );
  };

  const pop = () => {
    if (items.length === 0) {
      emptyError('pop');
      return;
    }
    const min = items[0];
    result = `pop → ${min.value}`;
    emit(`\`pop\`: nilai terkecil selalu ada di root, indeks 0. Ambil ${min.value}.`, ['pop', 'pop-ambil'], { [min.id]: 'khusus' });

    taken = min;
    const last = items[items.length - 1];
    if (items.length === 1) {
      items = [];
      emit(`${min.value} adalah satu-satunya elemen, jadi heap sekarang kosong.`, ['pop-pindah'], {});
      return;
    }
    const lastIndex = items.length - 1;
    items = [last, ...items.slice(1, -1)];
    let i = 0;
    tags = [{ id: 'i', at: last.id, label: 'i' }];
    const hasChild = (index: number) => heapLeft(index) < items.length;
    emit(
      `Pindahkan elemen terakhir, ${last.value} (indeks ${lastIndex}), ke indeks 0 supaya array tetap rapat tanpa lubang.${hasChild(0) ? '' : ` Indeks 0 tidak punya anak, jadi berhenti.`}`,
      hasChild(0) ? ['pop-pindah'] : ['pop-pindah', 'pop-ulang'],
      { [last.id]: 'aktif' },
    );

    while (hasChild(i)) {
      const l = heapLeft(i);
      const r = heapRight(i);
      const left = items[l];
      const right = r < items.length ? items[r] : null;
      const c = right !== null && right.value < left.value ? r : l;
      const child = items[c];
      tags = [
        { id: 'i', at: last.id, label: 'i' },
        { id: 'c', at: child.id, label: 'c' },
      ];
      const choice =
        right === null
          ? `Indeks ${i} hanya punya anak kiri di indeks ${l}, yaitu ${left.value}.`
          : right.value === left.value
            ? `Anak kiri (indeks ${l}) dan kanan (indeks ${r}) sama-sama ${left.value}, jadi pilih anak kiri.`
            : `Anak kiri (indeks ${l}) berisi ${left.value} dan anak kanan (indeks ${r}) berisi ${right.value}. Yang lebih kecil ${child.value} (${c === l ? 'kiri' : 'kanan'}).`;
      const highlights: Record<string, Role> = { [last.id]: 'aktif', [child.id]: 'khusus' };
      if (!(child.value < last.value)) {
        emit(
          `${choice} Apakah \`${child.value} < ${last.value}\`? Tidak, jadi ${last.value} sudah di tempat yang benar. Berhenti.`,
          ['pop-ulang', 'pop-anak', 'pop-cek'],
          highlights,
        );
        return;
      }
      emit(`${choice} Apakah \`${child.value} < ${last.value}\`? Ya, jadi keduanya harus ditukar.`, ['pop-ulang', 'pop-anak', 'pop-cek'], highlights);
      swap(i, c);
      i = c;
      tags = [{ id: 'i', at: last.id, label: 'i' }];
      emit(
        `Tukar ${last.value} dan ${child.value}. Sekarang ${last.value} ada di indeks ${i}, jadi \`i = ${i}\`.${hasChild(i) ? '' : ` Indeks ${i} tidak punya anak, jadi berhenti.`}`,
        hasChild(i) ? ['pop-tukar'] : ['pop-tukar', 'pop-ulang'],
        { [last.id]: 'aktif', [child.id]: 'khusus' },
      );
    }
  };

  operations.forEach((operation_, index) => {
    operation = index;
    taken = null;
    tags = [];
    result = undefined;
    if (operation_.type === 'push') push(operation_.value);
    else if (operation_.type === 'pop') pop();
    else if (operation_.type === 'top') {
      if (items.length === 0) emptyError('top');
      else {
        result = `top → ${items[0].value}`;
        emit(
          `\`top\`: lihat nilai terkecil di root (indeks 0) tanpa mengambilnya. Hasilnya ${items[0].value}, dan isi heap tidak berubah.`,
          ['top', 'top-lihat'],
          { [items[0].id]: 'khusus' },
        );
      }
    } else {
      result = `size → ${items.length}`;
      emit(
        items.length === 0 ? '`size`: heap kosong, jadi banyak elemennya 0.' : `\`size\`: heap berisi ${items.length} elemen.`,
        ['size', 'size-hitung'],
        Object.fromEntries(items.map((item) => [item.id, 'aktif' as const])),
      );
    }
  });

  if (operations.length > 0) steps[steps.length - 1].caption += ' Semua operasi selesai.';
  return steps;
}

/** Reads a number typed by the reader for push. */
export function parseHeapValue(text: string): { value: number } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Isi dulu angka yang mau di-push.' };
  if (!/^-?\d+$/.test(trimmed)) return { error: 'Masukkan bilangan bulat, misalnya 7 atau -3.' };
  const value = Number(trimmed);
  if (value < HEAP_LIMITS.minValue || value > HEAP_LIMITS.maxValue) {
    return { error: `Pakai angka dari ${HEAP_LIMITS.minValue} sampai ${HEAP_LIMITS.maxValue} supaya muat di kotak.` };
  }
  return { value };
}

export function validateHeapOperations(operations: HeapOperation[]): string | null {
  if (operations.length > HEAP_LIMITS.maxOperations) return `Maksimal ${HEAP_LIMITS.maxOperations} operasi.`;
  for (const operation of operations) {
    if (operation.type !== 'push') continue;
    if (!Number.isInteger(operation.value)) return 'Nilai push harus bilangan bulat.';
    if (operation.value < HEAP_LIMITS.minValue || operation.value > HEAP_LIMITS.maxValue) {
      return `Nilai push harus dari ${HEAP_LIMITS.minValue} sampai ${HEAP_LIMITS.maxValue}.`;
    }
  }
  return null;
}

/** Parses `push(35) push(20) pop top size` (commas optional). */
export function parseHeapOperations(text: string): { operations: HeapOperation[] } | { error: string } {
  const operations: HeapOperation[] = [];
  for (const token of text.match(/push\s*\(\s*-?\d+\s*\)|[^\s,]+/g) ?? []) {
    const push = /^push\s*\(\s*(-?\d+)\s*\)$/.exec(token);
    if (push) operations.push({ type: 'push', value: Number(push[1]) });
    else if (token === 'pop' || token === 'top' || token === 'size') operations.push({ type: token });
    else return { error: `Operasi tidak dikenal: ${token}. Gunakan push(x), pop, top, atau size.` };
  }
  const invalid = validateHeapOperations(operations);
  return invalid ? { error: invalid } : { operations };
}

/** Random practice: six or seven pushes, then a few pops, sometimes a top or a size. */
export function randomHeapOperations(random: () => number = Math.random): HeapOperation[] {
  const operations: HeapOperation[] = [];
  const pushes = 6 + Math.floor(random() * 2);
  for (let i = 0; i < pushes; i++) operations.push({ type: 'push', value: 1 + Math.floor(random() * 99) });
  const extra: HeapOperation[] = [{ type: 'pop' }, { type: 'pop' }, random() < 0.5 ? { type: 'top' } : { type: 'size' }];
  // Occasionally slip a pop between the pushes.
  if (random() < 0.4) operations.splice(3, 0, { type: 'pop' });
  return [...operations, ...extra].slice(0, HEAP_LIMITS.maxOperations);
}
