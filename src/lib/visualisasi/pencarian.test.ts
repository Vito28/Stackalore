import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  batas,
  batasCases,
  batasPseudocode,
  batasSteps,
  binarySearchSteps,
  binerPseudocode,
  cariCases,
  lessonBatasData,
  lessonCariData,
  linearPseudocode,
  linearSearchSteps,
  type CariStep,
  type JenisBatas,
} from './pencarian.ts';
import type { PseudocodeLine } from './types.ts';

/** `mid` of every round, read from the steps that pick it. */
const mids = (steps: CariStep[]) =>
  steps.filter((step) => step.lines.includes('mid')).map((step) => step.state.pointers.find((p) => p.name === 'mid')!.index);

const pointer = (step: CariStep, name: string) => step.state.pointers.find((p) => p.name === name)?.index;

/** Reference binary search from the lesson, with the number of rounds. */
function cariBiner(data: number[], x: number) {
  let lo = 0;
  let hi = data.length - 1;
  let rounds = 0;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    rounds++;
    if (data[mid] === x) return { index: mid, rounds };
    if (data[mid] < x) lo = mid + 1;
    else hi = mid - 1;
  }
  return { index: -1, rounds };
}

function checkCommon(steps: CariStep[], lines: PseudocodeLine[], n: number) {
  const lineIds = new Set(lines.map((line) => line.id));
  steps.forEach((step, index) => {
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.ok(!step.caption.includes('**'), 'captions only support backticks');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
    const ids = new Set(step.state.items.map((item) => item.id));
    for (const id of Object.keys(step.highlights)) assert.ok(ids.has(id), `step ${index} highlights an element that exists`);
    for (const p of step.state.pointers) assert.ok(p.index >= -1 && p.index <= n, `pointer ${p.name} stays within -1..n`);
    if (index > 0) assert.ok(step.state.checks >= steps[index - 1].state.checks, 'the counter never goes down');
  });
  assert.ok(steps.at(-1)!.result, 'the last step has a result');
}

describe('binarySearchSteps', () => {
  it('follows the lesson trace for 47', () => {
    const steps = binarySearchSteps(lessonCariData, 47);
    assert.deepEqual(mids(steps), [4, 7, 5, 6]);
    assert.equal(steps.at(-1)!.result, 'indeks 6');
    assert.equal(steps.at(-1)!.state.checks, 4);
    assert.equal(steps.at(-1)!.highlights.i6, 'selesai');
    // After "31 < 47" indices 0..4 are crossed out and lo moves to 5.
    assert.equal(pointer(steps[2], 'lo'), 5);
    for (let index = 0; index <= 4; index++) assert.equal(steps[2].highlights[`i${index}`], 'dibuang');
  });

  it('follows the lesson trace for 20 and stops with lo at the insertion point', () => {
    const steps = binarySearchSteps(lessonCariData, 20);
    assert.deepEqual(mids(steps), [4, 1, 2, 3]);
    const last = steps.at(-1)!;
    assert.equal(last.result, '-1 (tidak ada)');
    assert.equal(pointer(last, 'lo'), 3);
    assert.equal(pointer(last, 'hi'), 2);
    assert.match(last.caption, /antara 18 dan 23/);
    assert.equal(last.status, 'normal');
  });

  it('explains the integer division once', () => {
    const steps = binarySearchSteps(lessonCariData, 47);
    assert.equal(steps.filter((step) => step.caption.includes('dibulatkan')).length, 1);
  });

  it('agrees with the reference for every target on sorted data', () => {
    const data = lessonCariData;
    for (let x = 0; x <= 80; x++) {
      const steps = binarySearchSteps(data, x);
      const expected = cariBiner(data, x);
      checkCommon(steps, binerPseudocode, data.length);
      assert.equal(steps.at(-1)!.state.checks, expected.rounds, `rounds for ${x}`);
      assert.equal(steps.at(-1)!.result, expected.index === -1 ? '-1 (tidak ada)' : `indeks ${expected.index}`);
      // Two steps per round (mid, decision) plus the start step.
      assert.equal(steps.length, 1 + 2 * expected.rounds + (expected.index === -1 ? 1 : 0));
    }
  });

  it('shows the wrong answer on unsorted data as an error', () => {
    const steps = binarySearchSteps([8, 3, 9, 1, 5], 3);
    const last = steps.at(-1)!;
    assert.equal(last.status, 'error');
    assert.equal(last.result, '-1 (salah!)');
    assert.equal(last.highlights.i1, 'error', '3 is at index 1 all along');
    assert.ok(steps.some((step) => step.caption.includes('menganggap')), 'unsorted data is not described as certain');
  });

  it('handles one element', () => {
    assert.equal(binarySearchSteps([7], 7).at(-1)!.result, 'indeks 0');
    const missing = binarySearchSteps([7], 9).at(-1)!;
    assert.equal(missing.result, '-1 (tidak ada)');
    assert.equal(pointer(missing, 'lo'), 1, 'lo may end just outside the data');
  });
});

