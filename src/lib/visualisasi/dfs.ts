import type { PseudocodeLine, Role, Step } from './types.ts';
import { adjacencyList, edgeId, joinIndonesian, nodeId, type Edge, type Graph } from './graph.ts';

/** The two DFS versions taught in the DFS lesson. */
export type DfsMode = 'rekursif' | 'stack';

export interface DfsFrame {
  /** Stable identity so the view can animate the same frame or stack entry across steps. */
  id: string;
  node: number;
  /** Recursive mode: this call found its node already visited and returns at once. */
  returning?: boolean;
}

/** A move along an edge: walking to a new node, looking at a neighbour, or returning to the caller. */
export interface DfsMove {
  from: number;
  to: number;
  kind: 'maju' | 'cek' | 'mundur';
}

export interface DfsState {
  mode: DfsMode;
  start: number;
  /** Visit order so far; also the set of visited nodes. */
  order: number[];
  /** Node `u` whose neighbours are being looked at. */
  current: number | null;
  /** Neighbour `v` being looked at, or the node just popped and skipped. */
  neighbor: number | null;
  /** Which adjacency list the loop is walking and where: entries before `index` are done. */
  scan: { node: number; index: number } | null;
  move: DfsMove | null;
  /** Call stack (rekursif) or the explicit stack (stack), bottom to top. */
  stack: DfsFrame[];
  /** Edges [from, to] through which each node was first visited (the DFS tree). */
  tree: Edge[];
  /** Node visited for the first time in this step. */
  fresh: number | null;
  done: boolean;
}

export type DfsStep = Step<DfsState>;

export const dfsPseudocode: Record<DfsMode, PseudocodeLine[]> = {
  rekursif: [
    { id: 'dfs', text: 'dfs(u):', indent: 0 },
    { id: 'cek', text: 'jika visited[u]: kembali', indent: 1 },
    { id: 'tandai', text: 'visited[u] ← true, cetak u', indent: 1 },
    { id: 'loop', text: 'untuk setiap v di adj[u]:', indent: 1 },
    { id: 'panggil', text: 'dfs(v)', indent: 2 },
    { id: 'selesai', text: 'selesai → kembali ke pemanggil', indent: 1 },
    { id: 'utama', text: 'program utama:', indent: 0 },
    { id: 'init', text: 'visited ← semua false', indent: 1 },
    { id: 'mulai', text: 'dfs(s)', indent: 1 },
  ],
  stack: [
    { id: 'init', text: 'visited ← semua false', indent: 0 },
    { id: 'push-awal', text: 'push s', indent: 0 },
    { id: 'while', text: 'selama stack tidak kosong:', indent: 0 },
    { id: 'pop', text: 'u ← pop', indent: 1 },
    { id: 'cek', text: 'jika visited[u]: lewati', indent: 1 },
    { id: 'tandai', text: 'visited[u] ← true, cetak u', indent: 1 },
    { id: 'loop', text: 'untuk setiap v di adj[u]:', indent: 1 },
    { id: 'push', text: 'jika belum visited[v]: push v', indent: 2 },
  ],
};

const neighbourWord = (index: number) => (index === 0 ? 'Tetangga pertama' : 'Tetangga berikutnya');

/** Roles derived from a state; the same rules for every step. */
function highlightsFor(state: DfsState, n: number, extra: Record<string, Role> = {}): Record<string, Role> {
  const highlights: Record<string, Role> = {};
  const visited = new Set(state.order);
  for (let node = 1; node <= n; node++) {
    if (visited.has(node)) highlights[nodeId(node)] = 'selesai';
    else if (state.done) highlights[nodeId(node)] = 'dibuang';
  }
  // In the recursive version the open calls are exactly the path from the start to `u`.
  const onPath = new Set(
    state.mode === 'rekursif' ? state.stack.filter((frame) => !frame.returning).map((frame) => frame.node) : [],
  );
  for (const [from, to] of state.tree) highlights[edgeId(from, to)] = onPath.has(to) ? 'khusus' : 'selesai';
  if (state.move) highlights[edgeId(state.move.from, state.move.to)] = 'aktif';
  if (state.current !== null) highlights[nodeId(state.current)] = 'khusus';
  if (state.neighbor !== null) highlights[nodeId(state.neighbor)] = 'aktif';
  if (state.mode === 'rekursif') {
    // The call that is running is khusus; a call that returns at once is dibuang.
    const running = state.stack.findLast((frame) => !frame.returning);
    if (running && !state.done) highlights[running.id] = 'khusus';
    for (const frame of state.stack) if (frame.returning) highlights[frame.id] = 'dibuang';
  }
  return { ...highlights, ...extra };
}

