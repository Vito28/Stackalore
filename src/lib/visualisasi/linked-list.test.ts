import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  LINKED_LIST_JENIS,
  LINKED_LIST_LIMITS,
  LINKED_LIST_OPERASI,
  isCircular,
  isDoubly,
  keepsTail,
  lessonLinkedListExamples,
  linkId,
  linkedListPseudocode,
  linkedListSteps,
  listValues,
  normalizeJenis,
  normalizeOperasi,
  parseLinkedListData,
  parseLinkedListValue,
  randomLinkedListInput,
  validateLinkedListInput,
  type LinkedListInput,
  type LinkedListJenis,
  type LinkedListOperasi,
  type LinkedListState,
  type LinkedListStep,
} from './linked-list.ts';

const allJenis = LINKED_LIST_JENIS.map((jenis) => jenis.id);
const allOperasi = LINKED_LIST_OPERASI.map((operasi) => operasi.id);

/** Plain reference: the same operations on an ordinary array. */
function reference({ operasi, data, nilai = 0 }: LinkedListInput): { list: number[]; result: string } {
  const text = (list: number[]) => `list: ${list.length ? list.join(' → ') : 'kosong'}`;
  switch (operasi) {
    case 'telusuri':
      return { list: data, result: `dicetak: ${data.length ? data.join(' ') : '(tidak ada)'}` };
    case 'depan':
      return { list: [nilai, ...data], result: text([nilai, ...data]) };
    case 'belakang':
      return { list: [...data, nilai], result: text([...data, nilai]) };
    case 'cari':
      return { list: data, result: `cariPosisi → ${data.indexOf(nilai)}` };
    case 'hapus': {
      const index = data.indexOf(nilai);
      if (index === -1) return { list: data, result: `${nilai} tidak ada` };
      const list = data.filter((_, i) => i !== index);
      return { list, result: text(list) };
    }
  }
}

const pointer = (state: LinkedListState, name: string) => state.pointers.find((p) => p.name === name);

/** The final list must be a well-formed list of its variant. */
function assertWellFormed(state: LinkedListState, jenis: LinkedListJenis) {
  const { nodes } = state;
  const head = pointer(state, 'head')!;
  assert.ok(head, 'head is always shown');
  assert.ok(nodes.every((node) => !node.terlepas), 'no node is left half-removed');
  assert.equal(head.target, nodes[0]?.id ?? null, 'head is the first node drawn');
  nodes.forEach((node, i) => {
    const next = nodes[i + 1]?.id ?? (isCircular(jenis) ? nodes[0].id : null);
    const prev = isDoubly(jenis) ? (nodes[i - 1]?.id ?? (isCircular(jenis) ? nodes[nodes.length - 1].id : null)) : null;
    assert.equal(node.next, next, `next of node ${i}`);
    assert.equal(node.prev, prev, `prev of node ${i}`);
  });
  const tail = pointer(state, 'tail');
  if (keepsTail(jenis)) assert.equal(tail?.target, nodes.at(-1)?.id ?? null, 'tail is the last node');
  else assert.equal(tail, undefined, `${jenis} keeps no tail`);
}

