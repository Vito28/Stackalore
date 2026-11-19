import type { PseudocodeLine, Role, Step } from './types.ts';

/** Operations from the BST lesson: `sisipkan`, `cari`, and `hapusNilai`. */
export interface BstOperation {
  type: 'sisip' | 'cari' | 'hapus';
  value: number;
}

export type BstSide = 'kiri' | 'kanan';

export interface BstNode {
  /** Stable identity: a node keeps its id while it is in the tree, even when its value is overwritten. */
  id: string;
  value: number;
  left: string | null;
  right: string | null;
}

export interface BstTag {
  id: string;
  /** Node the label sits above. */
  at: string;
  label: string;
}

export interface BstState {
  root: string | null;
  nodes: Record<string, BstNode>;
  /** Index of the operation this step belongs to, or null for the starting step. */
  operation: number | null;
  /** Nodes compared so far in this operation, root first. Edges between neighbours are highlighted. */
  path: string[];
  /** Empty child (`nullptr`) reached in this step, drawn as a dashed stub. */
  ghost: { from: string; side: BstSide } | null;
  tags: BstTag[];
}

export type BstStep = Step<BstState>;

export const BST_LIMITS = { maxOperations: 12, maxInitial: 12, maxValues: 15, minValue: 1, maxValue: 999 } as const;

const op = (type: BstOperation['type'], value: number): BstOperation => ({ type, value });

/** Insert order and searches from the BST lesson. */
export const lessonBstOperations: BstOperation[] = [
  ...[45, 23, 71, 11, 30, 58, 36, 64].map((value) => op('sisip', value)),
  op('cari', 36),
  op('cari', 50),
];

/** Starting tree and deletions from the "Menghapus nilai" section. */
export const lessonBstDeleteInitial: number[] = [45, 23, 71, 11, 30, 58, 36, 64];
export const lessonBstDeleteOperations: BstOperation[] = [op('hapus', 11), op('hapus', 30), op('hapus', 45)];

export const bstPseudocode: PseudocodeLine[] = [
  { id: 's', text: 'sisip(root, x):', indent: 0 },
  { id: 's-kosong', text: 'jika root kosong → buat node x', indent: 1 },
  { id: 's-kiri', text: 'jika x < root.data → ke kiri', indent: 1 },
  { id: 's-kanan', text: 'jika x > root.data → ke kanan', indent: 1 },
  { id: 's-sama', text: 'jika sama → abaikan', indent: 1 },
  { id: 'c', text: 'cari(root, x):', indent: 0 },
  { id: 'c-kosong', text: 'jika root kosong → tidak ada', indent: 1 },
  { id: 'c-sama', text: 'jika x == root.data → ketemu', indent: 1 },
  { id: 'c-kiri', text: 'jika x < root.data → ke kiri', indent: 1 },
  { id: 'c-kanan', text: 'jika tidak → ke kanan', indent: 1 },
  { id: 'h', text: 'hapus(root, x):', indent: 0 },
  { id: 'h-kosong', text: 'jika root kosong → tidak ada', indent: 1 },
  { id: 'h-kiri', text: 'jika x < root.data → ke kiri', indent: 1 },
  { id: 'h-kanan', text: 'jika x > root.data → ke kanan', indent: 1 },
  { id: 'h-sama', text: 'jika sama → hapus node ini:', indent: 1 },
  { id: 'h-kiri-kosong', text: 'kiri kosong → kanan naik', indent: 2 },
  { id: 'h-kanan-kosong', text: 'kanan kosong → kiri naik', indent: 2 },
  { id: 'h-pengganti', text: 'dua anak → cari pengganti', indent: 2 },
  { id: 'h-salin', text: 'salin nilai pengganti', indent: 3 },
  { id: 'h-hapus-pengganti', text: 'hapus pengganti di kanan', indent: 3 },
];

export function formatBstOperation(operation: BstOperation): string {
  return `${operation.type}(${operation.value})`;
}

/** Ids of a node and everything below it. */
export function bstSubtree(nodes: Record<string, BstNode>, id: string | null): string[] {
  if (id === null) return [];
  const node = nodes[id];
  return [id, ...bstSubtree(nodes, node.left), ...bstSubtree(nodes, node.right)];
}

