import type { PseudocodeLine, Step } from './types.ts';

/** Operations taught in the Queue lesson, with the lesson's own names. */
export type QueueOperation =
  | { type: 'enqueue'; value: string }
  | { type: 'dequeue' }
  | { type: 'front' }
  | { type: 'back' }
  | { type: 'size' }
  | { type: 'empty' };

export interface QueueItem {
  /** Stable identity so the view can animate the same element across steps. */
  id: string;
  value: string;
}

export interface QueueState {
  /** Front to back: the first item is the next one to leave. */
  items: QueueItem[];
  /** Index of the operation this step shows, or null for the starting step. */
  operation: number | null;
}

export type QueueStep = Step<QueueState>;

export const QUEUE_LIMITS = { maxOperations: 12, maxNameLength: 8 } as const;

const namePattern = /^[A-Za-z]{1,8}$/;

/** Same sequence as the trace table in the Queue lesson. */
export const lessonQueueOperations: QueueOperation[] = [
  { type: 'enqueue', value: 'Ani' },
  { type: 'enqueue', value: 'Budi' },
  { type: 'enqueue', value: 'Citra' },
  { type: 'front' },
  { type: 'dequeue' },
  { type: 'enqueue', value: 'Dodi' },
  { type: 'dequeue' },
  { type: 'back' },
];

export const queuePseudocode: PseudocodeLine[] = [
  { id: 'enqueue', text: 'enqueue(x):', indent: 0 },
  { id: 'enqueue-masuk', text: 'letakkan x di belakang antrean', indent: 1 },
  { id: 'dequeue', text: 'dequeue():', indent: 0 },
  { id: 'dequeue-cek', text: 'jika queue kosong → error', indent: 1 },
  { id: 'dequeue-keluar', text: 'keluarkan elemen paling depan', indent: 1 },
  { id: 'front', text: 'front():', indent: 0 },
  { id: 'front-cek', text: 'jika queue kosong → error', indent: 1 },
  { id: 'front-lihat', text: 'kembalikan elemen paling depan', indent: 1 },
  { id: 'back', text: 'back():', indent: 0 },
  { id: 'back-cek', text: 'jika queue kosong → error', indent: 1 },
  { id: 'back-lihat', text: 'kembalikan elemen paling belakang', indent: 1 },
  { id: 'size', text: 'size():', indent: 0 },
  { id: 'size-hitung', text: 'kembalikan banyak elemen', indent: 1 },
  { id: 'empty', text: 'empty():', indent: 0 },
  { id: 'empty-cek', text: 'kembalikan apakah size = 0', indent: 1 },
];

export function formatQueueOperation(operation: QueueOperation): string {
  return operation.type === 'enqueue' ? `enqueue(${operation.value})` : operation.type;
}

/** Reads a name typed by the reader for enqueue; returns an Indonesian error message when invalid. */
export function parseQueueName(text: string): { value: string } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Isi dulu nama yang mau di-enqueue.' };
  if (!namePattern.test(trimmed)) {
    return { error: `Pakai huruf saja tanpa spasi, paling banyak ${QUEUE_LIMITS.maxNameLength} huruf, misalnya Ani.` };
  }
  return { value: trimmed };
}

/** Checks a whole sequence (e.g. from MDX props) before generating steps. */
export function validateQueueOperations(operations: QueueOperation[]): string | null {
  if (operations.length > QUEUE_LIMITS.maxOperations) return `Maksimal ${QUEUE_LIMITS.maxOperations} operasi.`;
  for (const operation of operations) {
    if (operation.type === 'enqueue' && !namePattern.test(operation.value)) {
      return `Nama untuk enqueue harus huruf saja, 1 sampai ${QUEUE_LIMITS.maxNameLength} huruf.`;
    }
  }
  return null;
}

/**
 * Parses an operation list written in MDX, e.g. `enqueue(Ani) enqueue(Budi) front dequeue`
 * (commas optional). Returns an Indonesian error message for anything else.
 */
