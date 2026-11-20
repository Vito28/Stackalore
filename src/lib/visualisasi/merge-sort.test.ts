import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { randomValues } from './array.ts';
import {
  MERGE_RANDOM_LENGTH,
  countMergeComparisons,
  lessonMergeData,
  mergeCases,
  mergePseudocode,
  mergeSortSteps,
  type MergeStep,
} from './merge-sort.ts';

/** Small seeded generator so the random tests are repeatable. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const values = (step: MergeStep, id: string) =>
  step.state.segments.find((segment) => segment.id === id)?.cells.map((cell) => cell?.value ?? null);

/** Values of each range at the moment its merge finishes, in order. */
function mergedRanges(steps: MergeStep[]) {
  return steps
    .filter((step) => step.caption.includes('sekarang urut'))
    .map((step) => {
      const id = /^gabung\((\d+), \d+, (\d+)\)$/.exec(step.state.call ?? '')!;
      return values(step, `s${id[1]}-${id[2]}`);
    });
}

function checkInvariants(input: number[]) {
  const steps = mergeSortSteps(input);
  const n = input.length;
  const lineIds = new Set(mergePseudocode.map((line) => line.id));
  const sorted = [...input].sort((a, b) => a - b);

  steps.forEach((step, index) => {
    const { segments } = step.state;
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.ok(!step.caption.includes('**'), 'captions only support backticks');
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);

    // Every element is drawn exactly once.
    const ids = segments.flatMap((segment) => segment.cells.flatMap((cell) => (cell ? [cell.id] : [])));
    assert.equal(ids.length, n, `step ${index} shows every element`);
    assert.equal(new Set(ids).size, n, `step ${index} shows each element once`);
    assert.deepEqual(
      segments.flatMap((segment) => segment.cells.flatMap((cell) => (cell ? [cell.value] : []))).sort((a, b) => a - b),
      sorted,
      'no value is lost or invented',
    );

    for (const segment of segments) {
      assert.equal(segment.cells.length, segment.kanan - segment.kiri + 1, 'one cell per index');
      assert.ok(segment.depth < step.state.rows, 'every row fits the reserved rows');
      for (const other of segments) {
        if (other === segment || other.depth !== segment.depth) continue;
        assert.ok(other.kanan < segment.kiri || other.kiri > segment.kanan, 'ranges on one row never overlap');
      }
    }

    const known = new Set([...ids, ...segments.map((segment) => segment.id)]);
    for (const id of Object.keys(step.highlights)) assert.ok(known.has(id), `step ${index} highlights ${id}, which is drawn`);

    // i and j badges sit on the front element of the two halves being merged.
    for (const head of step.state.heads) {
      const owner = segments.find((segment) => segment.cells.some((cell) => cell?.id === head.id))!;
      assert.equal(owner.cells.find((cell) => cell !== null)?.id, head.id, `${head.name} is the front of its half`);
    }
  });

  const last = steps.at(-1)!;
  if (n > 1) {
    assert.equal(last.state.segments.length, 1, 'only the whole range is left at the end');
    assert.deepEqual(values(last, `s0-${n - 1}`), sorted);
    assert.equal(last.state.comparisons, countMergeComparisons(input));
    assert.equal(Object.keys(last.highlights).length, n, 'every element is marked done');
  }
  return steps;
}

describe('mergeSortSteps', () => {
  it('follows the lesson example 7 2 9 4 3 8 6 1', () => {
    const steps = mergeSortSteps(lessonMergeData);
    // start + 7 divides + 3 levels × 8 elements taken + end
    assert.equal(steps.length, 1 + 7 + 24 + 1);
    assert.deepEqual(mergedRanges(steps), [
      [2, 7],
      [4, 9],
      [2, 4, 7, 9],
      [3, 8],
      [1, 6],
      [1, 3, 6, 8],
      [1, 2, 3, 4, 6, 7, 8, 9],
    ]);
    // Splits match the lesson's "membagi" tree.
    assert.deepEqual(values(steps[1], 's0-3'), [7, 2, 9, 4]);
    assert.deepEqual(values(steps[1], 's4-7'), [3, 8, 6, 1]);
    assert.deepEqual(values(steps[1], 's0-7'), Array(8).fill(null), 'the parent is emptied while its halves work');
    assert.equal(steps.at(-1)?.state.comparisons, 17);
  });

  it('merges 2 4 7 9 with 1 3 6 8 in the order of the lesson table', () => {
    const steps = mergeSortSteps(lessonMergeData).filter((step) => step.state.call === 'gabung(0, 3, 7)');
    assert.deepEqual(
      steps.map((step) => step.result),
      ['ambil 1', 'ambil 2', 'ambil 3', 'ambil 4', 'ambil 6', 'ambil 7', 'ambil 8', 'ambil 9'],
    );
    assert.equal(steps.at(-1)!.state.comparisons - steps[0].state.comparisons + 1, 7, 'seven comparisons, then the left rest is copied');
    assert.deepEqual(steps.at(-1)!.lines, ['sisa']);
    assert.match(steps.at(-1)!.caption, /Bagian kanan sudah habis/);
    // The first comparison: 2 vs 1, the right one is taken and 2 waits as the compared head.
    assert.equal(steps[0].highlights.e7, 'aktif');
    assert.equal(steps[0].highlights.e1, 'khusus');
  });

  it('takes from the left on ties, so equal values keep their order', () => {
    const steps = mergeSortSteps([3, 1, 3, 1]);
    const final = steps.at(-1)!.state.segments[0].cells.map((cell) => cell!.id);
    assert.deepEqual(final, ['e1', 'e3', 'e0', 'e2']);
    assert.ok(steps.some((step) => step.caption.includes('sama besar')));
  });

  for (const example of mergeCases) {
    it(`keeps the invariants for the case "${example.label}"`, () => {
      checkInvariants(example.values);
    });
  }

  it('splits an odd range with the extra element on the left', () => {
    const steps = mergeSortSteps([5, 1, 4, 2, 3]);
    assert.deepEqual(values(steps[1], 's0-2'), [5, 1, 4]);
    assert.deepEqual(values(steps[1], 's3-4'), [2, 3]);
    assert.equal(steps[0].state.rows, 4);
    assert.match(steps[2].caption, /tinggal 1 elemen/);
  });

  it('keeps the invariants for random data', () => {
    const random = seeded(7);
    for (let round = 0; round < 200; round++) {
      const length = 1 + Math.floor(random() * MERGE_RANDOM_LENGTH);
      checkInvariants(randomValues(length, 9, random));
    }
  });

  it('handles a single element', () => {
    const steps = mergeSortSteps([4]);
    assert.equal(steps.length, 1);
    assert.equal(steps[0].state.rows, 1);
  });
});
