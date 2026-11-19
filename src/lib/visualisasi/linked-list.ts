import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Linked list operations from the Linked List lesson (singly) and the
 * Variasi Linked List deep dive (doubly, circular singly, circular doubly).
 *
 * Choices per variant:
 * - singly keeps only `head`, exactly like the lesson's functions, so adding
 *   at the back walks to the last node (`tambahBelakang` without `tail`);
 * - doubly keeps `head` and `tail`;
 * - circular singly keeps only `tail`: the first node is `tail->next`, drawn
 *   with a `head` label (as in the deep dive's diagram);
 * - circular doubly keeps only `head`: the last node is `head->prev`.
 */

export type LinkedListJenis = 'singly' | 'doubly' | 'circular-singly' | 'circular-doubly';
export type LinkedListOperasi = 'telusuri' | 'depan' | 'belakang' | 'cari' | 'hapus';

export const LINKED_LIST_JENIS: readonly { id: LinkedListJenis; label: string }[] = [
  { id: 'singly', label: 'Singly' },
  { id: 'doubly', label: 'Doubly' },
  { id: 'circular-singly', label: 'Circular singly' },
  { id: 'circular-doubly', label: 'Circular doubly' },
];

export const LINKED_LIST_OPERASI: readonly { id: LinkedListOperasi; label: string; pakaiNilai: boolean }[] = [
  { id: 'telusuri', label: 'Telusuri', pakaiNilai: false },
  { id: 'depan', label: 'Tambah di depan', pakaiNilai: true },
  { id: 'belakang', label: 'Tambah di belakang', pakaiNilai: true },
  { id: 'cari', label: 'Cari nilai', pakaiNilai: true },
  { id: 'hapus', label: 'Hapus nilai', pakaiNilai: true },
];

export interface LinkedListNode {
  /** Stable identity so the view can animate the same node across steps. */
  id: string;
  value: number;
  /** Id of the node `next` points to, or null for `nullptr`. */
  next: string | null;
  /** Id of the node `prev` points to (doubly variants only), or null. */
  prev: string | null;
  /** Unlinked from the list and about to be freed. Drawn below the row. */
  terlepas: boolean;
}

export interface LinkedListPointer {
  /** `head`, `tail`, or a variable in the function: `p`, `prev`, `baru`, `sisa`, `target`. */
  name: string;
  /** Node id, or null for `nullptr`. */
  target: string | null;
}

export interface LinkedListVariable {
  name: string;
  value: string;
}

export interface LinkedListState {
  jenis: LinkedListJenis;
  operasi: LinkedListOperasi;
  /** Display order, left to right. Usually the list order from `head`. */
  nodes: LinkedListNode[];
  pointers: LinkedListPointer[];
  /** Other values worth showing, such as `posisi` or what has been printed. */
  variables: LinkedListVariable[];
}

export type LinkedListStep = Step<LinkedListState>;

export interface LinkedListInput {
  jenis: LinkedListJenis;
  operasi: LinkedListOperasi;
  /** Starting list, from head to the last node. */
  data: number[];
  /** Value to add, search or remove. Ignored by `telusuri`. */
  nilai?: number;
}

export const LINKED_LIST_LIMITS = { maxNodes: 7, minValue: -99, maxValue: 999 } as const;

/** Examples from the lesson: `3 → 7 → 9`, add 1 at the front, build `4 8 15 16 23`, `hapus 7`. */
export const lessonLinkedListExamples: Record<LinkedListOperasi, { data: number[]; nilai?: number }> = {
  telusuri: { data: [3, 7, 9] },
  depan: { data: [3, 7, 9], nilai: 1 },
  belakang: { data: [4, 8, 15, 16], nilai: 23 },
  cari: { data: [3, 7, 9], nilai: 9 },
  hapus: { data: [3, 7, 9], nilai: 7 },
};

/** Element id of a link, for highlights: `${nodeId}:next` or `${nodeId}:prev`. */
export const linkId = (nodeId: string, field: 'next' | 'prev') => `${nodeId}:${field}`;

export const isCircular = (jenis: LinkedListJenis) => jenis === 'circular-singly' || jenis === 'circular-doubly';
export const isDoubly = (jenis: LinkedListJenis) => jenis === 'doubly' || jenis === 'circular-doubly';
/** Variants that store a `tail` pointer next to `head`. */
export const keepsTail = (jenis: LinkedListJenis) => jenis === 'doubly' || jenis === 'circular-singly';

/** Accepts `singly`, `Circular doubly`, `circular_singly`, ... */
export function normalizeJenis(text: string): LinkedListJenis | null {
  const id = text.trim().toLowerCase().replace(/[\s_]+/g, '-');
  return LINKED_LIST_JENIS.some((jenis) => jenis.id === id) ? (id as LinkedListJenis) : null;
}

export function normalizeOperasi(text: string): LinkedListOperasi | null {
  const id = text.trim().toLowerCase();
  return LINKED_LIST_OPERASI.some((operasi) => operasi.id === id) ? (id as LinkedListOperasi) : null;
}

// ---------------------------------------------------------------------------
// Pseudocode

const line = (id: string, text: string, indent: number): PseudocodeLine => ({ id, text, indent });

/**
 * Pseudocode for one variant and operation. Lines are kept short enough for
 * the narrow panel; a long statement continues on a line whose id ends in
 * `+`, which lights up together with the line before it.
 */
export function linkedListPseudocode(jenis: LinkedListJenis, operasi: LinkedListOperasi): PseudocodeLine[] {
  const circular = isCircular(jenis);
  // Circular singly stores only `tail`, so its first node is `tail.next`.
  const tailOnly = jenis === 'circular-singly';
  const start = tailOnly ? 'mulai' : 'head';
  const first = tailOnly ? 'tail.next' : 'head';

  if (operasi === 'telusuri') {
    return circular
      ? [
          line('t-head', jenis === 'circular-singly' ? 'cetakDari(mulai):' : 'cetakMaju(head):', 0),
          line('t-kosong', `jika ${start} = ∅: selesai`, 1),
          line('t-awal', `p ← ${start}`, 1),
          line('t-ulangi', 'ulangi:', 1),
          line('t-cetak', 'cetak p.data', 2),
          line('t-maju', 'p ← p.next', 2),
          line('t-cek', `sampai p = ${start}`, 1),
        ]
      : [
          line('t-head', 'cetak(head):', 0),
          line('t-awal', 'p ← head', 1),
          line('t-cek', 'selama p ≠ ∅:', 1),
          line('t-cetak', 'cetak p.data', 2),
          line('t-maju', 'p ← p.next', 2),
        ];
  }

  if (operasi === 'cari') {
    return [
      line('c-head', `cariPosisi(${tailOnly ? 'tail' : 'head'}, dicari):`, 0),
      ...(circular ? [line('c-kosong', `jika ${tailOnly ? 'tail' : 'head'} = ∅: kembalikan -1`, 1)] : []),
      line('c-awal', `posisi ← 0; p ← ${first}`, 1),
      circular ? line('c-ulangi', 'ulangi:', 1) : line('c-cek', 'selama p ≠ ∅:', 1),
      line('c-banding', 'jika p.data = dicari:', 2),
      line('c-ketemu', 'kembalikan posisi', 3),
      line('c-maju', 'posisi ← posisi + 1', 2),
      line('c-maju+', 'p ← p.next', 2),
      ...(circular ? [line('c-cek', `sampai p = ${first}`, 1)] : []),
      line('c-gagal', 'kembalikan -1', 1),
    ];
  }

  if (operasi === 'depan') {
    switch (jenis) {
      case 'singly':
        return [
          line('d-head', 'tambahDepan(head, x):', 0),
          line('d-baru', 'baru ← node x, next = head', 1),
          line('d-pindah', 'head ← baru', 1),
        ];
      case 'doubly':
        return [
          line('d-head', 'tambahDepan(x):', 0),
          line('d-baru', 'baru ← node x, next = head', 1),
          line('d-cek', 'jika head ≠ ∅:', 1),
          line('d-prev', 'head.prev ← baru', 2),
          line('d-kosong', 'selain itu: tail ← baru', 1),
          line('d-pindah', 'head ← baru', 1),
        ];
      case 'circular-singly':
        return [
          line('d-head', 'tambahDepan(tail, x):', 0),
          line('d-baru', 'baru ← node x', 1),
          line('d-kosong', 'jika tail = ∅:', 1),
          line('d-diri', 'baru.next ← baru', 2),
          line('d-diri+', 'kembalikan baru', 2),
          line('d-sambung', 'baru.next ← tail.next', 1),
          line('d-tail', 'tail.next ← baru', 1),
          line('d-pindah', 'kembalikan tail', 1),
        ];
      case 'circular-doubly':
        return [
          line('d-head', 'tambahDepan(head, x):', 0),
          line('d-baru', 'baru ← node x', 1),
          line('d-kosong', 'jika head = ∅:', 1),
          line('d-diri', 'baru.next, baru.prev ← baru', 2),
          line('d-lain', 'selain itu:', 1),
          line('d-akhir', 'tail ← head.prev', 2),
          line('d-sambung', 'baru.next ← head', 2),
          line('d-sambung+', 'baru.prev ← tail', 2),
          line('d-ikat', 'tail.next ← baru', 2),
          line('d-ikat+', 'head.prev ← baru', 2),
          line('d-pindah', 'kembalikan head.prev', 1),
        ];
    }
  }

  if (operasi === 'belakang') {
    switch (jenis) {
      case 'singly':
        return [
          line('b-head', 'tambahBelakang(head, x):', 0),
          line('b-baru', 'baru ← node x, next = ∅', 1),
          line('b-kosong', 'jika head = ∅:', 1),
          line('b-kosong+', 'kembalikan baru', 2),
          line('b-awal', 'p ← head', 1),
          line('b-cek', 'selama p.next ≠ ∅:', 1),
          line('b-maju', 'p ← p.next', 2),
          line('b-sambung', 'p.next ← baru', 1),
        ];
      case 'doubly':
        return [
          line('b-head', 'tambahBelakang(x):', 0),
          line('b-baru', 'baru ← node x, prev = tail', 1),
          line('b-cek', 'jika tail ≠ ∅:', 1),
          line('b-sambung', 'tail.next ← baru', 2),
          line('b-kosong', 'selain itu: head ← baru', 1),
          line('b-pindah', 'tail ← baru', 1),
        ];
      case 'circular-singly':
        return [
          line('b-head', 'tambahBelakang(tail, x):', 0),
          line('b-baru', 'baru ← node x', 1),
          line('b-kosong', 'jika tail = ∅:', 1),
          line('b-diri', 'baru.next ← baru', 2),
          line('b-diri+', 'kembalikan baru', 2),
          line('b-sambung', 'baru.next ← tail.next', 1),
          line('b-tail', 'tail.next ← baru', 1),
          line('b-pindah', 'kembalikan baru', 1),
        ];
      case 'circular-doubly':
        return [
          line('b-head', 'tambahBelakang(head, x):', 0),
          line('b-baru', 'baru ← node x', 1),
          line('b-kosong', 'jika head = ∅:', 1),
          line('b-diri', 'baru.next, baru.prev ← baru', 2),
          line('b-diri+', 'head ← baru', 2),
          line('b-lain', 'selain itu:', 1),
          line('b-akhir', 'tail ← head.prev', 2),
          line('b-sambung', 'baru.next ← head', 2),
          line('b-sambung+', 'baru.prev ← tail', 2),
          line('b-ikat', 'tail.next ← baru', 2),
          line('b-ikat+', 'head.prev ← baru', 2),
        ];
    }
  }

  // hapus
  if (jenis === 'singly') {
    return [
      line('h-head', 'hapusNilai(head, x):', 0),
      line('h-kosong', 'jika head = ∅: kembalikan ∅', 1),
      line('h-kasus1', 'jika head.data = x:', 1),
      line('h-sisa', 'sisa ← head.next', 2),
      line('h-hapus1', 'hapus head', 2),
      line('h-hapus1+', 'kembalikan sisa', 2),
      line('h-awal', 'prev ← head', 1),
      line('h-cari', 'selama prev.next ≠ ∅', 1),
      line('h-cari+', 'dan prev.next.data ≠ x:', 2),
      line('h-maju', 'prev ← prev.next', 2),
      line('h-ketemu', 'jika prev.next ≠ ∅:', 1),
      line('h-lompat', 'target ← prev.next', 2),
      line('h-lompat+', 'prev.next ← target.next', 2),
      line('h-hapus', 'hapus target', 2),
    ];
  }
  if (jenis === 'doubly') {
    return [
      line('h-head', 'hapusNilai(x):', 0),
      line('h-awal', 'p ← head', 1),
      line('h-cari', 'selama p ≠ ∅ dan p.data ≠ x:', 1),
      line('h-maju', 'p ← p.next', 2),
      line('h-gagal', 'jika p = ∅: selesai', 1),
      line('h-kiri', 'jika p.prev ≠ ∅:', 1),
      line('h-kiri-ya', 'p.prev.next ← p.next', 2),
      line('h-head2', 'selain itu: head ← p.next', 1),
      line('h-kanan', 'jika p.next ≠ ∅:', 1),
      line('h-kanan-ya', 'p.next.prev ← p.prev', 2),
      line('h-tail', 'selain itu: tail ← p.prev', 1),
      line('h-hapus', 'hapus p', 1),
    ];
  }
  if (tailOnly) {
    return [
      line('h-head', 'hapusNilai(tail, x):', 0),
      line('h-kosong', 'jika tail = ∅: selesai', 1),
      line('h-awal', 'prev ← tail; p ← tail.next', 1),
      line('h-ulangi', 'ulangi:', 1),
      line('h-banding', 'jika p.data = x: berhenti', 2),
      line('h-maju', 'prev ← p; p ← p.next', 2),
      line('h-cek', 'sampai p = tail.next', 1),
      line('h-gagal', 'jika tidak ketemu: selesai', 1),
      line('h-satu', 'jika p = prev:', 1),
      line('h-satu+', 'tail ← ∅', 2),
      line('h-lain', 'selain itu:', 1),
      line('h-lompat', 'prev.next ← p.next', 2),
      line('h-ekor', 'jika p = tail:', 2),
      line('h-ekor+', 'tail ← prev', 3),
      line('h-hapus', 'hapus p', 1),
    ];
  }
  return [
    line('h-head', 'hapusNilai(head, x):', 0),
    line('h-kosong', 'jika head = ∅: selesai', 1),
    line('h-awal', 'p ← head', 1),
    line('h-ulangi', 'ulangi:', 1),
    line('h-banding', 'jika p.data = x: berhenti', 2),
    line('h-maju', 'p ← p.next', 2),
    line('h-cek', 'sampai p = head', 1),
    line('h-gagal', 'jika tidak ketemu: selesai', 1),
    line('h-satu', 'jika p.next = p:', 1),
    line('h-satu+', 'head ← ∅', 2),
    line('h-lain', 'selain itu:', 1),
    line('h-lompat', 'p.prev.next ← p.next', 2),
    line('h-lompat+', 'p.next.prev ← p.prev', 2),
    line('h-geser', 'jika p = head:', 2),
    line('h-geser+', 'head ← p.next', 3),
    line('h-hapus', 'hapus p', 1),
  ];
}

// ---------------------------------------------------------------------------
// Input

/** Reads one value typed by the reader; returns an Indonesian error message when invalid. */
export function parseLinkedListValue(text: string): { value: number } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Isi dulu nilainya.' };
  if (!/^-?\d+$/.test(trimmed)) return { error: 'Nilai harus bilangan bulat, misalnya 7 atau -3.' };
  const value = Number(trimmed);
  if (value < LINKED_LIST_LIMITS.minValue || value > LINKED_LIST_LIMITS.maxValue) {
    return { error: `Pakai angka dari ${LINKED_LIST_LIMITS.minValue} sampai ${LINKED_LIST_LIMITS.maxValue} supaya muat di node.` };
  }
  return { value };
}

