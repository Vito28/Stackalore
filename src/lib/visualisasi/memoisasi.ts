import { fib, fibPseudocode } from './fibonacci.ts';
import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * `fib(n)` with and without a memo, from the Memoisasi deep dive. The call
 * tree grows one call at a time like the Rekursi visualization; with a memo,
 * a call whose answer is already written down returns at once and has no
 * children. Two small tables show how often each `fib(k)` was called and
 * what the memo holds.
 */

export type ModeMemo = 'tanpa' | 'memo';

export interface MemoCall {
  /** `c<i>`, numbered in call order. */
  id: string;
  n: number;
  left: string | null;
  right: string | null;
  /** Answered from the memo without calling anything. */
  hit: boolean;
}

export interface MemoTree {
  root: string;
  calls: Record<string, MemoCall>;
  order: string[];
}

export interface MemoState {
  tree: MemoTree;
  called: string[];
  results: Record<string, number>;
  /** From the first call to the running one. */
  stack: string[];
  /** `memo[k]` for k = 0..n; null means "belum dihitung" (-1 in the lesson). Base cases are never written. */
  memo: (number | null)[];
  /** How many times `fib(k)` has been called so far, for k = 0..n. */
  counts: number[];
  n: number;
  mode: ModeMemo;
}

export type MemoStep = Step<MemoState>;

export const MEMO_LIMITS = { min: 1, max: 6 } as const;

/** The deep dive draws the call tree of `fib(5)` with a memo. */
export const lessonMemoN = 5;

export const memoPseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'fib(n):', indent: 0 },
  { id: 'dasar', text: 'jika n <= 1 → kembalikan n', indent: 1 },
  { id: 'cek', text: 'jika memo[n] != -1:', indent: 1 },
  { id: 'baca', text: 'kembalikan memo[n]', indent: 2 },
  { id: 'hitung', text: 'memo[n] = fib(n-1) + fib(n-2)', indent: 1 },
  { id: 'kembali', text: 'kembalikan memo[n]', indent: 1 },
];

export const pseudocodeFor = (mode: ModeMemo) => (mode === 'memo' ? memoPseudocode : fibPseudocode);

export const memoCellId = (k: number) => `m${k}`;
export const countCellId = (k: number) => `h${k}`;

export function validateMemoN(n: number): string | null {
  if (!Number.isInteger(n) || n < MEMO_LIMITS.min || n > MEMO_LIMITS.max) {
    return `n harus bilangan bulat ${MEMO_LIMITS.min} sampai ${MEMO_LIMITS.max}.`;
  }
  return null;
}

/** Every call `fib(n)` makes. With a memo, a value is written after both of its calls return. */
export function memoCallTree(n: number, mode: ModeMemo): MemoTree {
  const calls: Record<string, MemoCall> = {};
  const order: string[] = [];
  const written = new Set<number>();
  const build = (k: number): string => {
    const id = `c${order.length}`;
    order.push(id);
    const call: MemoCall = { id, n: k, left: null, right: null, hit: false };
    calls[id] = call;
    if (k <= 1) return id;
    if (mode === 'memo' && written.has(k)) {
      call.hit = true;
      return id;
    }
    call.left = build(k - 1);
    call.right = build(k - 2);
    if (mode === 'memo') written.add(k);
    return id;
  };
  return { root: build(n), calls, order };
}

/** Number of calls for `fib(n)`: `2 × fib(n + 1) − 1` without a memo. */
export const callCount = (n: number, mode: ModeMemo) => memoCallTree(n, mode).order.length;