function assertInvariants(input: LinkedListInput): LinkedListStep[] {
  const steps = linkedListSteps(input);
  const lineIds = new Set(linkedListPseudocode(input.jenis, input.operasi).map((line) => line.id));
  const label = `${input.jenis} ${input.operasi} [${input.data.join(' ')}] ${input.nilai ?? ''}`;
  const { list, result } = reference(input);

  assert.ok(steps.length >= 2, `${label}: a starting step and at least one action`);
  assert.deepEqual(steps[0].lines, [], `${label}: the starting step runs nothing`);
  assert.deepEqual(
    steps[0].state.nodes.map((node) => node.value),
    input.data,
    `${label}: starts from the given data`,
  );

  const values = new Map<string, number>();
  steps.forEach((step, index) => {
    const where = `${label}, step ${index}`;
    const { state } = step;
    assert.equal(state.jenis, input.jenis);
    assert.equal(state.operasi, input.operasi);
    assert.equal(step.status, 'normal');
    assert.ok(step.caption.trim().length > 0, `${where}: caption`);
    assert.equal(step.caption.split('`').length % 2, 1, `${where}: balanced backticks`);
    for (const id of step.lines) assert.ok(lineIds.has(id), `${where}: line ${id} exists`);

    const ids = new Set(state.nodes.map((node) => node.id));
    assert.equal(ids.size, state.nodes.length, `${where}: node ids are unique`);
    for (const node of state.nodes) {
      if (values.has(node.id)) assert.equal(values.get(node.id), node.value, `${where}: a node keeps its value`);
      values.set(node.id, node.value);
      for (const target of [node.next, node.prev]) if (target !== null) assert.ok(ids.has(target), `${where}: links stay inside the list`);
      if (!isDoubly(input.jenis)) assert.equal(node.prev, null, `${where}: no prev in ${input.jenis}`);
    }
    const names = state.pointers.map((p) => p.name);
    assert.equal(new Set(names).size, names.length, `${where}: pointer names are unique`);
    for (const p of state.pointers) if (p.target !== null) assert.ok(ids.has(p.target), `${where}: ${p.name} points to a node`);

    const elements = new Set([
      ...ids,
      ...state.nodes.flatMap((node) => [
        ...(node.next !== null ? [linkId(node.id, 'next')] : []),
        ...(node.prev !== null ? [linkId(node.id, 'prev')] : []),
      ]),
    ]);
    for (const id of Object.keys(step.highlights)) assert.ok(elements.has(id), `${where}: highlight ${id} exists`);
  });

  const last = steps[steps.length - 1];
  assert.equal(last.result, result, `${label}: result matches the reference`);
  assert.deepEqual(listValues(last.state), list, `${label}: final list matches the reference`);
  assert.deepEqual(
    last.state.nodes.map((node) => node.value),
    list,
    `${label}: nodes are drawn in list order`,
  );
  assertWellFormed(last.state, input.jenis);
  return steps;
}

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe('linkedListSteps on the lesson examples (singly)', () => {
  const run = (operasi: LinkedListOperasi) =>
    assertInvariants({ jenis: 'singly', operasi, ...lessonLinkedListExamples[operasi] });

  it('telusuri 3 → 7 → 9 follows the trace table of cetak', () => {
    const steps = run('telusuri');
    assert.equal(steps.length, 6, 'start, p = head, three rounds, p = nullptr');
    const p = steps.map((step) => {
      const target = pointer(step.state, 'p')?.target;
      return target === undefined ? 'tidak ada' : target === null ? 'nullptr' : step.state.nodes.find((n) => n.id === target)!.value;
    });
    assert.deepEqual(p, ['tidak ada', 3, 3, 7, 9, 'nullptr']);
    assert.match(steps[2].caption, /cetak `3` dan spasi/);
    assert.match(steps[4].caption, /cetak `9` saja, karena `next`-nya `nullptr`/);
    assert.match(steps[5].caption, /putaran 4/);
  });

  it('tambah di depan 1 needs two steps whatever the length', () => {
    const steps = run('depan');
    assert.equal(steps.length, 3);
    assert.match(steps[1].caption, /`baru = new Node\{1, head\}`/);
    assert.equal(pointer(steps[1].state, 'head')!.target, steps[1].state.nodes[1].id, 'head has not moved yet');
    assert.equal(steps[1].highlights[linkId(steps[1].state.nodes[0].id, 'next')], 'aktif');
  });

  it('tambah di belakang 23 walks p to the last node first', () => {
    const steps = run('belakang');
    // start, new node, p = head, three moves, stop at 16, link.
    assert.equal(steps.length, 8);
    assert.match(steps[6].caption, /berhenti TEPAT di node terakhir, yaitu 16/);
    assert.match(steps[7].caption, /`tail`/, 'mentions the tail shortcut');
  });

  it('cari reports the position or -1', () => {
    assert.equal(run('cari').at(-1)!.result, 'cariPosisi → 2');
    const missing = assertInvariants({ jenis: 'singly', operasi: 'cari', data: [3, 7, 9], nilai: 5 });
    assert.equal(pointer(missing.at(-1)!.state, 'p')!.target, null, 'p walks off the end');
  });

  it('hapus 7 shows the bypass before the node disappears', () => {
    const steps = run('hapus');
    const bypass = steps.find((step) => step.state.nodes.some((node) => node.terlepas))!;
    assert.ok(bypass, 'there is a bypass step');
    const [three, seven, nine] = bypass.state.nodes;
    assert.equal(seven.terlepas, true);
    assert.equal(three.next, nine.id, '3 now skips 7');
    assert.equal(seven.next, nine.id, '7 still points to 9 until it is freed');
    assert.equal(bypass.highlights[seven.id], 'dibuang');
    assert.match(bypass.caption, /`prev->next = target->next`/);
    assert.match(steps.at(-1)!.caption, /`delete target`/);
    assert.match(steps.at(-1)!.caption, /Python/);
  });

  it('hapus distinguishes the head case and handles missing values and empty lists', () => {
    const head = assertInvariants({ jenis: 'singly', operasi: 'hapus', data: [3, 7, 9], nilai: 3 });
    assert.match(head[1].caption, /kasus 1/);
    assert.ok(head.some((step) => pointer(step.state, 'sisa')));
    const end = assertInvariants({ jenis: 'singly', operasi: 'hapus', data: [3, 7, 9], nilai: 9 });
    assert.equal(end.find((step) => step.state.nodes.some((n) => n.terlepas))!.state.nodes[1].next, null);
    const missing = assertInvariants({ jenis: 'singly', operasi: 'hapus', data: [3, 7, 9], nilai: 5 });
    assert.match(missing.at(-1)!.caption, /short-circuit/);
    const empty = assertInvariants({ jenis: 'singly', operasi: 'hapus', data: [], nilai: 5 });
    assert.equal(empty.length, 2);
  });
});