/** Values in inorder (sorted for a valid BST). */
export function bstInorder(state: Pick<BstState, 'root' | 'nodes'>): number[] {
  const out: number[] = [];
  const walk = (id: string | null) => {
    if (id === null) return;
    walk(state.nodes[id].left);
    out.push(state.nodes[id].value);
    walk(state.nodes[id].right);
  };
  walk(state.root);
  return out;
}

const cloneNodes = (nodes: Record<string, BstNode>) =>
  Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, { ...node }]));

const compare = (x: number, value: number) => `\`${x} ${x < value ? '<' : '>'} ${value}\``;

/**
 * Turns a starting tree (inserted silently, duplicates ignored) and a list of
 * operations into steps. Every comparison is its own step, an empty child
 * ends the walk, and deleting a node with two children copies its successor
 * and then deletes the successor from the right subtree, exactly like
 * `hapusNilai` in the lesson.
 */
export function bstSteps(initial: number[], operations: BstOperation[]): BstStep[] {
  const steps: BstStep[] = [];
  const nodes: Record<string, BstNode> = {};
  let root: string | null = null;
  let created = 0;

  let operation: number | null = null;
  let path: string[] = [];
  let discarded: string[] = [];
  let tags: BstTag[] = [];

  const newNode = (value: number) => {
    const id = `b${created++}`;
    nodes[id] = { id, value, left: null, right: null };
    return id;
  };

  const setChild = (parent: string | null, side: BstSide, id: string | null) => {
    if (parent === null) root = id;
    else if (side === 'kiri') nodes[parent].left = id;
    else nodes[parent].right = id;
  };

  for (const value of initial) {
    if (root === null) {
      root = newNode(value);
      continue;
    }
    let cur: string = root;
    while (value !== nodes[cur].value) {
      const side: BstSide = value < nodes[cur].value ? 'kiri' : 'kanan';
      const next = side === 'kiri' ? nodes[cur].left : nodes[cur].right;
      if (next === null) {
        setChild(cur, side, newNode(value));
        break;
      }
      cur = next;
    }
  }

  const emit = (
    caption: string,
    lines: string[],
    roles: Record<string, Role>,
    extra: { result?: string; ghost?: BstState['ghost'] } = {},
  ) => {
    const highlights: Record<string, Role> = {};
    for (const top of discarded) for (const id of bstSubtree(nodes, top)) highlights[id] = 'dibuang';
    Object.assign(highlights, roles);
    steps.push({
      state: {
        root,
        nodes: cloneNodes(nodes),
        operation,
        path: path.filter((id) => id in nodes),
        ghost: extra.ghost ?? null,
        tags: tags.filter((tag) => tag.at in nodes).map((tag) => ({ ...tag })),
      },
      highlights,
      caption,
      lines,
      result: extra.result,
      status: 'normal',
    });
  };

  const count = `${operations.length} operasi`;
  emit(
    `${initial.length > 0 ? `Tree awal dibangun dengan menyisipkan \`${initial.join(' ')}\` berurutan.` : 'Tree masih kosong.'} ${
      operations.length > 0 ? `Ada ${count} yang akan dijalankan dari kiri ke kanan.` : 'Belum ada operasi. Tambahkan operasi di bawah untuk mulai.'
    }`,
    [],
    {},
  );

  const sisip = (x: number) => {
    const name = `\`sisip(${x})\``;
    if (root === null) {
      root = newNode(x);
      path = [root];
      emit(`${name}: tree masih kosong, jadi ${x} menjadi root.`, ['s', 's-kosong'], { [root]: 'aktif' });
      return;
    }
    let cur: string = root;
    let intro = `${name}: mulai dari root. `;
    for (;;) {
      path.push(cur);
      const node = nodes[cur];
      if (x === node.value) {
        emit(`${intro}\`${x} == ${node.value}\`: ${x} sudah ada. Nilai kembar diabaikan, jadi tree tidak berubah.`, ['s-sama'], { [cur]: 'khusus' }, { result: `sisip(${x}) → diabaikan` });
        return;
      }
      const side: BstSide = x < node.value ? 'kiri' : 'kanan';
      const line = side === 'kiri' ? 's-kiri' : 's-kanan';
      const next = side === 'kiri' ? node.left : node.right;
      const other = side === 'kiri' ? node.right : node.left;
      if (next === null) {
        const id = newNode(x);
        setChild(cur, side, id);
        path.push(id);
        emit(
          `${intro}${compare(x, node.value)}, jadi pergi ke ${side}. Anak ${side} ${node.value} kosong (\`nullptr\`/\`None\`), jadi ${x} dipasang di sana sebagai daun baru.`,
          [line, 's-kosong'],
          { [id]: 'aktif' },
        );
        return;
      }
      if (other !== null) discarded.push(other);
      emit(`${intro}${compare(x, node.value)}, jadi pergi ke ${side}.`, [line], { [cur]: 'aktif' });
      intro = '';
      cur = next;
    }
  };

  const cari = (x: number) => {
    const name = `\`cari(${x})\``;
    const missing = `cari(${x}) → tidak ada`;
    if (root === null) {
      emit(`${name}: tree kosong, jadi ${x} tidak ada.`, ['c', 'c-kosong'], {}, { result: missing });
      return;
    }
    let cur: string = root;
    let intro = `${name}: mulai dari root. `;
    for (;;) {
      path.push(cur);
      const node = nodes[cur];
      if (x === node.value) {
        emit(`${intro}\`${x} == ${node.value}\`: ketemu!`, ['c-sama'], { [cur]: 'selesai' }, { result: `cari(${x}) → ketemu` });
        return;
      }
      const side: BstSide = x < node.value ? 'kiri' : 'kanan';
      const line = side === 'kiri' ? 'c-kiri' : 'c-kanan';
      const next = side === 'kiri' ? node.left : node.right;
      const other = side === 'kiri' ? node.right : node.left;
      if (other !== null) discarded.push(other);
      if (next === null) {
        emit(
          `${intro}${compare(x, node.value)}, jadi pergi ke ${side}. Anak ${side} ${node.value} kosong (\`nullptr\`/\`None\`), jadi ${x} tidak ada di tree.`,
          [line, 'c-kosong'],
          { [cur]: 'aktif' },
          { result: missing, ghost: { from: cur, side } },
        );
        return;
      }
      emit(`${intro}${compare(x, node.value)}, jadi pergi ke ${side}.`, [line], { [cur]: 'aktif' });
      intro = '';
      cur = next;
    }
  };

  /**
   * `hapusNilai(start, x)` where `start` hangs below `above` (null: the root).
   * Returns false when x is not in that subtree.
   */
  const remove = (above: { id: string; side: BstSide } | null, x: number, intro: string, leadLines: string[] = []): boolean => {
    let lead = leadLines;
    const say: typeof emit = (caption, lines, roles, extra) => {
      emit(caption, [...lead, ...lines], roles, extra);
      lead = [];
    };
    let parent = above?.id ?? null;
    let parentSide: BstSide = above?.side ?? 'kiri';
    let cur = parent === null ? root : parentSide === 'kiri' ? nodes[parent].left : nodes[parent].right;
    const missing = `hapus(${x}) → tidak ada`;
    if (cur === null) {
      say(`${intro}tree kosong, jadi ${x} tidak ada.`, ['h', 'h-kosong'], {}, { result: missing });
      return false;
    }

    for (;;) {
      path.push(cur);
      const node: BstNode = nodes[cur];
      if (x === node.value) break;
      const side: BstSide = x < node.value ? 'kiri' : 'kanan';
      const line = side === 'kiri' ? 'h-kiri' : 'h-kanan';
      const next: string | null = side === 'kiri' ? node.left : node.right;
      const other = side === 'kiri' ? node.right : node.left;
      if (other !== null) discarded.push(other);
      if (next === null) {
        say(
          `${intro}${compare(x, node.value)}, jadi pergi ke ${side}. Anak ${side} ${node.value} kosong (\`nullptr\`/\`None\`), jadi ${x} tidak ada di tree. Tree tidak berubah.`,
          [line, 'h-kosong'],
          { [cur]: 'aktif' },
          { result: missing, ghost: { from: cur, side } },
        );
        return false;
      }
      say(`${intro}${compare(x, node.value)}, jadi pergi ke ${side}.`, [line], { [cur]: 'aktif' });
      intro = '';
      parent = cur;
      parentSide = side;
      cur = next;
    }

    const target = cur;
    const node = nodes[target];
    const value = node.value;
    const found = `${intro}\`${x} == ${value}\`: ketemu.`;
    tags = [{ id: 'hapus', at: target, label: 'hapus' }];

    if (node.left === null || node.right === null) {
      const child = node.left === null ? node.right : node.left;
      const childSide = node.left === null ? 'kanan' : 'kiri';
      say(
        child === null
          ? `${found} ${value} adalah daun (tidak punya anak), jadi cukup dihapus (kasus 1).`
          : `${found} ${value} hanya punya anak ${childSide}, yaitu ${nodes[child].value} (kasus 2).`,
        ['h-sama'],
        { [target]: 'khusus' },
      );

      setChild(parent, parentSide, child);
      delete nodes[target];
      tags = [];
      const line = node.left === null ? 'h-kiri-kosong' : 'h-kanan-kosong';
      if (child === null) {
        say(
          parent === null
            ? `${value} dihapus. Tree sekarang kosong.`
            : `${value} dihapus. Pointer ${parentSide} ${nodes[parent].value} sekarang kosong (\`nullptr\`/\`None\`).`,
          [line],
          {},
          { ghost: parent === null ? null : { from: parent, side: parentSide } },
        );
      } else {
        const moved = nodes[child];
        const carries = moved.left !== null || moved.right !== null ? ', membawa seluruh subtree-nya' : '';
        say(
          parent === null
            ? `${value} dihapus dan anaknya, ${moved.value}, naik menjadi root${carries}.`
            : `${value} dihapus dan anaknya, ${moved.value}, naik menggantikan posisinya sebagai anak ${parentSide} ${nodes[parent].value}${carries}.`,
          [line],
          { [child]: 'aktif' },
        );
      }
      return true;
    }

    say(`${found} ${value} punya dua anak (kasus 3), jadi node ini tidak bisa langsung dibuang.`, ['h-sama'], { [target]: 'khusus' });

    let successor = node.right;
    tags = [
      { id: 'hapus', at: target, label: 'hapus' },
      { id: 'pengganti', at: successor, label: 'pengganti' },
    ];
    const stop = (id: string) => ` ${nodes[id].value} tidak punya anak kiri, jadi penggantinya ${nodes[id].value}.`;
    say(
      `Cari pengganti (successor), yaitu nilai terkecil di subtree kanan ${value}. Mulai dari anak kanan, ${nodes[successor].value}.${
        nodes[successor].left === null ? stop(successor) : ''
      }`,
      ['h-pengganti'],
      { [target]: 'khusus', [successor]: 'aktif' },
    );
    while (nodes[successor].left !== null) {
      const from = nodes[successor].value;
      successor = nodes[successor].left as string;
      tags = [tags[0], { id: 'pengganti', at: successor, label: 'pengganti' }];
      say(
        `${from} punya anak kiri, jadi turun ke kiri: ${nodes[successor].value}.${nodes[successor].left === null ? stop(successor) : ''}`,
        ['h-pengganti'],
        { [target]: 'khusus', [successor]: 'aktif' },
      );
    }

    const copied = nodes[successor].value;
    node.value = copied;
    tags = [{ id: 'pengganti', at: successor, label: 'pengganti' }];
    say(
      `Salin ${copied} ke node yang dihapus, jadi nilai ${value} diganti ${copied}. Sekarang ada dua node bernilai ${copied}, jadi ${copied} yang lama harus dihapus dari subtree kanan.`,
      ['h-salin'],
      { [target]: 'khusus', [successor]: 'aktif' },
    );

    tags = [];
    remove(
      { id: target, side: 'kanan' },
      copied,
      `Hapus ${copied} dari subtree kanan dengan memanggil \`hapus(root.kanan, ${copied})\`. Mulai di ${nodes[node.right as string].value}: `,
      ['h-hapus-pengganti'],
    );
    return true;
  };

  operations.forEach((operation_, index) => {
    operation = index;
    path = [];
    discarded = [];
    tags = [];
    if (operation_.type === 'sisip') sisip(operation_.value);
    else if (operation_.type === 'cari') cari(operation_.value);
    else {
      const name = `\`hapus(${operation_.value})\`: `;
      const removed = remove(null, operation_.value, root === null ? name : `${name}mulai dari root. `);
      if (removed) steps[steps.length - 1].result = `hapus(${operation_.value}) → terhapus`;
    }
  });

  if (operations.length > 0) steps[steps.length - 1].caption += ' Semua operasi selesai.';
  return steps;
}

