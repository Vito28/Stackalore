'use client';

import { Fragment } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { cellId, formatCell, isWall, type Grid } from '@/lib/visualisasi/grid';
import type { Role } from '@/lib/visualisasi/types';

export interface GridCellContent {
  /** Main text, e.g. a room number or a distance. Pops in when it first appears. */
  text?: string;
  /** Muted text shown while there is no `text`, e.g. `E` before it is found. */
  placeholder?: string;
  /** Small name in the corner, e.g. `S` or `E`. */
  tag?: string;
  /** Extra words for screen readers, e.g. "ruangan 1". */
  description?: string;
}

const pop = { type: 'spring', stiffness: 520, damping: 26, mass: 0.6 } as const;

/**
 * A character grid as square cells: walls are solid blocks, floor cells use
 * the shared role colours and can hold a short text (a room number or a
 * distance). Nine columns still fit a phone screen.
 */
export function GridView({
  grid,
  highlights,
  content,
  label,
  indices = true,
}: {
  grid: Grid;
  /** Keyed by cell id `r<i>c<j>`. */
  highlights: Record<string, Role>;
  content: Record<string, GridCellContent>;
  /** Screen reader summary of the whole grid. */
  label: string;
  /** Row and column numbers around the grid. */
  indices?: boolean;
}) {
  const columns = `${indices ? '0.875rem ' : ''}repeat(${grid.cols}, minmax(0, 2.5rem))`;
  const offset = indices ? 1 : 0;

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="list"
        aria-label={label}
        className="mx-auto grid w-full gap-[3px] sm:gap-1"
        style={{ gridTemplateColumns: columns, justifyContent: 'center' }}
      >
        {indices
          ? Array.from({ length: grid.cols }, (_, c) => (
              <span
                key={`col-${c}`}
                aria-hidden="true"
                className="text-center text-[0.625rem] leading-4 text-fd-muted-foreground tabular-nums"
                style={{ gridRow: 1, gridColumn: c + offset + 1 }}
              >
                {c}
              </span>
            ))
          : null}

        {Array.from({ length: grid.rows }, (_, r) => (
          <Fragment key={`row-${r}`}>
            {indices ? (
              <span
                aria-hidden="true"
                className="flex items-center justify-center text-[0.625rem] text-fd-muted-foreground tabular-nums"
                style={{ gridRow: r + offset + 1, gridColumn: 1 }}
              >
                {r}
              </span>
            ) : null}
            {Array.from({ length: grid.cols }, (_, c) => {
              const id = cellId(r, c);
              const place = { gridRow: r + offset + 1, gridColumn: c + offset + 1 };
              if (isWall(grid, r, c)) {
                return (
                  <div
                    key={id}
                    role="listitem"
                    aria-label={`${formatCell(r, c)}: dinding`}
                    className="aspect-square rounded-[5px] bg-fd-muted-foreground/45"
                    style={place}
                  />
                );
              }
              const cell = content[id] ?? {};
              const role = highlights[id];
              const words = [cell.tag, cell.description].filter(Boolean).join(', ');
              return (
                <div
                  key={id}
                  role="listitem"
                  aria-label={`${formatCell(r, c)}: lantai${words ? `, ${words}` : ''}${role === 'aktif' ? ', sedang diproses' : ''}`}
                  className="viz-cell relative flex aspect-square min-w-0 items-center justify-center rounded-[5px] font-mono text-xs font-semibold tabular-nums sm:text-sm"
                  data-role={role}
                  style={place}
                >
                  {cell.tag ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-0.5 left-1 font-sans text-[0.5rem] leading-none font-bold text-fd-muted-foreground sm:text-[0.625rem]"
                    >
                      {cell.tag}
                    </span>
                  ) : null}
                  <AnimatePresence initial={false} mode="wait">
                    {cell.text !== undefined ? (
                      <motion.span
                        key={`text-${cell.text}`}
                        aria-hidden="true"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={pop}
                      >
                        {cell.text}
                      </motion.span>
                    ) : cell.placeholder ? (
                      <motion.span
                        key={`placeholder-${cell.placeholder}`}
                        aria-hidden="true"
                        className="text-fd-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      >
                        {cell.placeholder}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </MotionConfig>
  );
}
