import type { PseudocodeLine, Role, Step } from './types.ts';

/** The four traversals taught in the Tree lesson. */
export type TraversalMode = 'preorder' | 'inorder' | 'postorder' | 'level-order';

export const TRAVERSAL_MODES: readonly TraversalMode[] = ['preorder', 'inorder', 'postorder', 'level-order'];

export const traversalModeLabels: Record<TraversalMode, string> = {
  preorder: 'Preorder',
  inorder: 'Inorder',
  postorder: 'Postorder',
  'level-order': 'Level-order',
};

export type Side = 'kiri' | 'kanan';

export interface BinaryTreeNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
}

export interface BinaryTree {
  root: string | null;
  nodes: Record<string, BinaryTreeNode>;
}

export interface TraversalState {
  mode: TraversalMode;
  /** The tree never changes during a traversal, so every step shares it. */
  tree: BinaryTree;
  /** Node being processed: the newest call, or the node just taken from the queue. */
  current: string | null;
  /** Visit order so far (node ids). */
  output: string[];
  /** Recursive traversals: active calls from bottom to top. `null` is a call on an empty subtree. */
  stack: (string | null)[];
  /** Level-order: node ids from front to back. */
  queue: string[];
  /** Empty child being looked at, drawn as a dashed stub. */
  ghost: { from: string; side: Side } | null;
}

export type TraversalStep = Step<TraversalState>;

const node = (id: string, value: number, left: string | null = null, right: string | null = null): BinaryTreeNode => ({
  id,
  value,
  left,
  right,
});

/**
 * The example from the Tree lesson:
 *
 *             12
 *           /    \
 *          7      30
 *         / \       \
 *        3   25      18
 *           /
 *         40
 */
export const lessonTree: BinaryTree = {
  root: 'n12',
  nodes: {
    n12: node('n12', 12, 'n7', 'n30'),
    n7: node('n7', 7, 'n3', 'n25'),
    n30: node('n30', 30, null, 'n18'),
    n3: node('n3', 3),
    n25: node('n25', 25, 'n40'),
    n40: node('n40', 40),
    n18: node('n18', 18),
  },
};

export const TRAVERSAL_LIMITS = { maxNodes: 10, maxDepth: 3 } as const;

const recursiveLines = (mode: Exclude<TraversalMode, 'level-order'>): PseudocodeLine[] => {
  const visit = { id: 'cetak', text: 'cetak root.data', indent: 1 };
  const left = { id: 'kiri', text: `${mode}(root.kiri)`, indent: 1 };
  const right = { id: 'kanan', text: `${mode}(root.kanan)`, indent: 1 };
  const body = mode === 'preorder' ? [visit, left, right] : mode === 'inorder' ? [left, visit, right] : [left, right, visit];
  return [
    { id: 'fungsi', text: `${mode}(root):`, indent: 0 },
    { id: 'cek', text: 'jika root kosong → kembali', indent: 1 },
    ...body,
  ];
};

export const traversalPseudocode: Record<TraversalMode, PseudocodeLine[]> = {
  preorder: recursiveLines('preorder'),
  inorder: recursiveLines('inorder'),
  postorder: recursiveLines('postorder'),
  'level-order': [
    { id: 'lv-fungsi', text: 'levelOrder(root):', indent: 0 },
    { id: 'lv-cek', text: 'jika root kosong → selesai', indent: 1 },
    { id: 'lv-awal', text: 'masukkan root ke queue', indent: 1 },
    { id: 'lv-ulang', text: 'selama queue tidak kosong:', indent: 1 },
    { id: 'lv-keluar', text: 'p ← keluarkan yang terdepan', indent: 2 },
    { id: 'lv-cetak', text: 'cetak p.data', indent: 2 },
    { id: 'lv-kiri', text: 'masukkan p.kiri jika ada', indent: 2 },
    { id: 'lv-kanan', text: 'masukkan p.kanan jika ada', indent: 2 },
  ],
};

