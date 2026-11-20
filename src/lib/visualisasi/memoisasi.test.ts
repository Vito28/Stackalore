import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fib } from './fibonacci.ts';
import {
  MEMO_LIMITS,
  callCount,
  countCellId,
  memoCallTree,
  memoCellId,
  memoisasiSteps,
  pseudocodeFor,
  validateMemoN,
  type ModeMemo,
} from './memoisasi.ts';

describe('memoCallTree', () => {
  it('matches the pruned tree of fib(5) in the deep dive', () => {
    const tree = memoCallTree(5, 'memo');
    assert.deepEqual(
      tree.order.map((id) => tree.calls[id].n),
      [5, 4, 3, 2, 1, 0, 1, 2, 3],
    );
    assert.deepEqual(
      tree.order.filter((id) => tree.calls[id].hit).map((id) => tree.calls[id].n),
      [2, 3],
      'the second fib(2) and fib(3) are read from the memo',
    );
  });

  it('matches the call counts in the deep dive table', () => {
    const table: [number, number, number][] = [
      [5, 15, 9],
      [10, 177, 19],
      [20, 21891, 39],
    ];
    for (const [n, tanpa, memo] of table) {
      assert.equal(callCount(n, 'tanpa'), tanpa, `tanpa memo, n = ${n}`);
      assert.equal(callCount(n, 'memo'), memo, `dengan memo, n = ${n}`);
      assert.equal(callCount(n, 'tanpa'), 2 * fib(n + 1) - 1);
    }
  });
});

describe('memoisasiSteps', () => {
  it('counts the calls per value like the program in the deep dive', () => {
    const last = memoisasiSteps(6, 'tanpa').at(-1)!;
    // fib(0) .. fib(6) are called 5, 8, 5, 3, 2, 1, 1 times.
    assert.deepEqual(last.state.counts, [5, 8, 5, 3, 2, 1, 1]);
    assert.equal(last.result, '25 panggilan');
    assert.equal(last.highlights[countCellId(2)], 'error');
  });

  it('fills the memo once per value and never stores base cases', () => {
    const steps = memoisasiSteps(5, 'memo');
    const last = steps.at(-1)!;
    assert.deepEqual(last.state.memo, [null, null, 1, 2, 3, 5]);
    assert.equal(last.result, '9 panggilan');
    assert.match(last.caption, /Tanpa memo butuh 15/);
    // Once written, a memo value never changes.
    for (let k = 0; k <= 5; k++) {
      const written = steps.map((step) => step.state.memo[k]).filter((value) => value !== null);
      assert.ok(written.every((value) => value === fib(k)));
    }
    const reads = steps.filter((step) => step.lines.includes('baca'));
    assert.deepEqual(
      reads.map((step) => step.result),
      ['memo[2] → 1', 'memo[3] → 2'],
    );
  });

  for (const mode of ['tanpa', 'memo'] as ModeMemo[]) {
    for (let n = MEMO_LIMITS.min; n <= MEMO_LIMITS.max; n++) {
      it(`keeps the invariants (${mode}, n = ${n})`, () => {
        const steps = memoisasiSteps(n, mode);
        const tree = steps[0].state.tree;
        const lineIds = new Set(pseudocodeFor(mode).map((line) => line.id));
        const tableIds = new Set<string>();
        for (let k = 0; k <= n; k++) {
          tableIds.add(countCellId(k));
          tableIds.add(memoCellId(k));
        }
        // Start, one step per call, one return step per computed call, summary.
        const computed = tree.order.filter((id) => tree.calls[id].left !== null).length;
        assert.equal(steps.length, 1 + tree.order.length + computed + 1);

        steps.forEach((step, index) => {
          assert.ok(step.caption.trim().length > 0);
          assert.ok(!step.caption.includes('**'), 'captions only support backticks');
          for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
          for (const id of Object.keys(step.highlights)) {
            assert.ok(id in tree.calls || tableIds.has(id), `step ${index} highlights ${id}`);
          }
          // The call stack is a path down the tree.
          const { stack } = step.state;
          for (let depth = 1; depth < stack.length; depth++) {
            const parent = tree.calls[stack[depth - 1]];
            assert.ok(parent.left === stack[depth] || parent.right === stack[depth]);
          }
          assert.equal(
            step.state.counts.reduce((sum, count) => sum + count, 0),
            step.state.called.length,
            'the count table adds up to the calls made',
          );
          if (mode === 'tanpa') assert.ok(step.state.memo.every((value) => value === null));
        });

        const last = steps.at(-1)!;
        assert.equal(last.state.results[tree.root], fib(n));
        assert.equal(last.state.called.length, tree.order.length);
      });
    }
  }

  it('validates n', () => {
    assert.equal(validateMemoN(5), null);
    assert.ok(validateMemoN(0));
    assert.ok(validateMemoN(7));
    assert.ok(validateMemoN(2.5));
  });
});
