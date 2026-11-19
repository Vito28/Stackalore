import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BFS_LESSON_GRAPH,
  DFS_LESSON_GRAPH,
  GRAPH_LIMITS,
  NODE_RADIUS,
  adjacencyList,
  formatEdges,
  graphLayout,
  joinIndonesian,
  parseEdges,
  parseGraph,
  randomGraph,
  validateGraph,
  validateNode,
  type Graph,
  type Point,
} from './graph.ts';

/** Small deterministic generator so random graphs are reproducible. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function isConnected(graph: Graph): boolean {
  const adj = adjacencyList(graph);
  const seen = new Set([1]);
  const todo = [1];
  while (todo.length > 0) {
    for (const v of adj[todo.pop()!]) {
      if (!seen.has(v)) {
        seen.add(v);
        todo.push(v);
      }
    }
  }
  return seen.size === graph.n;
}

/** Distance from point p to segment a–b. */
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Every node sits inside the viewBox, nodes do not overlap, and no edge runs through another node. */
function assertReadable(graph: Graph) {
  const { positions, viewBox } = graphLayout(graph);
  const nodes = Array.from({ length: graph.n }, (_, i) => i + 1);
  for (const node of nodes) {
    const p = positions[node];
    assert.ok(p, `node ${node} has a position`);
    assert.ok(p.x - NODE_RADIUS >= viewBox.x && p.x + NODE_RADIUS <= viewBox.x + viewBox.width, `node ${node} fits horizontally`);
    assert.ok(p.y - NODE_RADIUS >= viewBox.y && p.y + NODE_RADIUS <= viewBox.y + viewBox.height, `node ${node} fits vertically`);
    for (const other of nodes) {
      if (other <= node) continue;
      assert.ok(Math.hypot(p.x - positions[other].x, p.y - positions[other].y) >= 3 * NODE_RADIUS, `${node} and ${other} apart`);
    }
  }
  for (const [u, v] of graph.edges) {
    for (const node of nodes) {
      if (node === u || node === v) continue;
      assert.ok(
        distanceToSegment(positions[node], positions[u], positions[v]) >= NODE_RADIUS + 6,
        `edge ${u}-${v} stays clear of node ${node}`,
      );
    }
  }
}

describe('adjacencyList', () => {
  it('appends both directions in input order, like the DFS lesson', () => {
    const adj = adjacencyList(DFS_LESSON_GRAPH);
    // "1: 2 3, 2: 1 4 5, 3: 1 4, 4: 2 3 5, 5: 2 4, dan 6: kosong"
    assert.deepEqual(adj.slice(1), [[2, 3], [1, 4, 5], [1, 4], [2, 3, 5], [2, 4], []]);
  });

  it('builds the BFS lesson graph', () => {
    const adj = adjacencyList(BFS_LESSON_GRAPH);
    assert.deepEqual(adj.slice(1), [
      [2, 4],
      [1, 3, 5],
      [2, 6],
      [1, 7],
      [2, 6],
      [3, 5, 8],
      [4, 8],
      [7, 6],
    ]);
  });

  it('does not sort neighbours', () => {
    assert.deepEqual(
      adjacencyList({
        n: 3,
        edges: [
          [1, 3],
          [1, 2],
        ],
      })[1],
      [3, 2],
    );
  });
});

describe('parseEdges and validateGraph', () => {
  it('reads edge lists written in different ways', () => {
    assert.deepEqual(parseEdges('1-2 1-3 2-4'), {
      edges: [
        [1, 2],
        [1, 3],
        [2, 4],
      ],
    });
    assert.deepEqual(parseEdges(' 1 - 2, 3-4;5–6\n7-8 '), {
      edges: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ],
    });
    assert.deepEqual(parseEdges(''), { edges: [] });
    assert.equal(formatEdges(DFS_LESSON_GRAPH.edges), '1-2 1-3 2-4 2-5 3-4 4-5');
    assert.deepEqual(parseGraph(6, formatEdges(DFS_LESSON_GRAPH.edges)), { graph: DFS_LESSON_GRAPH });
  });

  it('rejects text that is not an edge', () => {
    for (const text of ['1-2-3', 'a-b', '12', '1-', '-2', '1 2', '1.5-2']) {
      const parsed = parseEdges(text);
      assert.ok('error' in parsed && parsed.error.length > 0, `rejects ${JSON.stringify(text)}`);
    }
  });

  it('accepts the lesson graphs and a graph without edges', () => {
    assert.equal(validateGraph(DFS_LESSON_GRAPH), null);
    assert.equal(validateGraph(BFS_LESSON_GRAPH), null);
    assert.equal(validateGraph({ n: 2, edges: [] }), null);
  });

  it('rejects graphs outside the limits or the lesson rules, with a clear message', () => {
    const cases: [Graph, RegExp][] = [
      [{ n: 1, edges: [] }, /2 sampai 9/],
      [{ n: 10, edges: [] }, /2 sampai 9/],
      [{ n: 2.5, edges: [] }, /2 sampai 9/],
      [{ n: 4, edges: [[1, 5]] }, /simpul 5, padahal simpulnya hanya 1 sampai 4/],
      [{ n: 4, edges: [[0, 2]] }, /simpul 0/],
      [{ n: 4, edges: [[3, 3]] }, /dirinya sendiri/],
      [
        {
          n: 4,
          edges: [
            [1, 2],
            [2, 1],
          ],
        },
        /sama dengan sisi 1-2/,
      ],
      [
        {
          n: 4,
          edges: [
            [1, 2],
            [1, 2],
          ],
        },
        /sudah ada/,
      ],
    ];
    for (const [graph, message] of cases) assert.match(validateGraph(graph) ?? '', message);

    const tooMany = { n: 9, edges: [] as [number, number][] };
    for (let u = 1; u <= 9 && tooMany.edges.length <= GRAPH_LIMITS.maxEdges; u++) {
      for (let v = u + 1; v <= 9 && tooMany.edges.length <= GRAPH_LIMITS.maxEdges; v++) tooMany.edges.push([u, v]);
    }
    assert.match(validateGraph(tooMany) ?? '', /Maksimal 15 sisi/);
    assert.equal(validateGraph({ n: 9, edges: tooMany.edges.slice(0, GRAPH_LIMITS.maxEdges) }), null);
  });

  it('checks start and target nodes', () => {
    assert.equal(validateNode(DFS_LESSON_GRAPH, 6, 'Simpul awal'), null);
    assert.match(validateNode(DFS_LESSON_GRAPH, 7, 'Simpul awal') ?? '', /Simpul awal harus antara 1 dan 6/);
    assert.ok(validateNode(DFS_LESSON_GRAPH, 0, 'Tujuan'));
  });

  it('reports parse errors before validation errors', () => {
    assert.ok('error' in parseGraph(4, '1-2 x'));
    assert.ok('error' in parseGraph(4, '1-9'));
  });
});

