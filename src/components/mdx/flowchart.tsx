import type { ReactNode } from 'react';

/* ------------------------------------------------------------------------- */
/* Flowchart: a small, dependency-free SVG renderer for top-to-bottom charts */
/* with optional Yes/No branches. Colors come from CSS variables (fc-*), so   */
/* the chart follows the light/dark theme automatically.                      */
/* ------------------------------------------------------------------------- */

type SimpleNode = { type: 'terminal' | 'io' | 'process'; label: string };
type DecisionNode = {
  type: 'decision';
  label: string;
  /** Steps on the left ("Ya") branch. */
  yes?: SimpleNode[];
  /** Steps on the right ("Tidak") branch. */
  no?: SimpleNode[];
  yesLabel?: string;
  noLabel?: string;
};
type LoopNode = {
  type: 'loop';
  /** Condition checked before every repetition. */
  label: string;
  /** Steps repeated while the condition is true. */
  body: SimpleNode[];
  yesLabel?: string;
  noLabel?: string;
};
export type FlowNode = SimpleNode | DecisionNode | LoopNode;

const LINE_HEIGHT = 17;
const CHAR_WIDTH = 7.2;
const GAP = 30;
const PADDING = 14;
const SKEW = 14;

interface Canvas {
  elements: ReactNode[];
  minX: number;
  maxX: number;
  key: number;
}

function labelLines(label: string) {
  return label.split('\n');
}

function measure(node: FlowNode) {
  const lines = labelLines(node.label);
  const textWidth = Math.max(...lines.map((line) => line.length)) * CHAR_WIDTH;
  const extra = (lines.length - 1) * LINE_HEIGHT;

  switch (node.type) {
    case 'terminal':
      return { w: Math.max(112, textWidth + 44), h: 38 + extra };
    case 'process':
      return { w: Math.max(150, textWidth + 36), h: 42 + extra };
    case 'io':
      return { w: Math.max(150, textWidth + 56), h: 42 + extra };
    case 'decision':
    case 'loop':
      return { w: Math.max(170, textWidth * 1.9 + 36), h: Math.max(76, 60 + lines.length * LINE_HEIGHT) };
  }
}

function track(canvas: Canvas, left: number, right: number) {
  canvas.minX = Math.min(canvas.minX, left);
  canvas.maxX = Math.max(canvas.maxX, right);
}

function drawText(canvas: Canvas, label: string, cx: number, cy: number) {
  const lines = labelLines(label);
  const startY = cy - ((lines.length - 1) * LINE_HEIGHT) / 2;
  canvas.elements.push(
    <text key={canvas.key++} className="fc-text" textAnchor="middle" dominantBaseline="central">
      {lines.map((line, index) => (
        <tspan key={index} x={cx} y={startY + index * LINE_HEIGHT}>
          {line}
        </tspan>
      ))}
    </text>,
  );
}

function drawShape(canvas: Canvas, node: FlowNode, cx: number, top: number): number {
  const { w, h } = measure(node);
  const x = cx - w / 2;
  track(canvas, x, x + w);

  switch (node.type) {
    case 'terminal':
      canvas.elements.push(
        <rect key={canvas.key++} className="fc-shape fc-terminal" x={x} y={top} width={w} height={h} rx={h / 2} />,
      );
      break;
    case 'process':
      canvas.elements.push(
        <rect key={canvas.key++} className="fc-shape fc-process" x={x} y={top} width={w} height={h} rx={5} />,
      );
      break;
    case 'io':
      canvas.elements.push(
        <polygon
          key={canvas.key++}
          className="fc-shape fc-io"
          points={`${x + SKEW},${top} ${x + w},${top} ${x + w - SKEW},${top + h} ${x},${top + h}`}
        />,
      );
      break;
    case 'decision':
    case 'loop':
      canvas.elements.push(
        <polygon
          key={canvas.key++}
          className="fc-shape fc-decision"
          points={`${cx},${top} ${cx + w / 2},${top + h / 2} ${cx},${top + h} ${cx - w / 2},${top + h / 2}`}
        />,
      );
      break;
  }

  drawText(canvas, node.label, cx, top + h / 2);
  return top + h;
}

function drawLine(canvas: Canvas, x1: number, y1: number, x2: number, y2: number) {
  canvas.elements.push(<line key={canvas.key++} className="fc-line" x1={x1} y1={y1} x2={x2} y2={y2} />);
}

function drawArrow(canvas: Canvas, x: number, from: number, to: number) {
  drawLine(canvas, x, from, x, to - 6);
  canvas.elements.push(
    <polygon key={canvas.key++} className="fc-head" points={`${x - 4.5},${to - 7.5} ${x + 4.5},${to - 7.5} ${x},${to}`} />,
  );
}

