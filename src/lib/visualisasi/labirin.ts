import { DIRECTIONS, cellId, findChar, formatCell, inside, isWall, parseGrid, type Grid, type GridCase } from './grid.ts';
import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * BFS on a maze from the BFS lesson: the fewest steps from `S` to `E`. One
 * step per cell taken from the front of the queue, showing which neighbours
 * it discovers. After the queue empties, the answer, and when `E` was reached
 * one shortest route for illustration (the lesson program only prints the
 * number).
 */

export interface LabirinState {
  grid: Grid;
  /** Distance from S of every cell found so far. Cells not listed are still -1. */
  dist: Record<string, number>;
  /** Cell ids in the queue, front first. */
  queue: string[];
  /** Cell being processed in this step. */
  current: string | null;
  start: string;
  end: string;
  /** One shortest route from S to E, shown at the very end. */
  route: string[];
}

export type LabirinStep = Step<LabirinState>;

export const labirinCases: GridCase[] = [
  {
    id: 'materi',
    label: 'Labirin materi',
    rows: ['S..#...', '.#.#.#.', '.#...#.', '.####..', '...#..E'],
  },
  {
    id: 'buntu',
    label: 'E tidak bisa dicapai',
    rows: ['S..#...', '.#.#.##', '.#...#.', '.####..', '...#..E'],
  },
  {
    id: 'terbuka',
    label: 'Tanpa dinding',
    rows: ['S......', '.......', '.......', '.......', '......E'],
  },
];

export const labirinPseudocode: PseudocodeLine[] = [
  { id: 'init', text: 'dist semua = -1', indent: 0 },
  { id: 'awal', text: 'dist[S] = 0, push S', indent: 0 },
  { id: 'ulang', text: 'selama queue tidak kosong:', indent: 0 },
  { id: 'pop', text: 'sel = pop depan', indent: 1 },
  { id: 'tetangga', text: 'untuk 4 tetangga (r, c):', indent: 1 },
  { id: 'cek', text: 'jika bukan # dan dist == -1:', indent: 2 },
  { id: 'jarak', text: 'dist = dist[sel] + 1', indent: 3 },
  { id: 'push', text: 'push (r, c)', indent: 3 },
  { id: 'hasil', text: 'cetak dist[E]', indent: 0 },
];

const parseId = (id: string) => id.slice(1).split('c').map(Number) as [number, number];
const position = (id: string) => formatCell(...parseId(id));