const orderDescription: Record<TraversalMode, string> = {
  preorder: 'root, subtree kiri, lalu subtree kanan',
  inorder: 'subtree kiri, root, lalu subtree kanan',
  postorder: 'subtree kiri, subtree kanan, lalu root',
  'level-order': 'per level, dari atas ke bawah dan dari kiri ke kanan',
};

/** "a", "a dan b", "a, b, dan c". */
export function joinIndonesian(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`;
}

const visitOrder: Record<Exclude<TraversalMode, 'level-order'>, ('root' | Side)[]> = {
  preorder: ['root', 'kiri', 'kanan'],
  inorder: ['kiri', 'root', 'kanan'],
  postorder: ['kiri', 'kanan', 'root'],
};

function highlightsFor(state: TraversalState): Record<string, Role> {
  const highlights: Record<string, Role> = {};
  for (const id of state.stack) if (id !== null) highlights[id] = 'khusus';
  for (const id of state.queue) highlights[id] = 'khusus';
  for (const id of state.output) highlights[id] = 'selesai';
  if (state.current !== null) highlights[state.current] = 'aktif';
  return highlights;
}

function countNodes(tree: BinaryTree): number {
  return Object.keys(tree.nodes).length;
}

/**
 * Steps of one traversal on a fixed tree. Recursive traversals show every
 * call (including calls on empty subtrees, as in the lesson's inorder trace)
 * and every print; returns are explained at the next step. Level-order shows
 * every dequeue and every batch of children entering the queue.
 */
export function traversalSteps(tree: BinaryTree, mode: TraversalMode): TraversalStep[] {
  return mode === 'level-order' ? levelOrderSteps(tree) : recursiveSteps(tree, mode);
}

function recursiveSteps(tree: BinaryTree, mode: Exclude<TraversalMode, 'level-order'>): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const value = (id: string) => tree.nodes[id].value;
  const call = (id: string | null) => `\`${mode}(${id === null ? 'nullptr' : value(id)})\``;
  const stack: (string | null)[] = [];
  const output: string[] = [];
  /** Calls that returned since the previous step, innermost first. */
  let returned: string[] = [];
  let firstNull = true;

  /** `newFrame`: this step pushed a call, so the code that continues runs in the frame below it. */
  const push = (caption: string, lines: string[], current: string, newFrame: boolean, ghost: TraversalState['ghost'] = null) => {
    let prefix = '';
    if (returned.length > 0) {
      const caller = stack[stack.length - (newFrame ? 2 : 1)];
      prefix = `${joinIndonesian(returned.map((id) => call(id)))} selesai dan keluar dari call stack.`;
      if (caller !== undefined && caller !== null) prefix += ` Kembali ke ${call(caller)}.`;
      prefix += ' ';
      returned = [];
    }
    const state: TraversalState = { mode, tree, current, output: [...output], stack: [...stack], queue: [], ghost };
    steps.push({ state, highlights: highlightsFor(state), caption: prefix + caption, lines, status: 'normal' });
  };

  const empty = { mode, tree, current: null, output: [], stack: [], queue: [], ghost: null } satisfies TraversalState;
  if (tree.root === null) {
    steps.push({
      state: empty,
      highlights: {},
      caption: `Tree kosong, jadi ${call(null)} langsung kembali dan tidak ada yang dicetak.`,
      lines: ['fungsi', 'cek'],
      status: 'normal',
    });
    return steps;
  }

  steps.push({
    state: empty,
    highlights: {},
    caption: `Tree berisi ${countNodes(tree)} node. ${mode[0].toUpperCase()}${mode.slice(1)} mengunjungi ${orderDescription[mode]}, dan dimulai dengan memanggil ${call(tree.root)} pada root.`,
    lines: [],
    status: 'normal',
  });

  const print = (id: string) => {
    output.push(id);
    const so = `Hasil sejauh ini: \`${output.map(value).join(' ')}\`.`;
    const reason =
      mode === 'preorder'
        ? `Preorder mencetak root lebih dulu, sebelum kedua subtree-nya.`
        : mode === 'inorder'
          ? `Subtree kiri ${value(id)} sudah selesai, jadi sekarang giliran ${value(id)} sendiri, sebelum subtree kanannya.`
          : `Kedua subtree ${value(id)} sudah selesai, jadi sekarang giliran ${value(id)} sendiri.`;
    push(`Cetak ${value(id)}. ${reason} ${so}`, ['cetak'], id, false);
  };

  const visitChild = (parent: string, side: Side) => {
    const child = side === 'kiri' ? tree.nodes[parent].left : tree.nodes[parent].right;
    const line = side === 'kiri' ? 'kiri' : 'kanan';
    if (child === null) {
      stack.push(null);
      const python = firstNull ? ' (di Python `None`)' : '';
      firstNull = false;
      push(
        `Anak ${side} ${value(parent)} kosong. Panggilan ${call(null)}${python} langsung kembali karena kasus dasar.`,
        [line, 'cek'],
        parent,
        true,
        { from: parent, side },
      );
      stack.pop();
      return;
    }
    visit(child, `Turun ke anak ${side} ${value(parent)}: panggil ${call(child)}.`, [line]);
  };

  const visit = (id: string, caption: string, lines: string[]) => {
    stack.push(id);
    push(`${caption} Panggilan ini masuk ke call stack.`, lines, id, true);
    for (const part of visitOrder[mode]) {
      if (part === 'root') print(id);
      else visitChild(id, part);
    }
    stack.pop();
    returned.push(id);
  };

  visit(tree.root, `Panggil ${call(tree.root)} pada root.`, ['fungsi']);

  returned = [];
  const final: TraversalState = { mode, tree, current: null, output: [...output], stack: [], queue: [], ghost: null };
  const result = output.map(value).join(' ');
  steps.push({
    state: final,
    highlights: highlightsFor(final),
    caption: `Semua panggilan selesai dan call stack kosong lagi. Hasil ${mode}: \`${result}\`.`,
    lines: [],
    result: `${mode}: ${result}`,
    status: 'normal',
  });
  return steps;
}

