import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { randomValues } from './array.ts';
import {
  QUICK_RANDOM_LENGTH,
  countQuickComparisons,
  lessonQuickData,
  quickCases,
  quickPseudocode,
  quickSortSteps,
  type QuickStep,
} from './quick-sort.ts';

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const row = (step: QuickStep) => step.state.items.map((item) => item.value);
const pointer = (step: QuickStep, name: string) => step.state.pointers.find((item) => item.name === name)?.index;

function checkInvariants(input: number[]) {
  const steps = quickSortSteps(input);
  const n = input.length;
  const lineIds = new Set(quickPseudocode.map((line) => line.id));
  const sorted = [...input].sort((a, b) => a - b);
  const finalPosition = new Map<string, number>();

  steps.forEach((step, index) => {
    const { items, range, final } = step.state;
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.ok(!step.caption.includes('**'), 'captions only support backticks');
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
    assert.deepEqual([...row(step)].sort((a, b) => a - b), sorted, 'values are only moved, never lost');
    assert.equal(new Set(items.map((item) => item.id)).size, n);
    for (const id of Object.keys(step.highlights)) assert.ok(items.some((item) => item.id === id), `step ${index} highlights an element`);
    assert.equal(step.state.stack.length > 0, range !== null, 'a range belongs to a running call');
    if (range) {
      assert.equal(step.state.stack.at(-1), `quickSort(${range.kiri}, ${range.kanan})`);
      for (const item of step.state.pointers) assert.ok(item.index >= range.kiri && item.index <= range.kanan, 'pointers stay in the range');
      for (const bracket of step.state.brackets) {
        if (bracket.from <= bracket.to) assert.ok(bracket.from >= range.kiri && bracket.to <= range.kanan, 'zones stay in the range');
      }
    }
    assert.ok(step.state.stack.length <= step.state.maxDepth);

    // Once an element is in its final place it never moves again.
    for (const id of final) {
      const position = items.findIndex((item) => item.id === id);
      if (finalPosition.has(id)) assert.equal(position, finalPosition.get(id), `${id} stays put`);
      else finalPosition.set(id, position);
      assert.equal(sorted[position], items[position].value, 'a final element holds its sorted value');
    }

    // While partitioning, everything left of i is smaller than the pivot.
    const i = pointer(step, 'i');
    const pivotIndex = pointer(step, 'pivot');
    const j = pointer(step, 'j');
    if (range && i !== undefined && pivotIndex !== undefined) {
      const pivot = items[pivotIndex].value;
      assert.equal(step.highlights[items[pivotIndex].id], 'khusus', 'the pivot is marked');
      for (let k = range.kiri; k < i; k++) assert.ok(items[k].value < pivot);
      if (j !== undefined) for (let k = i; k <= j; k++) assert.ok(items[k].value >= pivot);
    }
  });

  if (n > 1) {
    const last = steps.at(-1)!;
    assert.deepEqual(row(last), sorted);
    assert.equal(last.state.comparisons, countQuickComparisons(input));
    assert.equal(last.state.final.length, n, 'every element ends in its place');
  }
  return steps;
}

describe('quickSortSteps', () => {
  it('reproduces the lesson partition of 6 3 8 1 9 2 5 row by row', () => {
    const steps = quickSortSteps(lessonQuickData);
    assert.deepEqual(row(steps[1]), [6, 3, 8, 1, 9, 2, 5]);
    assert.equal(pointer(steps[1], 'i'), 0);
    const table: [number, number[], number][] = [
      [0, [6, 3, 8, 1, 9, 2, 5], 0],
      [1, [3, 6, 8, 1, 9, 2, 5], 1],
      [2, [3, 6, 8, 1, 9, 2, 5], 1],
      [3, [3, 1, 8, 6, 9, 2, 5], 2],
      [4, [3, 1, 8, 6, 9, 2, 5], 2],
      [5, [3, 1, 2, 6, 9, 8, 5], 3],
    ];
    table.forEach(([j, after, i], offset) => {
      const step = steps[2 + offset];
      assert.equal(pointer(step, 'j'), j);
      assert.deepEqual(row(step), after, `row j = ${j}`);
      assert.equal(pointer(step, 'i'), i, `i after j = ${j}`);
    });
    assert.deepEqual(row(steps[8]), [3, 1, 2, 5, 9, 8, 6], 'pivot 5 moves to index 3');
    assert.equal(steps[8].result, 'p = 3');
    assert.deepEqual(
      steps[8].state.brackets.map((bracket) => [bracket.label, bracket.from, bracket.to]),
      [
        ['< 5', 0, 2],
        ['≥ 5', 4, 6],
      ],
    );
    assert.equal(steps.at(-1)?.state.comparisons, 11);
  });

  it('shows the worst case on sorted data: 21 comparisons and 7 calls deep', () => {
    const steps = quickSortSteps([1, 2, 3, 4, 5, 6, 7]);
    const last = steps.at(-1)!;
    assert.equal(last.state.comparisons, 21);
    assert.equal(last.state.maxDepth, 7);
    assert.match(last.caption, /kasus terburuk/);
    // Every pivot is the largest, so it never moves and the left side shrinks by one.
    const pivots = steps.filter((step) => step.lines.includes('pivot')).map((step) => step.state.range);
    assert.deepEqual(
      pivots.map((range) => range!.kanan - range!.kiri + 1),
      [7, 6, 5, 4, 3, 2],
    );
  });

  it('does not call a normal case the worst case', () => {
    assert.doesNotMatch(quickSortSteps(lessonQuickData).at(-1)!.caption, /terburuk/);
  });

  it('explains a swap of an element with itself', () => {
    const steps = quickSortSteps([1, 2]);
    assert.ok(steps.some((step) => step.caption.includes('dengan dirinya sendiri')));
  });

  for (const example of quickCases) {
    it(`keeps the invariants for the case "${example.label}"`, () => {
      checkInvariants(example.values);
    });
  }

  it('keeps the invariants for random data', () => {
    const random = seeded(11);
    for (let round = 0; round < 200; round++) {
      const length = 1 + Math.floor(random() * QUICK_RANDOM_LENGTH);
      checkInvariants(randomValues(length, 9, random));
    }
  });
});