function closing(order: number[], n: number, start: number): string {
  const visited = new Set(order);
  const unreachable = Array.from({ length: n }, (_, i) => i + 1).filter((node) => !visited.has(node));
  const tail =
    unreachable.length === 0
      ? ''
      : unreachable.length === 1
        ? ` Simpul ${unreachable[0]} tidak pernah dikunjungi karena tidak bisa dicapai dari ${start}.`
        : ` Simpul ${joinIndonesian(unreachable)} tidak pernah dikunjungi karena tidak bisa dicapai dari ${start}.`;
  return `Urutan kunjungan: ${order.join(' ')}.${tail}`;
}

/**
 * Recursive DFS exactly as in the lesson: `dfs(v)` is called for every
 * neighbour, and a call on a visited node returns at once. One step per
 * call and one step per finished call.
 */
function recursiveSteps(graph: Graph, start: number): DfsStep[] {
  const adj = adjacencyList(graph);
  const steps: DfsStep[] = [];
  const order: number[] = [];
  const tree: Edge[] = [];
  const frames: DfsFrame[] = [];
  let calls = 0;

  const base = (): DfsState => ({
    mode: 'rekursif',
    start,
    order: [...order],
    current: frames.at(-1)?.node ?? null,
    neighbor: null,
    scan: null,
    move: null,
    stack: [...frames],
    tree: [...tree],
    fresh: null,
    done: false,
  });
  const emit = (state: DfsState, caption: string, lines: string[], result?: string) => {
    steps.push({ state, highlights: highlightsFor(state, graph.n), caption, lines, result, status: 'normal' });
  };

  emit(
    base(),
    `DFS rekursif dimulai dari simpul ${start}. Semua \`visited\` masih \`false\` dan call stack masih kosong. Tetangga diperiksa sesuai urutan di adjacency list.`,
    ['utama', 'init'],
  );

  const dfs = (u: number, caller: number | null, index: number) => {
    const frame: DfsFrame = { id: `f${calls++}`, node: u };
    const via = caller === null ? '' : `${neighbourWord(index)} dari ${caller} adalah ${u}, jadi panggil \`dfs(${u})\`. `;

    if (order.includes(u)) {
      const state: DfsState = {
        ...base(),
        neighbor: u,
        scan: caller === null ? null : { node: caller, index },
        move: caller === null ? null : { from: caller, to: u, kind: 'cek' },
        stack: [...frames, { ...frame, returning: true }],
      };
      emit(state, `${via}Namun \`visited[${u}]\` sudah \`true\`, jadi pemanggilan ini langsung kembali.`, ['panggil', 'cek']);
      return;
    }

    frames.push(frame);
    order.push(u);
    if (caller !== null) tree.push([caller, u]);
    const opening = caller === null ? `\`dfs(${u})\` dipanggil dari program utama. ` : via;
    emit(
      {
        ...base(),
        scan: caller === null ? null : { node: caller, index },
        move: caller === null ? null : { from: caller, to: u, kind: 'maju' },
        fresh: u,
      },
      `${opening}Karena \`visited[${u}]\` masih \`false\`, tandai \`visited[${u}] = true\` dan cetak ${u}.${adj[u].length === 0 ? ` Simpul ${u} tidak punya tetangga.` : ''}`,
      [caller === null ? 'mulai' : 'panggil', 'cek', 'tandai'],
      `cetak ${u}`,
    );

    adj[u].forEach((v, i) => dfs(v, u, i));

    frames.pop();
    const back = frames.at(-1)?.node ?? null;
    const finished = `Semua tetangga ${u} sudah diperiksa, jadi \`dfs(${u})\` selesai dan keluar dari call stack.`;
    if (back === null) {
      const state: DfsState = { ...base(), scan: { node: u, index: adj[u].length }, done: true };
      emit(
        state,
        `${adj[u].length === 0 ? `\`dfs(${u})\` selesai dan call stack kosong.` : `${finished} Call stack sekarang kosong.`} ${closing(order, graph.n, start)}`,
        ['selesai'],
        order.join(' '),
      );
      return;
    }
    emit(
      { ...base(), scan: { node: u, index: adj[u].length }, move: { from: u, to: back, kind: 'mundur' } },
      `${finished} DFS mundur ke ${back} dan melanjutkan perulangan di \`dfs(${back})\`.`,
      ['selesai'],
    );
  };

  dfs(start, null, 0);
  return steps;
}

