import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  QUEUE_LIMITS,
  lessonQueueOperations,
  parseQueueName,
  parseQueueOperations,
  queuePseudocode,
  queueSteps,
  randomQueueOperations,
  validateQueueOperations,
  type QueueOperation,
} from './queue.ts';

/** Plain reference: what a real queue (an array used front to back) returns for each operation. */
function reference(operations: QueueOperation[]) {
  const queue: string[] = [];
  const results: (string | undefined)[] = [];
  for (const operation of operations) {
    if (operation.type === 'enqueue') {
      queue.push(operation.value);
      results.push(undefined);
    } else if (operation.type === 'size') {
      results.push(`size → ${queue.length}`);
    } else if (operation.type === 'empty') {
      results.push(`empty → ${queue.length === 0}`);
    } else if (queue.length === 0) {
      results.push('error');
    } else if (operation.type === 'front') {
      results.push(`front → ${queue[0]}`);
    } else if (operation.type === 'back') {
      results.push(`back → ${queue[queue.length - 1]}`);
    } else {
      results.push(`${queue.shift()} keluar`);
    }
  }
  return { queue, results };
}

const values = (step: ReturnType<typeof queueSteps>[number]) => step.state.items.map((item) => item.value);

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function assertInvariants(operations: QueueOperation[]) {
  const steps = queueSteps(operations);
  const { queue, results } = reference(operations);
  const lineIds = new Set(queuePseudocode.map((line) => line.id));

  assert.equal(steps.length, operations.length + 1, 'one starting step plus one per operation');
  assert.deepEqual(values(steps[steps.length - 1]), queue, 'final contents match a real queue');

  steps.forEach((step, index) => {
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.equal(step.caption.split('`').length % 2, 1, `step ${index} has balanced backticks`);
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    for (const id of Object.keys(step.highlights)) {
      assert.ok(step.state.items.some((item) => item.id === id), `step ${index} highlights an element that exists`);
    }
    assert.equal(step.state.operation, index === 0 ? null : index - 1);
    if (index === 0) return;

    const operation = operations[index - 1];
    const before = values(steps[index - 1]);
    const expected = results[index - 1];
    if (expected === 'error') {
      assert.equal(step.status, 'error');
      assert.deepEqual(values(step), before, 'an error step leaves the queue unchanged');
    } else {
      assert.equal(step.status, 'normal');
      assert.equal(step.result, expected);
    }
    // FIFO: elements only ever join at the back and leave from the front.
    if (operation.type === 'enqueue') assert.deepEqual(values(step), [...before, operation.value]);
    else if (operation.type === 'dequeue' && before.length > 0) assert.deepEqual(values(step), before.slice(1));
    else assert.deepEqual(values(step), before);
  });

  // An element keeps its id for as long as it is in the queue, and ids are unique.
  const ids = new Map<string, string>();
  for (const step of steps) {
    for (const item of step.state.items) {
      if (ids.has(item.id)) assert.equal(ids.get(item.id), item.value);
      ids.set(item.id, item.value);
    }
    assert.equal(new Set(step.state.items.map((item) => item.id)).size, step.state.items.length, 'ids are unique');
  }
  return steps;
}

