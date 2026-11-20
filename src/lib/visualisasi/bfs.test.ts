import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BFS_LESSON_GRAPH, DFS_LESSON_GRAPH, edgeId, nodeId, randomGraph, type Graph } from './graph.ts';
import { bfsPseudocode, bfsSteps, distId, parentId, type BfsStep } from './bfs.ts';

/** Small deterministic generator so random graphs are reproducible. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

/** The lesson's BFS program with `induk`, recording the queue after each node leaves it. */
function reference(graph: Graph, s: number, t: number | null) {
  const adj: number[][] = [];
  for (let i = 0; i <= graph.n; i++) adj.push([]);
  for (const [u, v] of graph.edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const dist: number[] = new Array(graph.n + 1).fill(-1);
  const induk: number[] = new Array(graph.n + 1).fill(0);
  const q = [s];
  dist[s] = 0;
  const order: number[] = [];
  const after: number[][] = [[...q]];
  let looks = 0;
  while (q.length > 0) {
    const u = q.shift()!;
    order.push(u);
    for (const v of adj[u]) {
      looks++;
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1;
        induk[v] = u;
        q.push(v);
      }
    }
    after.push([...q]);
  }
  let route: number[] | null = null;
  if (t !== null && dist[t] !== -1) {
    route = [];
    for (let v = t; v !== 0; v = induk[v]) route.push(v);
    route.reverse();
  }
  return { dist, induk, order, after, looks, route };
}

const queueOf = (step: BfsStep) => step.state.queue.map((item) => item.node);

function assertInvariants(graph: Graph, start: number, target: number | null = null): BfsStep[] {
  const steps = bfsSteps(graph, start, target);
  const expected = reference(graph, start, target);
  const lineIds = new Set(bfsPseudocode(target !== null).map((line) => line.id));
  const edgeIds = new Set(graph.edges.map(([u, v]) => edgeId(u, v)));
  const doneIndex = steps.findIndex((step) => step.state.phase === 'selesai');
  const done = steps[doneIndex];
  const final = steps[steps.length - 1];

  assert.deepEqual(done.state.order, expected.order, 'BFS order matches the plain program');
  assert.deepEqual(done.state.dist, expected.dist, 'distances match');
  assert.deepEqual(done.state.queue, [], 'the queue ends empty');
  // Start, dist[s] = 0, one step per node taken, one per neighbour looked at, and the end.
  assert.equal(doneIndex, 2 + expected.order.length + expected.looks);

  if (target === null) {
    assert.equal(steps.length, doneIndex + 1);
    assert.ok(steps.every((step) => step.state.parent === null));
  } else {
    assert.deepEqual(done.state.parent, expected.induk, '`induk` matches');
    assert.equal(final.state.phase, 'rute-selesai');
    if (expected.route === null) {
      assert.equal(steps.length, doneIndex + 2);
      assert.equal(final.result, 'Tidak ada rute');
      assert.deepEqual(final.state.route, []);
    } else {
      // Check, one step per node on the way back, then the reversal.
      assert.equal(steps.length, doneIndex + 2 + expected.route.length + 1);
      assert.deepEqual(final.state.route, expected.route);
      assert.equal(final.result, `Rute: ${expected.route.join(' ')}`);
      assert.equal(final.state.route.length - 1, expected.dist[target], 'route length is the distance');
    }
  }

  const queueNode = new Map<string, number>();
  const enqueued = new Map<number, string>();
  steps.forEach((step, index) => {
    const { state } = step;
    const queueIds = new Set(state.queue.map((item) => item.id));
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.ok(!step.caption.includes('undefined') && !step.caption.includes('null'), `step ${index} caption is filled in`);
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    for (const id of Object.keys(step.highlights)) {
      const number = Number(id.slice(1));
      const isNode = /^[vdp]\d+$/.test(id) && number >= 1 && number <= graph.n;
      assert.ok(isNode || edgeIds.has(id) || queueIds.has(id), `step ${index} highlights ${id}, which exists`);
      if (id.startsWith('p')) assert.notEqual(target, null, 'induk only appears with a target');
    }

    // dist starts at -1, is filled once and never changes afterwards.
    assert.equal(state.dist.length, graph.n + 1);
    for (let v = 0; v <= graph.n; v++) {
      assert.ok(state.dist[v] === -1 || state.dist[v] === expected.dist[v], `step ${index}: dist[${v}] is final once set`);
      if (index > 0 && steps[index - 1].state.dist[v] !== -1) assert.equal(state.dist[v], steps[index - 1].state.dist[v]);
    }
    if (index >= 1) assert.equal(state.dist[start], 0);

    // Marked when entering the queue: everything waiting already has a distance,
    // each node enters at most once, and the queue is sorted by distance.
    const waiting = state.queue.map((item) => state.dist[item.node]);
    assert.ok(
      waiting.every((d) => d >= 0),
      `step ${index}: queued nodes have a distance`,
    );
    for (let i = 1; i < waiting.length; i++) assert.ok(waiting[i - 1] <= waiting[i], 'queue is sorted by distance');
    if (waiting.length > 0) assert.ok(waiting[waiting.length - 1] - waiting[0] <= 1, 'queue spans at most two layers');
    for (const item of state.queue) {
      if (queueNode.has(item.id)) assert.equal(queueNode.get(item.id), item.node, 'an entry keeps its node');
      queueNode.set(item.id, item.node);
      const first = enqueued.get(item.node);
      assert.ok(first === undefined || first === item.id, `node ${item.node} enters the queue only once`);
      enqueued.set(item.node, item.id);
    }

    // The order only grows, matches the final order and never goes back a layer.
    assert.deepEqual(state.order, expected.order.slice(0, state.order.length));
    for (let i = 1; i < state.order.length; i++) {
      assert.ok(state.dist[state.order[i - 1]] <= state.dist[state.order[i]], 'nodes leave layer by layer');
    }

    for (const [u, v] of state.tree) {
      assert.ok(edgeIds.has(edgeId(u, v)));
      assert.equal(state.dist[v], state.dist[u] + 1, 'tree edges go one layer further');
      if (state.parent) assert.equal(state.parent[v], u);
    }
    assert.equal(state.tree.length, state.dist.filter((d) => d > 0).length);

    if (state.move) assert.ok(edgeIds.has(edgeId(state.move.from, state.move.to)));
    if (state.current !== null) {
      assert.equal(state.current, state.order.at(-1), 'u is the node that just left the queue');
      assert.equal(step.highlights[nodeId(state.current)], 'khusus');
    }
    if (state.neighbor !== null) assert.equal(step.highlights[nodeId(state.neighbor)], 'aktif');
    if (state.fresh !== null) {
      assert.equal(steps[index - 1]?.state.dist[state.fresh] ?? -1, -1, 'fresh nodes are new');
      assert.notEqual(state.dist[state.fresh], -1);
      assert.equal(step.highlights[distId(state.fresh)], 'aktif');
    }
  });
  return steps;
}

