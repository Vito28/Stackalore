import type { PseudocodeLine, Step } from './types.ts';

/** Operations taught in the Stack lesson. `pop` only discards, as in C++'s std::stack. */
export type StackOperation = { type: 'push'; value: number } | { type: 'pop' } | { type: 'top' } | { type: 'size' };

export interface StackItem {
  /** Stable identity so the view can animate the same element across steps. */
  id: string;
  value: number;
}

export interface StackState {
  /** Bottom to top. */
  items: StackItem[];
  /** Index of the operation this step shows, or null for the starting step. */
  operation: number | null;
}

export type StackStep = Step<StackState>;

export const STACK_LIMITS = { maxOperations: 12, minValue: -99, maxValue: 999 } as const;

/** Same sequence as the table in the Stack lesson. */
export const lessonStackOperations: StackOperation[] = [
  { type: 'push', value: 3 },
  { type: 'push', value: 7 },
  { type: 'push', value: 5 },
  { type: 'top' },
  { type: 'pop' },
  { type: 'push', value: 9 },
  { type: 'pop' },
  { type: 'size' },
];

export const stackPseudocode: PseudocodeLine[] = [
  { id: 'push', text: 'push(x):', indent: 0 },
  { id: 'push-letakkan', text: 'letakkan x di atas tumpukan', indent: 1 },
  { id: 'pop', text: 'pop():', indent: 0 },
  { id: 'pop-cek', text: 'jika stack kosong → error', indent: 1 },
  { id: 'pop-buang', text: 'buang elemen paling atas', indent: 1 },
  { id: 'top', text: 'top():', indent: 0 },
  { id: 'top-cek', text: 'jika stack kosong → error', indent: 1 },
  { id: 'top-lihat', text: 'kembalikan elemen paling atas', indent: 1 },
  { id: 'size', text: 'size():', indent: 0 },
  { id: 'size-hitung', text: 'kembalikan banyak elemen', indent: 1 },
];

export function formatStackOperation(operation: StackOperation): string {
  return operation.type === 'push' ? `push(${operation.value})` : operation.type;
}

/** Reads a number typed by the reader for push; returns an Indonesian error message when invalid. */
export function parseStackValue(text: string): { value: number } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Isi dulu angka yang mau di-push.' };
  if (!/^-?\d+$/.test(trimmed)) return { error: 'Masukkan bilangan bulat, misalnya 7 atau -3.' };
  const value = Number(trimmed);
  if (value < STACK_LIMITS.minValue || value > STACK_LIMITS.maxValue) {
    return { error: `Pakai angka dari ${STACK_LIMITS.minValue} sampai ${STACK_LIMITS.maxValue} supaya muat di kotak.` };
  }
  return { value };
}

/** Checks a whole sequence (e.g. from MDX props) before generating steps. */
export function validateStackOperations(operations: StackOperation[]): string | null {
  if (operations.length > STACK_LIMITS.maxOperations) {
    return `Maksimal ${STACK_LIMITS.maxOperations} operasi.`;
  }
  for (const operation of operations) {
    if (operation.type !== 'push') continue;
    if (!Number.isInteger(operation.value)) return 'Nilai push harus bilangan bulat.';
    if (operation.value < STACK_LIMITS.minValue || operation.value > STACK_LIMITS.maxValue) {
      return `Nilai push harus dari ${STACK_LIMITS.minValue} sampai ${STACK_LIMITS.maxValue}.`;
    }
  }
  return null;
}

/**
 * Parses an operation list written in MDX, e.g. `push(3) push(7) top pop size`
 * (commas optional). Returns an Indonesian error message for anything else.
 */
export function parseStackOperations(text: string): { operations: StackOperation[] } | { error: string } {
  const operations: StackOperation[] = [];
  for (const token of text.match(/push\s*\(\s*-?\d+\s*\)|[^\s,]+/g) ?? []) {
    const push = /^push\s*\(\s*(-?\d+)\s*\)$/.exec(token);
    if (push) operations.push({ type: 'push', value: Number(push[1]) });
    else if (token === 'pop' || token === 'top' || token === 'size') operations.push({ type: token });
    else return { error: `Operasi tidak dikenal: ${token}. Gunakan push(x), pop, top, atau size.` };
  }
  const invalid = validateStackOperations(operations);
  return invalid ? { error: invalid } : { operations };
}

const listBottomToTop = (items: StackItem[]) => items.map((item) => item.value).join(', ');

/**
 * Turns a sequence of stack operations into steps: one starting step, then
 * one step per operation. Popping or reading the top of an empty stack becomes
 * an error step that leaves the stack unchanged, and the sequence continues.
 */
