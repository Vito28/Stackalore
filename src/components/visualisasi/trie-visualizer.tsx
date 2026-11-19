'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Plus, Search, TextCursorInput } from 'lucide-react';
import { cn } from '@/lib/cn';
import { edgeId, layoutNaryTree, treeFrame, type TreeLayout } from '@/lib/visualisasi/tree-layout';
import {
  TRIE_LIMITS,
  TRIE_ROOT,
  formatTrieOperation,
  lessonTrieOperations,
  parseTrieOperations,
  parseTrieWord,
  randomTrieOperations,
  trieChildren,
  triePseudocode,
  trieSteps,
  trieWords,
  validateTrieOperations,
  type TrieNode,
  type TrieOperation,
  type TrieStep,
} from '@/lib/visualisasi/trie';
import type { Role } from '@/lib/visualisasi/types';
import {
  EditorActions,
  EditorMessage,
  InfoBox,
  OperationChips,
  OperationStrip,
  ResultValue,
  editorButton,
  editorInput,
  reportPropError,
} from './tree-editor';
import { TreeView, treeSpring, type TreeViewMarker } from './tree-view';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiTrieProps {
  /** Operations, e.g. "sisip(kata) cari(kat) awalan(kat)". Defaults to the lesson's example. */
  operasi?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'posisi p / huruf yang diproses' },
  { role: 'selesai', label: 'ditemukan' },
];

const layoutOf = (nodes: Record<string, TrieNode>): TreeLayout => layoutNaryTree(TRIE_ROOT, (id) => trieChildren(nodes, id));

/** The word of the current operation, letter by letter. */
function WordStrip({ step, operations }: { step: TrieStep; operations: TrieOperation[] }) {
  const { operation, letter } = step.state;
  if (operation === null) return null;
  const { type, word } = operations[operation];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs text-fd-muted-foreground">{type}(</span>
      <ol className="flex gap-1" aria-label={`Huruf-huruf ${word}`}>
        {word.split('').map((char, index) => {
          const role: Role | undefined =
            letter === null ? undefined : index < letter ? 'selesai' : index === letter ? 'aktif' : undefined;
          return (
            <li
              key={index}
              aria-current={index === letter ? 'step' : undefined}
              className="viz-cell grid size-7 place-items-center rounded-md font-mono text-sm font-semibold"
              data-role={role}
            >
              {char}
            </li>
          );
        })}
      </ol>
      <span className="font-mono text-xs text-fd-muted-foreground">)</span>
    </div>
  );
}

function TrieView({ step, frame, operations }: { step: TrieStep; frame: ReturnType<typeof treeFrame>; operations: TrieOperation[] }) {
  const { nodes, current, path, missing, operation } = step.state;
  const layout = useMemo(() => layoutOf(nodes), [nodes]);
  const words = trieWords(nodes);

  const edgeRoles: Record<string, Role> = {};
  for (let i = 1; i < path.length; i++) edgeRoles[edgeId(path[i - 1], path[i])] = 'aktif';
  const edgeLabels = Object.fromEntries(layout.edges.map((edge) => [edge.id, nodes[edge.to].letter]));

  let side: 'kiri' | 'kanan' | 'bawah' = 'bawah';
  if (missing) {
    const letters = Object.keys(nodes[missing.from].children).sort();
    if (letters.length > 0) side = missing.letter < letters[0] ? 'kiri' : 'kanan';
  }

  const markers: TreeViewMarker[] = [{ id: 'root', at: TRIE_ROOT, label: 'root', tone: 'biasa' }];
  if (current !== null) markers.push({ id: 'p', at: current, label: 'p', side: 'kiri' });

  return (
    <MotionConfig reducedMotion="user" transition={treeSpring}>
      <div className="space-y-4">
        <WordStrip step={step} operations={operations} />
        <TreeView
          layout={layout}
          frame={frame}
          variant="kecil"
          nodes={layout.order.map((id) => ({
            id,
            label: String(nodes[id].index),
            role: step.highlights[id],
            ring: nodes[id].akhir,
            badge: nodes[id].akhir ? '✓' : undefined,
          }))}
          label={words.length > 0 ? `Trie berisi ${Object.keys(nodes).length} node untuk kata: ${words.join(', ')}.` : 'Trie berisi root saja.'}
          edgeRoles={edgeRoles}
          edgeLabels={edgeLabels}
          markers={markers}
          ghost={missing ? { from: missing.from, side, label: `${missing.letter} ✗` } : null}
        />
        <p className="text-xs text-fd-muted-foreground">
          Angka di lingkaran adalah indeks node di vector, huruf di garis adalah huruf pada edge, dan ✓ menandai akhir kata.
        </p>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="text-xs text-fd-muted-foreground">Kata tersimpan (node bertanda ✓)</div>
            <ul className="mt-1.5 flex min-h-8 flex-wrap gap-1.5" aria-label="Kata tersimpan">
              <AnimatePresence initial={false}>
                {words.map((word) => (
                  <motion.li
                    key={word}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="viz-cell rounded-md px-2 py-1 font-mono text-xs"
                    data-role={step.highlights[`#${word}`] === 'selesai' ? 'selesai' : undefined}
                  >
                    {word}
                  </motion.li>
                ))}
              </AnimatePresence>
              {words.length === 0 ? <li className="self-center text-xs text-fd-muted-foreground italic">belum ada</li> : null}
            </ul>
          </div>
          <InfoBox title="Hasil operasi" className="sm:min-w-40">
            <ResultValue result={step.result} stepKey={String(operation)} error={false} />
          </InfoBox>
        </div>
      </div>
    </MotionConfig>
  );
}