describe('linkedListSteps for every variant and operation', () => {
  const cases: Omit<LinkedListInput, 'jenis' | 'operasi'>[] = [
    { data: [3, 7, 9], nilai: 7 },
    { data: [3, 7, 9], nilai: 3 },
    { data: [3, 7, 9], nilai: 9 },
    { data: [3, 7, 9], nilai: 5 },
    { data: [], nilai: 4 },
    { data: [8], nilai: 8 },
    { data: [8], nilai: 2 },
    { data: [5, 5, 1, 5], nilai: 5 },
    { data: [4, 8, 15, 16, 23, 42, -7], nilai: 999 },
    { data: [4, 8, 15, 16, 23, 42, -7], nilai: -7 },
  ];

  for (const jenis of allJenis) {
    for (const operasi of allOperasi) {
      it(`${jenis}: ${operasi}`, () => {
        for (const data of cases) assertInvariants({ jenis, operasi, ...data });
        assertInvariants({ jenis, operasi, ...lessonLinkedListExamples[operasi] });
      });
    }
  }

  it('random inputs', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const random = seeded(seed);
      for (const jenis of allJenis) {
        for (const operasi of allOperasi) {
          const { data, nilai } = randomLinkedListInput(operasi, random);
          assert.equal(validateLinkedListInput({ jenis, operasi, data, nilai }), null);
          assertInvariants({ jenis, operasi, data, nilai });
        }
      }
    }
  });

  it('removes only the first occurrence of a duplicate', () => {
    for (const jenis of allJenis) {
      const steps = assertInvariants({ jenis, operasi: 'hapus', data: [5, 1, 5], nilai: 5 });
      const left = new Set(steps.at(-1)!.state.nodes.map((node) => node.id));
      const removed = steps[0].state.nodes.filter((node) => !left.has(node.id));
      assert.deepEqual(removed, [steps[0].state.nodes[0]], `${jenis}: only the first 5 goes`);
      assert.ok(
        steps.some((step) => step.highlights[removed[0].id] === 'dibuang'),
        `${jenis}: the node is marked before it disappears`,
      );
    }
  });

  it('circular traversal stops when p returns to head, not at nullptr', () => {
    for (const jenis of ['circular-singly', 'circular-doubly'] as const) {
      const steps = assertInvariants({ jenis, operasi: 'telusuri', data: [3, 7, 9] });
      const last = steps.at(-1)!;
      assert.equal(pointer(last.state, 'p')!.target, pointer(last.state, 'head')!.target);
      assert.match(last.caption, jenis === 'circular-singly' ? /`p == mulai`/ : /`p == head`/);
      assert.ok(steps.every((step) => step.state.nodes.every((node) => node.next !== null)), 'no nullptr anywhere');
    }
  });

  it('circular singly stores only tail, as in the deep dive: front and back differ only in the returned tail', () => {
    const front = assertInvariants({ jenis: 'circular-singly', operasi: 'depan', data: [3, 7, 9], nilai: 1 });
    const back = assertInvariants({ jenis: 'circular-singly', operasi: 'belakang', data: [3, 7, 9], nilai: 1 });
    assert.equal(front.length, back.length);
    assert.match(front[2].caption, /`baru->next = tail->next`/);
    assert.match(back[2].caption, /`baru->next = tail->next`/);
    assert.match(front.at(-1)!.caption, /mengembalikan `tail`/);
    assert.match(back.at(-1)!.caption, /mengembalikan `baru`/);
    const header = (operasi: LinkedListOperasi) => linkedListPseudocode('circular-singly', operasi)[0].text;
    assert.equal(header('depan'), 'tambahDepan(tail, x):');
    assert.equal(header('hapus'), 'hapusNilai(tail, x):');
    assert.equal(header('telusuri'), 'cetakDari(mulai):');
    // Removing the first node needs no separate head update: it is always tail->next.
    const first = assertInvariants({ jenis: 'circular-singly', operasi: 'hapus', data: [3, 7, 9], nilai: 3 });
    assert.ok(first.every((step) => !step.lines.includes('h-geser')));
    const single = assertInvariants({ jenis: 'circular-singly', operasi: 'hapus', data: [5], nilai: 5 });
    assert.ok(single.some((step) => /`p == prev`/.test(step.caption)));
  });

  it('doubly removal relinks both neighbours, and circular doubly finds the last node through head->prev', () => {
    const doubly = assertInvariants({ jenis: 'doubly', operasi: 'hapus', data: [3, 7, 9], nilai: 7 });
    const relinked = doubly.at(-2)!.state.nodes;
    assert.equal(relinked[0].next, relinked[2].id);
    assert.equal(relinked[2].prev, relinked[0].id);

    const circular = assertInvariants({ jenis: 'circular-doubly', operasi: 'belakang', data: [3, 7, 9], nilai: 1 });
    assert.ok(circular.some((step) => /`tail = head->prev`/.test(step.caption)));
    assert.ok(circular.every((step) => step.state.nodes.length <= 4));
  });

  it('is deterministic', () => {
    const input: LinkedListInput = { jenis: 'circular-doubly', operasi: 'hapus', data: [3, 7, 9], nilai: 3 };
    assert.deepEqual(linkedListSteps(input), linkedListSteps(input));
  });
});