describe('graphLayout', () => {
  it('uses the hand-placed layouts for the lesson graphs and their subsets', () => {
    const dfs = graphLayout(DFS_LESSON_GRAPH);
    // 1 and 2 on top, 3 4 5 6 on the bottom row, as in the lesson's drawing.
    assert.equal(dfs.positions[1].y, dfs.positions[2].y);
    assert.deepEqual(
      [3, 4, 5, 6].map((node) => dfs.positions[node].y),
      Array(4).fill(dfs.positions[3].y),
    );
    assert.ok(dfs.positions[6].x > dfs.positions[5].x);
    assert.deepEqual(graphLayout({ n: 6, edges: [[2, 1]] }).positions, dfs.positions);

    const bfs = graphLayout(BFS_LESSON_GRAPH);
    assert.equal(bfs.positions[4].x, bfs.positions[1].x);
    assert.equal(bfs.positions[5].x, bfs.positions[2].x);
  });

  it('falls back to a circle when an edge is not in the preset', () => {
    const layout = graphLayout({ n: 6, edges: [[1, 5]] });
    assert.notDeepEqual(layout.positions, graphLayout(DFS_LESSON_GRAPH).positions);
    assert.ok(layout.positions[1].y < layout.positions[4].y, 'node 1 on top');
  });

  it('keeps every drawing readable', () => {
    assertReadable(DFS_LESSON_GRAPH);
    assertReadable(BFS_LESSON_GRAPH);
    for (let n = GRAPH_LIMITS.minNodes; n <= GRAPH_LIMITS.maxNodes; n++) {
      // Every possible edge, so the check covers any graph the reader can type.
      const edges: [number, number][] = [];
      for (let u = 1; u <= n; u++) for (let v = u + 1; v <= n; v++) edges.push([u, v]);
      assertReadable({ n, edges });
    }
  });
});

describe('randomGraph', () => {
  it('makes valid connected graphs with the requested number of nodes', () => {
    for (let n = GRAPH_LIMITS.minNodes; n <= GRAPH_LIMITS.maxNodes; n++) {
      for (let seed = 1; seed <= 60; seed++) {
        const graph = randomGraph(n, seeded(seed * 31 + n));
        assert.equal(graph.n, n);
        assert.equal(validateGraph(graph), null, `seed ${seed}, n ${n}`);
        assert.ok(isConnected(graph), `connected for seed ${seed}, n ${n}`);
        assert.ok(graph.edges.length >= n - 1);
        for (const [u, v] of graph.edges) assert.ok(u < v, 'smaller node first');
        const sorted = [...graph.edges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        assert.deepEqual(graph.edges, sorted, 'sorted like the lesson inputs');
      }
    }
  });

  it('is deterministic for the same random source and clamps n', () => {
    assert.deepEqual(randomGraph(7, seeded(5)), randomGraph(7, seeded(5)));
    assert.equal(randomGraph(20, seeded(1)).n, GRAPH_LIMITS.maxNodes);
    assert.equal(randomGraph(0, seeded(1)).n, GRAPH_LIMITS.minNodes);
    // Works even when random() returns values at the very ends of its range.
    assert.equal(validateGraph(randomGraph(9, () => 0)), null);
    assert.equal(validateGraph(randomGraph(9, () => 0.999999)), null);
  });
});

describe('joinIndonesian', () => {
  it('joins lists the Indonesian way', () => {
    assert.equal(joinIndonesian([6]), '6');
    assert.equal(joinIndonesian([6, 7]), '6 dan 7');
    assert.equal(joinIndonesian([6, 7, 8]), '6, 7, dan 8');
  });
});
