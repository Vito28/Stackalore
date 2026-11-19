import type { PseudocodeLine, Role, Step } from './types.ts';

export interface TrieOperation {
  type: 'sisip' | 'cari' | 'awalan';
  word: string;
}

export interface TrieNode {
  /** `#` plus the prefix this node stands for, so `#` is the root and `#ka` is k → a. */
  id: string;
  /** Creation order, as in the lesson's vector of nodes: the root is 0. */
  index: number;
  /** Letter on the edge from the parent ('' for the root). */
  letter: string;
  /** End-of-word mark ("akhir kata"). */
  akhir: boolean;
  /** Letter → child id. */
  children: Record<string, string>;
}

export interface TrieState {
  nodes: Record<string, TrieNode>;
  /** Index of the operation this step belongs to, or null for the starting step. */
  operation: number | null;
  /** Node `p` points to, or null when no walk is in progress. */
  current: string | null;
  /** Nodes visited in this operation, from the root. Edges between neighbours are highlighted. */
  path: string[];
  /** Index of the letter being handled; equal to the word length once the loop is done. */
  letter: number | null;
  /** Letter that `p` has no child for (search failed). */
  missing: { from: string; letter: string } | null;
}

export type TrieStep = Step<TrieState>;

export const TRIE_ROOT = '#';
export const TRIE_LIMITS = { maxOperations: 12, maxWordLength: 8, maxNodes: 40 } as const;

export const lessonTrieOperations: TrieOperation[] = [
  { type: 'sisip', word: 'kata' },
  { type: 'sisip', word: 'katak' },
  { type: 'sisip', word: 'kita' },
  { type: 'sisip', word: 'buku' },
  { type: 'sisip', word: 'bus' },
  { type: 'cari', word: 'kita' },
  { type: 'cari', word: 'kat' },
  { type: 'awalan', word: 'kat' },
  { type: 'cari', word: 'bukit' },
];

export const triePseudocode: PseudocodeLine[] = [
  { id: 's', text: 'sisip(kata):', indent: 0 },
  { id: 's-awal', text: 'p ← root', indent: 1 },
  { id: 's-ulang', text: 'untuk setiap huruf h di kata:', indent: 1 },
  { id: 's-buat', text: 'anak h kosong → buat node', indent: 2 },
  { id: 's-pindah', text: 'p ← anak h', indent: 2 },
  { id: 's-tandai', text: 'tandai p: akhir kata ✓', indent: 1 },
  { id: 'c', text: 'cari(kata):', indent: 0 },
  { id: 'c-awal', text: 'p ← root', indent: 1 },
  { id: 'c-ulang', text: 'untuk setiap huruf h di kata:', indent: 1 },
  { id: 'c-tidak', text: 'anak h kosong → tidak ada', indent: 2 },
  { id: 'c-pindah', text: 'p ← anak h', indent: 2 },
  { id: 'c-akhir', text: 'ada jika p akhir kata ✓', indent: 1 },
  { id: 'a', text: 'awalan(s):', indent: 0 },
  { id: 'a-awal', text: 'p ← root', indent: 1 },
  { id: 'a-ulang', text: 'untuk setiap huruf h di s:', indent: 1 },
  { id: 'a-tidak', text: 'anak h kosong → tidak ada', indent: 2 },
  { id: 'a-pindah', text: 'p ← anak h', indent: 2 },
  { id: 'a-ada', text: 'ada (tanda ✓ tidak perlu)', indent: 1 },
];

export function formatTrieOperation(operation: TrieOperation): string {
  return `${operation.type}(${operation.word})`;
}

/** Children of a node in alphabetical order. */
export function trieChildren(nodes: Record<string, TrieNode>, id: string): string[] {
  const node = nodes[id];
  return Object.keys(node.children)
    .sort()
    .map((letter) => node.children[letter]);
}

/** Every stored word (nodes with the end mark) in alphabetical order. */
export function trieWords(nodes: Record<string, TrieNode>): string[] {
  const words: string[] = [];
  const walk = (id: string) => {
    if (nodes[id].akhir) words.push(id.slice(1));
    for (const child of trieChildren(nodes, id)) walk(child);
  };
  walk(TRIE_ROOT);
  return words;
}

const cloneNodes = (nodes: Record<string, TrieNode>) =>
  Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, { ...node, children: { ...node.children } }]));

/**
 * Steps for a list of trie operations: one step per letter (creating or
 * following a child), then one verdict step for `cari` and `awalan`. A missing
 * letter ends the walk early.
 */