export function stackSteps(operations: StackOperation[]): StackStep[] {
  const steps: StackStep[] = [];
  let items: StackItem[] = [];
  let pushes = 0;

  steps.push({
    state: { items: [], operation: null },
    highlights: {},
    caption:
      operations.length === 0
        ? 'Stack masih kosong dan belum ada operasi. Tambahkan operasi di bawah untuk mulai.'
        : `Stack masih kosong. Ada ${operations.length} operasi yang akan dijalankan dari kiri ke kanan.`,
    lines: [],
    status: 'normal',
  });

  operations.forEach((operation, index) => {
    const last = index === operations.length - 1;
    const done = last ? ' Semua operasi selesai.' : '';

    if (operation.type === 'push') {
      const item = { id: `n${pushes++}`, value: operation.value };
      items = [...items, item];
      const below = items.length > 1 ? ` Elemen ${items[items.length - 2].value} sekarang tertimbun di bawahnya.` : '';
      steps.push({
        state: { items, operation: index },
        highlights: { [item.id]: 'aktif' },
        caption: `\`push(${operation.value})\`: ${operation.value} diletakkan di atas tumpukan dan menjadi \`top\` yang baru.${below}${done}`,
        lines: ['push', 'push-letakkan'],
        status: 'normal',
      });
      return;
    }

    if ((operation.type === 'pop' || operation.type === 'top') && items.length === 0) {
      const cpp = operation.type === 'pop' ? '`s.pop()`' : '`s.top()`';
      const python = operation.type === 'pop' ? '`s.pop()`' : '`s[-1]`';
      steps.push({
        state: { items, operation: index },
        highlights: {},
        caption: `\`${operation.type}\` pada stack kosong! Tidak ada elemen yang bisa ${operation.type === 'pop' ? 'dibuang' : 'dilihat'}. Di C++, ${cpp} pada stack kosong adalah perilaku tak terdefinisi, jadi periksa \`empty()\` dulu. Di Python, ${python} pada list kosong menghasilkan \`IndexError\`.${done}`,
        lines: [operation.type, `${operation.type}-cek`],
        result: '✗ stack kosong',
        status: 'error',
      });
      return;
    }

    if (operation.type === 'top') {
      const top = items[items.length - 1];
      steps.push({
        state: { items, operation: index },
        highlights: { [top.id]: 'aktif' },
        caption: `\`top\`: lihat elemen paling atas tanpa membuangnya. Hasilnya ${top.value}, dan isi stack tidak berubah.${done}`,
        lines: ['top', 'top-lihat'],
        result: `top → ${top.value}`,
        status: 'normal',
      });
      return;
    }

    if (operation.type === 'pop') {
      const removed = items[items.length - 1];
      items = items.slice(0, -1);
      const after =
        items.length > 0
          ? ` Elemen di bawahnya, ${items[items.length - 1].value}, sekarang menjadi \`top\`.`
          : ' Stack sekarang kosong.';
      steps.push({
        state: { items, operation: index },
        highlights: {},
        caption: `\`pop\`: buang elemen paling atas, yaitu ${removed.value}.${after} (Di C++ \`pop()\` tidak mengembalikan nilai, jadi baca \`top()\` dulu kalau nilainya dibutuhkan.)${done}`,
        lines: ['pop', 'pop-buang'],
        result: `${removed.value} dibuang`,
        status: 'normal',
      });
      return;
    }

    steps.push({
      state: { items, operation: index },
      highlights: Object.fromEntries(items.map((item) => [item.id, 'aktif' as const])),
      caption:
        items.length === 0
          ? `\`size\`: stack kosong, jadi banyak elemennya 0.${done}`
          : `\`size\`: hitung banyak elemen di stack. Ada ${items.length} elemen: ${listBottomToTop(items)} (dari bawah ke atas).${done}`,
      lines: ['size', 'size-hitung'],
      result: `size → ${items.length}`,
      status: 'normal',
    });
  });

  return steps;
}

/** Random practice sequence: mostly pushes, sometimes popping more than was pushed. */
export function randomStackOperations(random: () => number = Math.random, length = 8): StackOperation[] {
  const operations: StackOperation[] = [];
  for (let i = 0; i < length; i++) {
    const roll = random();
    if (roll < 0.5) operations.push({ type: 'push', value: 1 + Math.floor(random() * 99) });
    else if (roll < 0.75) operations.push({ type: 'pop' });
    else if (roll < 0.9) operations.push({ type: 'top' });
    else operations.push({ type: 'size' });
  }
  return operations;
}