function levelOrderSteps(tree: BinaryTree): TraversalStep[] {
  const mode: TraversalMode = 'level-order';
  const steps: TraversalStep[] = [];
  const value = (id: string) => tree.nodes[id].value;
  const queue: string[] = [];
  const output: string[] = [];
  const queueText = () => (queue.length > 0 ? `Isi queue (depan → belakang): \`${queue.map(value).join(' ')}\`.` : 'Queue sekarang kosong.');

  const push = (caption: string, lines: string[], current: string | null, result?: string) => {
    const state: TraversalState = { mode, tree, current, output: [...output], stack: [], queue: [...queue], ghost: null };
    steps.push({ state, highlights: highlightsFor(state), caption, lines, result, status: 'normal' });
  };

  if (tree.root === null) {
    push('Tree kosong, jadi tidak ada yang dicetak.', ['lv-fungsi', 'lv-cek'], null);
    return steps;
  }

  push(
    `Tree berisi ${countNodes(tree)} node. Level-order mengunjungi node ${orderDescription[mode]}, dengan bantuan queue. Queue masih kosong.`,
    [],
    null,
  );
  queue.push(tree.root);
  push(`Masukkan root ${value(tree.root)} ke queue. ${queueText()}`, ['lv-fungsi', 'lv-awal'], null);

  while (queue.length > 0) {
    const p = queue.shift() as string;
    output.push(p);
    const { left, right } = tree.nodes[p];
    const leaf = left === null && right === null;
    const so = `Hasil sejauh ini: \`${output.map(value).join(' ')}\`.`;
    push(
      `Keluarkan ${value(p)} dari depan queue, lalu cetak. ${so}${leaf ? ` ${value(p)} tidak punya anak, jadi tidak ada yang masuk ke queue. ${queueText()}` : ''}`,
      leaf ? ['lv-ulang', 'lv-keluar', 'lv-cetak', 'lv-kiri', 'lv-kanan'] : ['lv-ulang', 'lv-keluar', 'lv-cetak'],
      p,
    );
    if (leaf) continue;

    const added: string[] = [];
    if (left !== null) {
      queue.push(left);
      added.push(`anak kiri ${value(left)}`);
    }
    if (right !== null) {
      queue.push(right);
      added.push(`anak kanan ${value(right)}`);
    }
    const missing = left === null ? ' (anak kirinya kosong)' : right === null ? ' (anak kanannya kosong)' : '';
    push(`Masukkan ${joinIndonesian(added)} ke belakang queue${missing}. ${queueText()}`, ['lv-kiri', 'lv-kanan'], p);
  }

  const result = output.map(value).join(' ');
  push(`Queue kosong, jadi perulangan berhenti. Hasil level-order: \`${result}\`.`, ['lv-ulang'], null, `level-order: ${result}`);
  return steps;
}

