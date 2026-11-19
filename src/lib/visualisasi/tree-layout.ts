/**
 * Pure tree layout shared by every tree visualization (traversal, BST, heap,
 * trie). It only places nodes; `TreeView` turns the numbers into pixels.
 *
 * Units: `depth` counts edges from the root, and `x` is measured so that two
 * nodes on the same level are always at least 1 apart. The smallest x is 0.
 */

export interface TreePoint {
  x: number;
  depth: number;
}

export interface TreeEdge {
  /** `edgeId(from, to)`, stable as long as both ends keep their ids. */
  id: string;
  from: string;
  to: string;
}

export interface TreeLayout {
  positions: Record<string, TreePoint>;
  /** Node ids in preorder. */
  order: string[];
  edges: TreeEdge[];
  /** Largest x. A tree with zero or one column has width 0. */
  width: number;
  /** Largest depth. An empty tree and a lone root both have depth 0. */
  depth: number;
}

/** Size of the drawing area that fits every step of one visualization. */
export interface TreeFrame {
  width: number;
  depth: number;
}

export const edgeId = (from: string, to: string) => `${from}>${to}`;

function emptyLayout(): TreeLayout {
  return { positions: {}, order: [], edges: [], width: 0, depth: 0 };
}

function finish(layout: TreeLayout): TreeLayout {
  const points = Object.values(layout.positions);
  if (points.length === 0) return layout;
  const minX = Math.min(...points.map((point) => point.x));
  for (const point of points) point.x -= minX;
  layout.width = Math.max(...points.map((point) => point.x));
  layout.depth = Math.max(...points.map((point) => point.depth));
  return layout;
}

function guard(seen: Set<string>, id: string) {
  if (seen.has(id)) throw new Error(`Node ${id} muncul lebih dari sekali, jadi bentuknya bukan tree.`);
  seen.add(id);
}

/**
 * Binary tree: every node gets its own column in inorder, half a unit apart.
 * Everything in a node's left subtree is therefore to its left and everything
 * in its right subtree to its right, so a lone right child sits to the right
 * and, for a BST, reading the columns left to right gives the sorted values.
 * Two nodes on the same level always have their parent or another ancestor
 * between them in inorder, so they are at least 1 apart.
 */
export function layoutBinaryTree(
  root: string | null,
  children: (id: string) => readonly [string | null, string | null],
): TreeLayout {
  const layout = emptyLayout();
  if (root === null) return layout;
  const seen = new Set<string>();
  let column = 0;

  const visit = (id: string, depth: number) => {
    guard(seen, id);
    layout.order.push(id);
    const [left, right] = children(id);
    if (left !== null) {
      layout.edges.push({ id: edgeId(id, left), from: id, to: left });
      visit(left, depth + 1);
    }
    layout.positions[id] = { x: column++ * 0.5, depth };
    if (right !== null) {
      layout.edges.push({ id: edgeId(id, right), from: id, to: right });
      visit(right, depth + 1);
    }
  };

  visit(root, 0);
  return finish(layout);
}

/**
 * Tree with any number of ordered children (e.g. a trie): leaves take
 * consecutive columns 1 apart, and a parent sits centered above its first and
 * last child, so a single child sits straight below its parent.
 */
export function layoutNaryTree(root: string | null, children: (id: string) => readonly string[]): TreeLayout {
  const layout = emptyLayout();
  if (root === null) return layout;
  const seen = new Set<string>();
  let nextLeaf = 0;

  const visit = (id: string, depth: number): number => {
    guard(seen, id);
    layout.order.push(id);
    const kids = children(id);
    let x: number;
    if (kids.length === 0) {
      x = nextLeaf++;
    } else {
      const xs = kids.map((kid) => {
        layout.edges.push({ id: edgeId(id, kid), from: id, to: kid });
        return visit(kid, depth + 1);
      });
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    layout.positions[id] = { x, depth };
    return x;
  };

  visit(root, 0);
  return finish(layout);
}

/** The smallest drawing area that holds every given layout. */
export function treeFrame(layouts: readonly TreeLayout[]): TreeFrame {
  let width = 0;
  let depth = 0;
  for (const layout of layouts) {
    width = Math.max(width, layout.width);
    depth = Math.max(depth, layout.depth);
  }
  return { width, depth };
}
