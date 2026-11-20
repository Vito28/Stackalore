/**
 * Shared graph helpers for the DFS and BFS visualizations: the lesson graphs,
 * parsing and validating graphs typed by the reader, adjacency lists built the
 * way the lessons build them, a fixed drawing layout and random graphs.
 *
 * Conventions from the Graph lesson: nodes are numbered 1..n, edges are
 * undirected, and every edge `u v` is appended to `adj[u]` and `adj[v]` in
 * input order (neighbours are never sorted).
 */

export type Edge = [number, number];

export interface Graph {
  n: number;
  /** In input order, as typed. */
  edges: Edge[];
}

export const GRAPH_LIMITS = { minNodes: 2, maxNodes: 9, maxEdges: 15 } as const;

/** Graph from the DFS lesson (`6 6`, node 6 has no edges). */
export const DFS_LESSON_GRAPH: Graph = {
  n: 6,
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
    [3, 4],
    [4, 5],
  ],
};

/** Train-station graph from the BFS lesson (`8 9`). */
export const BFS_LESSON_GRAPH: Graph = {
  n: 8,
  edges: [
    [1, 2],
    [1, 4],
    [2, 3],
    [2, 5],
    [3, 6],
    [5, 6],
    [4, 7],
    [7, 8],
    [6, 8],
  ],
};

/** Highlight id of a node. */
export const nodeId = (node: number) => `v${node}`;
/** Highlight id of an undirected edge; the same for `u-v` and `v-u`. */
export const edgeId = (u: number, v: number) => `e${Math.min(u, v)}-${Math.max(u, v)}`;