/** Reads a starting list such as `3 7 9`, `3, 7, 9` or `3 → 7 → 9`. An empty text is an empty list. */
export function parseLinkedListData(text: string): { data: number[] } | { error: string } {
  const tokens = text
    .replace(/→|->/g, ' ')
    .split(/[\s,]+/)
    .filter((token) => token !== '');
  if (tokens.length > LINKED_LIST_LIMITS.maxNodes) {
    return { error: `Paling banyak ${LINKED_LIST_LIMITS.maxNodes} node supaya list tetap terbaca.` };
  }
  const data: number[] = [];
  for (const token of tokens) {
    const parsed = parseLinkedListValue(token);
    if ('error' in parsed) return { error: `"${token}": ${parsed.error}` };
    data.push(parsed.value);
  }
  return { data };
}

/** Checks a whole input (e.g. from MDX props) before generating steps. */
export function validateLinkedListInput(input: LinkedListInput): string | null {
  if (input.data.length > LINKED_LIST_LIMITS.maxNodes) return `Paling banyak ${LINKED_LIST_LIMITS.maxNodes} node.`;
  const values = LINKED_LIST_OPERASI.find((operasi) => operasi.id === input.operasi)?.pakaiNilai
    ? [...input.data, input.nilai]
    : input.data;
  for (const value of values) {
    if (value === undefined) return 'Operasi ini butuh nilai.';
    if (!Number.isInteger(value) || value < LINKED_LIST_LIMITS.minValue || value > LINKED_LIST_LIMITS.maxValue) {
      return `Nilai harus bilangan bulat dari ${LINKED_LIST_LIMITS.minValue} sampai ${LINKED_LIST_LIMITS.maxValue}.`;
    }
  }
  return null;
}

