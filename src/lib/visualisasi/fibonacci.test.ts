import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FIB_LIMITS, fib, fibCallTree, fibPseudocode, fibonacciSteps, lessonFibN, validateFibN } from './fibonacci.ts';

/** Number of calls the plain recursive fib(n) makes. */
const callCount = (n: number): number => (n <= 1 ? 1 : 1 + callCount(n - 1) + callCount(n - 2));

describe('fibCallTree', () => {
  it('matches the call tree of fib(5) drawn in the lesson', () => {
    const tree = fibCallTree(lessonFibN);
    assert.equal(tree.order.length, 15);
    // Preorder, left branch first, exactly as the program calls them.
    assert.deepEqual(
      tree.order.map((id) => tree.calls[id].n),
      [5, 4, 3, 2, 1, 0, 1, 2, 1, 0, 3, 2, 1, 0, 1],
    );
    const count = (m: number) => tree.order.filter((id) => tree.calls[id].n === m).length;
    assert.equal(count(3), 2, 'fib(3) is computed twice');
    assert.equal(count(2), 3, 'fib(2) is computed three times');
  });
});

describe('fibonacciSteps', () => {
  it('ends fib(5) by pointing out fib(3) twice and fib(2) three times', () => {
    const steps = fibonacciSteps(lessonFibN);
    // 1 start + 15 calls + 7 returns of non-base calls + 2 repeated values.
    assert.equal(steps.length, 25);
    assert.deepEqual(
      steps.slice(-2).map((step) => step.result),
      ['fib(3) dihitung 2×', 'fib(2) dihitung 3×'],
    );
    assert.equal(steps.at(-3)?.result, 'fib(5) = 5');
  });

  for (let n = FIB_LIMITS.min; n <= FIB_LIMITS.max; n++) {
    it(`keeps the invariants for n = ${n}`, () => {
      const steps = fibonacciSteps(n);
      const lineIds = new Set(fibPseudocode.map((line) => line.id));
      const { tree } = steps[0].state;
      assert.equal(tree.order.length, callCount(n));

      const parent = new Map<string, string>();
      for (const call of Object.values(tree.calls)) {
        if (call.left) parent.set(call.left, call.id);
        if (call.right) parent.set(call.right, call.id);
      }

      let maxDepth = 0;
      steps.forEach((step, index) => {
        const { called, results, stack } = step.state;
        assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
        for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
        for (const id of Object.keys(step.highlights)) assert.ok(called.includes(id), `step ${index} highlights a call that was made`);
        // Calls appear in program order and never disappear.
        assert.deepEqual(called, tree.order.slice(0, called.length));
        if (index > 0) assert.ok(called.length >= steps[index - 1].state.called.length);
        // Every finished call returned the real Fibonacci number.
        for (const [id, value] of Object.entries(results)) assert.equal(value, fib(tree.calls[id].n));
        // The call stack is one path from the first call down to the running one.
        stack.forEach((id, depth) => {
          if (depth === 0) assert.equal(id, tree.root);
          else assert.equal(parent.get(id), stack[depth - 1]);
          assert.ok(!(id in results) || depth === stack.length - 1, 'only the running call may already have its result');
        });
        if (stack.length > 0) assert.equal(step.highlights[stack.at(-1)!], 'aktif');
        maxDepth = Math.max(maxDepth, stack.length);
      });

      assert.equal(maxDepth, n, 'the call stack is never deeper than n frames');
      const finished = steps.find((step) => step.result === `fib(${n}) = ${fib(n)}` && step.state.stack.length === 1);
      assert.ok(finished, 'one step shows the final answer');
      assert.equal(Object.keys(steps.at(-1)!.state.results).length, tree.order.length, 'every call finishes');
    });
  }
});

describe('validateFibN', () => {
  it('accepts the picker range and rejects the rest', () => {
    assert.equal(validateFibN(1), null);
    assert.equal(validateFibN(6), null);
    assert.notEqual(validateFibN(0), null);
    assert.notEqual(validateFibN(7), null);
    assert.notEqual(validateFibN(3.5), null);
  });
});