function drawArrowRight(canvas: Canvas, from: number, to: number, y: number) {
  drawLine(canvas, from, y, to - 6, y);
  canvas.elements.push(
    <polygon key={canvas.key++} className="fc-head" points={`${to - 7.5},${y - 4.5} ${to - 7.5},${y + 4.5} ${to},${y}`} />,
  );
}

/**
 * Loop: the body hangs below the diamond ("Ya"), a back edge returns on the
 * left into the diamond, and the exit ("Tidak") leaves on the right and comes
 * back to the centre line below the body.
 */
function drawLoop(canvas: Canvas, node: LoopNode, cx: number, top: number): number {
  const { w, h } = measure(node);
  const diamondBottom = drawShape(canvas, node, cx, top);
  const cy = top + h / 2;
  const bodyWidth = Math.max(0, ...node.body.map((child) => measure(child).w));
  const reach = Math.max(w / 2, bodyWidth / 2) + 30;
  const backX = cx - reach;
  const exitX = cx + reach;
  track(canvas, backX, exitX);

  drawArrow(canvas, cx, diamondBottom, diamondBottom + GAP);
  const bodyBottom = drawSequence(canvas, node.body, cx, diamondBottom + GAP);
  canvas.elements.push(
    <text key={canvas.key++} className="fc-branch" x={cx + 8} y={diamondBottom + 14} textAnchor="start">
      {node.yesLabel ?? 'Ya'}
    </text>,
    <text key={canvas.key++} className="fc-branch" x={cx + w / 2 + 8} y={cy - 8} textAnchor="start">
      {node.noLabel ?? 'Tidak'}
    </text>,
  );

  // Back edge: down a little, left, up, then right into the diamond.
  const turnY = bodyBottom + 16;
  drawLine(canvas, cx, bodyBottom, cx, turnY);
  drawLine(canvas, cx, turnY, backX, turnY);
  drawLine(canvas, backX, turnY, backX, cy);
  drawArrowRight(canvas, backX, cx - w / 2, cy);

  // Exit: right, down past the body, back to the centre line.
  const exitY = turnY + 22;
  drawLine(canvas, cx + w / 2, cy, exitX, cy);
  drawLine(canvas, exitX, cy, exitX, exitY);
  drawLine(canvas, exitX, exitY, cx, exitY);
  canvas.elements.push(<circle key={canvas.key++} className="fc-head" cx={cx} cy={exitY} r={3} />);
  return exitY;
}

function drawSequence(canvas: Canvas, nodes: FlowNode[], cx: number, startY: number): number {
  let bottom: number | undefined;

  for (const node of nodes) {
    let top = startY;
    if (bottom !== undefined) {
      drawArrow(canvas, cx, bottom, bottom + GAP);
      top = bottom + GAP;
    }

    if (node.type === 'loop') {
      bottom = drawLoop(canvas, node, cx, top);
      continue;
    }

    if (node.type !== 'decision') {
      bottom = drawShape(canvas, node, cx, top);
      continue;
    }

    const { w, h } = measure(node);
    const decisionBottom = drawShape(canvas, node, cx, top);
    const cy = top + h / 2;
    const yes = node.yes ?? [];
    const no = node.no ?? [];
    const branchWidth = Math.max(0, ...[...yes, ...no].map((child) => measure(child).w));
    const offset = Math.max(w / 2 + 26, branchWidth / 2 + 22);
    const leftX = cx - offset;
    const rightX = cx + offset;
    const branchTop = decisionBottom + 14;
    track(canvas, leftX, rightX);

    drawLine(canvas, cx - w / 2, cy, leftX, cy);
    drawLine(canvas, cx + w / 2, cy, rightX, cy);
    canvas.elements.push(
      <text key={canvas.key++} className="fc-branch" x={cx - w / 2 - 8} y={cy - 8} textAnchor="end">
        {node.yesLabel ?? 'Ya'}
      </text>,
      <text key={canvas.key++} className="fc-branch" x={cx + w / 2 + 8} y={cy - 8} textAnchor="start">
        {node.noLabel ?? 'Tidak'}
      </text>,
    );

    const drawBranch = (children: SimpleNode[], x: number) => {
      if (children.length === 0) return cy;
      drawArrow(canvas, x, cy, branchTop);
      return drawSequence(canvas, children, x, branchTop);
    };

    const leftBottom = drawBranch(yes, leftX);
    const rightBottom = drawBranch(no, rightX);
    const mergeY = Math.max(leftBottom, rightBottom, decisionBottom) + 20;

    drawLine(canvas, leftX, leftBottom, leftX, mergeY);
    drawLine(canvas, rightX, rightBottom, rightX, mergeY);
    drawLine(canvas, leftX, mergeY, rightX, mergeY);
    canvas.elements.push(<circle key={canvas.key++} className="fc-head" cx={cx} cy={mergeY} r={3} />);
    bottom = mergeY;
  }

  return bottom ?? startY;
}