/** Random practice data. For search and removal the value is sometimes missing from the list. */
export function randomLinkedListInput(
  operasi: LinkedListOperasi,
  random: () => number = Math.random,
): { data: number[]; nilai: number } {
  const length = 2 + Math.floor(random() * 4);
  const data = Array.from({ length }, () => 1 + Math.floor(random() * 50));
  const fresh = () => 51 + Math.floor(random() * 49);
  const existing = data[Math.floor(random() * data.length)];
  const nilai = (operasi === 'cari' || operasi === 'hapus') && random() < 0.7 ? existing : fresh();
  return { data, nilai };
}

// ---------------------------------------------------------------------------
// Working model

interface Model {
  jenis: LinkedListJenis;
  operasi: LinkedListOperasi;
  nodes: Map<string, LinkedListNode>;
  order: string[];
  pointers: Map<string, string | null>;
  variables: Map<string, string>;
  created: number;
}

function newNode(model: Model, value: number): LinkedListNode {
  const node = { id: `n${model.created++}`, value, next: null, prev: null, terlepas: false };
  model.nodes.set(node.id, node);
  return node;
}

function buildModel(jenis: LinkedListJenis, operasi: LinkedListOperasi, data: number[]): Model {
  const model: Model = { jenis, operasi, nodes: new Map(), order: [], pointers: new Map(), variables: new Map(), created: 0 };
  for (const value of data) model.order.push(newNode(model, value).id);
  const { order } = model;
  order.forEach((id, i) => {
    const node = model.nodes.get(id)!;
    node.next = order[i + 1] ?? (isCircular(jenis) ? order[0] : null);
    if (isDoubly(jenis)) node.prev = order[i - 1] ?? (isCircular(jenis) ? order[order.length - 1] : null);
  });
  model.pointers.set('head', order[0] ?? null);
  if (keepsTail(jenis)) model.pointers.set('tail', order.at(-1) ?? null);
  return model;
}

function snapshot(model: Model): LinkedListState {
  return {
    jenis: model.jenis,
    operasi: model.operasi,
    nodes: model.order.map((id) => ({ ...model.nodes.get(id)! })),
    pointers: [...model.pointers].map(([name, target]) => ({ name, target })),
    variables: [...model.variables].map(([name, value]) => ({ name, value })),
  };
}

/** Values reached by following `next` from `head`, each node once. */
export function listValues(state: Pick<LinkedListState, 'nodes' | 'pointers'>): number[] {
  const byId = new Map(state.nodes.map((node) => [node.id, node]));
  const values: number[] = [];
  const seen = new Set<string>();
  let id = state.pointers.find((pointer) => pointer.name === 'head')?.target ?? null;
  while (id !== null && !seen.has(id)) {
    seen.add(id);
    const node = byId.get(id);
    if (!node) break;
    values.push(node.value);
    id = node.next;
  }
  return values;
}

function listText(model: Model): string {
  const values = listValues(snapshot(model));
  if (values.length === 0) return 'kosong';
  const text = values.join(' → ');
  return isCircular(model.jenis) ? `${text} → kembali ke ${values[0]}` : text;
}

/** Short result shown next to the drawing; the drawing itself shows a circular list's loop. */
function resultText(model: Model): string {
  const values = listValues(snapshot(model));
  return `list: ${values.length ? values.join(' → ') : 'kosong'}`;
}

function intro(jenis: LinkedListJenis): string {
  switch (jenis) {
    case 'singly':
      return '';
    case 'doubly':
      return ' Setiap node menyimpan `next` (panah penuh) dan `prev` (panah putus-putus), dan list menyimpan `head` serta `tail`.';
    case 'circular-singly':
      return ' Hanya `tail` yang disimpan: node pertama selalu `tail->next` (ditandai `head`), jadi tidak ada `nullptr` di ujung list.';
    case 'circular-doubly':
      return ' `next` milik node terakhir kembali ke `head`, dan `prev` milik `head` menunjuk ke node terakhir, jadi cukup `head` yang disimpan.';
  }
}

interface Recorder {
  steps: LinkedListStep[];
  push: (caption: string, lines: string[], highlights?: Record<string, Role>, result?: string) => void;
}

function recorder(model: Model): Recorder {
  const steps: LinkedListStep[] = [];
  const ids = new Set(linkedListPseudocode(model.jenis, model.operasi).map((pseudo) => pseudo.id));
  return {
    steps,
    push(caption, lines, highlights = {}, result) {
      // A statement split over two lines lights up as a whole.
      const lit = lines.flatMap((id) => (ids.has(`${id}+`) ? [id, `${id}+`] : [id]));
      steps.push({ state: snapshot(model), highlights, caption, lines: lit, result, status: 'normal' });
    },
  };
}

const get = (model: Model, id: string) => model.nodes.get(id)!;
const value = (model: Model, id: string) => model.nodes.get(id)!.value;

function removeNode(model: Model, id: string) {
  model.order = model.order.filter((other) => other !== id);
  model.nodes.delete(id);
  for (const [name, target] of model.pointers) if (target === id) model.pointers.delete(name);
}

/** Highlight for a link that was just changed. A link that became `nullptr` highlights its node instead. */
function relinked(model: Model, id: string, field: 'next' | 'prev'): Record<string, Role> {
  return get(model, id)[field] === null ? { [id]: 'aktif' } : { [linkId(id, field)]: 'aktif' };
}

/** Roles for nodes already passed by a walk. */
const passed = (ids: string[], role: Role): Record<string, Role> => Object.fromEntries(ids.map((id) => [id, role]));

const freed = (x: number) =>
  `Di Python tidak perlu \`delete\`: node ${x} tidak ditunjuk siapa pun lagi, jadi dibebaskan otomatis.`;

// ---------------------------------------------------------------------------
// Operations

