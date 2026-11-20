import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TRAVERSAL_MODES,
  lessonTree,
  parseTraversalMode,
  randomBinaryTree,
  traversalPseudocode,
  traversalSteps,
  validateBinaryTree,
  type BinaryTree,
  type TraversalMode,
  type TraversalStep,
} from './traversal.ts';

/** Plain reference traversals, written the way the lesson does. */
function reference(tree: BinaryTree, mode: TraversalMode): number[] {
  const out: number[] = [];
  const walk = (id: string | null) => {
    if (id === null) return;
    const node = tree.nodes[id];
    if (mode === 'preorder') out.push(node.value);
    walk(node.left);
    if (mode === 'inorder') out.push(node.value);
    walk(node.right);
    if (mode === 'postorder') out.push(node.value);
  };
  if (mode !== 'level-order') {
    walk(tree.root);
    return out;
  }
  const queue = tree.root === null ? [] : [tree.root];
  while (queue.length > 0) {
    const node = tree.nodes[queue.shift() as string];
    out.push(node.value);
    if (node.left !== null) queue.push(node.left);
    if (node.right !== null) queue.push(node.right);
  }
  return out;
}

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const values = (tree: BinaryTree, ids: (string | null)[]) => ids.map((id) => (id === null ? null : tree.nodes[id].value));

function parentOf(tree: BinaryTree, id: string): string | null {
  return Object.values(tree.nodes).find((node) => node.left === id || node.right === id)?.id ?? null;
}

function assertInvariants(tree: BinaryTree, mode: TraversalMode): TraversalStep[] {
  const steps = traversalSteps(tree, mode);
  const lineIds = new Set(traversalPseudocode[mode].map((line) => line.id));
  const final = steps[steps.length - 1];

  assert.deepEqual(values(tree, final.state.output), reference(tree, mode), `${mode} visits in the right order`);
  assert.equal(final.state.stack.length, 0, 'call stack is empty at the end');
  assert.equal(final.state.queue.length, 0, 'queue is empty at the end');

  steps.forEach((step, index) => {
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    for (const id of Object.keys(step.highlights)) assert.ok(id in tree.nodes, `step ${index} highlights a node`);
    assert.equal(step.state.tree, tree, 'the tree never changes');
    assert.equal(new Set(step.state.output).size, step.state.output.length, 'every node is printed once');
    for (const id of step.state.output) assert.equal(step.highlights[id] === 'selesai' || step.highlights[id] === 'aktif', true);
    if (step.state.current !== null) assert.equal(step.highlights[step.state.current], 'aktif');

    // Output only grows, one node at a time.
    if (index > 0) {
      const before = steps[index - 1].state.output;
      assert.deepEqual(step.state.output.slice(0, before.length), before);
      assert.ok(step.state.output.length - before.length <= 1);
    }

    // The call stack is always a path from the root, possibly ending in an empty call.
    const frames = step.state.stack;
    frames.forEach((frame, depth) => {
      if (depth === 0) assert.equal(frame, tree.root);
      else if (frame === null) assert.equal(depth, frames.length - 1, 'only the newest call can be empty');
      else assert.equal(parentOf(tree, frame), frames[depth - 1]);
    });
    if (frames.length > 0 && frames[frames.length - 1] === null) {
      assert.ok(step.state.ghost, 'an empty call shows the empty child');
      assert.equal(step.state.ghost?.from, frames[frames.length - 2]);
      const parent = tree.nodes[step.state.ghost!.from];
      assert.equal(step.state.ghost?.side === 'kiri' ? parent.left : parent.right, null);
    } else {
      assert.equal(step.state.ghost, null);
    }

    if (mode === 'level-order') {
      assert.equal(frames.length, 0);
      // Queue + printed nodes form a prefix of the BFS order.
      const seen = [...step.state.output, ...step.state.queue];
      assert.deepEqual(values(tree, seen), reference(tree, mode).slice(0, seen.length));
    } else {
      assert.equal(step.state.queue.length, 0);
    }
  });
  return steps;
}