/** Checks a tree before generating steps (e.g. the shape stays readable on a phone). */
export function validateBinaryTree(tree: BinaryTree): string | null {
  const ids = Object.keys(tree.nodes);
  if (ids.length > TRAVERSAL_LIMITS.maxNodes) return `Tree maksimal ${TRAVERSAL_LIMITS.maxNodes} node.`;
  if (tree.root === null) return ids.length === 0 ? null : 'Tree tanpa root tidak boleh berisi node.';
  const seen = new Set<string>();
  const walk = (id: string, depth: number): string | null => {
    if (!(id in tree.nodes)) return `Node ${id} tidak ada.`;
    if (seen.has(id)) return 'Setiap node hanya boleh punya satu parent.';
    seen.add(id);
    if (depth > TRAVERSAL_LIMITS.maxDepth) return `Kedalaman tree maksimal ${TRAVERSAL_LIMITS.maxDepth}.`;
    const { left, right } = tree.nodes[id];
    return (left !== null ? walk(left, depth + 1) : null) ?? (right !== null ? walk(right, depth + 1) : null);
  };
  const problem = walk(tree.root, 0);
  if (problem) return problem;
  return seen.size === ids.length ? null : 'Semua node harus terhubung ke root.';
}

/**
 * A random practice tree: 5 to 9 nodes with different values from 1 to 99 and
 * depth at most 3, so it stays readable on a phone.
 */
export function randomBinaryTree(random: () => number = Math.random): BinaryTree {
  const size = 5 + Math.floor(random() * 5);
  const values: number[] = [];
  while (values.length < size) {
    const value = 1 + Math.floor(random() * 99);
    if (!values.includes(value)) values.push(value);
  }
  const nodes: Record<string, BinaryTreeNode> = { r0: node('r0', values[0]) };
  const depth: Record<string, number> = { r0: 0 };
  for (let i = 1; i < size; i++) {
    const free: [string, Side][] = [];
    for (const item of Object.values(nodes)) {
      if (depth[item.id] >= TRAVERSAL_LIMITS.maxDepth) continue;
      if (item.left === null) free.push([item.id, 'kiri']);
      if (item.right === null) free.push([item.id, 'kanan']);
    }
    const [parent, side] = free[Math.floor(random() * free.length)];
    const id = `r${i}`;
    nodes[id] = node(id, values[i]);
    depth[id] = depth[parent] + 1;
    if (side === 'kiri') nodes[parent].left = id;
    else nodes[parent].right = id;
  }
  return { root: 'r0', nodes };
}

/** Reads the `mode` prop; `semua` (or nothing) means every mode, starting with preorder. */
export function parseTraversalMode(text: string | undefined): TraversalMode | 'semua' | null {
  if (text === undefined) return 'semua';
  const normalized = text.trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (normalized === 'semua' || normalized === '') return 'semua';
  if (normalized === 'levelorder') return 'level-order';
  return (TRAVERSAL_MODES as readonly string[]).includes(normalized) ? (normalized as TraversalMode) : null;
}
