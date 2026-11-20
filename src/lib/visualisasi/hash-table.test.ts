import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HASH_BUCKETS,
  HASH_LIMITS,
  bucketId,
  hashMainan,
  hashPseudocode,
  hashTableSteps,
  lessonHashOperations,
  parseHashKey,
  parseHashOperations,
  parseHashValue,
  randomHashOperations,
  validateHashOperations,
  type HashOperation,
  type HashTableStep,
} from './hash-table.ts';

/** Plain reference: the lesson's hash function and `tambah`/`cari`/`hapus` written directly. */
function referenceHash(key: string) {
  let total = 0;
  for (const letter of key) total += letter.charCodeAt(0);
  return total % 10;
}

function reference(operations: HashOperation[]) {
  const buckets: [string, number][][] = Array.from({ length: 10 }, () => []);
  const results: string[] = [];
  for (const operation of operations) {
    const i = referenceHash(operation.key);
    const j = buckets[i].findIndex(([key]) => key === operation.key);
    if (operation.type === 'tambah') {
      if (j !== -1) {
        results.push(`${operation.key}: ${buckets[i][j][1]} → ${operation.value}`);
        buckets[i][j][1] = operation.value;
      } else {
        buckets[i].push([operation.key, operation.value]);
        results.push(`${operation.key}:${operation.value} → loker ${i}`);
      }
    } else if (operation.type === 'cari') {
      results.push(j === -1 ? '✗ tidak ditemukan' : `${operation.key} → ${buckets[i][j][1]}`);
    } else {
      results.push(j === -1 ? `✗ ${operation.key} tidak ada` : `${operation.key} dihapus`);
      if (j !== -1) buckets[i].splice(j, 1);
    }
  }
  return { buckets, results };
}

const entries = (step: HashTableStep) => step.state.buckets.map((chain) => chain.map((entry) => [entry.key, entry.value]));
const stepsOf = (steps: HashTableStep[], operation: number) => steps.filter((step) => step.state.operation === operation);

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function assertInvariants(operations: HashOperation[]) {
  const steps = hashTableSteps(operations);
  const { buckets, results } = reference(operations);
  const lineIds = new Set(hashPseudocode.map((line) => line.id));

  assert.deepEqual(entries(steps[steps.length - 1]), buckets, 'final lockers match the reference');

  steps.forEach((step, index) => {
    assert.equal(step.state.buckets.length, HASH_BUCKETS);
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.equal(step.caption.split('`').length % 2, 1, `step ${index} has balanced backticks`);
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    const elementIds = new Set([
      ...step.state.buckets.map((_, i) => bucketId(i)),
      ...step.state.buckets.flat().map((entry) => entry.id),
    ]);
    for (const id of Object.keys(step.highlights)) assert.ok(elementIds.has(id), `step ${index} highlights ${id}, which exists`);
    // Every key sits in the locker its hash points to, and appears only once.
    step.state.buckets.forEach((chain, bucket) => {
      for (const entry of chain) assert.equal(referenceHash(entry.key), bucket, `${entry.key} is in locker ${bucket}`);
    });
    const all = step.state.buckets.flat().map((entry) => entry.key);
    assert.equal(new Set(all).size, all.length, 'no key is stored twice');
    assert.equal(step.status, 'normal');
    if (step.state.computation) {
      assert.equal(step.state.computation.key, operations[step.state.operation!].key);
      assert.equal(step.highlights[bucketId(step.state.computation.bucket)], 'khusus', 'the target locker is highlighted');
    }
  });

  // Each operation ends with the reference result, and operations run in order.
  operations.forEach((_, i) => {
    const own = stepsOf(steps, i);
    assert.ok(own.length > 0, `operation ${i} has steps`);
    assert.equal(own.at(-1)!.result, results[i], `result of operation ${i}`);
    assert.match(own[0].caption, /`hashMainan\("[a-z]+"\) = \d+ % 10 = \d`/, 'the first step shows the hash');
  });
  const order = steps.map((step) => step.state.operation ?? -1);
  assert.deepEqual(order, [...order].sort((a, b) => a - b), 'operations run left to right');

  // An entry keeps its id and key while it stays in the table.
  const ids = new Map<string, string>();
  for (const step of steps) {
    for (const entry of step.state.buckets.flat()) {
      if (ids.has(entry.id)) assert.equal(ids.get(entry.id), entry.key);
      ids.set(entry.id, entry.key);
    }
  }
  return steps;
}