describe('traversalSteps', () => {
  it('matches the four results in the Tree lesson', () => {
    const expected: Record<TraversalMode, string> = {
      preorder: '12 7 3 25 40 30 18',
      inorder: '3 7 40 25 12 30 18',
      postorder: '3 40 25 7 18 30 12',
      'level-order': '12 7 30 3 25 18 40',
    };
    for (const mode of TRAVERSAL_MODES) {
      const steps = assertInvariants(lessonTree, mode);
      const final = steps[steps.length - 1];
      assert.equal(values(lessonTree, final.state.output).join(' '), expected[mode]);
      assert.equal(final.result, `${mode}: ${expected[mode]}`);
      assert.match(final.caption, new RegExp(expected[mode]));
    }
  });

  it('follows the inorder trace in the lesson: 7 calls, 8 empty calls and 7 prints', () => {
    const steps = traversalSteps(lessonTree, 'inorder');
    const calls = steps.filter((step) => step.lines.includes('kiri') || step.lines.includes('kanan') || step.lines.includes('fungsi'));
    const empty = steps.filter((step) => step.state.ghost !== null);
    const prints = steps.filter((step) => step.lines.includes('cetak'));
    assert.equal(empty.length, 8);
    assert.equal(calls.length, 7 + 8);
    assert.equal(prints.length, 7);
    assert.equal(steps.length, 1 + 7 + 8 + 7 + 1);
    // `inorder(12)` may print only after its whole left subtree is done.
    const print12 = steps.findIndex((step) => step.lines.includes('cetak') && step.state.current === 'n12');
    assert.deepEqual(values(lessonTree, steps[print12].state.output), [3, 7, 40, 25, 12]);
    assert.match(steps[print12].caption, /`inorder\(25\)` dan `inorder\(7\)` selesai/);
    assert.match(steps[print12].caption, /Kembali ke `inorder\(12\)`/);
  });

  it('follows the level-order table in the lesson', () => {
    const steps = traversalSteps(lessonTree, 'level-order');
    const queues = steps
      .filter((step) => step.lines.includes('lv-kiri') || step.lines.includes('lv-awal'))
      .map((step) => values(lessonTree, step.state.queue).join(' '));
    // "Isi queue" column: after enqueuing the root, then after every row.
    assert.deepEqual(queues, ['12', '7 30', '30 3 25', '3 25 18', '25 18', '18 40', '40', '']);
    assert.equal(steps.length, 1 + 1 + 7 + 4 + 1);
  });

  it('marks waiting nodes: unprinted calls and queued nodes', () => {
    const inorder = traversalSteps(lessonTree, 'inorder');
    const at40 = inorder.find((step) => step.state.current === 'n40' && step.lines.includes('kiri') && step.state.ghost === null);
    assert.ok(at40);
    assert.equal(at40.highlights.n12, 'khusus');
    assert.equal(at40.highlights.n25, 'khusus');
    assert.equal(at40.highlights.n7, 'selesai');
    assert.equal(at40.highlights.n40, 'aktif');

    const level = traversalSteps(lessonTree, 'level-order');
    assert.equal(level[3].highlights.n7, 'khusus');
    assert.equal(level[3].highlights.n12, 'aktif');
  });

  it('handles a single node, an empty tree and skewed trees', () => {
    const single: BinaryTree = { root: 'a', nodes: { a: { id: 'a', value: 5, left: null, right: null } } };
    for (const mode of TRAVERSAL_MODES) assertInvariants(single, mode);
    assert.equal(traversalSteps(single, 'preorder').length, 1 + 1 + 1 + 2 + 1);

    const empty: BinaryTree = { root: null, nodes: {} };
    for (const mode of TRAVERSAL_MODES) {
      const steps = traversalSteps(empty, mode);
      assert.equal(steps.length, 1);
      assert.match(steps[0].caption, /Tree kosong/);
    }

    const skewed: BinaryTree = {
      root: 'a',
      nodes: {
        a: { id: 'a', value: 1, left: null, right: 'b' },
        b: { id: 'b', value: 2, left: 'c', right: null },
        c: { id: 'c', value: 3, left: null, right: 'd' },
        d: { id: 'd', value: 4, left: null, right: null },
      },
    };
    for (const mode of TRAVERSAL_MODES) assertInvariants(skewed, mode);
  });

  it('works on random practice trees', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const tree = randomBinaryTree(seeded(seed));
      assert.equal(validateBinaryTree(tree), null, `seed ${seed} gives a valid tree`);
      const size = Object.keys(tree.nodes).length;
      assert.ok(size >= 5 && size <= 9);
      assert.equal(new Set(Object.values(tree.nodes).map((node) => node.value)).size, size, 'values differ');
      for (const mode of TRAVERSAL_MODES) assertInvariants(tree, mode);
    }
  });

  it('is deterministic', () => {
    for (const mode of TRAVERSAL_MODES) assert.deepEqual(traversalSteps(lessonTree, mode), traversalSteps(lessonTree, mode));
    assert.deepEqual(randomBinaryTree(seeded(7)), randomBinaryTree(seeded(7)));
  });
});

describe('tree and mode validation', () => {
  it('accepts the lesson tree and rejects broken or oversized trees', () => {
    assert.equal(validateBinaryTree(lessonTree), null);
    const big: BinaryTree = { root: 'x0', nodes: {} };
    for (let i = 0; i < 11; i++) big.nodes[`x${i}`] = { id: `x${i}`, value: i, left: null, right: null };
    assert.match(validateBinaryTree(big) ?? '', /maksimal 10/);

    const deep: BinaryTree = { root: 'a', nodes: {} };
    'abcde'.split('').forEach((id, i, all) => {
      deep.nodes[id] = { id, value: i, left: all[i + 1] ?? null, right: null };
    });
    assert.match(validateBinaryTree(deep) ?? '', /Kedalaman/);

    const shared: BinaryTree = {
      root: 'a',
      nodes: {
        a: { id: 'a', value: 1, left: 'b', right: 'b' },
        b: { id: 'b', value: 2, left: null, right: null },
      },
    };
    assert.ok(validateBinaryTree(shared));
    const loose: BinaryTree = {
      root: 'a',
      nodes: { a: { id: 'a', value: 1, left: null, right: null }, b: { id: 'b', value: 2, left: null, right: null } },
    };
    assert.ok(validateBinaryTree(loose));
  });

  it('reads the mode prop', () => {
    assert.equal(parseTraversalMode(undefined), 'semua');
    assert.equal(parseTraversalMode('semua'), 'semua');
    assert.equal(parseTraversalMode(' Inorder '), 'inorder');
    assert.equal(parseTraversalMode('level order'), 'level-order');
    assert.equal(parseTraversalMode('levelorder'), 'level-order');
    assert.equal(parseTraversalMode('bfs'), null);
  });
});
