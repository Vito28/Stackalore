'use client';

import { Fragment, useId } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import type { ArrayItem, Bracket, Pointer } from '@/lib/visualisasi/array';
import type { Role } from '@/lib/visualisasi/types';

export const arraySpring = { type: 'spring', stiffness: 380, damping: 32, mass: 0.85 } as const;

export interface ArrayViewProps {
  items: readonly (ArrayItem | null)[];
  /** Keyed by item id. */
  highlights: Record<string, Role>;
  pointers?: readonly Pointer[];
  /** Colour of a pointer label by its name, e.g. `{ mid: 'khusus' }`. */
  pointerRoles?: Record<string, Role>;
  /** Reserve room for this many pointer labels stacked under one index. Defaults to the number of pointers. */
  pointerRows?: number;
  /** Pointers drawn above the cells instead, each in a row of its own so a long name never collides, e.g. `jawaban`. */
  topPointers?: readonly Pointer[];
  brackets?: readonly Bracket[];
  /** Keep the bracket row even in steps without a bracket, so the drawing does not jump. */
  bracketRow?: boolean;
  /** An item lifted out of the row and held above `index`, like insertion sort's key. */
  floating?: { item: ArrayItem; index: number } | null;
  /** Keep the row above the cells for `floating`, so the drawing does not jump. */
  floatRow?: boolean;
  /** Draw values as bars whose height grows with the value; this is the largest value. */
  barMax?: number;
  /** Reserve a column at index -1 and at n for pointers that end just outside the data. */
  edges?: boolean;
  /** Positions outside this range are faded, e.g. outside quick sort's current call. */
  focus?: { from: number; to: number } | null;
  /** Show index numbers under the cells. */
  indices?: boolean;
  /** Screen reader summary of the row. */
  label: string;
}

const cellBase = 'viz-cell relative flex w-full items-center justify-center rounded-md font-mono font-semibold tabular-nums';

function barHeight(value: number, max: number) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return `calc(2.25rem + ${ratio.toFixed(3)} * 3.25rem)`;
}

const pointerText: Partial<Record<Role, string>> = {
  aktif: 'viz-text-aktif',
  khusus: 'viz-text-khusus',
  selesai: 'viz-text-selesai',
  error: 'viz-text-error',
};

/**
 * One row of array cells on a grid with one column per index. Cells keep
 * their element id, so a swap or a shift glides to the new column; pointers
 * (`lo`, `mid`, `i`, ...) slide under the row, and a lifted item floats above
 * its column. Everything lives in one grid, which keeps the motion simple and
 * the row inside a phone screen.
 */
