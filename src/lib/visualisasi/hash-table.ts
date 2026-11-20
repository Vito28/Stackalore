import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * A hash table with 10 lockers and separate chaining, as built in the Hash
 * Table lesson. It uses the toy hash from the Map dan Set lesson
 * (`hashMainan` / `hash_mainan`): add up the ASCII codes of the key's
 * letters, then take the remainder after dividing by 10. Each locker holds a
 * short chain of `kunci:nilai` entries.
 */

export type HashOperation =
  | { type: 'tambah'; key: string; value: number }
  | { type: 'cari'; key: string }
  | { type: 'hapus'; key: string };

export interface HashEntry {
  /** Stable identity so the view can animate the same entry across steps. */
  id: string;
  key: string;
  value: number;
}

export interface HashComputation {
  key: string;
  /** ASCII code of each letter, in order. */
  codes: number[];
  total: number;
  bucket: number;
}

export interface HashTableState {
  /** One chain per locker, oldest entry first. Always `HASH_BUCKETS` long. */
  buckets: HashEntry[][];
  /** Index of the operation this step shows, or null for the starting step. */
  operation: number | null;
  /** Hash computation for the current operation, shown above the lockers. */
  computation: HashComputation | null;
}

export type HashTableStep = Step<HashTableState>;

export const HASH_BUCKETS = 10;
export const HASH_LIMITS = { maxOperations: 12, maxKeyLength: 8, minValue: 0, maxValue: 999 } as const;

const keyPattern = /^[a-z]{1,8}$/;

/** Element id of a locker, used for highlights. */
export const bucketId = (index: number) => `loker-${index}`;

/** The lesson's example: five names with their ages, a hit, a miss, and removing one key of the collision. */
export const lessonHashOperations: HashOperation[] = [
  { type: 'tambah', key: 'budi', value: 21 },
  { type: 'tambah', key: 'citra', value: 20 },
  { type: 'tambah', key: 'andi', value: 19 },
  { type: 'tambah', key: 'dina', value: 22 },
  { type: 'tambah', key: 'dodi', value: 18 },
  { type: 'cari', key: 'dina' },
  { type: 'cari', key: 'eko' },
  { type: 'hapus', key: 'andi' },
];

/** Follows the lesson's functions: `hashMainan`, `cariDiLoker`, `tambah`, `cari`, `hapus`. */
export const hashPseudocode: PseudocodeLine[] = [
  { id: 'hash', text: 'hashMainan(kunci):', indent: 0 },
  { id: 'hash-hitung', text: 'jumlahkan kode ASCII hurufnya', indent: 1 },
  { id: 'hash-sisa', text: 'kembalikan jumlah % 10', indent: 1 },
  { id: 'loker', text: 'cariDiLoker(loker, kunci):', indent: 0 },
  { id: 'loker-banding', text: 'bandingkan kunci satu per satu', indent: 1 },
  { id: 'loker-hasil', text: 'cocok → posisinya, habis → -1', indent: 1 },
  { id: 'tambah', text: 'tambah(kunci, nilai):', indent: 0 },
  { id: 'tambah-awal', text: 'i ← hashMainan(kunci)', indent: 1 },
  { id: 'tambah-cari', text: 'j ← cariDiLoker(i, kunci)', indent: 1 },
  { id: 'tambah-ganti', text: 'jika j ≠ -1: ganti nilainya', indent: 1 },
  { id: 'tambah-baru', text: 'selain itu: masuk ke loker i', indent: 1 },
  { id: 'cari', text: 'cari(kunci):', indent: 0 },
  { id: 'cari-awal', text: 'i ← hashMainan(kunci)', indent: 1 },
  { id: 'cari-cari', text: 'j ← cariDiLoker(i, kunci)', indent: 1 },
  { id: 'cari-gagal', text: 'jika j = -1: tidak ditemukan', indent: 1 },
  { id: 'cari-hasil', text: 'kembalikan nilai entri ke-j', indent: 1 },
  { id: 'hapus', text: 'hapus(kunci):', indent: 0 },
  { id: 'hapus-awal', text: 'i ← hashMainan(kunci)', indent: 1 },
  { id: 'hapus-cari', text: 'j ← cariDiLoker(i, kunci)', indent: 1 },
  { id: 'hapus-gagal', text: 'jika j = -1: tidak ada', indent: 1 },
  { id: 'hapus-buang', text: 'buang entri ke-j dari loker i', indent: 1 },
];