function telusuri(model: Model, rec: Recorder) {
  const circular = isCircular(model.jenis);
  const ids = [...model.order];
  const head = model.pointers.get('head') ?? null;
  const printed: number[] = [];
  // The deep dive prints a circular singly list with `cetakDari(tail->next)` and a circular doubly one with `cetakMaju(head)`.
  const start = model.jenis === 'circular-singly' ? 'mulai' : 'head';
  const call = { singly: 'cetak(head)', doubly: 'cetak(head)', 'circular-singly': 'cetakDari(tail->next)', 'circular-doubly': 'cetakMaju(head)' }[model.jenis];

  const how = circular
    ? `\`${call}\` mengunjungi setiap node dan harus berhenti saat kembali ke titik awal.`
    : `\`${call}\` mengunjungi node satu per satu mulai dari \`head\` dan mencetak isinya.`;
  rec.push(startCaption(model, ids.length === 0 ? `Lihat apa yang terjadi saat \`${call}\` dijalankan.` : how), []);

  if (circular && head === null) {
    rec.push(
      model.jenis === 'circular-singly'
        ? 'List kosong, jadi `mulai` bernilai `nullptr`. Tidak ada yang dicetak dan fungsi langsung selesai.'
        : '`head` bernilai `nullptr`, jadi tidak ada yang dicetak dan fungsi langsung selesai.',
      ['t-kosong'],
      {},
      'dicetak: (tidak ada)',
    );
    return;
  }

  model.pointers.set('p', head);
  rec.push(
    head === null
      ? '`p = head`, jadi `p` juga `nullptr`.'
      : model.jenis === 'circular-singly'
        ? `\`p = mulai\`: \`mulai\` adalah \`tail->next\`, yaitu node ${value(model, head)}.`
        : `\`p = head\`: \`p\` menunjuk ke node pertama, yaitu ${value(model, head)}.`,
    ['t-awal'],
  );

  ids.forEach((id, i) => {
    const node = get(model, id);
    model.pointers.set('p', id);
    printed.push(node.value);
    model.variables.set('dicetak', printed.join(' '));
    const highlights = { ...passed(ids.slice(0, i), 'selesai'), [id]: 'aktif' as const };
    if (circular) {
      rec.push(
        i === 0
          ? `Putaran 1: cetak \`${node.value}\`. Badan perulangan dijalankan dulu, baru kondisinya diperiksa.`
          : `\`p = p->next\`: \`p\` pindah ke node ${node.value}. \`p\` belum kembali ke \`${start}\`, jadi cetak \`${node.value}\`.`,
        i === 0 ? ['t-ulangi', 't-cetak'] : ['t-maju', 't-cek', 't-cetak'],
        highlights,
      );
      return;
    }
    const what =
      node.next === null ? `cetak \`${node.value}\` saja, karena \`next\`-nya \`nullptr\`` : `cetak \`${node.value}\` dan spasi`;
    rec.push(
      i === 0
        ? `Putaran 1: \`p != nullptr\`, jadi ${what}.`
        : `\`p = p->next\`: \`p\` pindah ke node ${node.value}. Putaran ${i + 1}: \`p\` belum \`nullptr\`, jadi ${what}.`,
      i === 0 ? ['t-cek', 't-cetak'] : ['t-maju', 't-cek', 't-cetak'],
      highlights,
    );
  });

  const result = `dicetak: ${printed.length ? printed.join(' ') : '(tidak ada)'}`;
  if (circular) {
    const last = get(model, ids[ids.length - 1]);
    model.pointers.set('p', head);
    const back =
      ids.length === 1
        ? `\`next\` milik node ${last.value} menunjuk ke dirinya sendiri, yaitu \`${start}\``
        : `\`next\` milik node ${last.value} menunjuk kembali ke node ${value(model, head!)}, yaitu \`${start}\``;
    rec.push(
      `\`p = p->next\`: ${back}. Kondisi \`p == ${start}\` terpenuhi, jadi perulangan berhenti setelah setiap node dicetak tepat sekali. Dengan kondisi \`p != nullptr\` seperti pada singly, perulangan ini tidak akan pernah berhenti.`,
      ['t-maju', 't-cek'],
      passed(ids, 'selesai'),
      result,
    );
    return;
  }

  model.pointers.set('p', null);
  if (ids.length === 0) {
    rec.push(
      'Kondisi `p != nullptr` langsung salah, jadi perulangan tidak berjalan sekali pun dan tidak ada yang dicetak. Fungsi ini aman untuk list kosong.',
      ['t-cek'],
      {},
      result,
    );
    return;
  }
  rec.push(
    `\`p = p->next\`: \`p\` sekarang \`nullptr\` karena node ${value(model, ids[ids.length - 1])} adalah node terakhir. Di putaran ${ids.length + 1}, kondisi \`p != nullptr\` salah, jadi perulangan berhenti. Hasilnya \`${printed.join(' ')}\`.`,
    ['t-maju', 't-cek'],
    passed(ids, 'selesai'),
    result,
  );
}

function startCaption(model: Model, rest: string): string {
  const list =
    model.order.length === 0
      ? `List masih kosong: \`${model.jenis === 'circular-singly' ? 'tail' : 'head'}\` bernilai \`nullptr\` (\`None\` di Python).`
      : `List berisi ${listText(model)}.`;
  return `${list}${intro(model.jenis)} ${rest}`;
}

/**
 * Circular singly as in the deep dive: only `tail` is stored. Adding at the
 * front and at the back splice the new node between `tail` and the first
 * node in exactly the same way; they differ only in which node is returned
 * as the new `tail`.
 */
function sisipCircularSingly(model: Model, rec: Recorder, x: number, front: boolean) {
  const fn = front ? 'tambahDepan' : 'tambahBelakang';
  const id = front ? 'd' : 'b';
  const tail = model.pointers.get('tail') ?? null;
  rec.push(startCaption(model, `\`tail = ${fn}(tail, ${x})\` menambahkan ${x} di ${front ? 'depan' : 'belakang'}.`), []);

  const baru = newNode(model, x);
  if (front) model.order.unshift(baru.id);
  else model.order.push(baru.id);
  model.pointers.set('baru', baru.id);
  rec.push(`\`baru = new Node{${x}, nullptr}\`: buat node ${x}.`, [`${id}-baru`], { [baru.id]: 'aktif' });

  if (tail === null) {
    baru.next = baru.id;
    model.pointers.set('head', baru.id);
    model.pointers.set('tail', baru.id);
    model.pointers.delete('baru');
    rec.push(
      `List kosong: \`baru->next = baru\`, jadi node ${x} menunjuk ke dirinya sendiri. Fungsi mengembalikan \`baru\` sebagai \`tail\`, dan node itu sekaligus node pertama. Lingkaran sekarang ${listText(model)}.`,
      [`${id}-kosong`, `${id}-diri`],
      { [baru.id]: 'aktif', [linkId(baru.id, 'next')]: 'aktif' },
      resultText(model),
    );
    return;
  }

  const head = get(model, tail).next!;
  const tailValue = value(model, tail);
  baru.next = head;
  rec.push(
    `\`baru->next = tail->next\`: node ${x} menunjuk ke node pertama, yaitu node ${value(model, head)}.`,
    [`${id}-sambung`],
    { [baru.id]: 'aktif', [linkId(baru.id, 'next')]: 'aktif' },
  );
  get(model, tail).next = baru.id;
  if (front) model.pointers.set('head', baru.id);
  rec.push(
    front
      ? `\`tail->next = baru\`: node ${tailValue} kini kembali ke node ${x}, jadi node ${x} menjadi node pertama.`
      : `\`tail->next = baru\`: node ${tailValue} kini menunjuk ke node ${x}, bukan lagi ke node ${value(model, head)}.`,
    [`${id}-tail`],
    { [baru.id]: 'aktif', [linkId(tail, 'next')]: 'aktif' },
  );
  if (!front) model.pointers.set('tail', baru.id);
  model.pointers.delete('baru');
  rec.push(
    front
      ? `Fungsi mengembalikan \`tail\`, yang tetap node ${tailValue}. Lingkaran sekarang ${listText(model)}. \`tambahBelakang\` menjalankan langkah yang sama persis; bedanya hanya node yang dikembalikan sebagai \`tail\`.`
      : `Fungsi mengembalikan \`baru\`, jadi node ${x} menjadi \`tail\` yang baru. Lingkaran sekarang ${listText(model)}. \`tambahDepan\` menjalankan langkah yang sama persis; bedanya hanya \`tail\` lama yang dikembalikan.`,
    [`${id}-pindah`],
    { [baru.id]: 'aktif' },
    resultText(model),
  );
}