describe('linked list input validation', () => {
  it('parses starting lists written in several ways', () => {
    assert.deepEqual(parseLinkedListData('3 7 9'), { data: [3, 7, 9] });
    assert.deepEqual(parseLinkedListData(' 3, 7 ,9 '), { data: [3, 7, 9] });
    assert.deepEqual(parseLinkedListData('3 → 7 -> 9'), { data: [3, 7, 9] });
    assert.deepEqual(parseLinkedListData(''), { data: [] });
    assert.deepEqual(parseLinkedListData('-99 999'), { data: [-99, 999] });
  });

  it('rejects bad lists and values with a message', () => {
    for (const text of ['1 2 3 4 5 6 7 8', '3 x 9', '3.5', '1000', '-100']) {
      const parsed = parseLinkedListData(text);
      assert.ok('error' in parsed && parsed.error.length > 0, `rejects list ${JSON.stringify(text)}`);
    }
    for (const text of ['', 'tujuh', '1e2', '1000']) {
      const parsed = parseLinkedListValue(text);
      assert.ok('error' in parsed && parsed.error.length > 0, `rejects value ${JSON.stringify(text)}`);
    }
  });

  it('validates whole inputs from MDX props', () => {
    assert.equal(validateLinkedListInput({ jenis: 'singly', operasi: 'telusuri', data: [3, 7, 9] }), null);
    assert.ok(validateLinkedListInput({ jenis: 'singly', operasi: 'depan', data: [3] }), 'needs a value');
    assert.ok(validateLinkedListInput({ jenis: 'singly', operasi: 'depan', data: [3], nilai: 1.5 }));
    assert.ok(
      validateLinkedListInput({ jenis: 'singly', operasi: 'telusuri', data: Array(LINKED_LIST_LIMITS.maxNodes + 1).fill(1) }),
    );
  });

  it('normalizes variant and operation names', () => {
    assert.equal(normalizeJenis('Circular doubly'), 'circular-doubly');
    assert.equal(normalizeJenis('circular_singly'), 'circular-singly');
    assert.equal(normalizeJenis('semua'), null);
    assert.equal(normalizeOperasi(' Hapus '), 'hapus');
    assert.equal(normalizeOperasi('sisip'), null);
  });
});
