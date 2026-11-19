import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HEAP_LIMITS,
  heapLeft,
  heapParent,
  heapPseudocode,
  heapRight,
  heapSteps,
  lessonHeapOperations,
  parseHeapOperations,
  parseHeapValue,
  randomHeapOperations,
  validateHeapOperations,
  type HeapOperation,
  type HeapStep,
} from './heap.ts';

/** Plain array min-heap with the lesson's algorithm, counting swaps. */
function referenceHeap(operations: HeapOperation[]) {
  const a: number[] = [];
  const results: (string | undefined)[] = [];
  const snapshots: number[][] = [];
  let swaps = 0;
  for (const operation of operations) {
    if (operation.type === 'push') {
      a.push(operation.value);
      let i = a.length - 1;
      while (i > 0) {
        const p = Math.floor((i - 1) / 2);
        if (a[i] >= a[p]) break;
        [a[i], a[p]] = [a[p], a[i]];
        swaps++;
        i = p;
      }
      results.push(undefined);
    } else if (operation.type === 'size') {
      results.push(`size → ${a.length}`);
    } else if (a.length === 0) {
      results.push('✗ heap kosong');
    } else if (operation.type === 'top') {
      results.push(`top → ${a[0]}`);
    } else {
      const min = a[0];
      const last = a.pop() as number;
      if (a.length > 0) {
        a[0] = last;
        let i = 0;
        while (2 * i + 1 < a.length) {
          const l = 2 * i + 1;
          const r = l + 1;
          const c = r < a.length && a[r] < a[l] ? r : l;
          if (a[c] >= a[i]) break;
          [a[i], a[c]] = [a[c], a[i]];
          swaps++;
          i = c;
        }
      }
      results.push(`pop → ${min}`);
    }
    snapshots.push([...a]);
  }
  return { array: a, results, snapshots, swaps };
}

/** Even simpler reference for what pop must return: the minimum of a multiset. */
function sortedPops(operations: HeapOperation[]): (number | null)[] {
  const bag: number[] = [];
  const pops: (number | null)[] = [];
  for (const operation of operations) {
    if (operation.type === 'push') bag.push(operation.value);
    if (operation.type === 'pop') {
      bag.sort((x, y) => x - y);
      pops.push(bag.length > 0 ? (bag.shift() as number) : null);
    }
  }
  return pops;
}

const values = (step: HeapStep) => step.state.items.map((item) => item.value);

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function assertHeapProperty(array: number[], message: string) {
  for (let i = 1; i < array.length; i++) assert.ok(array[heapParent(i)] <= array[i], message);
}

function assertInvariants(operations: HeapOperation[]): HeapStep[] {
  const steps = heapSteps(operations);
  const reference = referenceHeap(operations);
  const lineIds = new Set(heapPseudocode.map((line) => line.id));

  assert.deepEqual(values(steps[steps.length - 1]), reference.array, 'final array matches the reference');
  assert.equal(steps.filter((step) => step.lines.includes('push-tukar') || step.lines.includes('pop-tukar')).length, reference.swaps, 'one step per swap');

  operations.forEach((operation, index) => {
    const own = steps.filter((step) => step.state.operation === index);
    assert.ok(own.length > 0);
    const last = own[own.length - 1];
    assert.deepEqual(values(last), reference.snapshots[index], `array after operation ${index}`);
    assertHeapProperty(values(last), `heap property after operation ${index}`);
    assert.equal(last.result, reference.results[index]);
  });

  const pops = steps
    .filter((step) => step.lines.includes('pop-ambil') || (step.status === 'error' && step.lines.includes('pop')))
    .map((step) => (step.status === 'error' ? null : Number(step.result?.split('→ ')[1])));
  assert.deepEqual(pops, sortedPops(operations), 'pop always returns the minimum');

  const seen = new Map<string, number>();
  steps.forEach((step, index) => {
    const ids = step.state.items.map((item) => item.id);
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    for (const id of Object.keys(step.highlights)) assert.ok(ids.includes(id), `step ${index} highlights an element in the heap`);
    for (const tag of step.state.tags) assert.ok(ids.includes(tag.at), `step ${index} tag sits on an element`);
    assert.equal(new Set(ids).size, ids.length, 'ids are unique');
    for (const item of step.state.items) {
      if (seen.has(item.id)) assert.equal(seen.get(item.id), item.value, 'an element keeps its value');
      seen.set(item.id, item.value);
    }
    if (step.status === 'error') {
      assert.deepEqual(step.state.items, steps[index - 1].state.items, 'an error step changes nothing');
      assert.match(step.caption, /perilaku tak terdefinisi/);
      assert.match(step.caption, /IndexError/);
    }
    if (index > 0) {
      // Between consecutive steps the array changes by at most one swap, one append, or one pop.
      const before = steps[index - 1].state.items;
      const after = step.state.items;
      const changed = after.filter((item, i) => before[i]?.id !== item.id).length;
      assert.ok(changed <= 2 || after.length !== before.length, `step ${index} changes little`);
    }
  });
  return steps;
}