/** The lesson's `hashMainan`: sum of ASCII codes, modulo 10. */
export function hashMainan(key: string): HashComputation {
  const codes = Array.from(key, (letter) => letter.charCodeAt(0));
  const total = codes.reduce((sum, code) => sum + code, 0);
  return { key, codes, total, bucket: total % HASH_BUCKETS };
}

export function formatHashOperation(operation: HashOperation): string {
  return operation.type === 'tambah' ? `tambah(${operation.key}, ${operation.value})` : `${operation.type}(${operation.key})`;
}

/** Reads a key typed by the reader; returns an Indonesian error message when invalid. */
export function parseHashKey(text: string): { key: string } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Isi dulu kuncinya, misalnya dina.' };
  if (!keyPattern.test(trimmed)) {
    return { error: `Kunci harus huruf kecil a sampai z saja, 1 sampai ${HASH_LIMITS.maxKeyLength} huruf, misalnya dina.` };
  }
  return { key: trimmed };
}

/** Reads a value typed by the reader for `tambah`; returns an Indonesian error message when invalid. */
export function parseHashValue(text: string): { value: number } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Isi dulu nilainya, misalnya umur 22.' };
  if (!/^\d+$/.test(trimmed)) return { error: 'Nilai harus bilangan bulat, misalnya 22.' };
  const value = Number(trimmed);
  if (value < HASH_LIMITS.minValue || value > HASH_LIMITS.maxValue) {
    return { error: `Pakai nilai dari ${HASH_LIMITS.minValue} sampai ${HASH_LIMITS.maxValue} supaya muat di loker.` };
  }
  return { value };
}

/** Checks a whole sequence (e.g. from MDX props) before generating steps. */
export function validateHashOperations(operations: HashOperation[]): string | null {
  if (operations.length > HASH_LIMITS.maxOperations) return `Maksimal ${HASH_LIMITS.maxOperations} operasi.`;
  for (const operation of operations) {
    if (!keyPattern.test(operation.key)) {
      return `Kunci "${operation.key}" tidak valid. Pakai huruf kecil a sampai z, 1 sampai ${HASH_LIMITS.maxKeyLength} huruf.`;
    }
    if (
      operation.type === 'tambah' &&
      (!Number.isInteger(operation.value) || operation.value < HASH_LIMITS.minValue || operation.value > HASH_LIMITS.maxValue)
    ) {
      return `Nilai untuk "${operation.key}" harus bilangan bulat dari ${HASH_LIMITS.minValue} sampai ${HASH_LIMITS.maxValue}.`;
    }
  }
  return null;
}

/**
 * Parses an operation list written in MDX, e.g. `tambah(budi,21) cari(dina) hapus(andi)`
 * (commas between operations optional). Returns an Indonesian error message for anything else.
 */
export function parseHashOperations(text: string): { operations: HashOperation[] } | { error: string } {
  const operations: HashOperation[] = [];
  for (const token of text.match(/[a-z]+\s*\([^)]*\)|[^\s,]+/g) ?? []) {
    const match = /^(tambah|cari|hapus)\s*\(([^)]*)\)$/.exec(token);
    if (!match) {
      return { error: `Operasi tidak dikenal: ${token}. Gunakan tambah(kunci, nilai), cari(kunci), atau hapus(kunci).` };
    }
    const args = match[2].split(',').map((arg) => arg.trim());
    if (match[1] === 'tambah') {
      if (args.length !== 2 || args[1] === '') return { error: `${token}: tambah butuh kunci dan nilai, misalnya tambah(budi, 21).` };
      const value = parseHashValue(args[1]);
      if ('error' in value) return { error: `${token}: ${value.error}` };
      operations.push({ type: 'tambah', key: args[0], value: value.value });
    } else {
      if (args.length !== 1) return { error: `${token}: ${match[1]} hanya butuh kunci, misalnya ${match[1]}(dina).` };
      operations.push({ type: match[1] as 'cari' | 'hapus', key: args[0] });
    }
  }
  const invalid = validateHashOperations(operations);
  return invalid ? { error: invalid } : { operations };
}

/** `hashMainan("budi") = 420 % 10 = 0`, written as inline code. */
const hashExpression = (computation: HashComputation) =>
  `\`hashMainan("${computation.key}") = ${computation.total} % ${HASH_BUCKETS} = ${computation.bucket}\``;

const entryText = (entry: HashEntry) => `\`${entry.key}:${entry.value}\``;
const chainText = (chain: HashEntry[]) => chain.map(entryText).join(', ');

/**
 * Turns a sequence of operations into steps: one starting step, then for each
 * operation a step that computes `hashMainan` and opens the locker, one step
 * per key compared inside that locker (`cariDiLoker`), and a closing step when
 * the table changes.
 *
 * Rule for duplicates, as in the lesson's `tambah`: adding a key that is
 * already in its locker replaces its value; the key is never stored twice.
 */
