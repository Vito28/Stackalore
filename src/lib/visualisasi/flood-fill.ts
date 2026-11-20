import { DIRECTIONS, cellId, formatCell, inside, isWall, parseGrid, type Grid, type GridCase } from './grid.ts';
import type { PseudocodeLine, Role, Step } from './types.ts';

/**
 * Flood fill from the DFS lesson: count the rooms of a floor plan. Main scans
 * the cells row by row and calls the recursive `isi(i, j)` on every floor cell
 * nobody has reached yet. Every cell that gets filled is one step; calls that
 * hit a wall, a visited cell or the outside return at once and get no step of
 * their own (the first captions say so).
 */

export interface FloodState {
  grid: Grid;
  /** Room number of every filled cell. */
  room: Record<string, number>;
  /** Cells whose `isi` call is still running, outermost first. */
  stack: string[];
  rooms: number;
  /** The cell where main just found a new room, before `isi` runs on it. */
  found: string | null;
}

export type FloodStep = Step<FloodState>;

export const floodCases: GridCase[] = [
  {
    id: 'materi',
    label: 'Denah materi',
    rows: ['.....#...', '.....#...', '######.##', '...#.....', '...#.....'],
  },
  {
    id: 'pintu-tertutup',
    label: 'Pintu tertutup',
    rows: ['.....#...', '.....#...', '#########', '...#.....', '...#.....'],
  },
  {
    id: 'satu-ruangan',
    label: 'Satu ruangan besar',
    rows: ['.........', '.##...##.', '.........', '...#.#...', '.........'],
  },
];

export const floodPseudocode: PseudocodeLine[] = [
  { id: 'scan', text: 'untuk setiap sel (i, j):', indent: 0 },
  { id: 'cek', text: 'jika lantai belum dikunjungi:', indent: 1 },
  { id: 'baru', text: 'ruangan++, isi(i, j)', indent: 2 },
  { id: 'fungsi', text: 'isi(i, j):', indent: 0 },
  { id: 'tolak', text: 'jika di luar, dinding, atau', indent: 1 },
  { id: 'tolak2', text: 'sudah dikunjungi → kembali', indent: 2 },
  { id: 'tandai', text: 'visited[i][j] = benar', indent: 1 },
  { id: 'rekursi', text: 'isi atas, bawah, kiri, kanan', indent: 1 },
];

/** Why a call returned at once. */
type Rejection = { dir: string; reason: string };