export function parseQueueOperations(text: string): { operations: QueueOperation[] } | { error: string } {
  const operations: QueueOperation[] = [];
  for (const token of text.match(/enqueue\s*\([^)]*\)|[^\s,]+/g) ?? []) {
    const enqueue = /^enqueue\s*\(\s*([^)]*?)\s*\)$/.exec(token);
    if (enqueue) operations.push({ type: 'enqueue', value: enqueue[1] });
    else if (token === 'dequeue' || token === 'front' || token === 'back' || token === 'size' || token === 'empty') {
      operations.push({ type: token });
    } else {
      return { error: `Operasi tidak dikenal: ${token}. Gunakan enqueue(nama), dequeue, front, back, size, atau empty.` };
    }
  }
  const invalid = validateQueueOperations(operations);
  return invalid ? { error: invalid } : { operations };
}

const listFrontToBack = (items: QueueItem[]) => items.map((item) => item.value).join(', ');

/** How each operation is written in the lesson's C++ and Python code. */
const code = {
  enqueue: (x: string) => `C++: \`q.push("${x}")\`, Python: \`q.append("${x}")\``,
  dequeue: 'C++: `q.pop()`, Python: `q.popleft()`',
  front: 'C++: `q.front()`, Python: `q[0]`',
  back: 'C++: `q.back()`, Python: `q[-1]`',
  size: 'C++: `q.size()`, Python: `len(q)`',
  empty: 'C++: `q.empty()`, Python: `len(q) == 0`',
};

/** What goes wrong when reading or removing from an empty queue, per language. */
const emptyError = {
  dequeue:
    'Di C++, `q.pop()` pada queue kosong adalah perilaku tak terdefinisi, jadi periksa `q.empty()` dulu. Di Python, `q.popleft()` pada deque kosong menghasilkan `IndexError`.',
  front:
    'Di C++, `q.front()` pada queue kosong adalah perilaku tak terdefinisi: bisa saja tampil angka yang tampak wajar padahal tidak berarti apa-apa. Di Python, `q[0]` pada deque kosong menghasilkan `IndexError`.',
  back: 'Di C++, `q.back()` pada queue kosong adalah perilaku tak terdefinisi, jadi periksa `q.empty()` dulu. Di Python, `q[-1]` pada deque kosong menghasilkan `IndexError`.',
};

/**
 * Turns a sequence of queue operations into steps: one starting step, then
 * one step per operation. Dequeue, front or back on an empty queue becomes an
 * error step that leaves the queue unchanged, and the sequence continues.
 * The C++ and Python spelling of an operation is mentioned the first time it appears.
 */
