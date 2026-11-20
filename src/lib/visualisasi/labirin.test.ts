import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DIRECTIONS, cellId, findChar, parseGrid } from './grid.ts';
import { bfsDistances, labirinCases, labirinPseudocode, labirinSteps, shortestRoute } from './labirin.ts';

const rowsOf = (id: string) => labirinCases.find((item) => item.id === id)!.rows;

/** The dist table printed in the lesson, `#` for walls. */
const lessonDist = [
  '0 1 2 # 8 9 10',
  '1 # 3 # 7 # 11',
  '2 # 4 5 6 # 12',
  '3 # # # # 14 13',
  '4 5 6 # 16 15 14',
];

describe('labirinSteps', () => {
  it('reproduces the lesson dist table and answer 14', () => {
    const steps = labirinSteps(rowsOf('materi'));
    const { dist } = steps.at(-1)!.state;
    lessonDist.forEach((line, r) => {
      line.split(' ').forEach((cell, c) => {
        if (cell === '#') assert.ok(!(cellId(r, c) in dist));
        else assert.equal(dist[cellId(r, c)], Number(cell), `dist (${r}, ${c})`);
      });
    });
    const answer = steps.find((step) => step.result?.startsWith('dist[E]'))!;
    assert.equal(answer.result, 'dist[E] = 14');
    // start + 24 cells taken from the queue + answer + route.
    assert.equal(steps.length, 1 + 24 + 1 + 1);
    assert.equal(steps.at(-1)!.state.route.length, 15, 'a route of 14 moves visits 15 cells');
  });

  it('says -1 when E cannot be reached', () => {
    const steps = labirinSteps(rowsOf('buntu'));
    const last = steps.at(-1)!;
    assert.equal(last.result, 'dist[E] = -1');
    assert.ok(!(last.state.end in last.state.dist));
    assert.equal(last.state.route.length, 0);
    assert.equal(steps.length, 1 + 17 + 1);
  });

  it('spreads as a diamond without walls', () => {
    const steps = labirinSteps(rowsOf('terbuka'));
    const { dist } = steps.at(-1)!.state;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) assert.equal(dist[cellId(r, c)], r + c);
    assert.ok(steps.some((step) => step.result === 'dist[E] = 10'));
  });

  for (const kasus of labirinCases) {
    it(`keeps the BFS invariants (${kasus.id})`, () => {
      const steps = labirinSteps(kasus.rows);
      const grid = parseGrid(kasus.rows);
      const expected = bfsDistances(grid, findChar(grid, 'S')!);
      const lineIds = new Set(labirinPseudocode.map((line) => line.id));
      const popped: string[] = [];

      steps.forEach((step, index) => {
        const { queue, dist, current } = step.state;
        assert.ok(step.caption.trim().length > 0);
        assert.ok(!step.caption.includes('**'));
        for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to line ${id}`);
        for (const id of Object.keys(step.highlights)) {
          const [r, c] = id.slice(1).split('c').map(Number);
          assert.notEqual(grid.text[r][c], '#');
        }
        // Distances in the queue never decrease and differ by at most one.
        const ds = queue.map((id) => dist[id]);
        for (let k = 1; k < ds.length; k++) assert.ok(ds[k] === ds[k - 1] || ds[k] === ds[k - 1] + 1);
        if (ds.length > 0) assert.ok(ds.at(-1)! - ds[0] <= 1);
        for (const [id, value] of Object.entries(dist)) assert.equal(value, expected[id], 'a distance never changes once set');
        if (current) {
          assert.equal(current, steps[index - 1].state.queue[0], 'the processed cell was at the front');
          assert.equal(step.highlights[current], 'aktif');
          popped.push(current);
        }
        for (const id of queue) assert.equal(step.highlights[id], 'khusus');
      });

      assert.deepEqual(new Set(popped), new Set(Object.keys(expected)), 'every reachable cell is processed once');
      assert.equal(popped.length, Object.keys(expected).length);

      const route = steps.at(-1)!.state.route;
      if (route.length > 0) {
        assert.equal(route[0], steps.at(-1)!.state.start);
        assert.equal(route.at(-1), steps.at(-1)!.state.end);
        route.forEach((id, k) => assert.equal(expected[id], k));
      }
    });
  }

  it('walks back atas, bawah, kiri, kanan first when several neighbours qualify', () => {
    const grid = parseGrid(rowsOf('terbuka'));
    const dist = bfsDistances(grid, { r: 0, c: 0 });
    const route = shortestRoute(grid, dist, cellId(4, 6));
    // From E it keeps going up (atas) until row 0, then left.
    assert.deepEqual(route.slice(-5), [cellId(0, 6), cellId(1, 6), cellId(2, 6), cellId(3, 6), cellId(4, 6)]);
    assert.equal(DIRECTIONS[0].name, 'atas');
  });
});