/** `adj[u]` lists the neighbours of `u` in input order; index 0 is unused. */
export function adjacencyList(graph: Graph): number[][] {
  const adj = Array.from({ length: graph.n + 1 }, () => [] as number[]);
  for (const [u, v] of graph.edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  return adj;
}

export function formatEdges(edges: Edge[]): string {
  return edges.map(([u, v]) => `${u}-${v}`).join(' ');
}

/** Joins numbers the Indonesian way: "1", "1 dan 2", "1, 2, dan 3". */
export function joinIndonesian(items: (number | string)[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`;
}

/**
 * Reads an edge list such as `1-2 1-3 2-4` (commas, semicolons and new lines
 * also separate edges). Only checks the notation; see `validateGraph`.
 */
export function parseEdges(text: string): { edges: Edge[] } | { error: string } {
  const tokens = text
    .replace(/\s*[-–]\s*/g, '-')
    .split(/[\s,;]+/)
    .filter(Boolean);
  const edges: Edge[] = [];
  for (const token of tokens) {
    const match = /^(\d+)-(\d+)$/.exec(token);
    if (!match) {
      return { error: `"${token}" bukan sisi. Tulis setiap sisi sebagai dua nomor simpul dengan tanda hubung, misalnya 1-2.` };
    }
    edges.push([Number(match[1]), Number(match[2])]);
  }
  return { edges };
}

/** Checks a graph against the limits and the lesson's rules. Returns an Indonesian message, or null when valid. */
export function validateGraph(graph: Graph): string | null {
  const { n, edges } = graph;
  if (!Number.isInteger(n) || n < GRAPH_LIMITS.minNodes || n > GRAPH_LIMITS.maxNodes) {
    return `Banyak simpul harus ${GRAPH_LIMITS.minNodes} sampai ${GRAPH_LIMITS.maxNodes} supaya gambarnya tetap terbaca.`;
  }
  if (edges.length > GRAPH_LIMITS.maxEdges) {
    return `Maksimal ${GRAPH_LIMITS.maxEdges} sisi supaya gambarnya tetap terbaca. Sekarang ada ${edges.length}.`;
  }
  const seen = new Map<string, Edge>();
  for (const [u, v] of edges) {
    for (const node of [u, v]) {
      if (!Number.isInteger(node) || node < 1 || node > n) {
        return `Sisi ${u}-${v} memakai simpul ${node}, padahal simpulnya hanya 1 sampai ${n}.`;
      }
    }
    if (u === v) return `Sisi ${u}-${v} menghubungkan simpul ${u} ke dirinya sendiri. Hapus sisi itu.`;
    const id = edgeId(u, v);
    const earlier = seen.get(id);
    if (earlier) {
      return `Sisi ${u}-${v} sama dengan sisi ${earlier[0]}-${earlier[1]} yang sudah ada. Setiap pasangan simpul cukup ditulis sekali.`;
    }
    seen.set(id, [u, v]);
  }
  return null;
}

/** Checks a start or target node. `label` names it in the message, e.g. "Simpul awal". */
export function validateNode(graph: Graph, node: number, label: string): string | null {
  if (!Number.isInteger(node) || node < 1 || node > graph.n) return `${label} harus antara 1 dan ${graph.n}.`;
  return null;
}

/** Parses and validates `n` plus an edge list in one go. */
export function parseGraph(n: number, text: string): { graph: Graph } | { error: string } {
  const parsed = parseEdges(text);
  if ('error' in parsed) return parsed;
  const graph = { n, edges: parsed.edges };
  const invalid = validateGraph(graph);
  return invalid ? { error: invalid } : { graph };
}

// ---------------------------------------------------------------------------
// Layout

export interface Point {
  x: number;
  y: number;
}

export interface GraphLayout {
  /** Node → position in SVG user units. */
  positions: Record<number, Point>;
  /** SVG viewBox that fits every node with room for its labels. */
  viewBox: { x: number; y: number; width: number; height: number };
}

/** Radius of a node circle in SVG units; views and layout share it. */
export const NODE_RADIUS = 18;
/** Room around the outermost nodes for tags above and badges below. */
const LAYOUT_MARGIN = 34;

/**
 * Hand-placed layouts that match the ASCII drawings in the lessons. A preset
 * is used while the graph has the same `n` and only uses the preset's edges,
 * so no edge can cross through another node.
 */
const PRESETS: { graph: Graph; positions: Record<number, Point> }[] = [
  {
    // 1 ------- 2
    // |         | \
    // 3 ------- 4 --- 5        6
    graph: DFS_LESSON_GRAPH,
    positions: {
      1: { x: 40, y: 40 },
      2: { x: 160, y: 40 },
      3: { x: 40, y: 160 },
      4: { x: 160, y: 160 },
      5: { x: 260, y: 160 },
      6: { x: 340, y: 160 },
    },
  },
  {
    // 1 --- 2 --- 3
    // |     |     |
    // |     5 --- 6
    // |           |
    // 4 --- 7 --- 8
    graph: BFS_LESSON_GRAPH,
    positions: {
      1: { x: 40, y: 40 },
      2: { x: 160, y: 40 },
      3: { x: 280, y: 40 },
      5: { x: 160, y: 130 },
      6: { x: 280, y: 130 },
      4: { x: 40, y: 220 },
      7: { x: 160, y: 220 },
      8: { x: 280, y: 220 },
    },
  },
];

/** Nodes on a circle, node 1 at the top, going clockwise. On a convex shape an edge never runs through a node. */
function circularPositions(n: number): Record<number, Point> {
  const radius = n <= 4 ? 80 : n <= 6 ? 100 : 120;
  const positions: Record<number, Point> = {};
  for (let node = 1; node <= n; node++) {
    const angle = -Math.PI / 2 + ((node - 1) * 2 * Math.PI) / n;
    positions[node] = {
      x: Math.round(radius + radius * Math.cos(angle)),
      y: Math.round(radius + radius * Math.sin(angle)),
    };
  }
  return positions;
}

export function graphLayout(graph: Graph): GraphLayout {
  const preset = PRESETS.find(
    (candidate) =>
      candidate.graph.n === graph.n &&
      graph.edges.every(([u, v]) => candidate.graph.edges.some(([a, b]) => edgeId(a, b) === edgeId(u, v))),
  );
  const positions = preset ? preset.positions : circularPositions(graph.n);
  const points = Object.values(positions);
  const minX = Math.min(...points.map((point) => point.x)) - LAYOUT_MARGIN;
  const minY = Math.min(...points.map((point) => point.y)) - LAYOUT_MARGIN;
  const maxX = Math.max(...points.map((point) => point.x)) + LAYOUT_MARGIN;
  const maxY = Math.max(...points.map((point) => point.y)) + LAYOUT_MARGIN;
  return { positions, viewBox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY } };
}

// ---------------------------------------------------------------------------
// Random graphs

/**
 * A random connected graph on `n` nodes for the "Acak" button: a random
 * spanning tree plus a few extra edges, listed like the lessons' inputs
 * (smaller node first, sorted). Randomness comes only from `random`.
 */
export function randomGraph(n: number, random: () => number = Math.random): Graph {
  const size = Math.min(Math.max(Math.trunc(n), GRAPH_LIMITS.minNodes), GRAPH_LIMITS.maxNodes);
  const pick = (count: number) => Math.min(count - 1, Math.floor(random() * count));

  const labels = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = labels.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }

  const ids = new Set<string>();
  const edges: Edge[] = [];
  const add = (u: number, v: number) => {
    ids.add(edgeId(u, v));
    edges.push([Math.min(u, v), Math.max(u, v)]);
  };
  // Each new label hangs off one already placed, so the graph is connected.
  for (let i = 1; i < size; i++) add(labels[pick(i)], labels[i]);

  const missing: Edge[] = [];
  for (let u = 1; u <= size; u++) {
    for (let v = u + 1; v <= size; v++) if (!ids.has(edgeId(u, v))) missing.push([u, v]);
  }
  const room = Math.min(missing.length, GRAPH_LIMITS.maxEdges - edges.length, 3);
  const extra = room <= 0 ? 0 : 1 + pick(room);
  for (let i = 0; i < extra; i++) {
    const [u, v] = missing.splice(pick(missing.length), 1)[0];
    add(u, v);
  }

  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return { n: size, edges };
}