const listRejections = (rejected: Rejection[]) => {
  const parts = rejected.map((item) => `${item.dir} (${item.reason})`);
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} dan ${parts.at(-1)}`;
};

/** Captions explain the calls that return at once only for the first few fills. */
const EXPLAINED_FILLS = 4;

export function floodFillSteps(rows: readonly string[]): FloodStep[] {
  const grid = parseGrid(rows);
  const steps: FloodStep[] = [];
  const room: Record<string, number> = {};
  const stack: string[] = [];
  let rooms = 0;
  let fills = 0;
  let maxDepth = 0;
  /** Stack height right after the previous fill, to tell when the recursion went back up. */
  let depthAfterLastFill = 0;
  let lastFilled = '';
  const sizes: number[] = [];

  const state = (found: string | null = null): FloodState => ({ grid, room: { ...room }, stack: [...stack], rooms, found });
  const roles = (): Record<string, Role> => {
    const highlights: Record<string, Role> = {};
    for (const id of Object.keys(room)) highlights[id] = 'selesai';
    stack.forEach((id, depth) => {
      highlights[id] = depth === stack.length - 1 ? 'aktif' : 'khusus';
    });
    return highlights;
  };
  const position = (id: string) => {
    const [r, c] = id.slice(1).split('c').map(Number);
    return formatCell(r, c);
  };

  steps.push({
    state: state(),
    highlights: {},
    caption: `Denah ${grid.rows} × ${grid.cols}: \`.\` lantai dan \`#\` dinding. Main memeriksa setiap sel dari kiri atas, baris demi baris, dan memanggil \`isi\` untuk setiap lantai yang belum dikunjungi.`,
    lines: ['scan'],
    status: 'normal',
  });

  const isi = (r: number, c: number, from: { r: number; c: number; dir: string } | null, rejected: Rejection[]) => {
    const id = cellId(r, c);
    const before = stack.length;
    room[id] = rooms;
    fills++;
    stack.push(id);
    maxDepth = Math.max(maxDepth, stack.length);

    let caption: string;
    if (from === null) {
      caption =
        rooms === 1
          ? `\`isi${formatCell(r, c)}\`: sel ini lantai dan belum dikunjungi, jadi ditandai \`visited\` sebagai ruangan ${rooms}. Setelah itu \`isi\` dipanggil untuk keempat tetangganya, berurutan atas, bawah, kiri, kanan.`
          : `\`isi${formatCell(r, c)}\`: tandai sebagai ruangan ${rooms}, lalu menyebar ke tetangganya dengan urutan yang sama.`;
    } else {
      const parent = formatCell(from.r, from.c);
      const pops = depthAfterLastFill - before;
      const back =
        pops <= 0
          ? ''
          : pops === 1
            ? `${position(lastFilled)} buntu, jadi rekursi kembali ke ${parent}. `
            : `Sel-sel terakhir buntu, jadi rekursi kembali ${pops} tingkat ke ${parent}. `;
      const explain = fills <= EXPLAINED_FILLS && rejected.length > 0;
      caption = explain
        ? `${back}Dari ${parent}: ${listRejections(rejected)} langsung kembali. Arah ${from.dir} menuju ${formatCell(r, c)}, lantai yang belum dikunjungi, jadi diisi ruangan ${rooms}.`
        : `${back}Dari ${parent} ke ${from.dir}: ${formatCell(r, c)} lantai yang belum dikunjungi, jadi diisi ruangan ${rooms}.`;
    }
    steps.push({
      state: state(),
      highlights: roles(),
      caption,
      lines: from === null ? ['fungsi', 'tandai'] : ['rekursi', 'tandai'],
      result: `isi${formatCell(r, c)}`,
      status: 'normal',
    });
    depthAfterLastFill = stack.length;
    lastFilled = id;

    let local: Rejection[] = [];
    for (const direction of DIRECTIONS) {
      const nr = r + direction.dr;
      const nc = c + direction.dc;
      let reason: string | null = null;
      if (!inside(grid, nr, nc)) reason = 'di luar denah';
      else if (isWall(grid, nr, nc)) reason = 'dinding';
      else if (cellId(nr, nc) in room) reason = 'sudah dikunjungi';
      if (reason) {
        local.push({ dir: direction.name, reason });
        continue;
      }
      isi(nr, nc, { r, c, dir: direction.name }, local);
      local = [];
    }
    stack.pop();
  };

  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.cols; j++) {
      const id = cellId(i, j);
      if (isWall(grid, i, j) || id in room) continue;
      rooms++;
      const highlights: Record<string, Role> = roles();
      highlights[id] = 'aktif';
      steps.push({
        state: state(id),
        highlights,
        caption:
          rooms === 1
            ? `${formatCell(i, j)} adalah lantai yang belum dikunjungi, jadi ini ruangan baru: \`ruangan = 1\`. Panggil \`isi${formatCell(i, j)}\`.`
            : `Kembali di main, pemeriksaan berlanjut dan melewati dinding serta sel yang sudah dikunjungi. ${formatCell(i, j)} adalah lantai yang belum dikunjungi: ruangan baru, \`ruangan = ${rooms}\`.`,
        lines: ['scan', 'cek', 'baru'],
        result: `ruangan = ${rooms}`,
        status: 'normal',
      });

      const filledBefore = Object.keys(room).length;
      isi(i, j, null, []);
      const size = Object.keys(room).length - filledBefore;
      sizes.push(size);
      depthAfterLastFill = 0;
      steps.push({
        state: state(),
        highlights: roles(),
        caption: `${position(lastFilled)} buntu, dan semua panggilan \`isi\` kembali satu per satu sampai ke main. Ruangan ${rooms} selesai: ${size} sel.`,
        lines: ['baru'],
        result: `ruangan ${rooms}: ${size} sel`,
        status: 'normal',
      });
    }
  }

  const listSizes = sizes.length === 1 ? `${sizes[0]} sel` : `${sizes.slice(0, -1).join(', ')} dan ${sizes.at(-1)} sel`;
  steps.push({
    state: state(),
    highlights: roles(),
    caption:
      rooms === 0
        ? 'Pemeriksaan selesai tanpa menemukan lantai, jadi jawabannya 0 ruangan.'
        : `Pemeriksaan sampai di sel terakhir tanpa menemukan lantai baru, jadi jawabannya ${rooms} ruangan (${listSizes}). Rekursi paling dalam ${maxDepth} panggilan \`isi\` sekaligus.`,
    lines: ['scan'],
    result: `${rooms} ruangan`,
    status: 'normal',
  });

  return steps;
}