export function trieSteps(operations: TrieOperation[]): TrieStep[] {
  const steps: TrieStep[] = [];
  const nodes: Record<string, TrieNode> = { [TRIE_ROOT]: { id: TRIE_ROOT, index: 0, letter: '', akhir: false, children: {} } };
  let created = 1;
  let operation: number | null = null;
  let path: string[] = [];

  const emit = (
    caption: string,
    lines: string[],
    current: string | null,
    letter: number | null,
    roles: Record<string, Role> = {},
    extra: { result?: string; missing?: TrieState['missing'] } = {},
  ) => {
    const highlights: Record<string, Role> = { ...roles };
    if (current !== null && !(current in highlights)) highlights[current] = 'aktif';
    steps.push({
      state: { nodes: cloneNodes(nodes), operation, current, path: [...path], letter, missing: extra.missing ?? null },
      highlights,
      caption,
      lines,
      result: extra.result,
      status: 'normal',
    });
  };

  emit(
    operations.length === 0
      ? 'Trie baru berisi root saja dan belum ada operasi. Tambahkan operasi di bawah untuk mulai.'
      : `Trie baru berisi root saja. Ada ${operations.length} operasi yang akan dijalankan dari kiri ke kanan.`,
    [],
    null,
    null,
  );

  const quote = (letter: string) => `\`${letter}\``;

  const sisip = (word: string) => {
    let p = TRIE_ROOT;
    path = [p];
    for (let i = 0; i < word.length; i++) {
      const h = word[i];
      const intro = i === 0 ? `\`sisip(${word})\`: mulai dengan \`p\` di root. ` : '';
      const lines = i === 0 ? ['s-awal', 's-ulang'] : ['s-ulang'];
      let caption: string;
      const fresh = !(h in nodes[p].children);
      if (fresh) {
        const id = p + h;
        nodes[id] = { id, index: created++, letter: h, akhir: false, children: {} };
        nodes[p].children[h] = id;
        caption = `${intro}Huruf ${quote(h)}: belum ada anak ${quote(h)}, jadi buat node baru lalu pindahkan \`p\` ke sana.`;
        lines.push('s-buat', 's-pindah');
      } else {
        caption = `${intro}Huruf ${quote(h)}: anak ${quote(h)} sudah ada, jadi cukup pindahkan \`p\` ke sana.`;
        lines.push('s-pindah');
      }
      p = nodes[p].children[h];
      path.push(p);
      let result: string | undefined;
      if (i === word.length - 1) {
        lines.push('s-tandai');
        if (nodes[p].akhir) {
          caption += ` Huruf habis, dan node ini sudah bertanda akhir kata. \`${word}\` sudah ada, jadi trie tidak berubah.`;
          result = `sisip(${word}) → sudah ada`;
        } else {
          nodes[p].akhir = true;
          caption += ` Huruf habis: tandai node ini sebagai akhir kata ✓.`;
        }
      }
      emit(caption, lines, p, i, fresh ? { [p]: 'aktif' } : {}, { result });
    }
  };

  const search = (word: string, prefixOnly: boolean) => {
    const name = prefixOnly ? 'awalan' : 'cari';
    const key = prefixOnly ? 'a' : 'c';
    let p = TRIE_ROOT;
    path = [p];
    for (let i = 0; i < word.length; i++) {
      const h = word[i];
      const intro = i === 0 ? `\`${name}(${word})\`: mulai dengan \`p\` di root. ` : '';
      const lines = i === 0 ? [`${key}-awal`, `${key}-ulang`] : [`${key}-ulang`];
      if (!(h in nodes[p].children)) {
        emit(
          `${intro}Huruf ${quote(h)}: node ini tidak punya anak ${quote(h)}, jadi ${
            prefixOnly ? `tidak ada kata yang diawali \`${word}\`` : `\`${word}\` tidak ada di trie`
          }.`,
          [...lines, `${key}-tidak`],
          p,
          i,
          { [p]: 'aktif' },
          { result: `${name}(${word}) → tidak ada`, missing: { from: p, letter: h } },
        );
        return;
      }
      p = nodes[p].children[h];
      path.push(p);
      emit(`${intro}Huruf ${quote(h)}: ada anak ${quote(h)}, jadi pindahkan \`p\` ke sana.`, [...lines, `${key}-pindah`], p, i);
    }

    if (prefixOnly) {
      emit(
        `Semua huruf \`${word}\` ditemukan, jadi ada kata yang diawali \`${word}\`. Untuk awalan, tanda akhir kata tidak diperlukan.`,
        ['a-ada'],
        p,
        word.length,
        { [p]: 'selesai' },
        { result: `awalan(${word}) → ada` },
      );
    } else if (nodes[p].akhir) {
      emit(
        `Semua huruf \`${word}\` ditemukan dan node terakhir bertanda akhir kata ✓, jadi \`${word}\` ada di trie.`,
        ['c-akhir'],
        p,
        word.length,
        { [p]: 'selesai' },
        { result: `cari(${word}) → ada` },
      );
    } else {
      emit(
        `Semua huruf \`${word}\` ditemukan, tetapi node terakhir tidak bertanda akhir kata. \`${word}\` hanya awalan dari kata lain, bukan kata yang pernah disisipkan.`,
        ['c-akhir'],
        p,
        word.length,
        { [p]: 'aktif' },
        { result: `cari(${word}) → tidak ada` },
      );
    }
  };

  operations.forEach((operation_, index) => {
    operation = index;
    if (operation_.type === 'sisip') sisip(operation_.word);
    else search(operation_.word, operation_.type === 'awalan');
  });

  if (operations.length > 0) steps[steps.length - 1].caption += ' Semua operasi selesai.';
  return steps;
}

