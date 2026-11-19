import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BST_LIMITS,
  bstInorder,
  bstPseudocode,
  bstSteps,
  lessonBstDeleteInitial,
  lessonBstDeleteOperations,
  lessonBstOperations,
  parseBstOperations,
  parseBstValue,
  parseBstValues,
  randomBstData,
  validateBst,
  type BstOperation,
  type BstState,
  type BstStep,
} from './bst.ts';

/** Plain BST written exactly like `sisipkan`, `cari` and `hapusNilai` in the lesson. */
interface Ref {
  data: number;
  left: Ref | null;
  right: Ref | null;
}

function sisipkan(root: Ref | null, x: number): Ref {
  if (root === null) return { data: x, left: null, right: null };
  if (x < root.data) root.left = sisipkan(root.left, x);
  else if (x > root.data) root.right = sisipkan(root.right, x);
  return root;
}

function cari(root: Ref | null, x: number): boolean {
  if (root === null) return false;
  if (x === root.data) return true;
  return x < root.data ? cari(root.left, x) : cari(root.right, x);
}

function hapusNilai(root: Ref | null, x: number): Ref | null {
  if (root === null) return null;
  if (x < root.data) root.left = hapusNilai(root.left, x);
  else if (x > root.data) root.right = hapusNilai(root.right, x);
  else {
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;
    let pengganti = root.right;
    while (pengganti.left !== null) pengganti = pengganti.left;
    root.data = pengganti.data;
    root.right = hapusNilai(root.right, pengganti.data);
  }
  return root;
}

/** Shape as nested text, e.g. "45(23(11,30(,36)),71(58(,64),))". */
function refShape(node: Ref | null): string {
  if (node === null) return '';
  if (node.left === null && node.right === null) return String(node.data);
  return `${node.data}(${refShape(node.left)},${refShape(node.right)})`;
}

function stateShape(state: Pick<BstState, 'root' | 'nodes'>, id: string | null = state.root): string {
  if (id === null) return '';
  const node = state.nodes[id];
  if (node.left === null && node.right === null) return String(node.value);
  return `${node.value}(${stateShape(state, node.left)},${stateShape(state, node.right)})`;
}

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function assertInvariants(initial: number[], operations: BstOperation[]): BstStep[] {
  const steps = bstSteps(initial, operations);
  const lineIds = new Set(bstPseudocode.map((line) => line.id));

  // Reference: shape after the starting tree and after every operation, plus search results.
  let ref: Ref | null = null;
  for (const value of initial) ref = sisipkan(ref, value);
  assert.equal(stateShape(steps[0].state), refShape(ref), 'starting tree matches');
  assert.equal(steps[0].state.operation, null);

  operations.forEach((operation, index) => {
    const own = steps.filter((step) => step.state.operation === index);
    assert.ok(own.length > 0, `operation ${index} has steps`);
    const last = own[own.length - 1];
    if (operation.type === 'sisip') {
      const existed = cari(ref, operation.value);
      ref = sisipkan(ref, operation.value);
      assert.equal(last.result, existed ? `sisip(${operation.value}) → diabaikan` : undefined);
    } else if (operation.type === 'cari') {
      assert.equal(last.result, cari(ref, operation.value) ? `cari(${operation.value}) → ketemu` : `cari(${operation.value}) → tidak ada`);
    } else {
      const existed = cari(ref, operation.value);
      ref = hapusNilai(ref, operation.value);
      assert.equal(last.result, existed ? `hapus(${operation.value}) → terhapus` : `hapus(${operation.value}) → tidak ada`);
    }
    assert.equal(stateShape(last.state), refShape(ref), `tree after ${operation.type}(${operation.value}) matches`);
    const values = bstInorder(last.state);
    values.forEach((value, i) => i === 0 || assert.ok(values[i - 1] < value, 'inorder is strictly increasing after each operation'));
  });

  const values = new Map<string, number>();
  steps.forEach((step, index) => {
    const { state } = step;
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    for (const id of Object.keys(step.highlights)) assert.ok(id in state.nodes, `step ${index} highlights a node that exists`);
    for (const id of state.path) assert.ok(id in state.nodes, `step ${index} path node exists`);
    for (const tag of state.tags) assert.ok(tag.at in state.nodes, `step ${index} tag sits on a node`);
    if (state.ghost) {
      const parent = state.nodes[state.ghost.from];
      assert.ok(parent, 'ghost hangs below a node');
      assert.equal(state.ghost.side === 'kiri' ? parent.left : parent.right, null, 'ghost marks an empty child');
    }
    if (index > 0) assert.ok((state.operation ?? -1) >= (steps[index - 1].state.operation ?? -1), 'operations run in order');

    // Every node is reachable exactly once from the root, and inorder never decreases.
    const reachable = new Set<string>();
    const walk = (id: string | null) => {
      if (id === null) return;
      assert.ok(!reachable.has(id), 'no node appears twice');
      reachable.add(id);
      walk(state.nodes[id].left);
      walk(state.nodes[id].right);
    };
    walk(state.root);
    assert.equal(reachable.size, Object.keys(state.nodes).length, 'no detached nodes');
    const inorder = bstInorder(state);
    inorder.forEach((value, i) => i === 0 || assert.ok(inorder[i - 1] <= value, `step ${index}: inorder never decreases`));

    // A node keeps its value, except when the successor's value is copied into it.
    for (const node of Object.values(state.nodes)) {
      if (values.has(node.id) && values.get(node.id) !== node.value) {
        assert.ok(step.lines.includes('h-salin'), `step ${index}: values only change by copying the successor`);
      }
      values.set(node.id, node.value);
    }
  });
  return steps;
}