export function memoisasiSteps(n: number, mode: ModeMemo): MemoStep[] {
  const tree = memoCallTree(n, mode);
  const other = callCount(n, mode === 'memo' ? 'tanpa' : 'memo');
  const total = tree.order.length;
  const steps: MemoStep[] = [];
  const called: string[] = [];
  const results: Record<string, number> = {};
  const stack: string[] = [];
  const memo: (number | null)[] = Array.from({ length: n + 1 }, () => null);
  const counts: number[] = Array.from({ length: n + 1 }, () => 0);
  const withMemo = mode === 'memo';

  const state = (): MemoState => ({
    tree,
    called: [...called],
    results: { ...results },
    stack: [...stack],
    memo: [...memo],
    counts: [...counts],
    n,
    mode,
  });

  /** Tree roles plus the table cells this step touches. */
  const roles = (touched: number | null = null): Record<string, Role> => {
    const highlights: Record<string, Role> = {};
    for (const id of called) highlights[id] = id in results ? 'selesai' : 'khusus';
    const running = stack.at(-1);
    if (running !== undefined) highlights[running] = 'aktif';
    if (touched !== null) {
      highlights[countCellId(touched)] = 'aktif';
      if (withMemo && touched >= 2) highlights[memoCellId(touched)] = 'aktif';
    }
    if (!withMemo) {
      for (let k = 2; k <= n; k++) if (counts[k] > 1 && touched !== k) highlights[countCellId(k)] = 'error';
    }
    return highlights;
  };

  steps.push({
    state: state(),
    highlights: {},
    caption: withMemo
      ? `Kita menghitung \`fib(${n})\` dengan memo. Awalnya semua \`memo[k]\` bernilai -1, artinya belum dihitung. \`fib(0)\` dan \`fib(1)\` adalah kasus dasar, jadi tidak perlu dicatat.`
      : `Kita menghitung \`fib(${n})\` tanpa memo, persis seperti di materi Rekursi. Perhatikan tabel "dipanggil": berapa kali setiap \`fib(k)\` dipanggil.`,
    lines: [],
    status: 'normal',
  });

  const visit = (id: string, parent: string | null, side: 'kiri' | 'kanan'): number => {
    const call = tree.calls[id];
    const k = call.n;
    const caller = parent === null ? null : `\`fib(${tree.calls[parent].n})\``;
    const how =
      caller === null
        ? `Panggil \`fib(${k})\`.`
        : side === 'kiri'
          ? `${caller} memanggil \`fib(${k})\`.`
          : `Cabang kiri ${caller} selesai, sekarang ${caller} memanggil \`fib(${k})\`.`;
    called.push(id);
    stack.push(id);
    counts[k]++;
    const nth = counts[k] > 1 ? ` Ini panggilan ke-${counts[k]} untuk \`fib(${k})\`.` : '';

    if (k <= 1) {
      results[id] = k;
      steps.push({
        state: state(),
        highlights: roles(k),
        caption: `${how} Karena \`n <= 1\`, ini kasus dasar: langsung kembalikan ${k}.`,
        lines: ['dasar'],
        result: `fib(${k}) = ${k}`,
        status: 'normal',
      });
      stack.pop();
      return k;
    }

    if (call.hit) {
      const value = memo[k] as number;
      results[id] = value;
      steps.push({
        state: state(),
        highlights: roles(k),
        caption: `${how}${nth} \`memo[${k}]\` sudah berisi ${value}, jadi langsung kembalikan ${value} tanpa memanggil apa pun lagi.`,
        lines: ['cek', 'baca'],
        result: `memo[${k}] → ${value}`,
        status: 'normal',
      });
      stack.pop();
      return value;
    }

    const need = `\`fib(${k - 1}) + fib(${k - 2})\``;
    steps.push({
      state: state(),
      highlights: roles(k),
      caption: withMemo
        ? `${how} \`memo[${k}]\` masih -1, jadi \`fib(${k})\` harus dihitung: ${need}. Cabang kiri dikerjakan dulu.`
        : `${how}${nth} Tanpa catatan, \`fib(${k})\` harus dihitung dari awal: ${need}.`,
      lines: withMemo ? ['cek', 'hitung'] : parent === null ? ['fungsi'] : side === 'kiri' ? ['kiri'] : ['kanan'],
      status: 'normal',
    });

    const a = visit(call.left as string, id, 'kiri');
    const b = visit(call.right as string, id, 'kanan');
    const value = a + b;
    results[id] = value;
    if (withMemo) memo[k] = value;
    const last = parent === null ? ` Selesai dengan ${total} panggilan.` : '';
    steps.push({
      state: state(),
      highlights: roles(withMemo ? k : null),
      caption: withMemo
        ? `\`fib(${k}) = ${a} + ${b} = ${value}\`. Catat dulu: \`memo[${k}] = ${value}\`, baru kembalikan.${last}`
        : `\`fib(${k}) = ${a} + ${b} = ${value}\`.${last}`,
      lines: withMemo ? ['hitung', 'kembali'] : ['jumlah'],
      result: `fib(${k}) = ${value}`,
      status: 'normal',
    });
    stack.pop();
    return value;
  };

  visit(tree.root, null, 'kiri');

  // Summary: what the memo saved, or what was computed again and again.
  const done: Record<string, Role> = Object.fromEntries(tree.order.map((id) => [id, 'selesai' as Role]));
  if (withMemo) {
    const hits = tree.order.filter((id) => tree.calls[id].hit);
    const names = hits.map((id) => `\`fib(${tree.calls[id].n})\``).join(' dan ');
    steps.push({
      state: state(),
      highlights: done,
      caption:
        hits.length > 0
          ? `Lingkaran ganda adalah panggilan yang dijawab dari memo: ${names}. Setiap \`fib(k)\` hanya dihitung sekali, jadi \`fib(${n}) = ${fib(n)}\` cukup dengan ${total} panggilan. Tanpa memo butuh ${other}.`
          : `\`fib(${n}) = ${fib(n)}\` dengan ${total} panggilan. Untuk \`n\` sekecil ini memo belum sempat dipakai; coba \`n\` yang lebih besar.`,
      lines: [],
      result: `${total} panggilan`,
      status: 'normal',
    });
  } else {
    const repeated: string[] = [];
    for (let k = n; k >= 2; k--) {
      if (counts[k] > 1) {
        repeated.push(`\`fib(${k})\` ${counts[k]} kali`);
        for (const id of tree.order) if (tree.calls[id].n === k) done[id] = 'error';
      }
    }
    const table: Record<string, Role> = {};
    for (let k = 2; k <= n; k++) if (counts[k] > 1) table[countCellId(k)] = 'error';
    steps.push({
      state: state(),
      highlights: { ...done, ...table },
      caption:
        repeated.length > 0
          ? `\`fib(${n}) = ${fib(n)}\` butuh ${total} panggilan. Yang ditandai merah dihitung ulang dari awal: ${repeated.join(', ')}. Dengan memo cukup ${other} panggilan.`
          : `\`fib(${n}) = ${fib(n)}\` dengan ${total} panggilan. Untuk \`n\` sekecil ini belum ada yang dihitung ulang; coba \`n\` yang lebih besar.`,
      lines: [],
      result: `${total} panggilan`,
      status: 'normal',
    });
  }

  return steps;
}
