import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DFS_LESSON_GRAPH, edgeId, nodeId, randomGraph, type Graph } from './graph.ts';
import { dfsPseudocode, dfsSteps, type DfsMode, type DfsStep } from './dfs.ts';

/** Small deterministic generator so random graphs are reproducible. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function plainAdjacency(graph: Graph): number[][] {
  const adj: number[][] = [];
  for (let i = 0; i <= graph.n; i++) adj.push([]);
  for (const [u, v] of graph.edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  return adj;
}

/** The lesson's recursive program, recording the call stack whenever a node is visited. */
function referenceRecursive(graph: Graph, start: number) {
  const adj = plainAdjacency(graph);
  const visited: boolean[] = new Array(graph.n + 1).fill(false);
  const order: number[] = [];
  const stacksAtVisit: number[][] = [];
  const path: number[] = [];
  let calls = 0;
  const dfs = (u: number) => {
    calls++;
    if (visited[u]) return;
    visited[u] = true;
    order.push(u);
    path.push(u);
    stacksAtVisit.push([...path]);
    for (const v of adj[u]) dfs(v);
    path.pop();
  };
  dfs(start);
  return { order, calls, stacksAtVisit };
}

/** The lesson's program with its own stack, recording the stack after each pop and its pushes. */
function referenceStack(graph: Graph, start: number) {
  const adj = plainAdjacency(graph);
  const visited: boolean[] = new Array(graph.n + 1).fill(false);
  const order: number[] = [];
  const stack = [start];
  const after: number[][] = [[...stack]];
  let pushes = 1;
  let looks = 0;
  while (stack.length > 0) {
    const u = stack.pop()!;
    if (!visited[u]) {
      visited[u] = true;
      order.push(u);
      for (const v of adj[u]) {
        looks++;
        if (!visited[v]) {
          stack.push(v);
          pushes++;
        }
      }
    }
    after.push([...stack]);
  }
  return { order, after, pushes, looks };
}

const nodesOf = (step: DfsStep) => step.state.stack.map((frame) => frame.node);

function assertInvariants(graph: Graph, start: number, mode: DfsMode): DfsStep[] {
  const steps = dfsSteps(graph, start, mode);
  const lineIds = new Set(dfsPseudocode[mode].map((line) => line.id));
  const edgeIds = new Set(graph.edges.map(([u, v]) => edgeId(u, v)));
  const final = steps[steps.length - 1];
  const reference = mode === 'rekursif' ? referenceRecursive(graph, start) : referenceStack(graph, start);

  assert.deepEqual(final.state.order, reference.order, 'visit order matches the plain program');
  assert.equal(final.state.done, true);
  assert.deepEqual(final.state.stack, [], 'the stack ends empty');
  assert.ok(
    steps.slice(0, -1).every((step) => !step.state.done),
    'only the last step is done',
  );

  const frameNodes = new Map<string, number>();
  steps.forEach((step, index) => {
    const { state } = step;
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.ok(!step.caption.includes('undefined') && !step.caption.includes('null'), `step ${index} caption is filled in`);
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);

    const frameIds = new Set(state.stack.map((frame) => frame.id));
    assert.equal(frameIds.size, state.stack.length, `step ${index}: frame ids are unique`);
    for (const frame of state.stack) {
      if (frameNodes.has(frame.id)) assert.equal(frameNodes.get(frame.id), frame.node, 'a frame keeps its node');
      frameNodes.set(frame.id, frame.node);
      assert.ok(frame.node >= 1 && frame.node <= graph.n);
    }
    for (const id of Object.keys(step.highlights)) {
      const known =
        (id.startsWith('v') && Number(id.slice(1)) >= 1 && Number(id.slice(1)) <= graph.n) || edgeIds.has(id) || frameIds.has(id);
      assert.ok(known, `step ${index} highlights ${id}, which exists`);
    }

    // Visit order only grows, has no repeats and always agrees with the final order.
    assert.deepEqual(state.order, reference.order.slice(0, state.order.length), `step ${index} order is a prefix`);
    if (index > 0) assert.ok(state.order.length - steps[index - 1].state.order.length <= 1);
    if (state.fresh !== null) {
      assert.equal(state.fresh, state.order.at(-1));
      assert.ok(!steps[index - 1].state.order.includes(state.fresh), 'fresh nodes are new');
    }

    // The DFS tree: one edge per visited node except the start, each a real edge.
    assert.equal(state.tree.length, Math.max(0, state.order.length - 1));
    state.tree.forEach(([from, to], i) => {
      assert.ok(edgeIds.has(edgeId(from, to)));
      assert.equal(to, state.order[i + 1]);
      assert.ok(state.order.indexOf(from) < state.order.indexOf(to));
    });

    if (state.move) assert.ok(edgeIds.has(edgeId(state.move.from, state.move.to)), `step ${index} moves along an edge`);
    if (state.current !== null) {
      assert.ok(state.order.includes(state.current), 'u is visited');
      assert.equal(step.highlights[nodeId(state.current)], 'khusus');
    }
    if (state.neighbor !== null) assert.equal(step.highlights[nodeId(state.neighbor)], 'aktif');
    if (state.scan) assert.ok(state.scan.index >= 0);

    if (mode === 'rekursif') {
      const open = state.stack.filter((frame) => !frame.returning);
      const returning = state.stack.filter((frame) => frame.returning);
      assert.ok(returning.length <= 1, 'at most one call returns at once');
      if (returning.length === 1) {
        assert.equal(state.stack.at(-1), returning[0], 'the returning call is on top');
        assert.ok(state.order.includes(returning[0].node), 'it returns because its node is visited');
      }
      // The open calls are the path from the start to u.
      open.forEach((frame, i) => {
        assert.ok(state.order.includes(frame.node));
        if (i > 0) assert.ok(edgeIds.has(edgeId(open[i - 1].node, frame.node)), 'call stack is a path');
      });
      if (open.length > 0) assert.equal(open[0].node, start);
      assert.equal(state.current, open.at(-1)?.node ?? null, 'u is the running call');
      assert.ok(state.stack.length <= graph.n + 1);
    } else {
      assert.ok(state.stack.length <= 2 * graph.edges.length + 1, 'stack stays within 2m + 1');
    }
  });

  if (mode === 'rekursif') {
    const { calls, stacksAtVisit } = referenceRecursive(graph, start);
    // One starting step, one per call, one per finished call (each visited node).
    assert.equal(steps.length, 1 + calls + reference.order.length);
    const atVisit = steps.filter((step) => step.state.fresh !== null).map(nodesOf);
    assert.deepEqual(atVisit, stacksAtVisit, 'call stack at each visit is the path to it');
  } else {
    const { after, pushes, looks } = referenceStack(graph, start);
    // Start, push s, one step per pop, one per neighbour looked at, and the end.
    assert.equal(steps.length, 3 + pushes + looks);
    // The stack just before each pop (and at the end) matches the plain program.
    const beforePops = steps
      .filter((step, index) => index === steps.length - 1 || (steps[index + 1]?.lines.includes('pop') ?? false))
      .map(nodesOf);
    assert.deepEqual(beforePops, after, 'stack after each pop and its pushes');
  }
  return steps;
}

