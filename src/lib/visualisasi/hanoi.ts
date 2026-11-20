import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Tower of Hanoi from the Rekursi lesson. Besides every move, a call that has
 * to clear smaller disks first gets its own step, so the reader sees why each
 * move happens: "disk k is covered, move the k - 1 disks above it away first".
 */

export type Peg = 'A' | 'B' | 'C';
export const PEGS: readonly Peg[] = ['A', 'B', 'C'];

/** Same parameter order as the lesson: hanoi(n, asal, tujuan, bantu). */
export interface HanoiCall {
  n: number;
  asal: Peg;
  tujuan: Peg;
  bantu: Peg;
}

export interface HanoiMove {
  disk: number;
  from: Peg;
  to: Peg;
}

export interface HanoiState {
  /** Disks on each peg from bottom to top. Disk 1 is the smallest. */
  pegs: Record<Peg, number[]>;
  /** Calls still running, outermost first. The last one is the call this step belongs to. */
  calls: HanoiCall[];
  /** The move made in this step, if any. */
  move: HanoiMove | null;
  /** Moves made so far. */
  moves: number;
  /** 2^disks − 1. */
  total: number;
  disks: number;
}

export type HanoiStep = Step<HanoiState>;

export const HANOI_LIMITS = { min: 1, max: 4 } as const;

/** The lesson runs the program with 3 disks. */
export const lessonHanoiDisks = 3;

export const hanoiPseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'hanoi(n, asal, tujuan, bantu):', indent: 0 },
  { id: 'dasar', text: 'jika n == 0 → selesai', indent: 1 },
  { id: 'langkah1', text: '1. hanoi(n-1): asal → bantu', indent: 1 },
  { id: 'pindah', text: '2. cakram n: asal → tujuan', indent: 1 },
  { id: 'langkah3', text: '3. hanoi(n-1): bantu → tujuan', indent: 1 },
];

export const diskId = (disk: number) => `d${disk}`;

export function formatHanoiCall(call: HanoiCall): string {
  return `hanoi(${call.n}, ${call.asal}, ${call.tujuan}, ${call.bantu})`;
}

export function validateHanoiDisks(disks: number): string | null {
  if (!Number.isInteger(disks) || disks < HANOI_LIMITS.min || disks > HANOI_LIMITS.max) {
    return `Banyak cakram harus bilangan bulat ${HANOI_LIMITS.min} sampai ${HANOI_LIMITS.max}.`;
  }
  return null;
}

const superscript = (value: number) => String(value).replace(/\d/g, (digit) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]);

/** "cakram itu" for one disk, "2 cakram itu" for more. */
const thoseDisks = (count: number) => (count === 1 ? 'cakram itu' : `${count} cakram itu`);

/**
 * Steps for `hanoi(disks, 'A', 'C', 'B')`: a starting step, a "clear the way
 * first" step for every call with at least 2 disks, one step per move, and a
 * final step. Calls with 0 disks do nothing and get no step.
 */
export function hanoiSteps(disks: number): HanoiStep[] {
  const steps: HanoiStep[] = [];
  const pegs: Record<Peg, number[]> = { A: [], B: [], C: [] };
  for (let disk = disks; disk >= 1; disk--) pegs.A.push(disk);
  const calls: HanoiCall[] = [];
  const total = 2 ** disks - 1;
  let moves = 0;

  const state = (move: HanoiMove | null): HanoiState => ({
    pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
    calls: calls.map((call) => ({ ...call })),
    move,
    moves,
    total,
    disks,
  });

  steps.push({
    state: state(null),
    highlights: {},
    caption: `Ada ${disks} cakram di tiang A. Tujuannya memindahkan semuanya ke C. Setiap langkah hanya boleh memindahkan satu cakram, dan cakram besar tidak boleh diletakkan di atas cakram kecil.`,
    lines: [],
    status: 'normal',
  });

  /** How a call was reached: the first call, step 1 of its caller, or step 3 of its caller. */
  type Origin = 'utama' | 'langkah1' | 'langkah3';

  const intro = (call: HanoiCall, origin: Origin) => {
    const name = `\`${formatHanoiCall(call)}\``;
    if (origin === 'utama') return `Panggil ${name}`;
    const parent = `\`${formatHanoiCall(calls[calls.length - 2])}\``;
    return `Langkah ${origin === 'langkah1' ? 1 : 3} dari ${parent} adalah memanggil ${name}`;
  };

  let first = true;

  const solve = (k: number, asal: Peg, tujuan: Peg, bantu: Peg, origin: Origin) => {
    if (k === 0) return;
    const call: HanoiCall = { n: k, asal, tujuan, bantu };
    calls.push(call);

    if (k >= 2) {
      const highlights: Record<string, Role> = { [diskId(k)]: 'aktif' };
      for (let disk = 1; disk < k; disk++) highlights[diskId(disk)] = 'khusus';
      steps.push({
        state: state(null),
        highlights,
        caption: `${intro(call, origin)}: pindahkan ${k} cakram dari ${asal} ke ${tujuan}. Cakram ${k} tertutup ${k - 1} cakram di atasnya, jadi pindahkan dulu ${thoseDisks(k - 1)} ke ${bantu}.`,
        lines: ['langkah1'],
        status: 'normal',
      });
    }

    solve(k - 1, asal, bantu, tujuan, 'langkah1');

    const disk = pegs[asal].pop() as number;
    pegs[tujuan].push(disk);
    moves++;
    const move = { disk, from: asal, to: tujuan };
    let caption: string;
    if (k === 1) {
      const nothing = first ? ' (Di dalamnya, `hanoi(0, ...)` adalah kasus dasar dan tidak melakukan apa-apa.)' : '';
      caption = `${intro(call, origin)}. Hanya 1 cakram, jadi langsung pindahkan cakram 1 dari ${asal} ke ${tujuan}.${nothing}`;
    } else {
      const rest = `Tinggal langkah 3: pindahkan ${k - 1} cakram dari ${bantu} ke ${tujuan}.`;
      caption = `Langkah 2 dari \`${formatHanoiCall(call)}\`: ${k - 1} cakram di atasnya sudah pindah ke ${bantu}, jadi cakram ${k} sekarang bebas. Pindahkan cakram ${k} dari ${asal} ke ${tujuan}. ${rest}`;
    }
    first = false;
    steps.push({
      state: state(move),
      highlights: { [diskId(disk)]: 'aktif' },
      caption,
      lines: ['pindah'],
      result: `cakram ${disk}: ${asal} → ${tujuan}`,
      status: 'normal',
    });

    solve(k - 1, bantu, tujuan, asal, 'langkah3');
    calls.pop();
  };

  solve(disks, 'A', 'C', 'B', 'utama');

  const done: Record<string, Role> = {};
  for (let disk = 1; disk <= disks; disk++) done[diskId(disk)] = 'selesai';
  steps.push({
    state: state(null),
    highlights: done,
    caption: `Selesai! Semua ${disks} cakram sudah di C dalam ${total} langkah, sama dengan \`2${superscript(disks)} − 1 = ${total}\`. Kita tidak pernah merencanakan langkah-langkah itu satu per satu. Rekursi yang mengurusnya.`,
    lines: [],
    result: `${total} langkah`,
    status: 'normal',
  });

  return steps;
}
