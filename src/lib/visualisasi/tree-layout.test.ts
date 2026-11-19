import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { edgeId, layoutBinaryTree, layoutNaryTree, treeFrame, type TreeLayout } from './tree-layout.ts';

type Binary = Record<string, [string | null, string | null]>;

const binary = (tree: Binary) => (id: string) => tree[id];

/** The example tree from the Tree lesson. */
const lessonTree: Binary = {
  '12': ['7', '30'],
  '7': ['3', '25'],
  '30': [null, '18'],
  '3': [null, null],
  '25': ['40', null],
  '40': [null, null],
  '18': [null, null],
};

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

/** Random binary tree with `size` nodes named n0, n1, … */
function randomBinary(random: () => number, size: number): Binary {
  const tree: Binary = { n0: [null, null] };
  for (let i = 1; i < size; i++) {
    const free: [string, 0 | 1][] = [];
    for (const [id, kids] of Object.entries(tree)) {
      if (kids[0] === null) free.push([id, 0]);
      if (kids[1] === null) free.push([id, 1]);
    }
    const [parent, side] = free[Math.floor(random() * free.length)];
    tree[`n${i}`] = [null, null];
    tree[parent][side] = `n${i}`;
  }
  return tree;
}

function subtree(tree: Binary, id: string | null): string[] {
  if (id === null) return [];
  return [id, ...subtree(tree, tree[id][0]), ...subtree(tree, tree[id][1])];
}

function assertSameLevelSpacing(layout: TreeLayout) {
  const ids = Object.keys(layout.positions);
  for (const a of ids) {
    for (const b of ids) {
      if (a >= b) continue;
      const pa = layout.positions[a];
      const pb = layout.positions[b];
      if (pa.depth === pb.depth) assert.ok(Math.abs(pa.x - pb.x) >= 1 - 1e-9, `${a} and ${b} are at least 1 apart`);
    }
  }
}

function assertBinaryLayout(tree: Binary, root: string) {
  const layout = layoutBinaryTree(root, binary(tree));
  const ids = Object.keys(tree);
  assert.equal(Object.keys(layout.positions).length, ids.length, 'every node is placed');
  assert.equal(layout.edges.length, ids.length - 1, 'n - 1 edges');
  assert.deepEqual(layout.order, subtree(tree, root), 'order is preorder');
  assert.equal(Math.min(...Object.values(layout.positions).map((p) => p.x)), 0, 'smallest x is 0');

  for (const id of ids) {
    const here = layout.positions[id];
    const [left, right] = tree[id];
    for (const kid of subtree(tree, left)) assert.ok(layout.positions[kid].x < here.x, `${kid} is left of ${id}`);
    for (const kid of subtree(tree, right)) assert.ok(layout.positions[kid].x > here.x, `${kid} is right of ${id}`);
    for (const kid of [left, right]) {
      if (kid === null) continue;
      assert.equal(layout.positions[kid].depth, here.depth + 1);
      assert.ok(layout.edges.some((edge) => edge.id === edgeId(id, kid) && edge.from === id && edge.to === kid));
    }
  }
  assertSameLevelSpacing(layout);
  return layout;
}