describe('bfsSteps', () => {
  it('follows the trace table in the BFS lesson', () => {
    const steps = assertInvariants(BFS_LESSON_GRAPH, 1);
    const done = steps.at(-1)!;
    assert.deepEqual(done.state.order, [1, 2, 4, 3, 5, 7, 6, 8]);
    assert.deepEqual(done.state.dist.slice(1), [0, 1, 2, 1, 2, 3, 2, 3]);
    assert.match(done.caption, /Urutan BFS: 1 2 4 3 5 7 6 8\./);

    // "Isi queue sesudahnya": 1 | 2 4 | 4 3 5 | 3 5 7 | 5 7 6 | 7 6 | 6 8 | 8 | kosong
    const rows = steps
      .filter((step, index) => index === steps.length - 1 || steps[index + 1].lines.includes('ambil'))
      .map(queueOf);
    assert.deepEqual(rows, [[1], [2, 4], [4, 3, 5], [3, 5, 7], [5, 7, 6], [7, 6], [6, 8], [8], []]);

    // Langkah 5: 6 already has a distance while it waits, so 5 does not add it again.
    const skip6 = steps.find((step) => step.state.current === 5 && step.state.neighbor === 6)!;
    assert.match(skip6.caption, /`dist\[6\] = 3`.*masih menunggu di queue/);
    assert.deepEqual(queueOf(skip6), [7, 6]);
  });

  it('shows dist[v] = dist[u] + 1 when a node is found', () => {
    const steps = bfsSteps(BFS_LESSON_GRAPH, 1);
    const found3 = steps.find((step) => step.state.fresh === 3)!;
    assert.match(found3.caption, /`dist\[3\] = dist\[2\] \+ 1 = 2`/);
    assert.equal(found3.result, 'dist[3] = 2');
    assert.deepEqual(found3.lines, ['loop', 'cek', 'isi', 'masuk']);
    assert.equal(found3.highlights[found3.state.queue.at(-1)!.id], 'aktif');
    assert.ok(!found3.caption.includes('induk'), 'no induk before the lesson teaches it');
  });

  it('rebuilds the route with induk like the lesson', () => {
    const steps = assertInvariants(BFS_LESSON_GRAPH, 1, 8);
    const done = steps.find((step) => step.state.phase === 'selesai')!;
    assert.deepEqual(done.state.parent!.slice(1), [0, 1, 2, 1, 2, 3, 4, 7]);
    const walk = steps.filter((step) => step.lines.includes('rute-catat'));
    assert.deepEqual(
      walk.map((step) => step.state.route),
      [[8], [8, 7], [8, 7, 4], [8, 7, 4, 1]],
    );
    assert.deepEqual(
      walk.map((step) => step.highlights[parentId(step.state.neighbor!)]),
      ['aktif', 'aktif', 'aktif', 'aktif'],
    );
    const final = steps.at(-1)!;
    assert.match(final.caption, /1 → 4 → 7 → 8, dengan jarak 3/);
    assert.equal(final.highlights[edgeId(4, 7)], 'khusus');
    assert.equal(final.highlights[nodeId(7)], 'khusus');
  });
});

