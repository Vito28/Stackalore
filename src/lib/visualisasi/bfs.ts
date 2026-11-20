import type { PseudocodeLine, Role, Step } from './types.ts';
import { adjacencyList, edgeId, joinIndonesian, nodeId, type Edge, type Graph } from './graph.ts';

export interface BfsQueueItem {
  /** Stable identity so the view can animate the same entry across steps. */
  id: string;
  node: number;
}

export interface BfsState {
  start: number;
  /** Node whose shortest route is rebuilt with `induk` after BFS, or null. */
  target: number | null;
  /** `dist[v]` for v = 1..n (index 0 unused); -1 means not found yet. */
  dist: number[];
  /** `induk[v]` (index 0 unused); 0 means no parent. Only tracked when there is a target. */
  parent: number[] | null;
  /** Front to back. */
  queue: BfsQueueItem[];
  /** Nodes in the order they left the queue. */
  order: number[];
  /** Node `u` taken from the front of the queue. */
  current: number | null;
  /** Neighbour `v` being looked at, or the node the route walk is on. */
  neighbor: number | null;
  /** Which adjacency list the loop is walking and where: entries before `index` are done. */
  scan: { node: number; index: number } | null;
  /** Edge [from, to] being looked at. */
  move: { from: number; to: number } | null;
  /** Edges [u, v] through which each node was found (the BFS tree). */
  tree: Edge[];
  /** Node found (given a distance) in this step. */
  fresh: number | null;
  /** Route rebuilt so far: while walking back it runs from the target, once done from the start. */
  route: number[];
  phase: 'bfs' | 'selesai' | 'rute' | 'rute-selesai';
}

export type BfsStep = Step<BfsState>;

/** Pseudocode for the main BFS program, plus the route lines when there is a target. */
export function bfsPseudocode(withRoute: boolean): PseudocodeLine[] {
  const lines: PseudocodeLine[] = [
    { id: 'init', text: withRoute ? 'dist ← semua -1, induk ← semua 0' : 'dist ← semua -1', indent: 0 },
    { id: 'awal', text: 'dist[s] ← 0, masukkan s ke queue', indent: 0 },
    { id: 'while', text: 'selama queue tidak kosong:', indent: 0 },
    { id: 'ambil', text: 'u ← ambil dari depan queue', indent: 1 },
    { id: 'loop', text: 'untuk setiap v di adj[u]:', indent: 1 },
    { id: 'cek', text: 'jika dist[v] = -1:', indent: 2 },
    { id: 'isi', text: 'dist[v] ← dist[u] + 1', indent: 3 },
    { id: 'induk', text: 'induk[v] ← u', indent: 3 },
    { id: 'masuk', text: 'masukkan v ke belakang queue', indent: 3 },
    { id: 'rute-cek', text: 'jika dist[t] = -1: tidak ada rute', indent: 0 },
    { id: 'rute-mundur', text: 'v ← t, selama v ≠ 0:', indent: 0 },
    { id: 'rute-catat', text: 'catat v, lalu v ← induk[v]', indent: 1 },
    { id: 'rute-balik', text: 'balik urutan rute', indent: 0 },
  ];
  return withRoute ? lines : lines.filter((line) => line.id !== 'induk' && !line.id.startsWith('rute'));
}

const neighbourWord = (index: number) => (index === 0 ? 'Tetangga pertama' : 'Tetangga berikutnya');

/** Distance cell id in the `dist` table. */
export const distId = (node: number) => `d${node}`;
/** Parent cell id in the `induk` table. */
export const parentId = (node: number) => `p${node}`;

function highlightsFor(state: BfsState, n: number, extra: Record<string, Role> = {}): Record<string, Role> {
  const highlights: Record<string, Role> = {};
  const finished = state.phase !== 'bfs';
  for (let node = 1; node <= n; node++) {
    if (state.dist[node] !== -1) highlights[nodeId(node)] = 'selesai';
    else if (finished) highlights[nodeId(node)] = 'dibuang';
  }
  for (const [from, to] of state.tree) highlights[edgeId(from, to)] = 'selesai';
  if (state.move) highlights[edgeId(state.move.from, state.move.to)] = 'aktif';
  for (let i = 0; i + 1 < state.route.length; i++) highlights[edgeId(state.route[i], state.route[i + 1])] = 'khusus';
  for (const node of state.route) highlights[nodeId(node)] = 'khusus';
  if (state.current !== null) {
    highlights[nodeId(state.current)] = 'khusus';
    highlights[distId(state.current)] = 'khusus';
  }
  if (state.neighbor !== null) highlights[nodeId(state.neighbor)] = 'aktif';
  return { ...highlights, ...extra };
}

/**
 * Turns a graph, a start node and an optional target into BFS steps, exactly
 * as in the BFS lesson: a node gets its distance (and parent) when it enters
 * the queue, not when it leaves. One step per node taken from the queue and
 * one per neighbour looked at. With a target, the route is then rebuilt by
 * following `induk` back from the target. Expects a valid graph (see
 * `validateGraph`) and nodes between 1 and n.
 */