export function ArrayView({
  items,
  highlights,
  pointers = [],
  pointerRoles = {},
  pointerRows,
  topPointers = [],
  brackets = [],
  bracketRow = false,
  floating = null,
  floatRow = false,
  barMax,
  edges = false,
  focus = null,
  indices = true,
  label,
}: ArrayViewProps) {
  const groupId = useId();
  const n = items.length;
  const offset = edges ? 1 : 0;
  const columns = n + 2 * offset;
  const column = (index: number) => index + offset + 1;
  const bars = barMax !== undefined;

  const hasFloat = floatRow || floating !== null;
  const hasBrackets = bracketRow || brackets.length > 0;
  const tops = topPointers.length;
  const rows = {
    float: 1,
    bracket: hasFloat ? 2 : 1,
    top: (hasFloat ? 1 : 0) + (hasBrackets ? 1 : 0) + 1,
    cells: (hasFloat ? 1 : 0) + (hasBrackets ? 1 : 0) + tops + 1,
  };
  const indexRow = rows.cells + 1;
  const pointerStart = rows.cells + (indices ? 2 : 1);
  const reservedPointerRows = pointerRows ?? pointers.length;

  // Pointers on the same index stack downwards, in the order given.
  const stackDepth = new Map<number, number>();
  const placedPointers = pointers.map((pointer) => {
    const depth = stackDepth.get(pointer.index) ?? 0;
    stackDepth.set(pointer.index, depth + 1);
    return { ...pointer, depth };
  });
  const outside = new Set(
    [...pointers, ...topPointers].map((pointer) => pointer.index).filter((index) => index < 0 || index >= n),
  );

  const tallest = bars ? barHeight(barMax, barMax) : '2.5rem';
  const rowTemplate = [
    hasFloat ? tallest : null,
    hasBrackets ? '1.5rem' : null,
    ...topPointers.map(() => '1.125rem'),
    bars ? tallest : '2.5rem',
    indices ? '1rem' : null,
    ...Array.from({ length: Math.max(reservedPointerRows, 0) }, () => '1.125rem'),
  ]
    .filter(Boolean)
    .join(' ');

  const faded = (index: number) => focus !== null && (index < focus.from || index > focus.to);

  return (
    <MotionConfig reducedMotion="user" transition={arraySpring}>
      <LayoutGroup id={groupId}>
        <div
          role="list"
          aria-label={label}
          className="mx-auto grid w-full gap-x-1 gap-y-1 sm:gap-x-1.5"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 3rem))`,
            gridTemplateRows: rowTemplate,
            justifyContent: 'center',
          }}
        >
          {brackets
            .filter((bracket) => bracket.from <= bracket.to)
            .map((bracket) => (
              <motion.div
                key={bracket.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-w-0 flex-col items-stretch justify-end"
                style={{ gridRow: rows.bracket, gridColumn: `${column(bracket.from)} / ${column(bracket.to) + 1}` }}
                aria-hidden="true"
              >
                <motion.span layout="position" className="truncate px-0.5 text-center text-[0.6875rem] leading-4 text-fd-muted-foreground">
                  {bracket.label}
                </motion.span>
                <span className="mx-0.5 h-1.5 rounded-t-sm border-x-[1.5px] border-t-[1.5px] border-fd-muted-foreground/50" />
              </motion.div>
            ))}

          {items.map((item, index) =>
            item === null ? (
              <div
                key={`slot-${index}`}
                className={cn('rounded-md border-[1.5px] border-dashed border-fd-muted-foreground/40', bars ? 'self-end' : '')}
                style={{ gridRow: rows.cells, gridColumn: column(index), height: bars ? '2.25rem' : undefined }}
                role="listitem"
                aria-label={`indeks ${index}: kosong`}
              />
            ) : null,
          )}

          {[...items.map((item, index) => ({ item, index, float: false })), ...(floating ? [{ ...floating, float: true }] : [])]
            .filter((entry): entry is { item: ArrayItem; index: number; float: boolean } => entry.item !== null)
            .sort((a, b) => a.item.id.localeCompare(b.item.id))
            .map(({ item, index, float }) => (
              <motion.div
                key={item.id}
                layout
                role="listitem"
                aria-label={float ? `${item.value}, diangkat di atas indeks ${index}` : `indeks ${index}: ${item.value}`}
                className={cn(
                  cellBase,
                  bars ? 'items-end self-end pb-1.5 text-sm' : 'h-10 text-[0.8125rem] sm:text-sm',
                  !float && faded(index) && 'opacity-40',
                )}
                style={{
                  gridRow: float ? rows.float : rows.cells,
                  gridColumn: column(index),
                  height: bars ? barHeight(item.value, barMax) : undefined,
                }}
                data-role={highlights[item.id]}
              >
                {item.value}
              </motion.div>
            ))}

          {indices
            ? items.map((_, index) => (
                <span
                  key={`index-${index}`}
                  className={cn('text-center text-[0.625rem] leading-4 text-fd-muted-foreground tabular-nums', faded(index) && 'opacity-50')}
                  style={{ gridRow: indexRow, gridColumn: column(index) }}
                  aria-hidden="true"
                >
                  {index}
                </span>
              ))
            : null}

          {[...outside].map((index) => (
            <Fragment key={`edge-${index}`}>
              <div
                className="h-10 rounded-md border-[1.5px] border-dashed border-fd-muted-foreground/30"
                style={{ gridRow: rows.cells, gridColumn: column(index) }}
                aria-hidden="true"
              />
              {indices ? (
                <span
                  className="text-center text-[0.625rem] leading-4 text-fd-muted-foreground tabular-nums"
                  style={{ gridRow: indexRow, gridColumn: column(index) }}
                  aria-hidden="true"
                >
                  {index}
                </span>
              ) : null}
            </Fragment>
          ))}

          {topPointers.map((pointer, row) => (
            <motion.span
              key={`top-${pointer.name}`}
              layout="position"
              className={cn(
                'flex items-center justify-center gap-px font-sans text-[0.6875rem] leading-4 font-semibold whitespace-nowrap',
                (pointerRoles[pointer.name] && pointerText[pointerRoles[pointer.name]]) || 'text-fd-foreground',
              )}
              style={{ gridRow: rows.top + row, gridColumn: column(pointer.index) }}
              aria-label={`${pointer.name} = ${pointer.index}`}
            >
              {pointer.name}
              <span aria-hidden="true">▼</span>
            </motion.span>
          ))}

          {placedPointers.map((pointer) => (
            <motion.span
              key={`pointer-${pointer.name}`}
              layout="position"
              className={cn(
                'flex items-center justify-center gap-px font-sans text-[0.6875rem] leading-4 font-semibold whitespace-nowrap',
                (pointerRoles[pointer.name] && pointerText[pointerRoles[pointer.name]]) || 'text-fd-foreground',
              )}
              style={{ gridRow: pointerStart + pointer.depth, gridColumn: column(pointer.index) }}
              aria-label={`${pointer.name} = ${pointer.index}`}
            >
              {pointer.depth === 0 ? <span aria-hidden="true">▲</span> : null}
              {pointer.name}
            </motion.span>
          ))}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
