'use client';

import { useMemo, useState } from 'react';
import { floodCases, floodFillSteps, floodPseudocode, type FloodStep } from '@/lib/visualisasi/flood-fill';
import { ChoicePicker } from './choice-picker';
import { GridView, type GridCellContent } from './grid-view';
import { InfoBox, ResultValue, reportPropError } from './tree-editor';
import { Visualizer, type LegendItem } from './visualizer';

interface VisualisasiFloodFillProps {
  /** Starting floor plan: `materi` (default), `pintu-tertutup` or `satu-ruangan`. */
  kasus?: string;
  judul?: string;
}

const legend: LegendItem[] = [
  { role: 'aktif', label: 'sedang diisi' },
  { role: 'khusus', label: 'masih di call stack' },
  { role: 'selesai', label: 'sudah diisi (angka = ruangan)' },
];

const caseChoices = floodCases.map((item) => ({ value: item.id, label: item.label }));

function startingCase(kasus: string | undefined): string {
  if (kasus === undefined) return floodCases[0].id;
  if (floodCases.some((item) => item.id === kasus)) return kasus;
  reportPropError('VisualisasiFloodFill', 'kasus', `pilih salah satu dari ${floodCases.map((item) => item.id).join(', ')}.`);
  return floodCases[0].id;
}

function FloodView({ step, index }: { step: FloodStep; index: number }) {
  const { grid, room, stack, rooms, found } = step.state;
  const content: Record<string, GridCellContent> = {};
  for (const [id, number] of Object.entries(room)) content[id] = { text: String(number), description: `ruangan ${number}` };
  if (found) content[found] = { description: 'ruangan baru ditemukan' };
  const filled = Object.keys(room).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <GridView
        grid={grid}
        highlights={step.highlights}
        content={content}
        label={`Denah ${grid.rows} kali ${grid.cols}. ${filled} sel lantai sudah diisi, ${rooms} ruangan ditemukan.`}
      />
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
        <InfoBox title="Ruangan">
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{rooms}</span>
        </InfoBox>
        <InfoBox title="Kedalaman rekursi">
          <span className="font-mono text-2xl font-semibold text-fd-foreground tabular-nums">{stack.length}</span>
          <span className="ml-1 text-xs text-fd-muted-foreground">panggilan</span>
        </InfoBox>
        <InfoBox title="Hasil">
          <ResultValue result={step.result} stepKey={String(index)} error={false} />
        </InfoBox>
      </div>
    </div>
  );
}

/** Flood fill counting the rooms of a floor plan, as in the DFS lesson. MDX: `<VisualisasiFloodFill />`. */
export function VisualisasiFloodFill({ kasus, judul = 'Visualisasi flood fill' }: VisualisasiFloodFillProps) {
  const [caseId, setCaseId] = useState(() => startingCase(kasus));
  const current = floodCases.find((item) => item.id === caseId) ?? floodCases[0];
  const steps = useMemo(() => floodFillSteps(current.rows), [current]);

  return (
    <Visualizer
      title={judul}
      steps={steps}
      pseudocode={floodPseudocode}
      legend={legend}
      renderHeader={() => <ChoicePicker label="Denah" choices={caseChoices} value={caseId} onChange={setCaseId} />}
      render={(step, index) => <FloodView step={step} index={index} />}
    />
  );
}
