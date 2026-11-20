import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HANOI_LIMITS,
  PEGS,
  diskId,
  hanoiPseudocode,
  hanoiSteps,
  lessonHanoiDisks,
  validateHanoiDisks,
  type Peg,
} from './hanoi.ts';

/** The lesson's program, collecting its output lines. */
function reference(n: number, asal: Peg, tujuan: Peg, bantu: Peg, out: string[] = []): string[] {
  if (n === 0) return out;
  reference(n - 1, asal, bantu, tujuan, out);
  out.push(`cakram ${n}: ${asal} → ${tujuan}`);
  reference(n - 1, bantu, tujuan, asal, out);
  return out;
}

describe('hanoiSteps', () => {
  it('makes the same seven moves as the lesson output for 3 disks', () => {
    const steps = hanoiSteps(lessonHanoiDisks);
    const moves = steps.filter((step) => step.state.move !== null).map((step) => step.result);
    assert.deepEqual(moves, [
      'cakram 1: A → C',
      'cakram 2: A → B',
      'cakram 1: C → B',
      'cakram 3: A → C',
      'cakram 1: B → A',
      'cakram 2: B → C',
      'cakram 1: A → C',
    ]);
    // 1 start + 3 "clear the way" steps (hanoi(3) and both hanoi(2)) + 7 moves + 1 end.
    assert.equal(steps.length, 12);
  });

  for (let disks = HANOI_LIMITS.min; disks <= HANOI_LIMITS.max; disks++) {
    it(`keeps the invariants for ${disks} disks`, () => {
      const steps = hanoiSteps(disks);
      const lineIds = new Set(hanoiPseudocode.map((line) => line.id));
      const moveSteps = steps.filter((step) => step.state.move !== null);

      assert.equal(moveSteps.length, 2 ** disks - 1);
      assert.deepEqual(
        moveSteps.map((step) => step.result),
        reference(disks, 'A', 'C', 'B'),
      );

      steps.forEach((step, index) => {
        const { pegs, calls, move } = step.state;
        assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
        for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
        for (const id of Object.keys(step.highlights)) {
          assert.ok(PEGS.some((peg) => pegs[peg].some((disk) => diskId(disk) === id)), `step ${index} highlights a disk that exists`);
        }
        // Every disk is somewhere, exactly once, and no disk sits on a smaller one.
        const all = PEGS.flatMap((peg) => pegs[peg]).sort((a, b) => a - b);
        assert.deepEqual(all, Array.from({ length: disks }, (_, i) => i + 1));
        for (const peg of PEGS) {
          pegs[peg].forEach((disk, i) => {
            if (i > 0) assert.ok(disk < pegs[peg][i - 1], `disk ${disk} is not on a smaller disk`);
          });
        }
        // Each move takes the top disk of one peg to the top of another.
        if (move) {
          const before = steps[index - 1].state.pegs;
          assert.equal(before[move.from].at(-1), move.disk);
          assert.equal(pegs[move.to].at(-1), move.disk);
          assert.equal(step.state.moves, steps[index - 1].state.moves + 1);
        } else if (index > 0) {
          assert.deepEqual(pegs, steps[index - 1].state.pegs, 'only move steps change the pegs');
        }
        // Each nested call has one disk fewer and the right roles for its pegs.
        calls.forEach((call, depth) => {
          assert.equal(call.n, disks - depth);
          assert.equal(new Set([call.asal, call.tujuan, call.bantu]).size, 3);
        });
        if (move) assert.equal(calls.at(-1)?.n, move.disk, 'disk k is moved by hanoi(k, ...)');
      });

      const last = steps.at(-1)!.state;
      assert.deepEqual(last.pegs.C, Array.from({ length: disks }, (_, i) => disks - i));
      assert.equal(last.calls.length, 0);
    });
  }
});

describe('validateHanoiDisks', () => {
  it('accepts the picker range and rejects the rest', () => {
    assert.equal(validateHanoiDisks(1), null);
    assert.equal(validateHanoiDisks(4), null);
    assert.notEqual(validateHanoiDisks(0), null);
    assert.notEqual(validateHanoiDisks(5), null);
  });
});