describe('hashMainan', () => {
  it('matches the locker table in the lessons', () => {
    const table: [string, number, number][] = [
      ['budi', 420, 0],
      ['citra', 531, 1],
      ['andi', 412, 2],
      ['dina', 412, 2],
      ['dodi', 416, 6],
      ['eko', 319, 9],
    ];
    for (const [key, total, bucket] of table) {
      const computation = hashMainan(key);
      assert.equal(computation.total, total, key);
      assert.equal(computation.bucket, bucket, key);
      assert.equal(computation.codes.length, key.length);
      assert.equal(computation.bucket, referenceHash(key));
    }
  });
});

describe('hashTableSteps', () => {
  it('follows the lesson: five names, a collision, a hit, a miss and a removal', () => {
    const steps = assertInvariants(lessonHashOperations);
    assert.deepEqual(entries(steps[steps.length - 1]), [
      [['budi', 21]],
      [['citra', 20]],
      [['dina', 22]],
      [],
      [],
      [],
      [['dodi', 18]],
      [],
      [],
      [],
    ]);

    assert.match(steps[1].caption, /`hashMainan\("budi"\) = 420 % 10 = 0`/);
    assert.match(steps[1].caption, /`budi:21` langsung masuk/);
    // dina collides with andi: open locker 2, compare with andi, then line up behind it.
    const dina = stepsOf(steps, 3);
    assert.equal(dina.length, 3);
    assert.match(dina[0].caption, /`hashMainan\("dina"\) = 412 % 10 = 2`/);
    assert.match(dina[1].caption, /`dina` dengan `andi`: bukan/);
    assert.match(dina[2].caption, /tabrakan \(collision\)/);
    assert.deepEqual(entries(dina[2])[2], [
      ['andi', 19],
      ['dina', 22],
    ]);

    const search = stepsOf(steps, 5);
    assert.equal(search.length, 3, 'open locker 2, compare andi, compare dina');
    assert.match(search[2].caption, /Setelah 2 perbandingan, `cari` mengembalikan nilainya, yaitu 22/);
    assert.equal(search[2].result, 'dina → 22');
    assert.equal(search[2].highlights[search[2].state.buckets[2][1].id], 'selesai');

    const miss = stepsOf(steps, 6);
    assert.equal(miss.length, 1, 'locker 9 is empty: no comparison at all');
    assert.match(miss[0].caption, /`hashMainan\("eko"\) = 319 % 10 = 9`/);
    assert.match(miss[0].caption, /Loker 9 kosong/);
    assert.equal(miss[0].result, '✗ tidak ditemukan');

    const removal = stepsOf(steps, 7);
    assert.equal(removal.length, 3);
    assert.equal(removal[1].highlights[removal[1].state.buckets[2][0].id], 'dibuang', 'andi is marked before it leaves');
    assert.match(removal[2].caption, /maju/);
    assert.match(steps[steps.length - 1].caption, /Semua operasi selesai/);
  });

  it('replaces the value when a key is added again, keeping a single entry', () => {
    const steps = assertInvariants([
      ...lessonHashOperations.slice(0, 5),
      { type: 'tambah', key: 'budi', value: 22 },
      { type: 'tambah', key: 'dina', value: 23 },
      { type: 'tambah', key: 'dina', value: 23 },
      { type: 'cari', key: 'dina' },
    ]);
    const budi = stepsOf(steps, 5);
    assert.equal(budi.length, 3, 'open locker 0, find budi, replace the value');
    assert.equal(budi.at(-1)!.result, 'budi: 21 → 22');
    assert.match(budi.at(-1)!.caption, /diganti dari 21 menjadi 22/);
    assert.equal(budi[1].state.buckets[0][0].id, budi[2].state.buckets[0][0].id, 'same entry, updated in place');
    assert.deepEqual(entries(budi[2])[0], [['budi', 22]]);

    const dina = stepsOf(steps, 6);
    assert.equal(dina.length, 4, 'open, compare andi, find dina, replace');
    assert.deepEqual(entries(dina.at(-1)!)[2], [
      ['andi', 19],
      ['dina', 23],
    ]);
    assert.match(stepsOf(steps, 7).at(-1)!.caption, /kebetulan sama/);
    assert.equal(stepsOf(steps, 8).at(-1)!.result, 'dina → 23');
  });

  it('handles misses after comparisons, removals from empty lockers and an empty sequence', () => {
    const steps = assertInvariants([
      { type: 'hapus', key: 'eko' },
      { type: 'cari', key: 'budi' },
      { type: 'tambah', key: 'andi', value: 19 },
      { type: 'cari', key: 'dina' },
      { type: 'hapus', key: 'dina' },
      { type: 'hapus', key: 'andi' },
      { type: 'cari', key: 'andi' },
    ]);
    assert.match(steps[1].caption, /`false`/);
    assert.match(stepsOf(steps, 3).at(-1)!.caption, /sudah habis diperiksa/);
    assert.match(stepsOf(steps, 5).at(-1)!.caption, /Loker 2 sekarang kosong/);
    assert.match(assertInvariants([])[0].caption, /belum ada operasi/);
  });

  it('works for long chains, the maximum number of operations and random sequences', () => {
    // Anagrams of "andi" all land in locker 2.
    const sameLocker: HashOperation[] = ['andi', 'dina', 'nadi', 'inda', 'adin', 'dani'].map((key, i) => ({
      type: 'tambah',
      key,
      value: 20 + i,
    }));
    const operations: HashOperation[] = [
      ...sameLocker,
      ...['dani', 'inda', 'nida'].map((key) => ({ type: 'cari' as const, key })),
      { type: 'hapus', key: 'nadi' },
      { type: 'hapus', key: 'dani' },
      { type: 'hapus', key: 'nida' },
    ];
    assert.equal(operations.length, HASH_LIMITS.maxOperations);
    assert.equal(validateHashOperations(operations), null);
    const steps = assertInvariants(operations);
    assert.deepEqual(
      entries(steps[steps.length - 1])[2].map(([key]) => key),
      ['andi', 'dina', 'inda', 'adin'],
    );
    assert.equal(stepsOf(steps, 6).length, 7, 'finding the sixth key compares all six');
    for (let seed = 1; seed <= 200; seed++) assertInvariants(randomHashOperations(seeded(seed)));
  });

  it('is deterministic', () => {
    assert.deepEqual(hashTableSteps(lessonHashOperations), hashTableSteps(lessonHashOperations));
  });
});