/** DFS with its own stack, exactly as in the lesson: mark on pop, push every unvisited neighbour. */
function stackSteps(graph: Graph, start: number): DfsStep[] {
  const adj = adjacencyList(graph);
  const steps: DfsStep[] = [];
  const order: number[] = [];
  const tree: Edge[] = [];
  /** `from` remembers who pushed an entry, to draw the DFS tree when it is visited. */
  let stack: (DfsFrame & { from: number | null })[] = [];
  let pushes = 0;

  const state = (patch: Partial<DfsState>): DfsState => ({
    mode: 'stack',
    start,
    order: [...order],
    current: null,
    neighbor: null,
    scan: null,
    move: null,
    stack: stack.map(({ id, node }) => ({ id, node })),
    tree: [...tree],
    fresh: null,
    done: false,
    ...patch,
  });
  const emit = (value: DfsState, caption: string, lines: string[], result?: string, extra?: Record<string, Role>) => {
    steps.push({ state: value, highlights: highlightsFor(value, graph.n, extra), caption, lines, result, status: 'normal' });
  };
  const push = (node: number, from: number | null) => {
    const entry = { id: `s${pushes++}`, node, from };
    stack = [...stack, entry];
    return entry;
  };

  emit(
    state({}),
    `DFS dengan stack sendiri dimulai dari simpul ${start}. Semua \`visited\` masih \`false\` dan stack masih kosong.`,
    ['init'],
  );
  const first = push(start, null);
  emit(state({}), `Push simpul awal ${start} ke stack.`, ['push-awal'], `push ${start}`, { [first.id]: 'aktif' });

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    stack = stack.slice(0, -1);
    const u = top.node;

    if (order.includes(u)) {
      emit(
        state({ neighbor: u }),
        `Pop elemen paling atas: \`u = ${u}\`. \`visited[${u}]\` sudah \`true\` karena ${u} sudah dikunjungi lewat jalan lain, jadi lewati.`,
        ['while', 'pop', 'cek'],
        `pop → ${u}, lewati`,
      );
      continue;
    }

    order.push(u);
    if (top.from !== null) tree.push([top.from, u]);
    const pushedBy = top.from === null ? '' : ` (${u} tadi di-push oleh ${top.from}.)`;
    emit(
      state({
        current: u,
        move: top.from === null ? null : { from: top.from, to: u, kind: 'maju' },
        fresh: u,
      }),
      `Pop elemen paling atas: \`u = ${u}\`. \`visited[${u}]\` masih \`false\`, jadi tandai \`visited[${u}] = true\` dan cetak ${u}.${pushedBy}${adj[u].length === 0 ? ` Simpul ${u} tidak punya tetangga.` : ''}`,
      ['while', 'pop', 'cek', 'tandai'],
      `pop → ${u}`,
    );

    adj[u].forEach((v, index) => {
      const scan = { node: u, index };
      const move: DfsMove = { from: u, to: v, kind: 'cek' };
      if (order.includes(v)) {
        emit(
          state({ current: u, neighbor: v, scan, move }),
          `${neighbourWord(index)} dari ${u} adalah ${v}, tetapi \`visited[${v}]\` sudah \`true\`, jadi ${v} tidak di-push.`,
          ['loop', 'push'],
        );
        return;
      }
      const waiting = stack.some((entry) => entry.node === v);
      const entry = push(v, u);
      emit(
        state({ current: u, neighbor: v, scan, move }),
        `${neighbourWord(index)} dari ${u} adalah ${v}. \`visited[${v}]\` masih \`false\`, jadi push ${v} ke stack.${waiting ? ` Simpul ${v} sudah ada di stack, tetapi tetap di-push karena baru ditandai saat di-pop.` : ''}`,
        ['loop', 'push'],
        `push ${v}`,
        { [entry.id]: 'aktif' },
      );
    });
  }

  emit(
    state({ done: true }),
    `Stack kosong, jadi perulangan berhenti. ${closing(order, graph.n, start)}`,
    ['while'],
    order.join(' '),
  );
  return steps;
}

/**
 * Turns a graph and a start node into DFS steps. Expects a valid graph
 * (see `validateGraph`) and a start node between 1 and n.
 */
export function dfsSteps(graph: Graph, start: number, mode: DfsMode): DfsStep[] {
  return mode === 'rekursif' ? recursiveSteps(graph, start) : stackSteps(graph, start);
}