export function queueSteps(operations: QueueOperation[]): QueueStep[] {
  const steps: QueueStep[] = [];
  let items: QueueItem[] = [];
  let arrivals = 0;
  const explained = new Set<QueueOperation['type']>();

  steps.push({
    state: { items: [], operation: null },
    highlights: {},
    caption:
      operations.length === 0
        ? 'Queue masih kosong dan belum ada operasi. Tambahkan operasi di bawah untuk mulai.'
        : `Queue masih kosong. Ada ${operations.length} operasi yang akan dijalankan dari kiri ke kanan.`,
    lines: [],
    status: 'normal',
  });

  operations.forEach((operation, index) => {
    const last = index === operations.length - 1;
    const done = last ? ' Semua operasi selesai.' : '';
    const firstTime = !explained.has(operation.type);
    explained.add(operation.type);
    const codeNote = (text: string) => (firstTime ? ` (${text}.)` : '');

    if (operation.type === 'enqueue') {
      const item = { id: `q${arrivals++}`, value: operation.value };
      const behind = items.at(-1);
      items = [...items, item];
      const where = behind
        ? `${item.value} masuk di belakang, tepat di belakang ${behind.value}. Elemen yang sudah ada tidak bergeser.`
        : `queue masih kosong, jadi ${item.value} menjadi elemen paling depan sekaligus paling belakang.`;
      steps.push({
        state: { items, operation: index },
        highlights: { [item.id]: 'aktif' },
        caption: `\`enqueue(${item.value})\`: ${where}${codeNote(code.enqueue(item.value))}${done}`,
        lines: ['enqueue', 'enqueue-masuk'],
        status: 'normal',
      });
      return;
    }

    if ((operation.type === 'dequeue' || operation.type === 'front' || operation.type === 'back') && items.length === 0) {
      const what = operation.type === 'dequeue' ? 'dikeluarkan' : 'dilihat';
      steps.push({
        state: { items, operation: index },
        highlights: {},
        caption: `\`${operation.type}\` pada queue kosong! Tidak ada elemen yang bisa ${what}. ${emptyError[operation.type]}${done}`,
        lines: [operation.type, `${operation.type}-cek`],
        result: '✗ queue kosong',
        status: 'error',
      });
      return;
    }

    if (operation.type === 'front' || operation.type === 'back') {
      const item = operation.type === 'front' ? items[0] : items[items.length - 1];
      const side = operation.type === 'front' ? 'paling depan' : 'paling belakang';
      steps.push({
        state: { items, operation: index },
        highlights: { [item.id]: 'aktif' },
        caption: `\`${operation.type}\`: lihat elemen ${side} tanpa mengeluarkannya. Hasilnya ${item.value}, dan isi queue tidak berubah.${codeNote(code[operation.type])}${done}`,
        lines: [operation.type, `${operation.type}-lihat`],
        result: `${operation.type} → ${item.value}`,
        status: 'normal',
      });
      return;
    }

    if (operation.type === 'dequeue') {
      const removed = items[0];
      items = items.slice(1);
      const after = items.length > 0 ? ` ${items[0].value} sekarang paling depan.` : ' Queue sekarang kosong.';
      const note = firstTime
        ? ` (C++: \`q.pop()\` tidak mengembalikan nilai, jadi baca \`q.front()\` dulu kalau namanya dibutuhkan. Python: \`q.popleft()\` membuang sekaligus mengembalikan ${removed.value}.)`
        : '';
      steps.push({
        state: { items, operation: index },
        highlights: {},
        caption: `\`dequeue\`: ${removed.value} keluar dari depan karena ia yang paling lama menunggu.${after}${note}${done}`,
        lines: ['dequeue', 'dequeue-keluar'],
        result: `${removed.value} keluar`,
        status: 'normal',
      });
      return;
    }

    if (operation.type === 'empty') {
      const isEmpty = items.length === 0;
      steps.push({
        state: { items, operation: index },
        highlights: {},
        caption: isEmpty
          ? `\`empty\`: queue tidak berisi elemen, jadi hasilnya \`true\` (\`True\` di Python).${codeNote(code.empty)}${done}`
          : `\`empty\`: queue masih berisi ${items.length} elemen, jadi hasilnya \`false\` (\`False\` di Python).${codeNote(code.empty)}${done}`,
        lines: ['empty', 'empty-cek'],
        result: `empty → ${isEmpty}`,
        status: 'normal',
      });
      return;
    }

    steps.push({
      state: { items, operation: index },
      highlights: Object.fromEntries(items.map((item) => [item.id, 'aktif' as const])),
      caption:
        items.length === 0
          ? `\`size\`: queue kosong, jadi banyak elemennya 0.${codeNote(code.size)}${done}`
          : `\`size\`: hitung banyak elemen di queue. Ada ${items.length} elemen: ${listFrontToBack(items)} (dari depan ke belakang).${codeNote(code.size)}${done}`,
      lines: ['size', 'size-hitung'],
      result: `size → ${items.length}`,
      status: 'normal',
    });
  });

  return steps;
}

const randomNames = ['Ani', 'Budi', 'Citra', 'Dodi', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Intan', 'Joko', 'Kirana', 'Lukas'];

/** Random practice sequence: mostly arrivals, sometimes serving more people than have arrived. */
export function randomQueueOperations(random: () => number = Math.random, length = 8): QueueOperation[] {
  const operations: QueueOperation[] = [];
  let next = Math.floor(random() * randomNames.length);
  for (let i = 0; i < length; i++) {
    const roll = random();
    if (roll < 0.5) {
      operations.push({ type: 'enqueue', value: randomNames[next % randomNames.length] });
      next++;
    } else if (roll < 0.75) operations.push({ type: 'dequeue' });
    else if (roll < 0.85) operations.push({ type: 'front' });
    else if (roll < 0.93) operations.push({ type: 'back' });
    else operations.push({ type: random() < 0.5 ? 'size' : 'empty' });
  }
  return operations;
}