function depan(model: Model, rec: Recorder, x: number) {
  const { jenis } = model;
  if (jenis === 'circular-singly') {
    sisipCircularSingly(model, rec, x, true);
    return;
  }
  const head = model.pointers.get('head') ?? null;
  const headText = head === null ? '' : `node ${value(model, head)}`;
  rec.push(
    startCaption(
      model,
      jenis === 'doubly' ? `\`tambahDepan(${x})\` menambahkan ${x} di depan.` : `\`head = tambahDepan(head, ${x})\` menambahkan ${x} di depan.`,
    ),
    [],
  );

  const baru = newNode(model, x);
  model.order.unshift(baru.id);
  model.pointers.set('baru', baru.id);

  if (jenis === 'singly') {
    baru.next = head;
    rec.push(
      `\`baru = new Node{${x}, head}\`: buat node ${x} yang \`next\`-nya menunjuk ke \`head\` lama, ${head === null ? 'yaitu `nullptr`' : `yaitu ${headText}`}. Di Python: \`Node(${x}, head)\`.`,
      ['d-baru'],
      head === null ? { [baru.id]: 'aktif' } : { [baru.id]: 'aktif', [linkId(baru.id, 'next')]: 'aktif' },
    );
    model.pointers.set('head', baru.id);
    model.pointers.delete('baru');
    rec.push(
      `Fungsi mengembalikan \`baru\`, lalu \`head = tambahDepan(head, ${x})\` menyimpannya: node ${x} menjadi \`head\` yang baru. Berapa pun panjang list-nya, langkahnya tetap dua. List sekarang ${listText(model)}.`,
      ['d-pindah'],
      { [baru.id]: 'aktif' },
      resultText(model),
    );
    return;
  }

  if (jenis === 'doubly') {
    baru.next = head;
    rec.push(
      `Buat node baru berisi ${x}. \`prev\`-nya \`nullptr\` karena ia akan menjadi node pertama, dan \`next\`-nya menunjuk ke \`head\` lama${head === null ? ', yang masih `nullptr`' : `, yaitu ${headText}`}.`,
      ['d-baru'],
      head === null ? { [baru.id]: 'aktif' } : { [baru.id]: 'aktif', [linkId(baru.id, 'next')]: 'aktif' },
    );
    if (head !== null) {
      get(model, head).prev = baru.id;
      rec.push(
        `\`head->prev = baru\`: ${headText} kini menunjuk balik ke node ${x} lewat \`prev\`.`,
        ['d-cek', 'd-prev'],
        { [baru.id]: 'aktif', [linkId(head, 'prev')]: 'aktif' },
      );
    } else {
      model.pointers.set('tail', baru.id);
      rec.push(`List tadinya kosong, jadi node ${x} juga menjadi \`tail\`.`, ['d-cek', 'd-kosong'], { [baru.id]: 'aktif' });
    }
    model.pointers.set('head', baru.id);
    model.pointers.delete('baru');
    rec.push(`\`head = baru\`: node ${x} menjadi \`head\`. List sekarang ${listText(model)}.`, ['d-pindah'], { [baru.id]: 'aktif' }, resultText(model));
    return;
  }

  rec.push(`Buat node baru berisi ${x}.`, ['d-baru'], { [baru.id]: 'aktif' });

  if (head === null) {
    baru.next = baru.id;
    baru.prev = baru.id;
    rec.push(`List kosong, jadi \`next\` dan \`prev\` milik node ${x} menunjuk ke dirinya sendiri.`, ['d-kosong', 'd-diri'], {
      [baru.id]: 'aktif',
      [linkId(baru.id, 'next')]: 'aktif',
      [linkId(baru.id, 'prev')]: 'aktif',
    });
  } else {
    const tail = get(model, head).prev!;
    model.pointers.set('tail', tail);
    rec.push(
      `\`tail = head->prev\`: node terakhir langsung didapat dari \`prev\` milik \`head\`, yaitu node ${value(model, tail)}. Tidak perlu menelusuri list.`,
      ['d-lain', 'd-akhir'],
      { [baru.id]: 'aktif', [linkId(head, 'prev')]: 'aktif' },
    );
    baru.next = head;
    baru.prev = tail;
    rec.push(
      `\`baru->next = head\` dan \`baru->prev = tail\`: node ${x} diselipkan di antara node ${value(model, tail)} dan ${headText}.`,
      ['d-sambung'],
      { [baru.id]: 'aktif', [linkId(baru.id, 'next')]: 'aktif', [linkId(baru.id, 'prev')]: 'aktif' },
    );
    get(model, tail).next = baru.id;
    get(model, head).prev = baru.id;
    rec.push(
      `\`tail->next = baru\` dan \`head->prev = baru\`: node ${value(model, tail)} dan ${headText} kini menunjuk ke node ${x}.`,
      ['d-ikat'],
      { [baru.id]: 'aktif', [linkId(tail, 'next')]: 'aktif', [linkId(head, 'prev')]: 'aktif' },
    );
    model.pointers.delete('tail');
  }

  model.pointers.set('head', baru.id);
  model.pointers.delete('baru');
  const same = head === null ? '' : ' Bedanya dengan tambah di belakang hanya langkah terakhir ini.';
  rec.push(
    `Fungsi mengembalikan \`head->prev\`, yaitu node ${x}, sebagai \`head\` yang baru. Lingkaran sekarang ${listText(model)}.${same}`,
    ['d-pindah'],
    { [baru.id]: 'aktif' },
    resultText(model),
  );
}