describe('dfsSteps (rekursif)', () => {
  it('follows the trace in the DFS lesson', () => {
    const steps = assertInvariants(DFS_LESSON_GRAPH, 1, 'rekursif');
    assert.equal(steps.length, 19);
    assert.deepEqual(steps.at(-1)!.state.order, [1, 2, 4, 3, 5]);

    // The order of calls in the lesson's tree: dfs(1) dfs(2) dfs(1) dfs(4) dfs(2) dfs(3) ...
    const calls = steps
      .filter((step) => step.lines.includes('panggil') || step.lines.includes('mulai'))
      .map((step) => step.state.stack.at(-1)!.node);
    assert.deepEqual(calls, [1, 2, 1, 4, 2, 3, 1, 4, 5, 2, 4, 5, 3]);

    // The call stack table: 3 is a dead end, so DFS backs up to 4 before visiting 5.
    const deadEnd = steps.findIndex((step) => step.caption.includes('`dfs(3)` selesai'));
    assert.deepEqual(nodesOf(steps[deadEnd]), [1, 2, 4]);
    assert.deepEqual(steps[deadEnd].state.move, { from: 3, to: 4, kind: 'mundur' });
    assert.deepEqual(nodesOf(steps[deadEnd + 1]), [1, 2, 4, 5]);

    // 3 is reached through 4, not straight from 1.
    assert.deepEqual(steps.at(-1)!.state.tree, [
      [1, 2],
      [2, 4],
      [4, 3],
      [4, 5],
    ]);
    assert.match(steps.at(-1)!.caption, /Urutan kunjungan: 1 2 4 3 5\. Simpul 6 tidak pernah dikunjungi/);
    assert.equal(steps.at(-1)!.highlights[nodeId(6)], 'dibuang');
    assert.equal(steps.at(-1)!.result, '1 2 4 3 5');
  });

  it('marks a call on a visited node as returning at once', () => {
    const steps = dfsSteps(DFS_LESSON_GRAPH, 1, 'rekursif');
    const step = steps[3];
    assert.deepEqual(
      step.state.stack.map((frame) => [frame.node, Boolean(frame.returning)]),
      [
        [1, false],
        [2, false],
        [1, true],
      ],
    );
    assert.equal(step.highlights[step.state.stack[2].id], 'dibuang');
    assert.equal(step.highlights[step.state.stack[1].id], 'khusus');
    assert.deepEqual(step.lines, ['panggil', 'cek']);
    assert.match(step.caption, /sudah `true`/);
  });

  it('colours the call-stack path and the finished part of the tree differently', () => {
    const steps = dfsSteps(DFS_LESSON_GRAPH, 1, 'rekursif');
    const visit5 = steps.find((step) => step.state.fresh === 5)!;
    assert.equal(visit5.highlights[edgeId(1, 2)], 'khusus');
    assert.equal(visit5.highlights[edgeId(2, 4)], 'khusus');
    assert.equal(visit5.highlights[edgeId(4, 5)], 'aktif', 'the edge just walked');
    assert.equal(visit5.highlights[edgeId(3, 4)], 'selesai', '3 is finished');
  });
});