describe('linearSearchSteps', () => {
  it('checks one element per step until it finds the target', () => {
    const steps = linearSearchSteps(lessonCariData, 47);
    assert.equal(steps.length, 1 + 7);
    assert.equal(steps.at(-1)!.state.checks, 7);
    assert.equal(steps.at(-1)!.result, 'indeks 6');
    checkCommon(steps, linearPseudocode, lessonCariData.length);
  });

  it('checks everything when the target is missing', () => {
    const steps = linearSearchSteps(lessonCariData, 20);
    assert.equal(steps.at(-1)!.state.checks, 10);
    assert.equal(steps.at(-1)!.result, '-1 (tidak ada)');
    assert.equal(pointer(steps.at(-1)!, 'i'), 10);
    checkCommon(steps, linearPseudocode, lessonCariData.length);
  });

  it('works on unsorted data', () => {
    const steps = linearSearchSteps([8, 3, 9, 1, 5], 3);
    assert.equal(steps.at(-1)!.result, 'indeks 1');
    assert.equal(steps.at(-1)!.status, 'normal');
  });
});

describe('cariCases', () => {
  it('counts checks per case: binary search wins except for the very first element', () => {
    const expected: Record<string, [number, number]> = {
      ada: [7, 4],
      'tidak-ada': [10, 4],
      'paling-kiri': [1, 3],
      'paling-kanan': [10, 4],
      'tidak-urut': [2, 2],
    };
    for (const kasus of cariCases) {
      const linear = linearSearchSteps(kasus.values, kasus.x).at(-1)!.state.checks;
      const biner = binarySearchSteps(kasus.values, kasus.x).at(-1)!.state.checks;
      assert.deepEqual([linear, biner], expected[kasus.id], kasus.id);
    }
  });
});

describe('batasSteps', () => {
  const lessonTable: [number, number, number][] = [
    [4, 1, 4],
    [5, 4, 4],
    [1, 0, 0],
    [10, 6, 6],
  ];

  it('matches the lesson table', () => {
    for (const [x, bawah, atas] of lessonTable) {
      assert.equal(batasSteps(lessonBatasData, x, 'bawah').at(-1)!.state.jawaban, bawah, `batasBawah(${x})`);
      assert.equal(batasSteps(lessonBatasData, x, 'atas').at(-1)!.state.jawaban, atas, `batasAtas(${x})`);
    }
    assert.deepEqual(
      batasCases.map((kasus) => kasus.x),
      lessonTable.map(([x]) => x),
    );
  });

  for (const jenis of ['bawah', 'atas'] as JenisBatas[]) {
    it(`agrees with a plain scan for every x (${jenis})`, () => {
      const datasets = [lessonBatasData, [1], [3, 3, 3], [1, 2, 3, 4, 5, 6, 7, 8]];
      for (const data of datasets) {
        for (let x = 0; x <= 10; x++) {
          const steps = batasSteps(data, x, jenis);
          const expected = batas(data, x, jenis);
          const last = steps.at(-1)!;
          assert.equal(last.state.jawaban, expected, `${jenis}(${x}) on ${data.join(' ')}`);
          assert.ok(last.result!.endsWith(`= ${expected}`));
          checkCommon(steps, batasPseudocode(jenis), data.length);
          // The candidate only ever moves left.
          steps.forEach((step, index) => {
            if (index > 0) assert.ok(step.state.jawaban <= steps[index - 1].state.jawaban);
            const marker = step.state.pointers.find((p) => p.name === 'jawaban');
            assert.equal(marker?.index, step.state.jawaban);
          });
          if (expected < data.length) assert.equal(last.highlights[`i${expected}`], 'selesai');
        }
      }
    });
  }

  it('explains the meaning of the answer', () => {
    assert.match(batasSteps(lessonBatasData, 4, 'bawah').at(-1)!.caption, /pertama kali muncul di indeks 1/);
    assert.match(batasSteps(lessonBatasData, 4, 'atas').at(-1)!.caption, /4 elemen yang `<= 4`/);
    assert.match(batasSteps(lessonBatasData, 10, 'bawah').at(-1)!.caption, /sesudah elemen terakhir/);
  });
});