function belakang(model: Model, rec: Recorder, x: number) {
  const { jenis } = model;
  if (jenis === 'circular-singly') {
    sisipCircularSingly(model, rec, x, false);
    return;
  }
  const head = model.pointers.get('head') ?? null;
  const rest = {
    singly: `\`head = tambahBelakang(head, ${x})\` menambahkan ${x} di belakang. List ini tidak menyimpan \`tail\`, jadi node terakhir harus dicari dulu.`,
    doubly: `\`tambahBelakang(${x})\` menambahkan ${x} di belakang lewat \`tail\`, tanpa menelusuri list.`,
    'circular-singly': '',
    'circular-doubly': `\`head = tambahBelakang(head, ${x})\` menambahkan ${x} di belakang. Node terakhir didapat dari \`head->prev\`, tanpa menelusuri list.`,
  }[jenis];
  rec.push(startCaption(model, rest), []);

  const baru = newNode(model, x);
  model.order.push(baru.id);
  model.pointers.set('baru', baru.id);

  if (jenis === 'singly') {
    rec.push(
      `\`baru = new Node{${x}, nullptr}\`: buat node ${x}. \`next\`-nya \`nullptr\` karena ia akan menjadi node terakhir.`,
      ['b-baru'],
      { [baru.id]: 'aktif' },
    );
    if (head === null) {
      model.pointers.set('head', baru.id);
      model.pointers.delete('baru');
      rec.push(
        `List kosong, jadi tidak ada node terakhir. \`baru\` langsung dikembalikan dan menjadi \`head\`. List sekarang ${listText(model)}.`,
        ['b-kosong'],
        { [baru.id]: 'aktif' },
        resultText(model),
      );
      return;
    }
    let p = head;
    model.pointers.set('p', p);
    const walked: string[] = [];
    rec.push(`\`p = head\`: mulai menelusuri dari node ${value(model, p)}.`, ['b-awal'], { [baru.id]: 'aktif' });
    while (get(model, p).next !== null) {
      walked.push(p);
      const from = value(model, p);
      p = get(model, p).next!;
      model.pointers.set('p', p);
      rec.push(
        `\`p->next\` milik node ${from} belum \`nullptr\`, jadi \`p = p->next\`: \`p\` pindah ke node ${value(model, p)}.`,
        ['b-cek', 'b-maju'],
        { ...passed(walked, 'dibuang'), [baru.id]: 'aktif' },
      );
    }
    rec.push(
      `\`p->next\` sudah \`nullptr\`: \`p\` berhenti TEPAT di node terakhir, yaitu ${value(model, p)}. Karena itu kondisinya \`p->next != nullptr\`, bukan \`p != nullptr\`.`,
      ['b-cek'],
      { ...passed(walked, 'dibuang'), [p]: 'aktif', [baru.id]: 'aktif' },
    );
    get(model, p).next = baru.id;
    model.pointers.delete('baru');
    rec.push(
      `\`p->next = baru\`: node ${value(model, p)} kini menunjuk ke node ${x}, dan \`head\` tidak berubah. List sekarang ${listText(model)}. Dengan pointer \`tail\`, penelusuran tadi tidak perlu: cukup \`tail->next = baru\` lalu \`tail = baru\`.`,
      ['b-sambung'],
      { [baru.id]: 'aktif', [linkId(p, 'next')]: 'aktif' },
      resultText(model),
    );
    return;
  }

  if (jenis === 'doubly') {
    const tail = model.pointers.get('tail') ?? null;
    baru.prev = tail;
    rec.push(
      `Buat node baru berisi ${x}. \`prev\`-nya menunjuk ke \`tail\`${tail === null ? ', yang masih `nullptr`' : `, yaitu node ${value(model, tail)}`}, dan \`next\`-nya \`nullptr\`.`,
      ['b-baru'],
      tail === null ? { [baru.id]: 'aktif' } : { [baru.id]: 'aktif', [linkId(baru.id, 'prev')]: 'aktif' },
    );
    if (tail !== null) {
      get(model, tail).next = baru.id;
      rec.push(`\`tail->next = baru\`: node ${value(model, tail)} kini menunjuk ke node ${x}.`, ['b-cek', 'b-sambung'], {
        [baru.id]: 'aktif',
        [linkId(tail, 'next')]: 'aktif',
      });
    } else {
      model.pointers.set('head', baru.id);
      rec.push(`List tadinya kosong, jadi node ${x} juga menjadi \`head\`.`, ['b-cek', 'b-kosong'], { [baru.id]: 'aktif' });
    }
    model.pointers.set('tail', baru.id);
    model.pointers.delete('baru');
    rec.push(
      `\`tail = baru\`: node ${x} menjadi \`tail\` yang baru. Tidak ada penelusuran sama sekali berkat \`tail\`. List sekarang ${listText(model)}.`,
      ['b-pindah'],
      { [baru.id]: 'aktif' },
      resultText(model),
    );
    return;
  }

  rec.push(`Buat node baru berisi ${x}.`, ['b-baru'], { [baru.id]: 'aktif' });

  if (head === null) {
    baru.next = baru.id;
    baru.prev = baru.id;
    model.pointers.set('head', baru.id);
    model.pointers.delete('baru');
    rec.push(
      `List kosong, jadi \`next\` dan \`prev\` milik node ${x} menunjuk ke dirinya sendiri, dan node ${x} menjadi \`head\`. Lingkaran sekarang ${listText(model)}.`,
      ['b-kosong', 'b-diri'],
      { [baru.id]: 'aktif', [linkId(baru.id, 'next')]: 'aktif', [linkId(baru.id, 'prev')]: 'aktif' },
      resultText(model),
    );
    return;
  }

  const headText = `node ${value(model, head)}`;

  const tail = get(model, head).prev!;
  model.pointers.set('tail', tail);
  rec.push(
    `\`tail = head->prev\`: node terakhir langsung didapat dari \`prev\` milik \`head\`, yaitu node ${value(model, tail)}.`,
    ['b-lain', 'b-akhir'],
    { [baru.id]: 'aktif', [linkId(head, 'prev')]: 'aktif' },
  );
  baru.next = head;
  baru.prev = tail;
  rec.push(
    `\`baru->next = head\` dan \`baru->prev = tail\`: node ${x} diselipkan di antara node ${value(model, tail)} dan ${headText}.`,
    ['b-sambung'],
    { [baru.id]: 'aktif', [linkId(baru.id, 'next')]: 'aktif', [linkId(baru.id, 'prev')]: 'aktif' },
  );
  get(model, tail).next = baru.id;
  get(model, head).prev = baru.id;
  model.pointers.delete('tail');
  model.pointers.delete('baru');
  rec.push(
    `\`tail->next = baru\` dan \`head->prev = baru\`: node ${x} kini menjadi node terakhir, karena \`head->prev\` menunjuk ke sana. \`head\` tidak berubah. Lingkaran sekarang ${listText(model)}.`,
    ['b-ikat'],
    { [baru.id]: 'aktif', [linkId(tail, 'next')]: 'aktif', [linkId(head, 'prev')]: 'aktif' },
    resultText(model),
  );
}

function cari(model: Model, rec: Recorder, x: number) {
  const circular = isCircular(model.jenis);
  const ids = [...model.order];
  const head = model.pointers.get('head') ?? null;
  const tailOnly = model.jenis === 'circular-singly';
  const first = tailOnly ? 'tail->next' : 'head';
  rec.push(
    startCaption(
      model,
      `\`cariPosisi(${tailOnly ? 'tail' : 'head'}, ${x})\` memeriksa node satu per satu dari depan dan mengembalikan posisi kemunculan pertama ${x} (dihitung dari 0), atau -1 jika tidak ada.`,
    ),
    [],
  );

  if (circular && head === null) {
    rec.push(`\`${tailOnly ? 'tail' : 'head'}\` bernilai \`nullptr\`, jadi \`cariPosisi\` langsung mengembalikan -1.`, ['c-kosong'], {}, 'cariPosisi → -1');
    return;
  }

  model.variables.set('posisi', '0');
  model.pointers.set('p', head);
  rec.push(
    head === null ? '`posisi = 0` dan `p = head`, yang bernilai `nullptr`.' : `\`posisi = 0\` dan \`p = ${first}\`: \`p\` menunjuk ke node ${value(model, head)}.`,
    ['c-awal'],
  );

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const v = value(model, id);
    model.pointers.set('p', id);
    model.variables.set('posisi', String(i));
    const where = i === 0 ? `\`p\` di node ${v}, posisi 0` : `\`posisi = ${i}\`, \`p = p->next\`: \`p\` pindah ke node ${v}`;
    const lines = i === 0 ? [circular ? 'c-ulangi' : 'c-cek', 'c-banding'] : ['c-maju', 'c-cek', 'c-banding'];
    if (v === x) {
      rec.push(
        `${where}. \`${v} == ${x}\`, ketemu! \`cariPosisi\` mengembalikan ${i}.`,
        [...lines, 'c-ketemu'],
        { ...passed(ids.slice(0, i), 'dibuang'), [id]: 'selesai' },
        `cariPosisi → ${i}`,
      );
      return;
    }
    rec.push(`${where}. Apakah \`${v} == ${x}\`? Tidak, jadi lanjut ke node berikutnya.`, lines, {
      ...passed(ids.slice(0, i), 'dibuang'),
      [id]: 'aktif',
    });
  }

  model.variables.set('posisi', String(ids.length));
  if (circular) {
    model.pointers.set('p', head);
    rec.push(
      `\`posisi = ${ids.length}\`, \`p = p->next\`: \`p\` kembali ke \`${first}\`. Semua node sudah diperiksa sekali tanpa menemukan ${x}, jadi \`cariPosisi\` mengembalikan -1.`,
      ['c-maju', 'c-cek', 'c-gagal'],
      passed(ids, 'dibuang'),
      'cariPosisi → -1',
    );
    return;
  }
  model.pointers.set('p', null);
  rec.push(
    ids.length === 0
      ? 'Kondisi `p != nullptr` langsung salah karena list kosong, jadi perulangan tidak berjalan dan `cariPosisi` mengembalikan -1.'
      : `\`posisi = ${ids.length}\`, \`p = p->next\`: \`p\` sekarang \`nullptr\`. Sudah sampai ujung tanpa menemukan ${x}, jadi \`cariPosisi\` mengembalikan -1.`,
    ids.length === 0 ? ['c-cek', 'c-gagal'] : ['c-maju', 'c-cek', 'c-gagal'],
    passed(ids, 'dibuang'),
    'cariPosisi → -1',
  );
}

