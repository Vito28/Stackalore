import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { randomValues } from './array.ts';
import {
  ALGORITMA_URUT,
  URUT_LIMITS,
  lessonUrutData,
  sortedCopy,
  urutCases,
  urutPseudocode,
  urutSteps,
  validateUrutValues,
  type AlgoritmaUrut,
  type UrutStep,
} from './pengurutan.ts';

/** Values in the row, with the lifted key put back into its slot. */
const row = (step: UrutStep) => {
  const values = step.state.items.map((item) => item?.value ?? null);
  const { floating } = step.state;
  if (floating) values[floating.index] = floating.item.value;
  return values;
};

const joined = (step: UrutStep) => row(step).join(' ');
const last = (steps: UrutStep[]) => steps[steps.length - 1];

/** Deterministic pseudo-random numbers so failures are reproducible. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function checkInvariants(algoritma: AlgoritmaUrut, values: number[]) {
  const steps = urutSteps(algoritma, values);
  const lineIds = new Set(urutPseudocode[algoritma].map((line) => line.id));
  const ids = values.map((_, index) => `e${index}`);
  const sortedValues = sortedCopy(values);

  steps.forEach((step, index) => {
    const { items, floating, pointers, brackets, comparisons, moves } = step.state;
    const where = `${algoritma} [${values.join(' ')}] step ${index}`;
    assert.equal(items.length, values.length, `${where}: length`);
    assert.ok(step.caption.trim().length > 0, `${where}: caption`);
    assert.ok(!step.caption.includes('**'), `${where}: captions only support backticks`);
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `${where}: line ${id}`);

    // Every element is on screen exactly once: in the row or lifted above it.
    const present = items.filter((item) => item !== null).map((item) => item!.id);
    if (floating) present.push(floating.item.id);
    assert.deepEqual([...present].sort(), [...ids].sort(), `${where}: ids`);
    const gaps = items.filter((item) => item === null).length;
    assert.equal(gaps, floating ? 1 : 0, `${where}: one gap only while the key is lifted`);
    if (floating) assert.equal(items[floating.index], null, `${where}: the key hangs over the gap`);
    assert.deepEqual(
      row(step).map(Number).sort((a, b) => a - b),
      sortedValues,
      `${where}: same multiset`,
    );

    for (const id of Object.keys(step.highlights)) assert.ok(ids.includes(id), `${where}: highlight ${id}`);
    for (const pointer of pointers) {
      assert.ok(pointer.index >= 0 && pointer.index < values.length, `${where}: pointer ${pointer.name} inside the row`);
    }
    for (const bracket of brackets) assert.ok(bracket.from >= 0 && bracket.to < values.length);

    if (index > 0) {
      const before = steps[index - 1].state;
      assert.ok(comparisons >= before.comparisons && comparisons - before.comparisons <= 1, `${where}: one comparison per step at most`);
      assert.ok(moves >= before.moves && moves - before.moves <= 1, `${where}: one move per step at most`);
    }
  });

  const end = last(steps);
  assert.deepEqual(row(end), sortedValues, `${algoritma} [${values.join(' ')}]: sorted at the end`);
  for (const id of ids) assert.equal(end.highlights[id], 'selesai');
  assert.equal(end.result, sortedValues.join(' '));
  assert.match(end.caption, new RegExp(`${end.state.comparisons} perbandingan`));
  return steps;
}

describe('bubble sort', () => {
  const steps = urutSteps('bubble', lessonUrutData);

  it('follows the first pass in the lesson', () => {
    const compares = steps.filter((step) => step.state.pointers.some((pointer) => pointer.name === 'j'));
    assert.deepEqual(
      compares.slice(0, 5).map(joined),
      ['4 9 2 7 5 8', '4 2 9 7 5 8', '4 2 7 9 5 8', '4 2 7 5 9 8', '4 2 7 5 8 9'],
    );
    assert.deepEqual(
      compares.slice(0, 5).map((step) => step.lines.includes('tukar')),
      [false, true, true, true, true],
    );
  });

  it('matches the pass table and stops early after pass 3', () => {
    const passEnds = steps.filter((step) => step.lines.includes('cekTukar'));
    assert.deepEqual(passEnds.map(joined), ['4 2 7 5 8 9', '2 4 5 7 8 9', '2 4 5 7 8 9']);
    assert.ok(passEnds[2].lines.includes('berhenti'));
    assert.equal(last(steps).state.comparisons, 12);
    assert.equal(last(steps).state.moves, 6);
    // 9 is final after pass 1, 8 and 9 after pass 2.
    assert.equal(passEnds[0].highlights.e1, 'selesai');
    assert.equal(Object.values(passEnds[1].highlights).filter((role) => role === 'selesai').length, 2);
  });
});

describe('selection sort', () => {
  const steps = urutSteps('selection', lessonUrutData);

  it('matches every row of the lesson table', () => {
    const rounds = steps.filter((step) => step.lines.includes('cekTukar'));
    assert.deepEqual(rounds.map(joined), ['2 9 4 7 5 8', '2 4 9 7 5 8', '2 4 5 7 9 8', '2 4 5 7 9 8', '2 4 5 7 8 9']);
    assert.deepEqual(
      rounds.map((step) => step.state.pointers.find((pointer) => pointer.name === 'terkecil')?.index),
      [2, 2, 4, 3, 5],
    );
    assert.deepEqual(
      rounds.map((step) => step.lines.includes('tukar')),
      [true, true, true, false, true],
    );
    assert.equal(last(steps).state.comparisons, 15);
    assert.equal(last(steps).state.moves, 4);
  });
});

describe('insertion sort', () => {
  const steps = urutSteps('insertion', lessonUrutData);

  it('matches every row of the lesson table', () => {
    const drops = steps.filter((step) => step.lines.includes('taruh'));
    assert.deepEqual(drops.map(joined), ['4 9 2 7 5 8', '2 4 9 7 5 8', '2 4 7 9 5 8', '2 4 5 7 9 8', '2 4 5 7 8 9']);
    const lifts = steps.filter((step) => step.lines.includes('ambil'));
    assert.deepEqual(
      lifts.map((step) => step.state.floating?.item.value),
      [9, 2, 7, 5, 8],
    );
    // Shifted values per key: none; 9, 4; 9; 9, 7; 9.
    const shiftsPerKey = lifts.map((lift) => {
      const start = steps.indexOf(lift);
      const end = steps.findIndex((step, index) => index > start && step.lines.includes('taruh'));
      return steps
        .slice(start + 1, end)
        .filter((step) => step.lines.includes('geser'))
        .map((step) => {
          const id = Object.keys(step.highlights).find((key) => step.highlights[key] === 'aktif')!;
          return step.state.items.find((item) => item?.id === id)?.value;
        });
    });
    assert.deepEqual(shiftsPerKey, [[], [9, 4], [9], [9, 7], [9]]);
    assert.equal(last(steps).state.comparisons, 10);
    assert.equal(last(steps).state.moves, 6);
  });

  it('stops at j = -1 without reading data[-1]', () => {
    const stop = steps.find((step) => step.result === 'berhenti: j < 0');
    assert.ok(stop, 'key 2 runs off the left end');
    assert.equal(stop.state.pointers.length, 0);
  });
});

describe('every algorithm', () => {
  for (const algoritma of ALGORITMA_URUT) {
    for (const kasus of urutCases) {
      it(`${algoritma} keeps the invariants on "${kasus.label}"`, () => {
        checkInvariants(algoritma, kasus.values);
      });
    }

    it(`${algoritma} sorts 200 random arrays`, () => {
      const random = seeded(7 + algoritma.length);
      for (let round = 0; round < 200; round++) {
        const length = URUT_LIMITS.minLength + Math.floor(random() * (URUT_LIMITS.maxLength - URUT_LIMITS.minLength + 1));
        checkInvariants(algoritma, randomValues(length, 9, random));
      }
    });
  }

  it('matches the comparison table on sorted data', () => {
    const sorted = [1, 2, 3, 4, 5, 6];
    const n = sorted.length;
    const count = (algoritma: AlgoritmaUrut) => last(urutSteps(algoritma, sorted)).state;
    assert.deepEqual(count('bubble'), { ...count('bubble'), comparisons: n - 1, moves: 0 });
    assert.deepEqual(count('insertion'), { ...count('insertion'), comparisons: n - 1, moves: 0 });
    assert.deepEqual(count('selection'), { ...count('selection'), comparisons: (n * (n - 1)) / 2, moves: 0 });
  });

  it('does the most work on reversed data', () => {
    const reversed = [6, 5, 4, 3, 2, 1];
    const total = (6 * 5) / 2;
    for (const algoritma of ALGORITMA_URUT) {
      assert.equal(last(urutSteps(algoritma, reversed)).state.comparisons, total, algoritma);
    }
    assert.equal(last(urutSteps('bubble', reversed)).state.moves, total);
    assert.equal(last(urutSteps('insertion', reversed)).state.moves, total);
    assert.equal(last(urutSteps('selection', reversed)).state.moves, 3);
  });
});

describe('validateUrutValues', () => {
  it('accepts the cases and rejects bad data', () => {
    for (const kasus of urutCases) assert.equal(validateUrutValues(kasus.values), null);
    assert.match(validateUrutValues([5]) ?? '', /2 sampai 8/);
    assert.match(validateUrutValues([1, 2, 3, 4, 5, 6, 7, 8, 9]) ?? '', /2 sampai 8/);
    assert.match(validateUrutValues([1, 0]) ?? '', /1 sampai 99/);
    assert.match(validateUrutValues([1, 2.5]) ?? '', /bulat/);
    assert.match(validateUrutValues([1, 100]) ?? '', /1 sampai 99/);
  });
});
