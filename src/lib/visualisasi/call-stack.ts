import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Call stack of `faktorial(n)` from the Rekursi lesson: frames are pushed on
 * the way down and popped on the way back up, one step per call or return.
 */

export interface CallFrame {
  /** `main` or `f<n>`, stable so the view can animate the same frame across steps. */
  id: string;
  /** `main` or `faktorial`. */
  name: string;
  /** This call's own `n`; null for main. */
  n: number | null;
  /** Short code-like note, e.g. `4 * faktorial(3)` while waiting or `4 * 6 = 24` when done. */
  note: string;
}

/** `turun`: calls are being made and the stack grows. `naik`: results come back and it shrinks. */
export type CallStackPhase = 'awal' | 'turun' | 'naik' | 'selesai';

export interface CallStackState {
  /** Bottom (main) to top (the call that is running). */
  frames: CallFrame[];
  phase: CallStackPhase;
  n: number;
}

export type CallStackStep = Step<CallStackState>;

export const FAKTORIAL_LIMITS = { min: 0, max: 5 } as const;

/** The lesson traces `faktorial(4)`. */
export const lessonFaktorialN = 4;

export const faktorialPseudocode: PseudocodeLine[] = [
  { id: 'fungsi', text: 'faktorial(n):', indent: 0 },
  { id: 'dasar', text: 'jika n == 0 → kembalikan 1', indent: 1 },
  { id: 'rekursif', text: 'kembalikan n * faktorial(n-1)', indent: 1 },
];

export function faktorial(n: number): number {
  return n <= 1 ? 1 : n * faktorial(n - 1);
}

/** Checks `n` from an MDX prop or the picker; returns an Indonesian message when invalid. */
export function validateFaktorialN(n: number): string | null {
  if (!Number.isInteger(n) || n < FAKTORIAL_LIMITS.min || n > FAKTORIAL_LIMITS.max) {
    return `n harus bilangan bulat ${FAKTORIAL_LIMITS.min} sampai ${FAKTORIAL_LIMITS.max}.`;
  }
  return null;
}

const callFrame = (k: number, note: string): CallFrame => ({ id: `f${k}`, name: 'faktorial', n: k, note });

/** The top frame gets `top`; every frame below it is still waiting for a result. */
function roles(frames: CallFrame[], top: Role): Record<string, Role> {
  return Object.fromEntries(frames.map((frame, index) => [frame.id, index === frames.length - 1 ? top : 'khusus']));
}

/**
 * Steps for `faktorial(n)`: a starting step, one step per call on the way
 * down (the last one is the base case), one step per return on the way up,
 * and a final step where main receives the answer. That is 2n + 3 steps.
 */
export function faktorialSteps(n: number): CallStackStep[] {
  const steps: CallStackStep[] = [];
  const main: CallFrame = { id: 'main', name: 'main', n: null, note: `cetak faktorial(${n})` };
  let frames: CallFrame[] = [main];

  steps.push({
    state: { frames, phase: 'awal', n },
    highlights: { main: 'aktif' },
    caption: `Program berjalan di \`main\`, yang akan memanggil \`faktorial(${n})\`. Call stack baru berisi satu frame, milik \`main\`.`,
    lines: [],
    status: 'normal',
  });

  // Down: every call with n > 0 has to wait for the next one.
  for (let k = n; k >= 1; k--) {
    const caller = k === n ? '`main`' : `\`faktorial(${k + 1})\``;
    frames = [...frames, callFrame(k, `${k} * faktorial(${k - 1})`)];
    steps.push({
      state: { frames, phase: 'turun', n },
      highlights: roles(frames, 'aktif'),
      caption: `${caller} memanggil \`faktorial(${k})\`, jadi frame baru dengan \`n = ${k}\` di-push ke call stack. Karena \`n\` bukan 0, fungsi ini butuh \`${k} * faktorial(${k - 1})\`. Perkaliannya ditunda sampai hasil \`faktorial(${k - 1})\` datang.`,
      lines: ['rekursif'],
      status: 'normal',
    });
  }

  // The base case answers straight away.
  frames = [...frames, callFrame(0, 'n == 0 → 1')];
  steps.push({
    state: { frames, phase: 'turun', n },
    highlights: roles(frames, 'selesai'),
    caption: `${n === 0 ? '`main`' : '`faktorial(1)`'} memanggil \`faktorial(0)\`. Kali ini \`n == 0\`, jadi ini kasus dasar: langsung kembalikan 1 tanpa memanggil fungsi lagi. Call stack sedang paling tinggi, ${frames.length} frame.`,
    lines: ['dasar'],
    result: 'faktorial(0) = 1',
    status: 'normal',
  });

  // Up: each return lets the frame below finish its postponed multiplication.
  for (let k = 1; k <= n; k++) {
    const received = faktorial(k - 1);
    const value = faktorial(k);
    frames = [...frames.slice(0, -2), callFrame(k, `${k} * ${received} = ${value}`)];
    const first = k === 1 ? ' Inilah perkalian pertama yang benar-benar dihitung.' : '';
    steps.push({
      state: { frames, phase: 'naik', n },
      highlights: roles(frames, 'selesai'),
      caption: `\`faktorial(${k - 1})\` selesai dan frame-nya di-pop. Hasilnya, ${received}, kembali ke \`faktorial(${k})\`, yang akhirnya bisa menghitung perkalian yang tertunda: \`${k} * ${received} = ${value}\`.${first}`,
      lines: ['rekursif'],
      result: `faktorial(${k}) = ${value}`,
      status: 'normal',
    });
  }

  const answer = faktorial(n);
  frames = [{ ...main, note: `cetak ${answer}` }];
  const lifo =
    n > 0 ? ' Perhatikan: `faktorial(0)` yang paling akhir dipanggil justru yang paling dulu selesai. Itulah aturan LIFO dari stack.' : '';
  steps.push({
    state: { frames, phase: 'selesai', n },
    highlights: { main: 'selesai' },
    caption: `\`faktorial(${n})\` selesai dan frame-nya di-pop. \`main\` menerima ${answer}, dan call stack kembali hanya berisi \`main\`.${lifo}`,
    lines: [],
    result: `faktorial(${n}) = ${answer}`,
    status: 'normal',
  });

  return steps;
}