function hapusSingly(model: Model, rec: Recorder, x: number) {
  const head = model.pointers.get('head') ?? null;
  rec.push(
    startCaption(
      model,
      `\`head = hapusNilai(head, ${x})\` menghapus kemunculan pertama ${x}. Ada dua kasus: ${x} adalah \`head\`, atau ${x} ada di tengah atau di akhir.`,
    ),
    [],
  );
  if (head === null) {
    rec.push(
      '`head` bernilai `nullptr`: list kosong, tidak ada yang dihapus. Fungsi langsung mengembalikan `nullptr`.',
      ['h-kosong'],
      {},
      `${x} tidak ada`,
    );
    return;
  }

  const first = get(model, head);
  if (first.value === x) {
    rec.push(`\`head->data == ${x}\`: yang dihapus adalah \`head\` (kasus 1).`, ['h-kasus1'], { [head]: 'aktif' });
    model.pointers.set('sisa', first.next);
    rec.push(
      first.next === null
        ? `\`sisa = head->next\`, yaitu \`nullptr\`, karena node ${x} satu-satunya node. Alamat ini disimpan sebelum \`head\` dihapus.`
        : `\`sisa = head->next\`: simpan alamat node ${value(model, first.next)} sebelum node ${x} dihapus.`,
      ['h-sisa'],
      { [head]: 'dibuang' },
    );
    model.pointers.set('head', first.next);
    removeNode(model, head);
    model.pointers.delete('sisa');
    rec.push(
      `\`delete head\` lalu kembalikan \`sisa\`: node ${x} dibebaskan, dan \`head = hapusNilai(...)\` membuat ${first.next === null ? 'list kosong' : `node ${value(model, first.next)} menjadi \`head\` yang baru`}. Di Python cukup \`return head.next\`; node lama dibebaskan otomatis. List sekarang ${listText(model)}.`,
      ['h-hapus1'],
      {},
      resultText(model),
    );
    return;
  }

  rec.push(`\`head->data\` adalah ${first.value}, bukan ${x}, jadi ini bukan kasus 1.`, ['h-kasus1'], { [head]: 'aktif' });
  let prev = head;
  model.pointers.set('prev', prev);
  rec.push(
    '`prev = head`. Yang diperiksa selalu node SESUDAH `prev`, karena nanti `next` milik `prev`-lah yang diubah.',
    ['h-awal'],
  );
  const walked: string[] = [];
  for (;;) {
    const next = get(model, prev).next;
    if (next === null) {
      rec.push(
        `\`prev->next\` sudah \`nullptr\`: sampai ujung tanpa menemukan ${x}. Berkat short-circuit, \`prev->next->data\` tidak pernah dibaca dari \`nullptr\`. List tidak berubah.`,
        ['h-cari', 'h-ketemu'],
        passed([...walked, prev], 'dibuang'),
        `${x} tidak ada`,
      );
      return;
    }
    if (value(model, next) === x) {
      rec.push(
        `\`prev->next->data == ${x}\`: ketemu, perulangan berhenti. Target ada tepat sesudah \`prev\`.`,
        ['h-cari'],
        { ...passed(walked, 'dibuang'), [next]: 'aktif' },
      );
      break;
    }
    walked.push(prev);
    rec.push(
      `\`prev->next->data\` adalah ${value(model, next)}, bukan ${x}, jadi \`prev = prev->next\`: \`prev\` maju ke node ${value(model, next)}.`,
      ['h-cari', 'h-maju'],
      passed(walked, 'dibuang'),
    );
    prev = next;
    model.pointers.set('prev', prev);
  }

  const target = get(model, get(model, prev).next!);
  model.pointers.set('target', target.id);
  get(model, prev).next = target.next;
  target.terlepas = true;
  rec.push(
    `\`target = prev->next\`, lalu \`prev->next = target->next\`: \`next\` milik node ${value(model, prev)} kini melompati node ${x} dan langsung menunjuk ke ${target.next === null ? '`nullptr`' : `node ${value(model, target.next)}`}.`,
    ['h-ketemu', 'h-lompat'],
    { [target.id]: 'dibuang', ...relinked(model, prev, 'next') },
  );
  removeNode(model, target.id);
  rec.push(
    `\`delete target\`: node ${x} dibebaskan. Urutannya penting: sambungkan dulu, baru hapus. ${freed(x)} List sekarang ${listText(model)}.`,
    ['h-hapus'],
    {},
    resultText(model),
  );
}

function hapusDoubly(model: Model, rec: Recorder, x: number) {
  const head = model.pointers.get('head') ?? null;
  const ids = [...model.order];
  rec.push(
    startCaption(model, `\`hapusNilai(${x})\` mencari node ${x} dengan \`p\`, lalu menyambungkan tetangga kiri dan kanannya. Berkat \`prev\` di setiap node, node sebelumnya langsung diketahui.`),
    [],
  );
  model.pointers.set('p', head);
  rec.push(head === null ? '`p = head`, yang bernilai `nullptr` karena list kosong.' : `\`p = head\`: \`p\` menunjuk ke node ${value(model, head)}.`, ['h-awal']);

  let found: string | null = null;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const v = value(model, id);
    model.pointers.set('p', id);
    const where = i === 0 ? `\`p\` di node ${v}` : `\`p = p->next\`: \`p\` pindah ke node ${v}`;
    if (v === x) {
      rec.push(`${where}. \`${v} == ${x}\`, ketemu! Perulangan berhenti.`, i === 0 ? ['h-cari'] : ['h-maju', 'h-cari'], {
        ...passed(ids.slice(0, i), 'dibuang'),
        [id]: 'aktif',
      });
      found = id;
      break;
    }
    rec.push(`${where}. \`${v} != ${x}\`, jadi lanjut.`, i === 0 ? ['h-cari'] : ['h-maju', 'h-cari'], {
      ...passed(ids.slice(0, i), 'dibuang'),
      [id]: 'aktif',
    });
  }

  if (found === null) {
    model.pointers.set('p', null);
    rec.push(
      ids.length === 0
        ? `\`p\` sudah \`nullptr\`, jadi ${x} tidak ada dan tidak ada yang dihapus.`
        : `\`p = p->next\`: \`p\` sekarang \`nullptr\`. ${x} tidak ada, jadi list tidak berubah.`,
      ids.length === 0 ? ['h-cari', 'h-gagal'] : ['h-maju', 'h-cari', 'h-gagal'],
      passed(ids, 'dibuang'),
      `${x} tidak ada`,
    );
    return;
  }

  const p = get(model, found);
  p.terlepas = true;
  if (p.prev !== null) {
    get(model, p.prev).next = p.next;
    rec.push(
      `\`p->prev->next = p->next\`: node ${value(model, p.prev)} kini menunjuk ke ${p.next === null ? '`nullptr`' : `node ${value(model, p.next)}`} lewat \`next\`, melompati node ${x}.`,
      ['h-gagal', 'h-kiri', 'h-kiri-ya'],
      { [p.id]: 'dibuang', ...relinked(model, p.prev, 'next') },
    );
  } else {
    model.pointers.set('head', p.next);
    rec.push(
      `\`p\` adalah \`head\` (\`p->prev\` bernilai \`nullptr\`), jadi \`head = p->next\`: ${p.next === null ? '`head` menjadi `nullptr`' : `node ${value(model, p.next)} menjadi \`head\``}.`,
      ['h-gagal', 'h-kiri', 'h-head2'],
      { [p.id]: 'dibuang' },
    );
  }
  if (p.next !== null) {
    get(model, p.next).prev = p.prev;
    rec.push(
      `\`p->next->prev = p->prev\`: node ${value(model, p.next)} kini menunjuk balik ke ${p.prev === null ? '`nullptr`, karena ia node pertama' : `node ${value(model, p.prev)}`} lewat \`prev\`.`,
      ['h-kanan', 'h-kanan-ya'],
      { [p.id]: 'dibuang', ...relinked(model, p.next, 'prev') },
    );
  } else {
    model.pointers.set('tail', p.prev);
    rec.push(
      `\`p\` adalah \`tail\` (\`p->next\` bernilai \`nullptr\`), jadi \`tail = p->prev\`: ${p.prev === null ? '`tail` menjadi `nullptr`' : `node ${value(model, p.prev)} menjadi \`tail\``}.`,
      ['h-kanan', 'h-tail'],
      { [p.id]: 'dibuang' },
    );
  }
  removeNode(model, p.id);
  rec.push(`\`delete p\`: node ${x} dibebaskan. ${freed(x)} List sekarang ${listText(model)}.`, ['h-hapus'], {}, resultText(model));
}

