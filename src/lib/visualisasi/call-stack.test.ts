import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FAKTORIAL_LIMITS,
  faktorial,
  faktorialPseudocode,
  faktorialSteps,
  lessonFaktorialN,
  validateFaktorialN,
  type CallStackStep,
} from './call-stack.ts';

const ns = (step: CallStackStep) => step.state.frames.map((frame) => frame.n);

describe('faktorialSteps', () => {
  it('follows the trace of faktorial(4) in the lesson', () => {
    const steps = faktorialSteps(lessonFaktorialN);
    assert.equal(steps.length, 11);
    // Stack height over time: grows to main + 5 frames, then shrinks back to main.
    assert.deepEqual(
      steps.map((step) => step.state.frames.length),
      [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
    );
    assert.deepEqual(ns(steps[5]), [null, 4, 3, 2, 1, 0], 'five n values live at once while faktorial(0) runs');
    // The first multiplication that is actually computed belongs to faktorial(1).
    assert.equal(steps[6].state.frames.at(-1)?.note, '1 * 1 = 1');
    assert.equal(steps[9].state.frames.at(-1)?.note, '4 * 6 = 24');
    assert.equal(steps.at(-1)?.result, 'faktorial(4) = 24');
  });

  for (let n = FAKTORIAL_LIMITS.min; n <= FAKTORIAL_LIMITS.max; n++) {
    it(`keeps the invariants for n = ${n}`, () => {
      const steps = faktorialSteps(n);
      const lineIds = new Set(faktorialPseudocode.map((line) => line.id));
      assert.equal(steps.length, 2 * n + 3);

      steps.forEach((step, index) => {
        const { frames } = step.state;
        assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
        assert.ok(!step.caption.includes('**'), 'captions only support backticks');
        assert.equal(step.status, 'normal');
        assert.equal(frames[0].id, 'main', 'main is always at the bottom');
        assert.equal(new Set(frames.map((frame) => frame.id)).size, frames.length, 'frame ids are unique');
        for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
        for (const id of Object.keys(step.highlights)) {
          assert.ok(frames.some((frame) => frame.id === id), `step ${index} highlights a frame that exists`);
        }
        // Frames above main hold n, n - 1, ..., counting down by one.
        frames.slice(1).forEach((frame, depth) => assert.equal(frame.n, n - depth));
        // Only the top frame runs; everything below it is waiting.
        const top = frames.at(-1)!;
        assert.ok(step.highlights[top.id] === 'aktif' || step.highlights[top.id] === 'selesai');
        for (const frame of frames.slice(0, -1)) assert.equal(step.highlights[frame.id], 'khusus');
        if (index > 0) {
          const change = frames.length - steps[index - 1].state.frames.length;
          assert.ok(change === 1 || change === -1, 'one push or one pop per step');
        }
      });

      // Every result on the way up is the real factorial.
      for (const step of steps) {
        const match = /^faktorial\((\d+)\) = (\d+)$/.exec(step.result ?? '');
        if (match) assert.equal(Number(match[2]), faktorial(Number(match[1])));
      }
      assert.equal(steps.at(-1)?.result, `faktorial(${n}) = ${faktorial(n)}`);
      assert.equal(steps.at(-1)?.state.phase, 'selesai');
    });
  }
});

describe('validateFaktorialN', () => {
  it('accepts the picker range and rejects the rest', () => {
    assert.equal(validateFaktorialN(0), null);
    assert.equal(validateFaktorialN(5), null);
    assert.notEqual(validateFaktorialN(6), null);
    assert.notEqual(validateFaktorialN(-1), null);
    assert.notEqual(validateFaktorialN(2.5), null);
    assert.notEqual(validateFaktorialN(Number.NaN), null);
  });
});