export function hashTableSteps(operations: HashOperation[]): HashTableStep[] {
  const steps: HashTableStep[] = [];
  let buckets: HashEntry[][] = Array.from({ length: HASH_BUCKETS }, () => []);
  let created = 0;
  let collisionExplained = false;

  steps.push({
    state: { buckets, operation: null, computation: null },
    highlights: {},
    caption:
      operations.length === 0
        ? 'Kesepuluh loker masih kosong dan belum ada operasi. Tambahkan operasi di bawah untuk mulai.'
        : `Ada ${HASH_BUCKETS} loker bernomor 0 sampai 9, semuanya masih kosong. Ada ${operations.length} operasi yang akan dijalankan dari kiri ke kanan.`,
    lines: [],
    status: 'normal',
  });

  operations.forEach((operation, index) => {
    const done = index === operations.length - 1 ? ' Semua operasi selesai.' : '';
    const computation = hashMainan(operation.key);
    const { key, bucket } = computation;
    const op = operation.type;
    const chain = buckets[bucket];
    const push = (caption: string, lines: string[], highlights: Record<string, Role>, result?: string) => {
      steps.push({
        state: { buckets, operation: index, computation },
        highlights: { [bucketId(bucket)]: 'khusus', ...highlights },
        caption,
        lines,
        result,
        status: 'normal',
      });
    };
    const call = operation.type === 'tambah' ? `\`tambah(${key}, ${operation.value})\`` : `\`${op}(${key})\``;
    const opening = ['hash-hitung', 'hash-sisa', op, `${op}-awal`];
    const search = `${op}-cari`;

    if (chain.length === 0) {
      if (operation.type === 'tambah') {
        const entry = { id: `k${created++}`, key, value: operation.value };
        buckets = buckets.map((items, i) => (i === bucket ? [entry] : items));
        push(
          `${call}: ${hashExpression(computation)}. Loker ${bucket} kosong, jadi ${entryText(entry)} langsung masuk ke sana.${done}`,
          [...opening, search, 'loker-hasil', 'tambah-baru'],
          { [entry.id]: 'aktif' },
          `${key}:${entry.value} → loker ${bucket}`,
        );
      } else if (op === 'cari') {
        push(
          `${call}: ${hashExpression(computation)}. Loker ${bucket} kosong, jadi \`${key}\` pasti tidak ada di tabel, tanpa satu perbandingan pun.${done}`,
          [...opening, search, 'loker-hasil', 'cari-gagal'],
          {},
          '✗ tidak ditemukan',
        );
      } else {
        push(
          `${call}: ${hashExpression(computation)}. Loker ${bucket} kosong, jadi tidak ada yang dihapus dan \`hapus\` mengembalikan \`false\` (\`False\` di Python).${done}`,
          [...opening, search, 'loker-hasil', 'hapus-gagal'],
          {},
          `✗ ${key} tidak ada`,
        );
      }
      return;
    }

    const goal =
      op === 'tambah'
        ? `\`cariDiLoker\` memeriksa dulu apakah \`${key}\` sudah ada di sana`
        : op === 'cari'
          ? 'periksa loker itu saja, loker lain tidak perlu disentuh'
          : `cari \`${key}\` di loker itu`;
    push(
      `${call}: ${hashExpression(computation)}. Loker ${bucket} berisi ${chainText(chain)}, jadi ${goal}.`,
      opening,
      {},
    );

    const found = chain.findIndex((entry) => entry.key === key);
    const compared = found === -1 ? chain : chain.slice(0, found + 1);
    for (const [position, entry] of compared.entries()) {
      const comparing = `Bandingkan \`${key}\` dengan \`${entry.key}\``;
      if (entry.key === key) break;
      if (position < chain.length - 1) {
        push(`${comparing}: bukan, lanjut ke entri berikutnya.`, [op, search, 'loker-banding'], { [entry.id]: 'aktif' });
        continue;
      }
      const exhausted = `Loker ${bucket} sudah habis diperiksa, jadi \`cariDiLoker\` mengembalikan -1`;
      if (op === 'tambah') {
        push(`${comparing}: bukan. ${exhausted}: \`${key}\` belum ada.`, [op, search, 'loker-banding', 'loker-hasil'], {
          [entry.id]: 'aktif',
        });
      } else if (op === 'cari') {
        push(
          `${comparing}: bukan. ${exhausted}, berarti \`${key}\` tidak ada di tabel.${done}`,
          [op, search, 'loker-banding', 'loker-hasil', 'cari-gagal'],
          { [entry.id]: 'aktif' },
          '✗ tidak ditemukan',
        );
      } else {
        push(
          `${comparing}: bukan. ${exhausted}, jadi tidak ada yang dihapus.${done}`,
          [op, search, 'loker-banding', 'loker-hasil', 'hapus-gagal'],
          { [entry.id]: 'aktif' },
          `✗ ${key} tidak ada`,
        );
      }
    }

    if (found === -1) {
      if (operation.type !== 'tambah') return;
      const entry = { id: `k${created++}`, key, value: operation.value };
      const behind = chainText(chain);
      buckets = buckets.map((items, i) => (i === bucket ? [...items, entry] : items));
      const collision = collisionExplained
        ? ''
        : ' Dua kunci berbeda di loker yang sama disebut tabrakan (collision), dan loker cukup menyimpan keduanya dalam satu rantai.';
      collisionExplained = true;
      push(
        `Tabrakan: ${entryText(entry)} berbaris di belakang ${behind} di loker ${bucket}.${collision}${done}`,
        [op, 'tambah-baru'],
        { [entry.id]: 'aktif' },
        `${key}:${entry.value} → loker ${bucket}`,
      );
      return;
    }

    const entry = chain[found];
    const comparisons = found + 1;
    const match = `Bandingkan \`${key}\` dengan \`${entry.key}\`: cocok, jadi \`j = ${found}\``;
    const matchLines = [op, search, 'loker-banding', 'loker-hasil'];

    if (operation.type === 'tambah') {
      push(`${match}. Kunci \`${key}\` sudah ada di tabel.`, matchLines, { [entry.id]: 'selesai' });
      const updated = { ...entry, value: operation.value };
      buckets = buckets.map((items, i) => (i === bucket ? items.map((item) => (item.id === entry.id ? updated : item)) : items));
      const change =
        entry.value === operation.value
          ? `nilainya diganti dengan ${operation.value}, yang kebetulan sama dengan nilai lamanya`
          : `nilainya diganti dari ${entry.value} menjadi ${operation.value}`;
      push(
        `Karena kunci sudah ada, ${change}, persis seperti \`umur["${key}"] = ${operation.value}\` pada map. Tidak ada entri baru, jadi \`${key}\` tetap hanya ada satu.${done}`,
        [op, 'tambah-ganti'],
        { [entry.id]: 'aktif' },
        `${key}: ${entry.value} → ${operation.value}`,
      );
    } else if (op === 'cari') {
      push(
        `${match}. Setelah ${comparisons} perbandingan, \`cari\` mengembalikan nilainya, yaitu ${entry.value}.${done}`,
        [...matchLines, 'cari-hasil'],
        { [entry.id]: 'selesai' },
        `${key} → ${entry.value}`,
      );
    } else {
      push(`${match}. Entri inilah yang dibuang.`, matchLines, { [entry.id]: 'dibuang' });
      buckets = buckets.map((items, i) => (i === bucket ? items.filter((item) => item.id !== entry.id) : items));
      const left = buckets[bucket];
      const after =
        left.length === 0
          ? `Loker ${bucket} sekarang kosong.`
          : found < left.length
            ? `Entri di belakangnya maju, jadi loker ${bucket} sekarang berisi ${chainText(left)}.`
            : `Loker ${bucket} sekarang berisi ${chainText(left)}.`;
      push(
        `${entryText(entry)} dibuang dari loker ${bucket}. ${after} Loker lain tidak tersentuh sama sekali.${done}`,
        [op, 'hapus-buang'],
        {},
        `${key} dihapus`,
      );
    }
  });

  return steps;
}

const randomKeys = ['ani', 'andi', 'budi', 'citra', 'dina', 'dodi', 'eko', 'fajar', 'gita', 'hadi', 'intan', 'joko', 'rina', 'tono'];

/** Random practice sequence: a handful of insertions, then searches and removals of present and missing keys. */
export function randomHashOperations(random: () => number = Math.random, length = 9): HashOperation[] {
  const pick = () => randomKeys[Math.floor(random() * randomKeys.length)];
  const operations: HashOperation[] = [];
  const inserts = Math.max(1, length - 3);
  for (let i = 0; i < inserts; i++) operations.push({ type: 'tambah', key: pick(), value: 17 + Math.floor(random() * 9) });
  for (let i = inserts; i < length; i++) operations.push({ type: random() < 0.6 ? 'cari' : 'hapus', key: pick() });
  return operations;
}