describe('bfsSteps edge cases', () => {
  it('handles a start node without edges and unreachable nodes', () => {
    const lonely = assertInvariants({ n: 3, edges: [] }, 2);
    assert.equal(lonely.length, 4);
    assert.match(lonely.at(-1)!.caption, /Simpul 1 dan 3 tetap `dist = -1`/);
    assert.equal(lonely.at(-1)!.highlights[nodeId(1)], 'dibuang');

    const steps = assertInvariants(DFS_LESSON_GRAPH, 1, 6);
    assert.match(steps.at(-1)!.caption, /tidak ada rute dari 1 ke 6/);
    assertInvariants(DFS_LESSON_GRAPH, 6, 1);
  });

  it('handles a target equal to the start', () => {
    const steps = assertInvariants(BFS_LESSON_GRAPH, 3, 3);
    assert.deepEqual(steps.at(-1)!.state.route, [3]);
    assert.match(steps.at(-1)!.caption, /hanya 3 dengan jarak 0/);
  });

  it('follows the input order of edges', () => {
    const graph: Graph = {
      n: 4,
      edges: [
        [1, 4],
        [1, 3],
        [1, 2],
      ],
    };
    assert.deepEqual(bfsSteps(graph, 1).at(-1)!.state.order, [1, 4, 3, 2]);
  });

  it('works for long paths, dense graphs and random graphs', () => {
    const path: Graph = { n: 9, edges: Array.from({ length: 8 }, (_, i) => [i + 1, i + 2] as [number, number]) };
    assertInvariants(path, 1, 9);
    assertInvariants(path, 5, 1);
    const dense: Graph = { n: 6, edges: [] };
    for (let u = 1; u <= 6; u++) for (let v = u + 1; v <= 6; v++) dense.edges.push([u, v]);
    assertInvariants(dense, 4, 2);
    for (let seed = 1; seed <= 150; seed++) {
      const random = seeded(seed);
      const graph = randomGraph(2 + (seed % 8), random);
      const start = 1 + Math.floor(random() * graph.n);
      assertInvariants(graph, start);
      assertInvariants(graph, start, 1 + Math.floor(random() * graph.n));
    }
  });

  it('keeps the route lines out of the pseudocode without a target', () => {
    const ids = bfsPseudocode(false).map((line) => line.id);
    assert.ok(!ids.includes('induk') && !ids.some((id) => id.startsWith('rute')));
    assert.ok(bfsPseudocode(true).some((line) => line.id === 'induk'));
  });

  it('is deterministic', () => {
    assert.deepEqual(bfsSteps(BFS_LESSON_GRAPH, 1, 8), bfsSteps(BFS_LESSON_GRAPH, 1, 8));
  });
});