describe('heapSteps', () => {
  it('runs the default priority queue example', () => {
    const steps = assertInvariants(lessonHeapOperations);
    const afterPushes = steps.filter((step) => step.state.operation === 6).at(-1) as HeapStep;
    assert.deepEqual(values(afterPushes), [5, 20, 10, 35, 40, 50, 30]);
    const pops = steps.filter((step) => step.lines.includes('pop-ambil')).map((step) => step.result);
    assert.deepEqual(pops, ['pop → 5', 'pop → 10']);
    assert.deepEqual(values(steps[steps.length - 1]), [20, 35, 30, 50, 40]);
    assert.match(steps[steps.length - 1].caption, /Semua operasi selesai/);

    // push(10) climbs two levels: compare, swap, compare, swap.
    const push10 = steps.filter((step) => step.state.operation === 3);
    assert.deepEqual(
      push10.map((step) => (step.lines.includes('push-tukar') ? 'tukar' : step.lines.includes('push-cek') ? 'banding' : 'taruh')),
      ['taruh', 'banding', 'tukar', 'banding', 'tukar'],
    );
    assert.match(push10[1].caption, /`\(3 - 1\) \/ 2 = 1`/);
    assert.deepEqual(push10[1].state.tags.map((tag) => tag.label), ['i', 'p']);
    // The taken minimum is shown beside the heap after it leaves.
    const firstPop = steps.filter((step) => step.state.operation === 7);
    assert.equal(firstPop[0].state.taken, null);
    assert.equal(firstPop[1].state.taken?.value, 5);
  });

  it('prefers the left child on a tie and swaps only when strictly smaller', () => {
    const ops = (text: string) => {
      const parsed = parseHeapOperations(text);
      assert.ok('operations' in parsed);
      return parsed.operations;
    };
    const steps = assertInvariants(ops('push(1) push(5) push(5) push(9) pop'));
    const leftFive = steps[2].state.items[1];
    const final = steps[steps.length - 1];
    assert.equal(final.state.items[0].id, leftFive.id, 'the left 5 moves up');
    assert.ok(steps.some((step) => /sama-sama 5, jadi pilih anak kiri/.test(step.caption)));

    // Equal to the parent: no swap on the way up.
    const equal = assertInvariants(ops('push(4) push(4)'));
    assert.equal(equal[equal.length - 1].state.items[0].id, equal[1].state.items[0].id);
    assert.match(equal[equal.length - 1].caption, /Tidak/);
  });

  it('treats pop and top on an empty heap as errors and keeps going', () => {
    const steps = assertInvariants([{ type: 'pop' }, { type: 'top' }, { type: 'push', value: 3 }, { type: 'pop' }, { type: 'pop' }, { type: 'size' }]);
    assert.deepEqual(
      steps.filter((step) => step.status === 'error').map((step) => step.lines),
      [
        ['pop', 'pop-kosong'],
        ['top', 'top-kosong'],
        ['pop', 'pop-kosong'],
      ],
    );
    assert.equal(steps[steps.length - 1].result, 'size → 0');
  });

  it('handles an empty list, a single push, negatives and the maximum size', () => {
    assert.equal(heapSteps([]).length, 1);
    assert.match(heapSteps([])[0].caption, /belum ada operasi/);
    assertInvariants([{ type: 'push', value: 7 }, { type: 'top' }, { type: 'pop' }]);
    assertInvariants([-5, 3, -99, 999, 0].map((value) => ({ type: 'push' as const, value })));
    const many = Array.from({ length: HEAP_LIMITS.maxOperations }, (_, i) => ({ type: 'push' as const, value: 100 - i * 7 }));
    const steps = assertInvariants(many);
    assert.equal(values(steps[steps.length - 1])[0], 100 - 11 * 7);
  });

  it('works on random sequences', () => {
    for (let seed = 1; seed <= 300; seed++) assertInvariants(randomHeapOperations(seeded(seed)));
    for (let seed = 1; seed <= 200; seed++) {
      const random = seeded(seed * 7);
      const operations: HeapOperation[] = Array.from({ length: HEAP_LIMITS.maxOperations }, () => {
        const roll = random();
        if (roll < 0.6) return { type: 'push', value: Math.floor(random() * 10) - 3 };
        return roll < 0.85 ? { type: 'pop' } : roll < 0.93 ? { type: 'top' } : { type: 'size' };
      });
      assertInvariants(operations);
    }
  });

  it('is deterministic and uses the lesson index formulas', () => {
    assert.deepEqual(heapSteps(lessonHeapOperations), heapSteps(lessonHeapOperations));
    assert.deepEqual([1, 2, 3, 4, 5, 6].map(heapParent), [0, 0, 1, 1, 2, 2]);
    assert.deepEqual([0, 1, 2].map(heapLeft), [1, 3, 5]);
    assert.deepEqual([0, 1, 2].map(heapRight), [2, 4, 6]);
  });
});

describe('heap input', () => {
  it('parses MDX operation lists', () => {
    assert.deepEqual(parseHeapOperations('push(35) push(20) push(50) push(10) push(40) push(5) push(30) pop pop'), {
      operations: lessonHeapOperations,
    });
    assert.deepEqual(parseHeapOperations('push( -4 ), top, size'), {
      operations: [{ type: 'push', value: -4 }, { type: 'top' }, { type: 'size' }],
    });
    assert.ok('error' in parseHeapOperations('push(3) peek'));
    assert.ok('error' in parseHeapOperations('push(1000)'));
  });

  it('validates values and limits', () => {
    assert.deepEqual(parseHeapValue(' -99 '), { value: -99 });
    for (const text of ['', 'x', '1.5', '-100', '1000']) assert.ok('error' in parseHeapValue(text), text);
    assert.match(validateHeapOperations(Array.from({ length: 13 }, () => ({ type: 'pop' as const }))) ?? '', /Maksimal 12/);
    assert.ok(validateHeapOperations([{ type: 'push', value: 2.5 }]));
  });
});