describe('dfsSteps (stack)', () => {
  it('follows the trace table in the DFS lesson', () => {
    const steps = assertInvariants(DFS_LESSON_GRAPH, 1, 'stack');
    assert.deepEqual(steps.at(-1)!.state.order, [1, 3, 4, 5, 2]);
    const pops = steps.filter((step) => step.lines.includes('pop'));
    assert.deepEqual(
      pops.map((step) => step.result),
      ['pop → 1', 'pop → 3', 'pop → 4', 'pop → 5', 'pop → 2', 'pop → 2, lewati', 'pop → 2, lewati'],
    );
    // "Stack sesudahnya": 1 | 2 3 | 2 4 | 2 2 5 | 2 2 2 | 2 2 | 2 | kosong
    const rows = steps.filter((step, index) => index === steps.length - 1 || steps[index + 1].lines.includes('pop')).map(nodesOf);
    assert.deepEqual(rows, [[1], [2, 3], [2, 4], [2, 2, 5], [2, 2, 2], [2, 2], [2], []]);
    assert.match(steps.at(-1)!.caption, /Urutan kunjungan: 1 3 4 5 2/);
  });

  it('explains pushing a node that is already waiting in the stack', () => {
    const steps = dfsSteps(DFS_LESSON_GRAPH, 1, 'stack');
    const second2 = steps.filter((step) => step.result === 'push 2')[1];
    assert.match(second2.caption, /sudah ada di stack/);
    assert.equal(second2.highlights[second2.state.stack.at(-1)!.id], 'aktif');
  });
});

describe('dfsSteps edge cases', () => {
  const modes: DfsMode[] = ['rekursif', 'stack'];

  it('handles a start node without edges', () => {
    for (const mode of modes) {
      const steps = assertInvariants({ n: 3, edges: [] }, 2, mode);
      assert.deepEqual(steps.at(-1)!.state.order, [2]);
      assert.match(steps.at(-1)!.caption, /Simpul 1 dan 3 tidak pernah dikunjungi/);
      assert.ok(steps.some((step) => step.caption.includes('tidak punya tetangga')));
    }
    assert.equal(dfsSteps({ n: 2, edges: [] }, 1, 'rekursif').length, 3);
  });

  it('handles other start nodes, disconnected graphs and long paths', () => {
    for (const mode of modes) {
      assertInvariants(DFS_LESSON_GRAPH, 6, mode);
      assertInvariants(DFS_LESSON_GRAPH, 4, mode);
      assertInvariants(
        {
          n: 7,
          edges: [
            [1, 2],
            [3, 4],
            [4, 5],
            [5, 3],
            [6, 7],
          ],
        },
        4,
        mode,
      );
      const path: Graph = { n: 9, edges: Array.from({ length: 8 }, (_, i) => [i + 1, i + 2] as [number, number]) };
      const steps = assertInvariants(path, 1, mode);
      assert.deepEqual(steps.at(-1)!.state.order, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
      assertInvariants(path, 5, mode);
    }
    // The deepest recursion holds all nine calls (plus a call that returns at once).
    const deep = dfsSteps(
      { n: 9, edges: Array.from({ length: 8 }, (_, i) => [i + 1, i + 2] as [number, number]) },
      1,
      'rekursif',
    );
    assert.equal(Math.max(...deep.map((step) => step.state.stack.filter((frame) => !frame.returning).length)), 9);
  });

  it('follows the input order of edges, not the node numbers', () => {
    const graph: Graph = {
      n: 4,
      edges: [
        [1, 4],
        [1, 3],
        [1, 2],
      ],
    };
    assert.deepEqual(dfsSteps(graph, 1, 'rekursif').at(-1)!.state.order, [1, 4, 3, 2]);
    assert.deepEqual(dfsSteps(graph, 1, 'stack').at(-1)!.state.order, [1, 2, 3, 4]);
  });

  it('works for dense graphs at the edge limit and for random graphs', () => {
    const dense: Graph = { n: 6, edges: [] };
    for (let u = 1; u <= 6; u++) for (let v = u + 1; v <= 6; v++) dense.edges.push([u, v]);
    for (const mode of modes) {
      assertInvariants(dense, 1, mode);
      assertInvariants(dense, 6, mode);
      for (let seed = 1; seed <= 120; seed++) {
        const random = seeded(seed);
        const graph = randomGraph(2 + (seed % 8), random);
        assertInvariants(graph, 1 + Math.floor(random() * graph.n), mode);
      }
    }
  });

  it('is deterministic', () => {
    for (const mode of modes) assert.deepEqual(dfsSteps(DFS_LESSON_GRAPH, 1, mode), dfsSteps(DFS_LESSON_GRAPH, 1, mode));
  });
});