export function bfsSteps(graph: Graph, start: number, target: number | null = null): BfsStep[] {
  const adj = adjacencyList(graph);
  const steps: BfsStep[] = [];
  const withRoute = target !== null;
  const dist = Array.from({ length: graph.n + 1 }, () => -1);
  const parent = Array.from({ length: graph.n + 1 }, () => 0);
  const order: number[] = [];
  const tree: Edge[] = [];
  let queue: BfsQueueItem[] = [];
  let entries = 0;

  const state = (patch: Partial<BfsState>): BfsState => ({
    start,
    target,
    dist: [...dist],
    parent: withRoute ? [...parent] : null,
    queue: [...queue],
    order: [...order],
    current: null,
    neighbor: null,
    scan: null,
    move: null,
    tree: [...tree],
    fresh: null,
    route: [],
    phase: 'bfs',
    ...patch,
  });
  const emit = (value: BfsState, caption: string, lines: string[], result?: string, extra?: Record<string, Role>) => {
    steps.push({ state: value, highlights: highlightsFor(value, graph.n, extra), caption, lines, result, status: 'normal' });
  };
  const enqueue = (node: number) => {
    const item = { id: `q${entries++}`, node };
    queue = [...queue, item];
    return item;
  };

  emit(
    state({}),
    `Semua \`dist\` diisi \`-1\`, artinya belum ditemukan.${withRoute ? ' Semua `induk` diisi 0.' : ''} Queue masih kosong.`,
    ['init'],
  );

  dist[start] = 0;
  const first = enqueue(start);
  emit(
    state({ fresh: start }),
    `Mulai dari simpul ${start}: \`dist[${start}] = 0\`, lalu ${start} masuk ke queue.`,
    ['awal'],
    `dist[${start}] = 0`,
    { [first.id]: 'aktif', [distId(start)]: 'aktif' },
  );

  while (queue.length > 0) {
    const u = queue[0].node;
    queue = queue.slice(1);
    order.push(u);
    emit(
      state({ current: u }),
      `Queue tidak kosong, jadi ambil simpul paling depan: \`u = ${u}\` dengan \`dist[${u}] = ${dist[u]}\`.${adj[u].length === 0 ? ` Simpul ${u} tidak punya tetangga.` : ''}`,
      ['while', 'ambil'],
      `u = ${u}`,
    );

    adj[u].forEach((v, index) => {
      const look = { current: u, neighbor: v, scan: { node: u, index }, move: { from: u, to: v } };
      if (dist[v] !== -1) {
        const waiting = queue.some((item) => item.node === v);
        emit(
          state(look),
          `${neighbourWord(index)} dari ${u} adalah ${v}, tetapi \`dist[${v}] = ${dist[v]}\`, bukan \`-1\`. Simpul ${v} sudah ditemukan${waiting ? ' dan masih menunggu di queue' : ''}, jadi tidak dimasukkan lagi.`,
          ['loop', 'cek'],
        );
        return;
      }
      dist[v] = dist[u] + 1;
      parent[v] = u;
      tree.push([u, v]);
      const item = enqueue(v);
      const parentText = withRoute ? `, \`induk[${v}] = ${u}\`` : '';
      emit(
        state({ ...look, fresh: v }),
        `${neighbourWord(index)} dari ${u} adalah ${v}. \`dist[${v}]\` masih \`-1\`, jadi \`dist[${v}] = dist[${u}] + 1 = ${dist[v]}\`${parentText}, lalu ${v} masuk ke belakang queue.`,
        withRoute ? ['loop', 'cek', 'isi', 'induk', 'masuk'] : ['loop', 'cek', 'isi', 'masuk'],
        `dist[${v}] = ${dist[v]}`,
        { [item.id]: 'aktif', [distId(v)]: 'aktif', ...(withRoute ? { [parentId(v)]: 'aktif' as const } : {}) },
      );
    });
  }

  const unreachable = Array.from({ length: graph.n }, (_, i) => i + 1).filter((node) => dist[node] === -1);
  const unreachableText =
    unreachable.length === 0
      ? ''
      : ` Simpul ${joinIndonesian(unreachable)} tetap \`dist = -1\` karena tidak bisa dicapai dari ${start}.`;
  emit(
    state({ phase: 'selesai' }),
    `Queue kosong, jadi BFS selesai. Urutan BFS: ${order.join(' ')}.${unreachableText}`,
    ['while'],
    order.join(' '),
  );

  if (target === null) return steps;

  if (dist[target] === -1) {
    emit(
      state({ phase: 'rute-selesai', neighbor: target }),
      `\`dist[${target}] = -1\`, jadi tidak ada rute dari ${start} ke ${target}.`,
      ['rute-cek'],
      'Tidak ada rute',
    );
    return steps;
  }

  emit(
    state({ phase: 'rute', neighbor: target }),
    `\`dist[${target}] = ${dist[target]}\`, bukan \`-1\`, jadi rute dari ${start} ke ${target} ada. Susun rutenya dengan mengikuti \`induk\` mundur dari ${target}.`,
    ['rute-cek'],
  );

  const walked: number[] = [];
  for (let v = target; v !== 0; v = parent[v]) {
    walked.push(v);
    const next = parent[v];
    emit(
      state({ phase: 'rute', neighbor: v, route: [...walked] }),
      next === 0
        ? `Catat ${v}. \`induk[${v}] = 0\`, artinya ${v} tidak punya induk, jadi berhenti.`
        : `Catat ${v}, lalu mundur ke \`induk[${v}] = ${next}\`.`,
      ['rute-mundur', 'rute-catat'],
      `induk[${v}] = ${next}`,
      { [parentId(v)]: 'aktif' },
    );
  }

  const route = [...walked].reverse();
  emit(
    state({ phase: 'rute-selesai', route }),
    route.length === 1
      ? `Simpul tujuan sama dengan simpul awal, jadi rutenya hanya ${start} dengan jarak 0.`
      : `Rute yang terkumpul, ${walked.join(' ')}, masih terbalik. Setelah dibalik: ${route.join(' → ')}, dengan jarak ${dist[target]}.`,
    ['rute-balik'],
    `Rute: ${route.join(' ')}`,
  );
  return steps;
}
