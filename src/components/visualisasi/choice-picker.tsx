'use client';

import { useId, type ReactNode } from 'react';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Choice<T extends string> {
  value: T;
  label: ReactNode;
}

const chip =
  'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none';
const chipOn = 'border-fd-primary bg-fd-primary text-fd-primary-foreground';
const chipOff = 'bg-fd-background text-fd-muted-foreground hover:text-fd-foreground';

/**
 * A labelled row of chips where exactly one is chosen, e.g. the algorithm or
 * the input case. Wraps onto more lines on a phone instead of scrolling.
 * `onRandom` adds an "Acak" chip that makes new data on every press.
 */
export function ChoicePicker<T extends string>({
  label,
  choices,
  value,
  onChange,
  onRandom,
  randomActive = false,
}: {
  label: ReactNode;
  choices: Choice<T>[];
  /** Ignored while `randomActive` is true. */
  value: T;
  onChange: (value: T) => void;
  onRandom?: () => void;
  randomActive?: boolean;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span id={labelId} className="text-xs text-fd-muted-foreground">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-1.5">
        {choices.map((choice) => {
          const checked = !randomActive && choice.value === value;
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(choice.value)}
              className={cn(chip, checked ? chipOn : chipOff)}
            >
              {choice.label}
            </button>
          );
        })}
        {onRandom ? (
          <button
            type="button"
            role="radio"
            aria-checked={randomActive}
            onClick={onRandom}
            title="Buat data acak baru"
            className={cn(chip, randomActive ? chipOn : chipOff)}
          >
            <Shuffle className="size-3.5" aria-hidden="true" />
            Acak
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Stack of pickers above a drawing. */
export function PickerStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2.5">{children}</div>;
}
