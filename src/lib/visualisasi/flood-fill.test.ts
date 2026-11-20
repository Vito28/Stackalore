import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { floodCases, floodFillSteps, floodPseudocode, type FloodStep } from './flood-fill.ts';
import { DIRECTIONS, cellId, parseGrid } from './grid.ts';

const rowsOf = (id: string) => floodCases.find((item) => item.id === id)!.rows;

/** The lesson program: visit order of `isi` and the room of every cell. */
function reference(rows: readonly string[]) {
  const grid = parseGrid(rows);
  const room: Record<string, number> = {};
  const order: string[] = [];
  let rooms = 0;
  const isi = (i: number, j: number) => {
    if (i < 0 || i >= grid.rows || j < 0 || j >= grid.cols) return;
    if (grid.text[i][j] === '#' || cellId(i, j) in room) return;
    room[cellId(i, j)] = rooms;
    order.push(cellId(i, j));
    for (const d of DIRECTIONS) isi(i + d.dr, j + d.dc);
  };
  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.cols; j++) {
      if (grid.text[i][j] === '.' && !(cellId(i, j) in room)) {
        rooms++;
        isi(i, j);
      }
    }
  }
  return { room, order, rooms };
}

/** The cell each fill step adds, in step order. */
const fillOrder = (steps: FloodStep[]) =>
  steps.filter((step) => step.lines.includes('tandai')).map((step) => step.state.stack.at(-1)!);

const adjacent = (a: string, b: string) => {
  const [ar, ac] = a.slice(1).split('c').map(Number);
  const [br, bc] = b.slice(1).split('c').map(Number);
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
};

describe('floodFillSteps', () => {
  it('counts the 3 rooms of the lesson floor plan', () => {
    const steps = floodFillSteps(rowsOf('materi'));
    const last = steps.at(-1)!;
    assert.equal(last.state.rooms, 3);
    assert.equal(last.result, '3 ruangan');
    assert.match(last.caption, /10, 17 dan 6 sel/);
    // start + 3 new rooms + 33 filled cells + 3 rooms done + final.
    assert.equal(steps.length, 1 + 3 + 33 + 3 + 1);
    // The door at (2, 6) joins the top right and bottom right rooms.
    assert.equal(last.state.room[cellId(0, 6)], last.state.room[cellId(4, 8)]);
    assert.equal(last.state.room[cellId(2, 6)], 2);
  });

  it('finds 4 rooms once the door is closed', () => {
    const last = floodFillSteps(rowsOf('pintu-tertutup')).at(-1)!;
    assert.equal(last.state.rooms, 4);
    assert.notEqual(last.state.room[cellId(0, 6)], last.state.room[cellId(4, 8)]);
  });

  it('finds 1 room in the open plan', () => {
    const last = floodFillSteps(rowsOf('satu-ruangan')).at(-1)!;
    assert.equal(last.state.rooms, 1);
    assert.equal(Object.keys(last.state.room).length, 39);
  });

  for (const kasus of floodCases) {
    it(`follows the lesson program and keeps the invariants (${kasus.id})`, () => {
      const steps = floodFillSteps(kasus.rows);
      const expected = reference(kasus.rows);
      const lineIds = new Set(floodPseudocode.map((line) => line.id));
      const grid = parseGrid(kasus.rows);

      assert.deepEqual(fillOrder(steps), expected.order, 'cells are filled in the order isi reaches them');
      assert.deepEqual(steps.at(-1)!.state.room, expected.room);
      assert.equal(steps.at(-1)!.state.rooms, expected.rooms);

      steps.forEach((step, index) => {
        const { stack, room } = step.state;
        assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
        assert.ok(!step.caption.includes('**'), 'captions only support backticks');
        for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
        for (const id of Object.keys(step.highlights)) {
          const [r, c] = id.slice(1).split('c').map(Number);
          assert.notEqual(grid.text[r][c], '#', 'only floor cells are highlighted');
        }
        // The call stack is a path of neighbouring cells, all filled.
        for (let depth = 1; depth < stack.length; depth++) assert.ok(adjacent(stack[depth - 1], stack[depth]));
        for (const id of stack) assert.ok(id in room);
        if (stack.length > 0) assert.equal(step.highlights[stack.at(-1)!], 'aktif');
        for (const id of stack.slice(0, -1)) assert.equal(step.highlights[id], 'khusus');
        if (index > 0) {
          const before = Object.keys(steps[index - 1].state.room).length;
          const added = Object.keys(room).length - before;
          assert.ok(added === 0 || added === 1, 'at most one cell is filled per step');
        }
      });
    });
  }

  it('explains calls that return at once in the first captions only', () => {
    const steps = floodFillSteps(rowsOf('materi'));
    const fills = steps.filter((step) => step.lines.includes('tandai'));
    assert.match(fills[0].caption, /atas, bawah, kiri, kanan/);
    assert.ok(fills.slice(0, 4).some((step) => step.caption.includes('langsung kembali')));
    assert.ok(fills.slice(4).every((step) => !step.caption.includes('langsung kembali')));
    assert.ok(fills.some((step) => step.caption.includes('rekursi kembali')), 'backtracking is described');
  });
});