function describe(nodes: FlowNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'loop') {
        const body = node.body.map((child) => child.label).join(', ');
        return `${node.label} Ya: ${body}, lalu ulangi; Tidak: lanjut`;
      }
      if (node.type !== 'decision') return node.label;
      const yes = (node.yes ?? []).map((child) => child.label).join(', ') || 'lanjut';
      const no = (node.no ?? []).map((child) => child.label).join(', ') || 'lanjut';
      return `${node.label} Ya: ${yes}; Tidak: ${no}`;
    })
    .join(' → ')
    .replaceAll('\n', ' ');
}

export function Flowchart({ nodes, caption }: { nodes: FlowNode[]; caption?: string }) {
  const canvas: Canvas = { elements: [], minX: Infinity, maxX: -Infinity, key: 0 };
  const bottom = drawSequence(canvas, nodes, 0, PADDING);
  const x = canvas.minX - PADDING;
  const width = canvas.maxX - canvas.minX + PADDING * 2;
  const height = bottom + PADDING;

  return (
    <figure className="not-prose my-6 rounded-xl border bg-fd-card px-4 py-5">
      <svg
        viewBox={`${x} 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width }}
        className="mx-auto block h-auto"
        role="img"
        aria-label={`${caption ? `${caption}: ` : ''}${describe(nodes)}`}
      >
        {canvas.elements}
      </svg>
      {caption ? (
        <figcaption className="mt-4 text-center text-sm text-fd-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------------- */

type SymbolKind = 'terminal' | 'io' | 'process' | 'decision' | 'arrow' | 'connector' | 'predefined' | 'offpage';

const symbols: { kind: SymbolKind; name: string; shape: string; description: string }[] = [
  { kind: 'terminal', name: 'Terminal', shape: 'Oval', description: 'Menandai awal (Mulai) dan akhir (Selesai) algoritma.' },
  { kind: 'io', name: 'Input / Output', shape: 'Jajar genjang', description: 'Membaca masukan atau menampilkan keluaran.' },
  { kind: 'process', name: 'Proses', shape: 'Persegi panjang', description: 'Perhitungan atau pengisian nilai ke variabel.' },
  { kind: 'decision', name: 'Keputusan', shape: 'Belah ketupat', description: 'Memilih jalur berdasarkan kondisi Ya atau Tidak.' },
  { kind: 'arrow', name: 'Garis alir', shape: 'Anak panah', description: 'Menunjukkan arah urutan langkah.' },
  { kind: 'connector', name: 'Konektor', shape: 'Lingkaran kecil', description: 'Menyambung alur yang terputus di halaman yang sama.' },
  { kind: 'predefined', name: 'Proses terdefinisi', shape: 'Persegi bergaris ganda', description: 'Memanggil prosedur atau fungsi yang dijelaskan terpisah.' },
  { kind: 'offpage', name: 'Konektor antarhalaman', shape: 'Segi lima', description: 'Menyambung alur ke halaman lain.' },
];

function SymbolShape({ kind }: { kind: SymbolKind }) {
  switch (kind) {
    case 'terminal':
      return <rect className="fc-shape fc-terminal" x={8} y={12} width={64} height={28} rx={14} />;
    case 'io':
      return <polygon className="fc-shape fc-io" points="18,12 74,12 62,40 6,40" />;
    case 'process':
      return <rect className="fc-shape fc-process" x={8} y={12} width={64} height={28} rx={3} />;
    case 'decision':
      return <polygon className="fc-shape fc-decision" points="40,4 72,26 40,48 8,26" />;
    case 'arrow':
      return (
        <>
          <line className="fc-line" x1={10} y1={26} x2={62} y2={26} />
          <polygon className="fc-head" points="62,21 70,26 62,31" />
        </>
      );
    case 'connector':
      return <circle className="fc-shape fc-process" cx={40} cy={26} r={13} />;
    case 'predefined':
      return (
        <>
          <rect className="fc-shape fc-process" x={8} y={12} width={64} height={28} rx={2} />
          <line className="fc-line" x1={16} y1={12} x2={16} y2={40} />
          <line className="fc-line" x1={64} y1={12} x2={64} y2={40} />
        </>
      );
    case 'offpage':
      return <polygon className="fc-shape fc-process" points="24,8 56,8 56,32 40,46 24,32" />;
  }
}

export function FlowchartSymbols() {
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      {symbols.map((symbol) => (
        <div key={symbol.kind} className="flex items-center gap-4 rounded-xl border bg-fd-card p-3">
          <svg viewBox="0 0 80 52" className="h-12 w-[4.5rem] shrink-0" aria-hidden="true">
            <SymbolShape kind={symbol.kind} />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fd-foreground">{symbol.name}</p>
            <p className="text-xs text-fd-muted-foreground">{symbol.shape}</p>
            <p className="mt-1 text-[0.8125rem] leading-5 text-fd-muted-foreground">{symbol.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