describe('layoutBinaryTree', () => {
  it('places the Tree lesson example in inorder columns', () => {
    const layout = assertBinaryLayout(lessonTree, '12');
    const x = (id: string) => layout.positions[id].x;
    // Inorder 3 7 40 25 12 30 18, half a unit apart.
    assert.deepEqual(['3', '7', '40', '25', '12', '30', '18'].map(x), [0, 0.5, 1, 1.5, 2, 2.5, 3]);
    assert.equal(layout.width, 3);
    assert.equal(layout.depth, 3);
  });

  it('keeps a lone child on its own side', () => {
    const right = layoutBinaryTree('5', binary({ '5': [null, '8'], '8': [null, null] }));
    assert.ok(right.positions['8'].x > right.positions['5'].x);
    const left = layoutBinaryTree('5', binary({ '5': ['8', null], '8': [null, null] }));
    assert.ok(left.positions['8'].x < left.positions['5'].x);
    assert.notDeepEqual(right.positions, left.positions);
  });

  it('handles an empty tree, a lone root and a skewed tree', () => {
    const empty = layoutBinaryTree(null, () => [null, null]);
    assert.deepEqual(empty, { positions: {}, order: [], edges: [], width: 0, depth: 0 });
    const lone = layoutBinaryTree('a', () => [null, null]);
    assert.deepEqual(lone.positions, { a: { x: 0, depth: 0 } });
    assert.equal(lone.width, 0);

    const skewed: Binary = {};
    for (let i = 0; i < 7; i++) skewed[`s${i}`] = [null, i < 6 ? `s${i + 1}` : null];
    const layout = assertBinaryLayout(skewed, 's0');
    assert.equal(layout.depth, 6);
    assert.equal(layout.width, 3);
  });

  it('keeps every rule on random trees', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const random = seeded(seed);
      assertBinaryLayout(randomBinary(random, 1 + Math.floor(random() * 15)), 'n0');
    }
  });

  it('rejects shapes that are not trees', () => {
    assert.throws(() => layoutBinaryTree('a', binary({ a: ['b', 'b'], b: [null, null] })), /lebih dari sekali/);
    assert.throws(() => layoutBinaryTree('a', binary({ a: ['b', null], b: ['a', null] })), /lebih dari sekali/);
  });
});

describe('layoutNaryTree', () => {
  /** The trie for kata, katak, kita, buku, bus (children in alphabetical order). */
  const trie: Record<string, string[]> = {
    '': ['b', 'k'],
    b: ['bu'],
    bu: ['buk', 'bus'],
    buk: ['buku'],
    buku: [],
    bus: [],
    k: ['ka', 'ki'],
    ka: ['kat'],
    kat: ['kata'],
    kata: ['katak'],
    katak: [],
    ki: ['kit'],
    kit: ['kita'],
    kita: [],
  };

  it('puts leaves in columns and centers parents above their children', () => {
    const layout = layoutNaryTree('', (id) => trie[id]);
    const x = (id: string) => layout.positions[id].x;
    assert.deepEqual(['buku', 'bus', 'katak', 'kita'].map(x), [0, 1, 2, 3]);
    assert.equal(x('bu'), 0.5);
    assert.equal(x('k'), 2.5);
    assert.equal(x(''), 1.5);
    // A single child sits straight below its parent.
    assert.equal(x('ka'), x('kat'));
    assert.equal(x('kat'), x('katak'));
    assert.equal(layout.depth, 5);
    assert.equal(layout.width, 3);
    assert.equal(layout.edges.length, Object.keys(trie).length - 1);
    assertSameLevelSpacing(layout);
  });

  it('keeps children in the given order', () => {
    const layout = layoutNaryTree('r', (id) => (id === 'r' ? ['c', 'a', 'b'] : []));
    assert.ok(layout.positions.c.x < layout.positions.a.x);
    assert.ok(layout.positions.a.x < layout.positions.b.x);
    assert.deepEqual(layout.order, ['r', 'c', 'a', 'b']);
  });

  it('keeps same-level nodes apart on random trees', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const random = seeded(seed);
      const kids: Record<string, string[]> = { n0: [] };
      const size = 1 + Math.floor(random() * 30);
      for (let i = 1; i < size; i++) {
        const parents = Object.keys(kids);
        kids[parents[Math.floor(random() * parents.length)]].push(`n${i}`);
        kids[`n${i}`] = [];
      }
      const layout = layoutNaryTree('n0', (id) => kids[id]);
      assert.equal(Object.keys(layout.positions).length, size);
      assertSameLevelSpacing(layout);
      for (const edge of layout.edges) {
        assert.equal(layout.positions[edge.to].depth, layout.positions[edge.from].depth + 1);
      }
    }
  });

  it('rejects shapes that are not trees', () => {
    assert.throws(() => layoutNaryTree('a', (id) => (id === 'a' ? ['b', 'b'] : [])), /lebih dari sekali/);
  });
});

describe('treeFrame', () => {
  it('fits the widest and deepest layout', () => {
    const a = layoutBinaryTree('12', binary(lessonTree));
    const b = layoutNaryTree('r', (id) => (id === 'r' ? ['x', 'y', 'z', 'w', 'v'] : []));
    assert.deepEqual(treeFrame([a, b]), { width: 4, depth: 3 });
    assert.deepEqual(treeFrame([]), { width: 0, depth: 0 });
  });
});
