import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TRIE_LIMITS,
  TRIE_ROOT,
  lessonTrieOperations,
  parseTrieOperations,
  parseTrieWord,
  randomTrieOperations,
  trieChildren,
  triePseudocode,
  trieSize,
  trieSteps,
  trieWords,
  validateTrieOperations,
  type TrieOperation,
  type TrieStep,
} from './trie.ts';

/** Plain reference: a set of words, prefix check by `startsWith`. */
function reference(operations: TrieOperation[]) {
  const words = new Set<string>();
  const results: (string | undefined)[] = [];
  for (const { type, word } of operations) {
    if (type === 'sisip') {
      results.push(words.has(word) ? `sisip(${word}) → sudah ada` : undefined);
      words.add(word);
    } else if (type === 'cari') {
      results.push(`cari(${word}) → ${words.has(word) ? 'ada' : 'tidak ada'}`);
    } else {
      results.push(`awalan(${word}) → ${[...words].some((stored) => stored.startsWith(word)) ? 'ada' : 'tidak ada'}`);
    }
  }
  return { words: [...words].sort(), results };
}

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const ops = (text: string) => {
  const parsed = parseTrieOperations(text);
  assert.ok('operations' in parsed, text);
  return parsed.operations;
};

function assertInvariants(operations: TrieOperation[]): TrieStep[] {
  const steps = trieSteps(operations);
  const { words, results } = reference(operations);
  const lineIds = new Set(triePseudocode.map((line) => line.id));
  const final = steps[steps.length - 1].state;

  assert.deepEqual(trieWords(final.nodes), words, 'stored words match a plain set');
  assert.equal(
    Object.keys(final.nodes).length,
    trieSize(operations.filter((operation) => operation.type === 'sisip').map((operation) => operation.word)),
    'one node per distinct prefix',
  );

  operations.forEach((operation, index) => {
    const own = steps.filter((step) => step.state.operation === index);
    const last = own[own.length - 1];
    assert.equal(last.result, results[index], `result of ${operation.type}(${operation.word})`);
    // One step per letter handled, plus a verdict for searches that reach the end.
    const handled = own.filter((step) => step.state.letter !== null && step.state.letter < operation.word.length).length;
    if (operation.type === 'sisip') assert.equal(own.length, operation.word.length);
    else assert.ok(own.length === handled || own.length === handled + 1);
  });

  steps.forEach((step, index) => {
    const { nodes, current, path, letter, missing } = step.state;
    assert.ok(step.caption.trim().length > 0, `step ${index} has a caption`);
    assert.equal(step.status, 'normal');
    for (const id of step.lines) assert.ok(lineIds.has(id), `step ${index} refers to existing line ${id}`);
    for (const id of Object.keys(step.highlights)) assert.ok(id in nodes, `step ${index} highlights a node that exists`);
    assert.ok(TRIE_ROOT in nodes, 'the root is always there');
    if (current !== null) {
      assert.ok(current in nodes);
      assert.equal(path[path.length - 1], current, 'p is the end of the path');
    }
    path.forEach((id, depth) => {
      assert.ok(id in nodes);
      if (depth === 0) assert.equal(id, TRIE_ROOT);
      else assert.equal(nodes[path[depth - 1]].children[nodes[id].letter], id, 'the path follows edges');
    });
    if (missing) {
      assert.ok(!(missing.letter in nodes[missing.from].children), 'the missing letter really is missing');
      assert.equal(missing.from, current);
    }
    if (letter !== null && step.state.operation !== null) {
      const word = operations[step.state.operation].word;
      assert.ok(letter >= 0 && letter <= word.length);
      if (letter < word.length && !missing) assert.equal(nodes[current as string].letter, word[letter]);
    }
    // Node ids spell their prefix, children are sorted and consistent.
    for (const node of Object.values(nodes)) {
      for (const [h, child] of Object.entries(node.children)) {
        assert.equal(child, node.id + h);
        assert.equal(nodes[child].letter, h);
      }
      const kids = trieChildren(nodes, node.id).map((id) => nodes[id].letter);
      assert.deepEqual(kids, [...kids].sort());
    }
    // Indexes count nodes in creation order.
    assert.deepEqual(
      Object.values(nodes).map((node) => node.index).sort((a, b) => a - b),
      Object.keys(nodes).map((_, i) => i),
    );
    // Nodes and marks are never removed.
    if (index > 0) {
      const before = steps[index - 1].state.nodes;
      for (const [id, node] of Object.entries(before)) {
        assert.ok(id in nodes);
        if (node.akhir) assert.ok(nodes[id].akhir);
      }
    }
  });
  return steps;
}