/** Reads one number typed by the reader. */
export function parseBstValue(text: string): { value: number } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === '') return { error: 'Isi dulu angkanya.' };
  if (!/^-?\d+$/.test(trimmed)) return { error: 'Masukkan bilangan bulat, misalnya 45.' };
  const value = Number(trimmed);
  if (value < BST_LIMITS.minValue || value > BST_LIMITS.maxValue) {
    return { error: `Pakai angka dari ${BST_LIMITS.minValue} sampai ${BST_LIMITS.maxValue} supaya muat di lingkaran.` };
  }
  return { value };
}

/** Checks a starting tree and operation list (e.g. from MDX props) before generating steps. */
export function validateBst(initial: number[], operations: BstOperation[]): string | null {
  if (operations.length > BST_LIMITS.maxOperations) return `Maksimal ${BST_LIMITS.maxOperations} operasi.`;
  if (initial.length > BST_LIMITS.maxInitial) return `Tree awal maksimal ${BST_LIMITS.maxInitial} nilai.`;
  const values = [...initial, ...operations.map((operation) => operation.value)];
  for (const value of values) {
    if (!Number.isInteger(value)) return 'Semua nilai harus bilangan bulat.';
    if (value < BST_LIMITS.minValue || value > BST_LIMITS.maxValue) {
      return `Nilai harus dari ${BST_LIMITS.minValue} sampai ${BST_LIMITS.maxValue}.`;
    }
  }
  const inTree = new Set([...initial, ...operations.filter((operation) => operation.type === 'sisip').map((operation) => operation.value)]);
  if (inTree.size > BST_LIMITS.maxValues) {
    return `Paling banyak ${BST_LIMITS.maxValues} nilai berbeda yang disisipkan, supaya tree tetap terbaca di HP.`;
  }
  return null;
}