/** Reads one word typed by the reader. */
export function parseTrieWord(text: string): { word: string } | { error: string } {
  const word = text.trim().toLowerCase();
  if (word === '') return { error: 'Isi dulu katanya.' };
  if (!/^[a-z]+$/.test(word)) return { error: 'Pakai huruf a sampai z saja, tanpa spasi, angka, atau tanda baca.' };
  if (word.length > TRIE_LIMITS.maxWordLength) return { error: `Kata paling panjang ${TRIE_LIMITS.maxWordLength} huruf.` };
  return { word };
}

/** Number of nodes (including the root) after inserting the given words. */
export function trieSize(words: string[]): number {
  const prefixes = new Set<string>(['']);
  for (const word of words) for (let i = 1; i <= word.length; i++) prefixes.add(word.slice(0, i));
  return prefixes.size;
}

export function validateTrieOperations(operations: TrieOperation[]): string | null {
  if (operations.length > TRIE_LIMITS.maxOperations) return `Maksimal ${TRIE_LIMITS.maxOperations} operasi.`;
  for (const operation of operations) {
    if (!/^[a-z]+$/.test(operation.word)) return 'Kata hanya boleh berisi huruf kecil a sampai z.';
    if (operation.word.length > TRIE_LIMITS.maxWordLength) return `Kata paling panjang ${TRIE_LIMITS.maxWordLength} huruf.`;
  }
  const size = trieSize(operations.filter((operation) => operation.type === 'sisip').map((operation) => operation.word));
  if (size > TRIE_LIMITS.maxNodes) return `Trie paling banyak ${TRIE_LIMITS.maxNodes} node supaya tetap terbaca. Pakai kata yang lebih pendek atau yang awalannya sama.`;
  return null;
}

/** Parses `sisip(kata) cari(kita) awalan(kat)` (commas optional). */
export function parseTrieOperations(text: string): { operations: TrieOperation[] } | { error: string } {
  const operations: TrieOperation[] = [];
  for (const token of text.match(/[a-z]+\s*\([^)]*\)|[^\s,]+/gi) ?? []) {
    const match = /^(sisip|cari|awalan)\s*\(\s*([^)\s]*)\s*\)$/.exec(token);
    if (!match) return { error: `Operasi tidak dikenal: ${token}. Gunakan sisip(kata), cari(kata), atau awalan(kata).` };
    const parsed = parseTrieWord(match[2]);
    if ('error' in parsed) return { error: `${token}: ${parsed.error}` };
    operations.push({ type: match[1] as TrieOperation['type'], word: parsed.word });
  }
  const invalid = validateTrieOperations(operations);
  return invalid ? { error: invalid } : { operations };
}

/** Word families that share prefixes, so the trie shows branching. */
const families: string[][] = [
  ['buku', 'bus', 'bumi', 'buah', 'buat', 'bunga'],
  ['kata', 'katak', 'kita', 'kitab', 'kaki', 'kaku'],
  ['main', 'makan', 'malam', 'mata', 'matahari', 'mati'],
  ['pagi', 'pasar', 'pasir', 'padi', 'pada', 'paku'],
  ['satu', 'sapu', 'sate', 'sama', 'salam', 'saku'],
];

/** Random practice: five words from two families, then four questions. */
export function randomTrieOperations(random: () => number = Math.random): TrieOperation[] {
  const pickIndex = (length: number) => Math.floor(random() * length);
  const first = pickIndex(families.length);
  const second = (first + 1 + pickIndex(families.length - 1)) % families.length;
  const pool = [...families[first], ...families[second]];
  const words: string[] = [];
  while (words.length < 5) {
    const word = pool[pickIndex(pool.length)];
    if (!words.includes(word)) words.push(word);
  }
  const unused = pool.filter((word) => !words.includes(word));
  const stored = words[pickIndex(words.length)];
  const prefix = words[pickIndex(words.length)].slice(0, 2 + pickIndex(2));
  return [
    ...words.map((word) => ({ type: 'sisip' as const, word })),
    { type: 'cari', word: stored },
    { type: 'cari', word: prefix },
    { type: 'awalan', word: prefix },
    { type: 'cari', word: unused[pickIndex(unused.length)] },
  ];
}