function initialOperations(operasi: string | undefined): TrieOperation[] {
  if (operasi === undefined) return lessonTrieOperations;
  const parsed = parseTrieOperations(operasi);
  if ('error' in parsed) {
    reportPropError('VisualisasiTrie', 'operasi', parsed.error);
    return lessonTrieOperations;
  }
  return parsed.operations;
}

/**
 * Trie of lowercase words: sisip, cari (whole word) and awalan (prefix), one
 * letter per step. MDX: `<VisualisasiTrie />` or `<VisualisasiTrie operasi="sisip(buku) cari(bu)" />`.
 */
export function VisualisasiTrie({ operasi, judul = 'Visualisasi trie' }: VisualisasiTrieProps) {
  const defaults = useMemo(() => initialOperations(operasi), [operasi]);
  const [operations, setOperations] = useState<TrieOperation[]>(defaults);
  const [word, setWord] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const steps = useMemo(() => trieSteps(operations), [operations]);
  const frame = useMemo(() => treeFrame(steps.map((step) => layoutOf(step.state.nodes))), [steps]);
  const full = operations.length >= TRIE_LIMITS.maxOperations;

  const add = (type: TrieOperation['type']) => {
    if (full) {
      setMessage(`Maksimal ${TRIE_LIMITS.maxOperations} operasi. Hapus salah satu dulu.`);
      return;
    }
    const parsed = parseTrieWord(word);
    if ('error' in parsed) {
      setMessage(parsed.error);
      return;
    }
    const next = [...operations, { type, word: parsed.word }];
    const invalid = validateTrieOperations(next);
    if (invalid) {
      setMessage(invalid);
      return;
    }
    setOperations(next);
    setWord('');
    setMessage(null);
  };

  const editor = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={word}
          onChange={(event) => setWord(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add('sisip');
            }
          }}
          placeholder="kata"
          aria-label="Kata untuk operasi"
          maxLength={TRIE_LIMITS.maxWordLength + 4}
          className={cn(editorInput, 'w-28')}
        />
        <button type="button" onClick={() => add('sisip')} disabled={full} className={editorButton}>
          <Plus className="size-4" aria-hidden="true" />
          Sisip
        </button>
        <button type="button" onClick={() => add('cari')} disabled={full} className={editorButton}>
          <Search className="size-4" aria-hidden="true" />
          Cari
        </button>
        <button type="button" onClick={() => add('awalan')} disabled={full} className={editorButton}>
          <TextCursorInput className="size-4" aria-hidden="true" />
          Awalan
        </button>
      </div>
      <EditorMessage
        message={message}
        hint={`${operations.length} dari ${TRIE_LIMITS.maxOperations} operasi. Huruf a sampai z, 1 sampai ${TRIE_LIMITS.maxWordLength} huruf per kata.`}
      />
      <OperationChips
        labels={operations.map(formatTrieOperation)}
        onRemove={(index) => setOperations((current) => current.filter((_, i) => i !== index))}
      />
      <EditorActions
        onReset={() => {
          setOperations(defaults);
          setMessage(null);
        }}
        onRandom={() => {
          setOperations(randomTrieOperations());
          setMessage(null);
        }}
        onClear={() => {
          setOperations([]);
          setMessage(null);
        }}
        clearDisabled={operations.length === 0}
      />
    </div>
  );

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={triePseudocode}
      legend={legend}
      renderHeader={(step) => (
        <OperationStrip labels={operations.map(formatTrieOperation)} current={step.state.operation} error={false} />
      )}
      render={(step) => <TrieView step={step} frame={frame} operations={operations} />}
      editor={editor}
      editorLabel="Ubah operasi"
    />
  );
}
