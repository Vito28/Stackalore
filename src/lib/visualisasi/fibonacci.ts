import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Call tree of the plain recursive `fib(n)` from the Rekursi lesson. The tree
 * grows one call at a time in the order the program makes them (left branch
 * first), and every finished call shows the value it returned.
 */

export interface FibCall {
  /** `c<i>`, numbered in call order. */
  id: string;
  n: number;
  /** The call to fib(n - 1), or null for a base case. */
  left: string | null;
  /** The call to fib(n - 2), or null for a base case. */
  right: string | null;
}

export interface FibTree {
  root: string;
  calls: Record<string, FibCall>;
  /** Every call in the order the program makes them (preorder). */
  order: string[];
}

export interface FibState {
  /** The whole call tree; the view only draws the calls made so far. */
  tree: FibTree;
  /** Calls made so far, in call order. */
  called: string[];
  /** Value returned by every finished call. */
  results: Record<string, number>;
  /** From the first call to the one that is running. Empty before the start and after the end. */
  stack: string[];
  n: number;
}

export type FibStep = Step<FibState>;

export const FIB_LIMITS = { min: 1, max: 6 } as const;

/** The lesson draws the call tree of `fib(5)`. */
export const lessonFibN = 5;

export const fibPseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'fib(n):', indent: 0 },
  { id: 'dasar', text: 'jika n <= 1 → kembalikan n', indent: 1 },
  { id: 'kiri', text: 'a = fib(n - 1)', indent: 1 },
  { id: 'kanan', text: 'b = fib(n - 2)', indent: 1 },
  { id: 'jumlah', text: 'kembalikan a + b', indent: 1 },
];

export function fib(n: number): number {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

export function validateFibN(n: number): string | null {
  if (!Number.isInteger(n) || n < FIB_LIMITS.min || n > FIB_LIMITS.max) {
    return `n harus bilangan bulat ${FIB_LIMITS.min} sampai ${FIB_LIMITS.max}.`;
  }
  return null;
}

/** Every call `fib(n)` makes, as a binary tree: left child fib(n - 1), right child fib(n - 2). */
export function fibCallTree(n: number): FibTree {
  const calls: Record<string, FibCall> = {};
  const order: string[] = [];
  const build = (k: number): string => {
    const id = `c${order.length}`;
    order.push(id);
    const call: FibCall = { id, n: k, left: null, right: null };
    calls[id] = call;
    if (k >= 2) {
      call.left = build(k - 1);
      call.right = build(k - 2);
    }
    return id;
  };
  return { root: build(n), calls, order };
}

/**
 * Steps for `fib(n)`: a starting step, one step per call (a base case calls
 * and returns in the same step), one step per return of a non-base call, and
 * finally one step for every value that was computed more than once, from
 * fib(n - 2) down to fib(2).
 */
export function fibonacciSteps(n: number): FibStep[] {
  const tree = fibCallTree(n);
  const steps: FibStep[] = [];
  const called: string[] = [];
  const results: Record<string, number> = {};
  const stack: string[] = [];
  const total = tree.order.length;

  const state = (): FibState => ({ tree, called: [...called], results: { ...results }, stack: [...stack], n });
  const roles = (): Record<string, Role> => {
    const highlights: Record<string, Role> = {};
    for (const id of called) highlights[id] = id in results ? 'selesai' : 'khusus';
    const running = stack.at(-1);
    if (running !== undefined) highlights[running] = 'aktif';
    return highlights;
  };

  steps.push({
    state: state(),
    highlights: {},
    caption: `Kita akan menghitung \`fib(${n})\`. Setiap panggilan fungsi muncul sebagai satu lingkaran. Angka di dalam lingkaran adalah \`n\`-nya, dan angka hijau kecil adalah hasil yang dikembalikan.`,
    lines: [],
    status: 'normal',
  });

  const visit = (id: string, parent: string | null, side: 'kiri' | 'kanan'): number => {
    const k = tree.calls[id].n;
    const caller = parent === null ? null : `\`fib(${tree.calls[parent].n})\``;
    const how =
      caller === null
        ? `Panggil \`fib(${k})\`.`
        : side === 'kiri'
          ? `${caller} memanggil cabang kirinya, \`fib(${k})\`.`
          : `Cabang kiri ${caller} sudah selesai, jadi sekarang ${caller} memanggil cabang kanannya, \`fib(${k})\`.`;
    called.push(id);
    stack.push(id);

    if (k <= 1) {
      results[id] = k;
      steps.push({
        state: state(),
        highlights: roles(),
        caption: `${how} Karena \`n <= 1\`, ini kasus dasar: langsung kembalikan ${k}.`,
        lines: ['dasar'],
        result: `fib(${k}) = ${k}`,
        status: 'normal',
      });
      stack.pop();
      return k;
    }

    const need = `\`fib(${k}) = fib(${k - 1}) + fib(${k - 2})\``;
    steps.push({
      state: state(),
      highlights: roles(),
      caption:
        caller === null
          ? `${how} ${k} bukan kasus dasar, jadi ${need}. Cabang kiri, \`fib(${k - 1})\`, dikerjakan lebih dulu sampai habis.`
          : `${how} ${k} bukan kasus dasar, jadi ${need}. ${caller} menunggu sampai \`fib(${k})\` selesai.`,
      lines: parent === null ? ['fungsi'] : side === 'kiri' ? ['kiri'] : ['kanan'],
      status: 'normal',
    });

    const call = tree.calls[id];
    const a = visit(call.left as string, id, 'kiri');
    const b = visit(call.right as string, id, 'kanan');
    results[id] = a + b;
    steps.push({
      state: state(),
      highlights: roles(),
      caption:
        caller === null
          ? `Kedua cabang sudah selesai: \`fib(${k}) = ${a} + ${b} = ${a + b}\`. Untuk satu \`fib(${k})\`, program membuat ${total} panggilan.`
          : `\`fib(${k})\` sudah punya kedua hasilnya: \`${a} + ${b} = ${a + b}\`. Hasil ${a + b} dikembalikan ke ${caller}.`,
      lines: ['jumlah'],
      result: `fib(${k}) = ${a + b}`,
      status: 'normal',
    });
    stack.pop();
    return a + b;
  };

  visit(tree.root, null, 'kiri');

  // The same values were computed again and again.
  const repeated: number[] = [];
  for (let m = n - 2; m >= 2; m--) {
    if (tree.order.filter((id) => tree.calls[id].n === m).length > 1) repeated.push(m);
  }
  repeated.forEach((m, index) => {
    const ids = tree.order.filter((id) => tree.calls[id].n === m);
    const highlights: Record<string, Role> = Object.fromEntries(tree.order.map((id) => [id, 'selesai' as Role]));
    for (const id of ids) highlights[id] = 'error';
    const last = index === repeated.length - 1;
    steps.push({
      state: state(),
      highlights,
      caption: `Perhatikan semua \`fib(${m})\` yang ditandai: dipanggil ${ids.length} kali, dan setiap kali dihitung ulang dari awal, padahal hasilnya selalu ${fib(m)}.${
        last ? ' Semakin besar `n`, perhitungan ulang seperti ini bertambah sangat cepat. Itulah sebabnya cara ini lambat.' : ''
      }`,
      lines: [],
      result: `fib(${m}) dihitung ${ids.length}×`,
      status: 'normal',
    });
  });

  return steps;
}
