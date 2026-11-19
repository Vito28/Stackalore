import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  STACK_LIMITS,
  lessonStackOperations,
  parseStackOperations,
  parseStackValue,
  randomStackOperations,
  stackPseudocode,
  stackSteps,
  validateStackOperations,
  type StackOperation,
} from './stack.ts';

/** Plain reference: what a real stack returns for each operation. */
function reference(operations: StackOperation[]) {
  const stack: number[] = [];
  const results: (string | undefined)[] = [];
  for (const operation of operations) {
    if (operation.type === 'push') {
      stack.push(operation.value);
      results.push(undefined);
    } else if (operation.type === 'size') {
      results.push(`size → ${stack.length}`);
    } else if (stack.length === 0) {
      results.push('error');
    } else if (operation.type === 'top') {
      results.push(`top → ${stack[stack.length - 1]}`);
    } else {
      results.push(`${stack.pop()} dibuang`);
    }
  }
  return { stack, results };
}

const values = (step: ReturnType<typeof stackSteps>[number]) => step.state.items.map((item) => item.value);

/** Small deterministic generator so random sequences are reproducible. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function assertInvariants(operations: StackOperation[]) {
  const steps = stackSteps(operations);
  const { stack, results } = reference(operations);
  const lineIds = new Set(stackPseudocode.map((line) => line.id));

  assert.equal(steps.length, operations.length + 1, 'one starting step plus one per operation');
  assert.deepEqual(values(steps[steps.length - 1]), stack, 'final contents match a real stack');

  steps.forEach((step, index) => {
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    for (const id of Object.keys(step.highlights)) {
      assert.ok(step.state.items.some((item) => item.id === id), `step ${index} highlights an element that exists`);
    }
    assert.equal(step.state.operation, index === 0 ? null : index - 1);
    if (index === 0) return;

    const expected = results[index - 1];
    if (expected === 'error') {
      assert.equal(step.status, 'error');
      assert.deepEqual(values(step), values(steps[index - 1]), 'an error step leaves the stack unchanged');
    } else {
      assert.equal(step.status, 'normal');
      assert.equal(step.result, expected);
    }
  });

  // Ids stay stable: an element keeps its id for as long as it is on the stack.
  const ids = new Map<string, number>();
  for (const step of steps) {
    for (const item of step.state.items) {
      if (ids.has(item.id)) assert.equal(ids.get(item.id), item.value);
      ids.set(item.id, item.value);
    }
    assert.equal(new Set(step.state.items.map((item) => item.id)).size, step.state.items.length, 'ids are unique');
  }
  return steps;
}

describe('stackSteps', () => {
  it('follows the table in the Stack lesson', () => {
    const steps = assertInvariants(lessonStackOperations);
    assert.deepEqual(steps.map(values), [[], [3], [3, 7], [3, 7, 5], [3, 7, 5], [3, 7], [3, 7, 9], [3, 7], [3, 7]]);
    assert.deepEqual(
      steps.map((step) => step.result),
      [undefined, undefined, undefined, undefined, 'top → 5', '5 dibuang', undefined, '9 dibuang', 'size → 2'],
    );
    assert.match(steps[1].caption, /`push\(3\)`/);
    assert.match(steps[steps.length - 1].caption, /Semua operasi selesai/);
  });

  it('marks pop and top on an empty stack as errors and keeps going', () => {
    const steps = assertInvariants([
      { type: 'pop' },
      { type: 'top' },
      { type: 'push', value: 4 },
      { type: 'pop' },
      { type: 'pop' },
      { type: 'size' },
    ]);
    assert.deepEqual(
      steps.map((step) => step.status),
      ['normal', 'error', 'error', 'normal', 'normal', 'error', 'normal'],
    );
    assert.match(steps[1].caption, /perilaku tak terdefinisi/);
    assert.match(steps[1].caption, /IndexError/);
    assert.deepEqual(steps[1].lines, ['pop', 'pop-cek']);
    assert.deepEqual(steps[2].lines, ['top', 'top-cek']);
    assert.equal(steps[6].result, 'size → 0');
  });

  it('handles an empty sequence', () => {
    const steps = assertInvariants([]);
    assert.equal(steps.length, 1);
    assert.match(steps[0].caption, /belum ada operasi/);
  });

  it('handles a single push and duplicate values', () => {
    assertInvariants([{ type: 'push', value: 8 }]);
    const steps = assertInvariants([
      { type: 'push', value: 5 },
      { type: 'push', value: 5 },
      { type: 'pop' },
      { type: 'top' },
    ]);
    // The two 5s are different elements: popping removes the upper one.
    assert.notEqual(steps[1].state.items[0].id, steps[2].state.items[1].id);
    assert.equal(steps[3].state.items[0].id, steps[1].state.items[0].id);
  });

  it('highlights the pushed element, the top on top, and everything on size', () => {
    const steps = stackSteps(lessonStackOperations);
    assert.deepEqual(Object.keys(steps[3].highlights), [steps[3].state.items[2].id]);
    assert.deepEqual(Object.keys(steps[4].highlights), [steps[4].state.items[2].id]);
    assert.equal(Object.keys(steps[8].highlights).length, 2);
  });

  it('works for the maximum number of operations and random sequences', () => {
    const many: StackOperation[] = Array.from({ length: STACK_LIMITS.maxOperations }, (_, i) =>
      i % 3 === 2 ? { type: 'pop' } : { type: 'push', value: i * 10 },
    );
    assertInvariants(many);
    for (let seed = 1; seed <= 200; seed++) assertInvariants(randomStackOperations(seeded(seed)));
  });

  it('is deterministic', () => {
    assert.deepEqual(stackSteps(lessonStackOperations), stackSteps(lessonStackOperations));
  });
});

describe('input validation', () => {
  it('accepts integers inside the limits', () => {
    assert.deepEqual(parseStackValue(' 42 '), { value: 42 });
    assert.deepEqual(parseStackValue('-99'), { value: -99 });
    assert.deepEqual(parseStackValue('999'), { value: 999 });
  });

  it('rejects empty, non-integer and out-of-range input with a message', () => {
    for (const text of ['', '  ', '3.5', 'abc', '1e3', '--1', '1000', '-100']) {
      const parsed = parseStackValue(text);
      assert.ok('error' in parsed && parsed.error.length > 0, `rejects ${JSON.stringify(text)}`);
    }
  });

  it('validates whole sequences from MDX props', () => {
    assert.equal(validateStackOperations(lessonStackOperations), null);
    assert.match(
      validateStackOperations(Array.from({ length: 13 }, () => ({ type: 'pop' as const }))) ?? '',
      /Maksimal 12/,
    );
    assert.ok(validateStackOperations([{ type: 'push', value: 1.5 }]));
    assert.ok(validateStackOperations([{ type: 'push', value: 5000 }]));
  });

  it('parses operation lists written in MDX', () => {
    assert.deepEqual(parseStackOperations('push(3) push(7) push(5) top pop push(9) pop size'), {
      operations: lessonStackOperations,
    });
    assert.deepEqual(parseStackOperations('push( -4 ), pop'), {
      operations: [{ type: 'push', value: -4 }, { type: 'pop' }],
    });
    assert.deepEqual(parseStackOperations(''), { operations: [] });
    assert.ok('error' in parseStackOperations('push(3) peek'));
    assert.ok('error' in parseStackOperations('push(1000)'));
  });
});