const opsOf = (text: string) => {
  const parsed = parseBstOperations(text);
  assert.ok('operations' in parsed, text);
  return parsed.operations;
};

describe('bstSteps', () => {
  it('builds the lesson tree and searches 36 and 50 like the lesson table', () => {
    const steps = assertInvariants([], lessonBstOperations);
    const afterInserts = steps.filter((step) => step.state.operation === 7).at(-1) as BstStep;
    assert.equal(stateShape(afterInserts.state), '45(23(11,30(,36)),71(58(,64),))');
    assert.deepEqual(bstInorder(afterInserts.state), [11, 23, 30, 36, 45, 58, 64, 71]);

    // Each comparison is one step: 36 needs 45, 23, 30, 36; 50 needs 45, 71, 58 and then hits nullptr.
    const search36 = steps.filter((step) => step.state.operation === 8);
    assert.equal(search36.length, 4);
    assert.match(search36[0].caption, /`36 < 45`, jadi pergi ke kiri/);
    assert.match(search36[1].caption, /`36 > 23`/);
    assert.match(search36[2].caption, /`36 > 30`/);
    assert.match(search36[3].caption, /`36 == 36`: ketemu/);
    const search50 = steps.filter((step) => step.state.operation === 9);
    assert.equal(search50.length, 3);
    assert.match(search50[2].caption, /`50 < 58`.*kosong/);
    const node58 = Object.values(afterInserts.state.nodes).find((node) => node.value === 58);
    assert.deepEqual(search50[2].state.ghost, { from: node58?.id, side: 'kiri' });

    // Insert paths follow the lesson table: 36 goes 45 (kiri), 23 (kanan), 30 (kanan).
    const insert36 = steps.filter((step) => step.state.operation === 6);
    assert.equal(insert36.length, 3);
    assert.match(insert36[2].caption, /dipasang di sana/);
  });

  it('greys out the subtree that a comparison throws away', () => {
    const steps = bstSteps([], lessonBstOperations);
    const first = steps.find((step) => step.state.operation === 8) as BstStep;
    const discarded = Object.entries(first.highlights)
      .filter(([, role]) => role === 'dibuang')
      .map(([id]) => first.state.nodes[id].value)
      .sort((a, b) => a - b);
    assert.deepEqual(discarded, [58, 64, 71]);
  });

  it('deletes 11, 30 and 45 like the lesson', () => {
    const steps = assertInvariants(lessonBstDeleteInitial, lessonBstDeleteOperations);
    const shapeAfter = (index: number) => stateShape((steps.filter((step) => step.state.operation === index).at(-1) as BstStep).state);
    assert.equal(shapeAfter(0), '45(23(,30(,36)),71(58(,64),))');
    assert.equal(shapeAfter(1), '45(23(,36),71(58(,64),))');
    assert.equal(shapeAfter(2), '58(23(,36),71(64,))');
    assert.deepEqual(bstInorder(steps[steps.length - 1].state), [23, 36, 58, 64, 71]);

    const del45 = steps.filter((step) => step.state.operation === 2);
    assert.match(del45[0].caption, /dua anak \(kasus 3\)/);
    const copy = del45.find((step) => step.lines.includes('h-salin')) as BstStep;
    assert.ok(copy);
    assert.equal(copy.state.nodes[copy.state.root as string].value, 58, 'the root keeps its node and takes the value 58');
    assert.deepEqual(bstInorder(copy.state), [23, 36, 58, 58, 64, 71], 'two 58s until the old one is deleted');
    const successorTag = del45.flatMap((step) => step.state.tags).filter((tag) => tag.label === 'pengganti');
    assert.ok(successorTag.length > 0);
    assert.ok(del45.some((step) => step.lines.includes('h-hapus-pengganti')));
    assert.match(del45.at(-1)?.caption ?? '', /64, naik menggantikan posisinya sebagai anak kiri 71/);

    // Deleting a leaf leaves an empty pointer behind; deleting 30 lifts 36.
    const leaf = steps.filter((step) => step.state.operation === 0).at(-1) as BstStep;
    assert.equal(leaf.state.ghost?.side, 'kiri');
    assert.match(steps.filter((step) => step.state.operation === 1).at(-1)?.caption ?? '', /36, naik/);
  });

  it('handles duplicates, empty trees and missing values', () => {
    assertInvariants([], opsOf('cari(5) hapus(5) sisip(5) sisip(5) hapus(5) hapus(5) cari(5)'));
    const steps = bstSteps([], opsOf('sisip(5) sisip(5)'));
    assert.match(steps[2].caption, /Nilai kembar diabaikan/);
    const emptied = bstSteps([10], opsOf('hapus(10)'));
    assert.match(emptied.at(-1)?.caption ?? '', /Tree sekarang kosong/);
    assert.equal(emptied.at(-1)?.state.root, null);
    assert.equal(bstSteps([], []).length, 1);
    assert.match(bstSteps([], [])[0].caption, /Belum ada operasi/);
  });

  it('deletes the root with one child and a node whose successor is its right child', () => {
    assertInvariants([10, 5, 3], opsOf('hapus(10) hapus(5)'));
    assertInvariants([10, 20, 30], opsOf('hapus(10)'));
    const steps = assertInvariants([50, 30, 70, 80], opsOf('hapus(50)'));
    assert.match(steps.find((step) => step.lines.includes('h-pengganti'))?.caption ?? '', /70 tidak punya anak kiri, jadi penggantinya 70/);
    assertInvariants([50, 30, 70, 60, 65, 62, 80], opsOf('hapus(50) hapus(60) hapus(62)'));
  });

  it('works on random data and the maximum size', () => {
    for (let seed = 1; seed <= 150; seed++) {
      for (const withInitial of [false, true]) {
        const { initial, operations } = randomBstData(seeded(seed), withInitial);
        assert.equal(validateBst(initial, operations), null);
        assertInvariants(initial, operations);
      }
    }
    for (let seed = 1; seed <= 60; seed++) {
      const random = seeded(seed * 31);
      const initial = Array.from({ length: BST_LIMITS.maxInitial }, () => 1 + Math.floor(random() * 30));
      const operations = Array.from({ length: BST_LIMITS.maxOperations }, () => ({
        type: (['sisip', 'cari', 'hapus'] as const)[Math.floor(random() * 3)],
        value: 1 + Math.floor(random() * 30),
      }));
      assertInvariants(initial, operations);
    }
  });

  it('is deterministic', () => {
    assert.deepEqual(bstSteps(lessonBstDeleteInitial, lessonBstDeleteOperations), bstSteps(lessonBstDeleteInitial, lessonBstDeleteOperations));
  });
});