/** "a", "a dan b", "a, b dan c". */
const joinList = (parts: string[]) => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} dan ${parts.at(-1)}`);

/** Plain BFS from the lesson, for tests and for the route. */
export function bfsDistances(grid: Grid, start: { r: number; c: number }): Record<string, number> {
  const dist: Record<string, number> = { [cellId(start.r, start.c)]: 0 };
  const queue: [number, number][] = [[start.r, start.c]];
  while (queue.length > 0) {
    const [r, c] = queue.shift() as [number, number];
    for (const direction of DIRECTIONS) {
      const nr = r + direction.dr;
      const nc = c + direction.dc;
      if (!inside(grid, nr, nc) || isWall(grid, nr, nc) || cellId(nr, nc) in dist) continue;
      dist[cellId(nr, nc)] = dist[cellId(r, c)] + 1;
      queue.push([nr, nc]);
    }
  }
  return dist;
}

/** Walk back from E to a neighbour one closer to S, trying atas, bawah, kiri, kanan in order. */
export function shortestRoute(grid: Grid, dist: Record<string, number>, end: string): string[] {
  if (!(end in dist)) return [];
  const route = [end];
  let [r, c] = parseId(end);
  while (dist[cellId(r, c)] > 0) {
    const here = dist[cellId(r, c)];
    const next = DIRECTIONS.map((d) => [r + d.dr, c + d.dc] as [number, number]).find(
      ([nr, nc]) => inside(grid, nr, nc) && dist[cellId(nr, nc)] === here - 1,
    );
    if (!next) break;
    [r, c] = next;
    route.unshift(cellId(r, c));
  }
  return route;
}

export function labirinSteps(rows: readonly string[]): LabirinStep[] {
  const grid = parseGrid(rows);
  const s = findChar(grid, 'S');
  const e = findChar(grid, 'E');
  if (!s || !e) throw new Error('Labirin harus berisi S dan E.');
  const start = cellId(s.r, s.c);
  const end = cellId(e.r, e.c);
  const steps: LabirinStep[] = [];
  const dist: Record<string, number> = { [start]: 0 };
  const queue: string[] = [start];

  const state = (current: string | null, route: string[] = []): LabirinState => ({
    grid,
    dist: { ...dist },
    queue: [...queue],
    current,
    start,
    end,
    route,
  });
  const roles = (current: string | null): Record<string, Role> => {
    const highlights: Record<string, Role> = {};
    for (const id of queue) highlights[id] = 'khusus';
    if (current) highlights[current] = 'aktif';
    return highlights;
  };

  steps.push({
    state: state(null),
    highlights: roles(null),
    caption: `Semua \`dist\` diisi -1, artinya belum ditemukan. \`dist[S] = 0\`, lalu S di ${formatCell(s.r, s.c)} masuk queue.`,
    lines: ['init', 'awal'],
    status: 'normal',
  });

  let first = true;
  let foundEnd = false;
  while (queue.length > 0) {
    const current = queue.shift() as string;
    const [r, c] = parseId(current);
    const d = dist[current];
    const found: string[] = [];
    for (const direction of DIRECTIONS) {
      const nr = r + direction.dr;
      const nc = c + direction.dc;
      if (!inside(grid, nr, nc) || isWall(grid, nr, nc) || cellId(nr, nc) in dist) continue;
      const id = cellId(nr, nc);
      dist[id] = d + 1;
      queue.push(id);
      found.push(`${formatCell(nr, nc)} di ${direction.name}`);
    }

    const order = first ? ' Tetangganya dicoba berurutan atas, bawah, kiri, kanan.' : '';
    const news =
      found.length > 0
        ? `Tetangga baru: ${joinList(found)}. ${found.length === 1 ? 'Sel itu' : found.length === 2 ? 'Keduanya' : 'Semuanya'} mendapat jarak ${d + 1} dan masuk ke belakang queue.`
        : 'Tidak ada tetangga baru: semuanya dinding, di luar grid, atau sudah punya jarak.';
    let reached = '';
    if (!foundEnd && end in dist) {
      foundEnd = true;
      reached = ` E ditemukan dengan jarak ${dist[end]}! Program di materi tetap melanjutkan BFS sampai queue kosong.`;
    }
    steps.push({
      state: state(current),
      highlights: roles(current),
      caption: `Ambil ${position(current)} dari depan queue (jarak ${d}).${order} ${news}${reached}`,
      lines: found.length > 0 ? ['ulang', 'pop', 'tetangga', 'cek', 'jarak', 'push'] : ['ulang', 'pop', 'tetangga', 'cek'],
      result: `pop ${position(current)}`,
      status: 'normal',
    });
    first = false;
  }

  const answer = dist[end] ?? -1;
  steps.push({
    state: state(null),
    highlights: {},
    caption:
      answer === -1
        ? 'Queue kosong, BFS selesai, tetapi E tidak pernah ditemukan. `dist[E]` tetap -1: tidak ada jalan dari S ke E.'
        : `Queue kosong, BFS selesai. \`dist[E] = ${answer}\`: paling sedikit ${answer} langkah dari S ke E.`,
    lines: ['ulang', 'hasil'],
    result: `dist[E] = ${answer}`,
    status: 'normal',
  });

  if (answer > 0) {
    const route = shortestRoute(grid, dist, end);
    steps.push({
      state: state(null, route),
      highlights: Object.fromEntries(route.map((id) => [id, 'selesai' as Role])),
      caption: `Sebagai gambaran, ini salah satu rute terpendek: mulai dari E, mundur ke tetangga yang jaraknya satu lebih kecil, sampai tiba di S. Program di materi hanya mencetak angka ${answer}.`,
      lines: [],
      result: `${answer} langkah`,
      status: 'normal',
    });
  }

  return steps;
}