describe('queueSteps', () => {
  it('follows the trace table in the Queue lesson', () => {
    const steps = assertInvariants(lessonQueueOperations);
    assert.deepEqual(steps.map(values), [
      [],
      ['Ani'],
      ['Ani', 'Budi'],
      ['Ani', 'Budi', 'Citra'],
      ['Ani', 'Budi', 'Citra'],
      ['Budi', 'Citra'],
      ['Budi', 'Citra', 'Dodi'],
      ['Citra', 'Dodi'],
      ['Citra', 'Dodi'],
    ]);
    assert.deepEqual(
      steps.map((step) => step.result),
      [undefined, undefined, undefined, undefined, 'front → Ani', 'Ani keluar', undefined, 'Budi keluar', 'back → Dodi'],
    );
    assert.match(steps[1].caption, /`enqueue\(Ani\)`/);
    assert.match(steps[1].caption, /`q\.append\("Ani"\)`/, 'first enqueue shows the Python spelling');
    assert.doesNotMatch(steps[2].caption, /q\.append/, 'later enqueues stay short');
    assert.match(steps[5].caption, /`q\.popleft\(\)`/);
    assert.match(steps[steps.length - 1].caption, /Semua operasi selesai/);
  });

  it('marks dequeue, front and back on an empty queue as errors and keeps going', () => {
    const steps = assertInvariants([
      { type: 'dequeue' },
      { type: 'front' },
      { type: 'back' },
      { type: 'enqueue', value: 'Eka' },
      { type: 'dequeue' },
      { type: 'dequeue' },
      { type: 'size' },
      { type: 'empty' },
    ]);
    assert.deepEqual(
      steps.map((step) => step.status),
      ['normal', 'error', 'error', 'error', 'normal', 'normal', 'error', 'normal', 'normal'],
    );
    assert.match(steps[1].caption, /perilaku tak terdefinisi/);
    assert.match(steps[1].caption, /popleft\(\)`.*IndexError/);
    assert.match(steps[2].caption, /`q\[0\]`.*IndexError/);
    assert.match(steps[3].caption, /`q\[-1\]`.*IndexError/);
    assert.deepEqual(steps[1].lines, ['dequeue', 'dequeue-cek']);
    assert.deepEqual(steps[2].lines, ['front', 'front-cek']);
    assert.deepEqual(steps[3].lines, ['back', 'back-cek']);
    assert.equal(steps[7].result, 'size → 0');
    assert.equal(steps[8].result, 'empty → true');
  });

  it('handles an empty sequence, a single element and duplicate names', () => {
    assert.match(assertInvariants([])[0].caption, /belum ada operasi/);
    const single = assertInvariants([{ type: 'enqueue', value: 'Ani' }, { type: 'front' }, { type: 'back' }]);
    assert.equal(single[2].result, 'front → Ani');
    assert.equal(single[3].result, 'back → Ani');

    const twins = assertInvariants([
      { type: 'enqueue', value: 'Ani' },
      { type: 'enqueue', value: 'Ani' },
      { type: 'dequeue' },
      { type: 'empty' },
    ]);
    // The two Anis are different elements: dequeue removes the one that arrived first.
    assert.notEqual(twins[2].state.items[0].id, twins[2].state.items[1].id);
    assert.equal(twins[3].state.items[0].id, twins[2].state.items[1].id);
    assert.equal(twins[4].result, 'empty → false');
  });

  it('highlights the new element, the element being read, and everything on size', () => {
    const steps = queueSteps(lessonQueueOperations);
    assert.deepEqual(Object.keys(steps[3].highlights), [steps[3].state.items[2].id]);
    assert.deepEqual(Object.keys(steps[4].highlights), [steps[4].state.items[0].id], 'front marks the front');
    assert.deepEqual(Object.keys(steps[8].highlights), [steps[8].state.items[1].id], 'back marks the back');
    const size = queueSteps([...lessonQueueOperations, { type: 'size' }]);
    assert.equal(Object.keys(size[9].highlights).length, 2);
  });

  it('works for the maximum number of operations and random sequences', () => {
    const many: QueueOperation[] = Array.from({ length: QUEUE_LIMITS.maxOperations }, (_, i) =>
      i % 3 === 2 ? { type: 'dequeue' } : { type: 'enqueue', value: `Orang${String.fromCharCode(65 + i)}` },
    );
    assertInvariants(many);
    for (let seed = 1; seed <= 200; seed++) assertInvariants(randomQueueOperations(seeded(seed)));
  });

  it('is deterministic', () => {
    assert.deepEqual(queueSteps(lessonQueueOperations), queueSteps(lessonQueueOperations));
  });
});

describe('queue input validation', () => {
  it('accepts names of 1 to 8 letters', () => {
    assert.deepEqual(parseQueueName(' Dodi '), { value: 'Dodi' });
    assert.deepEqual(parseQueueName('A'), { value: 'A' });
    assert.deepEqual(parseQueueName('Kiranaya'), { value: 'Kiranaya' });
  });

  it('rejects empty, too long and non-letter names with a message', () => {
    for (const text of ['', '  ', 'Ani Budi', 'Kiranayaa', 'Ani1', 'Çitra', 'a-b']) {
      const parsed = parseQueueName(text);
      assert.ok('error' in parsed && parsed.error.length > 0, `rejects ${JSON.stringify(text)}`);
    }
  });

  it('validates whole sequences from MDX props', () => {
    assert.equal(validateQueueOperations(lessonQueueOperations), null);
    assert.match(
      validateQueueOperations(Array.from({ length: 13 }, () => ({ type: 'dequeue' as const }))) ?? '',
      /Maksimal 12/,
    );
    assert.ok(validateQueueOperations([{ type: 'enqueue', value: 'Ani Budi' }]));
  });

  it('parses operation lists written in MDX', () => {
    assert.deepEqual(
      parseQueueOperations('enqueue(Ani) enqueue(Budi) enqueue(Citra) front dequeue enqueue(Dodi) dequeue back'),
      { operations: lessonQueueOperations },
    );
    assert.deepEqual(parseQueueOperations('enqueue( Eka ), size, empty'), {
      operations: [{ type: 'enqueue', value: 'Eka' }, { type: 'size' }, { type: 'empty' }],
    });
    assert.deepEqual(parseQueueOperations(''), { operations: [] });
    assert.ok('error' in parseQueueOperations('enqueue(Ani) push(Budi)'));
    assert.ok('error' in parseQueueOperations('enqueue(Ani Budi)'));
    assert.ok('error' in parseQueueOperations('enqueue()'));
  });
});