function hapusCircular(model: Model, rec: Recorder, x: number) {
  const withPrev = model.jenis === 'circular-singly';
  const head = model.pointers.get('head') ?? null;
  const ids = [...model.order];
  rec.push(
    startCaption(
      model,
      withPrev
        ? `\`tail = hapusNilai(tail, ${x})\` mencari ${x} dengan \`p\` sambil membawa \`prev\`. \`prev\` mulai dari \`tail\`, karena pada lingkaran node sebelum node pertama adalah \`tail\`.`
        : `\`head = hapusNilai(head, ${x})\` mencari ${x} dengan \`p\`, lalu menyambungkan tetangga kiri dan kanannya lewat \`prev\` dan \`next\`.`,
    ),
    [],
  );
  if (head === null) {
    rec.push(`\`${withPrev ? 'tail' : 'head'}\` bernilai \`nullptr\`: list kosong, tidak ada yang dihapus.`, ['h-kosong'], {}, `${x} tidak ada`);
    return;
  }

  model.pointers.set('p', head);
  if (withPrev) model.pointers.set('prev', model.pointers.get('tail')!);
  rec.push(
    withPrev ? `\`prev = tail\` dan \`p = tail->next\`: \`p\` di node ${value(model, head)}, \`prev\` di node ${value(model, model.pointers.get('tail')!)}.` : `\`p = head\`: \`p\` menunjuk ke node ${value(model, head)}.`,
    ['h-awal'],
  );

  let found: string | null = null;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const v = value(model, id);
    model.pointers.set('p', id);
    if (withPrev && i > 0) model.pointers.set('prev', ids[i - 1]);
    const move = withPrev ? '`prev = p`, `p = p->next`' : '`p = p->next`';
    const where = i === 0 ? `\`p\` di node ${v}` : `${move}: \`p\` pindah ke node ${v}`;
    const lines = i === 0 ? ['h-ulangi', 'h-banding'] : ['h-maju', 'h-cek', 'h-banding'];
    const highlights = { ...passed(ids.slice(0, i), 'dibuang'), [id]: 'aktif' as const };
    if (v === x) {
      rec.push(`${where}. \`${v} == ${x}\`, ketemu! Perulangan berhenti.`, lines, highlights);
      found = id;
      break;
    }
    rec.push(`${where}. \`${v} != ${x}\`, jadi lanjut.`, lines, highlights);
  }

  if (found === null) {
    model.pointers.set('p', head);
    if (withPrev) model.pointers.set('prev', ids[ids.length - 1]);
    rec.push(
      `${withPrev ? '`prev = p`, `p = p->next`' : '`p = p->next`'}: \`p\` kembali ke \`${withPrev ? 'tail->next' : 'head'}\`. Semua node sudah diperiksa, ${x} tidak ada, jadi list tidak berubah.`,
      ['h-maju', 'h-cek', 'h-gagal'],
      passed(ids, 'dibuang'),
      `${x} tidak ada`,
    );
    return;
  }

  const p = get(model, found);
  p.terlepas = true;
  if (p.next === p.id) {
    model.pointers.set('head', null);
    if (withPrev) model.pointers.set('tail', null);
    rec.push(
      withPrev
        ? `\`p == prev\`: node ${x} satu-satunya node dan menunjuk ke dirinya sendiri, jadi \`tail\` menjadi \`nullptr\` dan list menjadi kosong.`
        : `\`p->next == p\`: node ${x} satu-satunya node, jadi \`head\` menjadi \`nullptr\` dan list menjadi kosong.`,
      ['h-gagal', 'h-satu'],
      { [p.id]: 'dibuang' },
    );
  } else {
    const before = withPrev ? model.pointers.get('prev')! : p.prev!;
    const after = p.next!;
    get(model, before).next = after;
    if (!withPrev) get(model, after).prev = before;
    // With only `tail` stored, the first node is simply `tail->next`, which this step already changed.
    const newFirst = withPrev && found === head;
    if (newFirst) model.pointers.set('head', after);
    rec.push(
      withPrev
        ? `\`prev->next = p->next\`: node ${value(model, before)} kini melompati node ${x} dan langsung menunjuk ke node ${value(model, after)}.${
            newFirst ? ` Karena \`prev\` adalah \`tail\`, node ${value(model, after)} kini menjadi node pertama.` : ''
          }`
        : `\`p->prev->next = p->next\` dan \`p->next->prev = p->prev\`: node ${value(model, before)} dan node ${value(model, after)} kini saling menunjuk, melompati node ${x}.`,
      ['h-gagal', 'h-lain', 'h-lompat'],
      withPrev
        ? { [p.id]: 'dibuang', [linkId(before, 'next')]: 'aktif' }
        : { [p.id]: 'dibuang', [linkId(before, 'next')]: 'aktif', [linkId(after, 'prev')]: 'aktif' },
    );
    if (!withPrev && found === head) {
      model.pointers.set('head', after);
      rec.push(`\`p\` adalah \`head\`, jadi \`head = p->next\`: node ${value(model, after)} menjadi \`head\`.`, ['h-geser'], { [p.id]: 'dibuang' });
    }
    if (withPrev && found === model.pointers.get('tail')) {
      model.pointers.set('tail', before);
      rec.push(`\`p == tail\`, jadi \`tail = prev\`: node ${value(model, before)} menjadi \`tail\`.`, ['h-ekor'], { [p.id]: 'dibuang' });
    }
  }
  removeNode(model, p.id);
  rec.push(`\`delete p\`: node ${x} dibebaskan. ${freed(x)} List sekarang ${listText(model)}.`, ['h-hapus'], {}, resultText(model));
}

/**
 * Turns one linked list operation into steps. The first step shows the
 * starting list; every following step is one action of the operation's
 * pseudocode (`linkedListPseudocode`), as a full snapshot.
 */
export function linkedListSteps(input: LinkedListInput): LinkedListStep[] {
  const model = buildModel(input.jenis, input.operasi, input.data);
  const rec = recorder(model);
  const x = input.nilai ?? 0;
  switch (input.operasi) {
    case 'telusuri':
      telusuri(model, rec);
      break;
    case 'depan':
      depan(model, rec, x);
      break;
    case 'belakang':
      belakang(model, rec, x);
      break;
    case 'cari':
      cari(model, rec, x);
      break;
    case 'hapus':
      if (input.jenis === 'singly') hapusSingly(model, rec, x);
      else if (input.jenis === 'doubly') hapusDoubly(model, rec, x);
      else hapusCircular(model, rec, x);
      break;
  }
  return rec.steps;
}