describe('trieSteps', () => {
  it('runs the default operations with the expected answers', () => {
    const steps = assertInvariants(lessonTrieOperations);
    const results = lessonTrieOperations.map((_, index) => steps.filter((step) => step.state.operation === index).at(-1)?.result);
    assert.deepEqual(results.slice(5), ['cari(kita) → ada', 'cari(kat) → tidak ada', 'awalan(kat) → ada', 'cari(bukit) → tidak ada']);
    const final = steps[steps.length - 1].state;
    assert.equal(Object.keys(final.nodes).length, 14);
    assert.deepEqual(trieWords(final.nodes), ['buku', 'bus', 'kata', 'katak', 'kita']);
    assert.deepEqual(trieChildren(final.nodes, TRIE_ROOT), ['#b', '#k']);
    assert.deepEqual(trieChildren(final.nodes, '#bu'), ['#buk', '#bus']);
    // Same node numbers as the lesson's vector: cari("kita") walks 0 → 1 → 6 → 7 → 8.
    const kita = steps.filter((step) => step.state.operation === 5).at(-1) as TrieStep;
    assert.deepEqual(kita.state.path.map((id) => kita.state.nodes[id].index), [0, 1, 6, 7, 8]);
    assert.deepEqual(['#buk', '#buku', '#bus'].map((id) => final.nodes[id].index), [11, 12, 13]);
    assert.ok(final.nodes['#kata'].akhir && final.nodes['#katak'].akhir && !final.nodes['#kat'].akhir);

    const kat = steps.filter((step) => step.state.operation === 6).at(-1) as TrieStep;
    assert.match(kat.caption, /hanya awalan/);
    const bukit = steps[steps.length - 1];
    assert.deepEqual(bukit.state.missing, { from: '#buk', letter: 'i' });
    assert.match(bukit.caption, /tidak punya anak `i`/);
    // katak reuses k, a, t, a and adds a single node.
    const katak = steps.filter((step) => step.state.operation === 1);
    assert.equal(katak.filter((step) => step.lines.includes('s-buat')).length, 1);
  });

  it('marks a word that is a prefix of an existing word, and ignores repeats', () => {
    const steps = assertInvariants(ops('sisip(katak) cari(kata) sisip(kata) cari(kata) sisip(kata) awalan(katak) awalan(katakan)'));
    const repeat = steps.filter((step) => step.state.operation === 4).at(-1) as TrieStep;
    assert.equal(repeat.result, 'sisip(kata) → sudah ada');
    assert.equal(steps.filter((step) => step.state.operation === 2).filter((step) => step.lines.includes('s-buat')).length, 0);
  });

  it('handles an empty list, one-letter words and searches in an empty trie', () => {
    assert.equal(trieSteps([]).length, 1);
    assert.match(trieSteps([]).at(0)?.caption ?? '', /belum ada operasi/);
    const steps = assertInvariants(ops('cari(a) awalan(a) sisip(a) cari(a) awalan(a) cari(b)'));
    assert.deepEqual(steps[1].state.missing, { from: TRIE_ROOT, letter: 'a' });
  });

  it('works on random data and on long words', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const operations = randomTrieOperations(seeded(seed));
      assert.equal(validateTrieOperations(operations), null);
      assertInvariants(operations);
    }
    const long = ['abcdefgh', 'abcdefgz', 'zyxwvuts', 'zyxwvutz'].map((word) => ({ type: 'sisip' as const, word }));
    assertInvariants([...long, { type: 'cari', word: 'abcdefgh' }, { type: 'awalan', word: 'zyx' }]);
  });

  it('is deterministic', () => {
    assert.deepEqual(trieSteps(lessonTrieOperations), trieSteps(lessonTrieOperations));
  });
});

describe('trie input', () => {
  it('parses MDX operation lists', () => {
    assert.deepEqual(
      ops('sisip(kata) sisip(katak) sisip(kita) sisip(buku) sisip(bus) cari(kita) cari(kat) awalan(kat) cari(bukit)'),
      lessonTrieOperations,
    );
    assert.deepEqual(ops('sisip( Buku ), cari(bus)'), [
      { type: 'sisip', word: 'buku' },
      { type: 'cari', word: 'bus' },
    ]);
    for (const text of ['sisip(kata) hapus(kata)', 'sisip(ka ta)', 'sisip(k4ta)', 'sisip()', 'sisip(panjangsekali)']) {
      assert.ok('error' in parseTrieOperations(text), text);
    }
  });

  it('validates words and limits', () => {
    assert.deepEqual(parseTrieWord(' Kata '), { word: 'kata' });
    for (const text of ['', 'dua kata', 'é', 'abc1', 'abcdefghi']) assert.ok('error' in parseTrieWord(text), text);
    assert.match(validateTrieOperations(Array.from({ length: 13 }, () => ({ type: 'cari' as const, word: 'a' }))) ?? '', /Maksimal 12/);
    // Six unrelated 8-letter words need 49 nodes.
    const wide = ['abcdefgh', 'bcdefghi', 'cdefghij', 'defghijk', 'efghijkl', 'fghijklm'].map((word) => ({ type: 'sisip' as const, word }));
    assert.equal(trieSize(wide.map((operation) => operation.word)), 49);
    assert.match(validateTrieOperations(wide) ?? '', new RegExp(`${TRIE_LIMITS.maxNodes} node`));
  });
});