describe('hash table input validation', () => {
  it('accepts lowercase keys of 1 to 8 letters and values from 0 to 999', () => {
    assert.deepEqual(parseHashKey(' dina '), { key: 'dina' });
    assert.deepEqual(parseHashKey('abcdefgh'), { key: 'abcdefgh' });
    assert.deepEqual(parseHashValue(' 22 '), { value: 22 });
    assert.deepEqual(parseHashValue('0'), { value: 0 });
    assert.deepEqual(parseHashValue('999'), { value: 999 });
  });

  it('rejects bad keys and values with a message', () => {
    for (const text of ['', ' ', 'Dina', 'abcdefghi', 'di na', 'eko1', 'é']) {
      const parsed = parseHashKey(text);
      assert.ok('error' in parsed && parsed.error.length > 0, `rejects key ${JSON.stringify(text)}`);
    }
    for (const text of ['', '-1', '1000', '2.5', 'dua']) {
      const parsed = parseHashValue(text);
      assert.ok('error' in parsed && parsed.error.length > 0, `rejects value ${JSON.stringify(text)}`);
    }
  });

  it('validates and parses operation lists written in MDX', () => {
    assert.deepEqual(
      parseHashOperations(
        'tambah(budi,21) tambah(citra,20) tambah(andi,19) tambah(dina,22) tambah(dodi,18) cari(dina) cari(eko) hapus(andi)',
      ),
      { operations: lessonHashOperations },
    );
    assert.deepEqual(parseHashOperations('tambah( budi , 21 ), cari(eko)'), {
      operations: [
        { type: 'tambah', key: 'budi', value: 21 },
        { type: 'cari', key: 'eko' },
      ],
    });
    assert.deepEqual(parseHashOperations(''), { operations: [] });
    const missingValue = parseHashOperations('tambah(budi)');
    assert.ok('error' in missingValue && /butuh kunci dan nilai/.test(missingValue.error));
    for (const text of ['tambah(budi,21) ubah(budi)', 'tambah(Budi,21)', 'tambah(budi,1000)', 'tambah(budi,-1)', 'cari', 'cari(dina,22)']) {
      assert.ok('error' in parseHashOperations(text), `rejects ${text}`);
    }
    assert.match(
      validateHashOperations(Array.from({ length: 13 }, () => ({ type: 'cari' as const, key: 'eko' }))) ?? '',
      /Maksimal 12/,
    );
  });
});