/** Parses `sisip(45) cari(36) hapus(45)` (commas optional). */
export function parseBstOperations(text: string): { operations: BstOperation[] } | { error: string } {
  const operations: BstOperation[] = [];
  for (const token of text.match(/[a-z]+\s*\(\s*-?\d+\s*\)|[^\s,]+/gi) ?? []) {
    const match = /^(sisip|cari|hapus)\s*\(\s*(-?\d+)\s*\)$/.exec(token);
    if (!match) return { error: `Operasi tidak dikenal: ${token}. Gunakan sisip(x), cari(x), atau hapus(x).` };
    operations.push({ type: match[1] as BstOperation['type'], value: Number(match[2]) });
  }
  const invalid = validateBst([], operations);
  return invalid ? { error: invalid } : { operations };
}

/** Parses a starting tree written as `45 23 71` (commas optional). */
export function parseBstValues(text: string): { values: number[] } | { error: string } {
  const values: number[] = [];
  for (const token of text.split(/[\s,]+/).filter(Boolean)) {
    if (!/^-?\d+$/.test(token)) return { error: `Bukan bilangan bulat: ${token}.` };
    values.push(Number(token));
  }
  const invalid = validateBst(values, []);
  return invalid ? { error: invalid } : { values };
}

function distinctValues(random: () => number, count: number, avoid: number[] = []): number[] {
  const values: number[] = [];
  while (values.length < count) {
    const value = 1 + Math.floor(random() * 99);
    if (!values.includes(value) && !avoid.includes(value)) values.push(value);
  }
  return values;
}

