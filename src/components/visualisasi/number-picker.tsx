'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Row of number buttons for a single small input, e.g. `n` of `faktorial(n)` or the number of disks. */
export function NumberPicker({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: ReactNode;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const labelId = useId();
  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span id={labelId} className="text-xs text-fd-muted-foreground">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="inline-flex rounded-lg border bg-fd-background p-0.5">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={value === item}
            onClick={() => onChange(item)}
            className={cn(
              'h-9 min-w-9 rounded-md px-2 font-mono text-sm font-medium tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none',
              value === item ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