describe('BST input', () => {
  it('parses operation lists and starting trees from MDX', () => {
    assert.deepEqual(opsOf('sisip(45) sisip(23) sisip(71) sisip(11) sisip(30) sisip(58) sisip(36) sisip(64) cari(36) cari(50)'), lessonBstOperations);
    assert.deepEqual(opsOf('hapus( 11 ), hapus(30)  hapus(45)'), lessonBstDeleteOperations);
    assert.deepEqual(parseBstValues('45 23, 71 11 30 58 36 64'), { values: lessonBstDeleteInitial });
    assert.ok('error' in parseBstOperations('sisip(3) tambah(4)'));
    assert.ok('error' in parseBstOperations('sisip(0)'));
    assert.ok('error' in parseBstOperations('sisip(1000)'));
    assert.ok('error' in parseBstValues('1 2 x'));
  });

  it('validates limits', () => {
    assert.match(validateBst([], Array.from({ length: 13 }, () => ({ type: 'cari' as const, value: 1 }))) ?? '', /Maksimal 12/);
    assert.match(validateBst(Array.from({ length: 13 }, (_, i) => i + 1), []) ?? '', /maksimal 12/);
    const sixteen = Array.from({ length: 12 }, (_, i) => i + 1);
    assert.match(validateBst(sixteen, [13, 14, 15, 16].map((value) => ({ type: 'sisip' as const, value }))) ?? '', /15 nilai/);
    assert.equal(validateBst(sixteen, [12, 13, 14].map((value) => ({ type: 'sisip' as const, value }))), null);
    assert.ok(validateBst([1.5], []));
  });

  it('reads one typed value', () => {
    assert.deepEqual(parseBstValue(' 45 '), { value: 45 });
    for (const text of ['', 'abc', '0', '1000', '-3', '2.5']) assert.ok('error' in parseBstValue(text), text);
  });
});