/**
 * Random practice data. Without a starting tree: seven inserts, a search that
 * succeeds, one that fails, and a delete. With one: a starting tree of seven
 * values and a mix that includes deleting a node with two children.
 */
export function randomBstData(
  random: () => number = Math.random,
  withInitial = false,
): { initial: number[]; operations: BstOperation[] } {
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  if (!withInitial) {
    const values = distinctValues(random, 7);
    const [missing] = distinctValues(random, 1, values);
    return {
      initial: [],
      operations: [
        ...values.map((value) => op('sisip', value)),
        op('cari', pick(values)),
        op('cari', missing),
        op('hapus', pick(values)),
      ],
    };
  }
  const initial = distinctValues(random, 7);
  const last = bstSteps(initial, []).at(-1) as BstStep;
  const nodes = Object.values(last.state.nodes);
  const twoChildren = nodes.filter((node) => node.left !== null && node.right !== null).map((node) => node.value);
  const first = twoChildren.length > 0 ? pick(twoChildren) : pick(initial);
  const [fresh] = distinctValues(random, 1, initial);
  const rest = initial.filter((value) => value !== first);
  return {
    initial,
    operations: [op('hapus', first), op('cari', pick(rest)), op('hapus', pick(rest)), op('sisip', fresh), op('cari', first)],
  };
}
