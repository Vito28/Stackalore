import { Fragment } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------------- */
/* Pipeline: horizontal steps (vertical on phones), e.g. source → compiler.  */
/* ------------------------------------------------------------------------- */

interface PipelineStep {
  label: string;
  note?: string;
  /** Highlights the step as the tool doing the work (compiler, interpreter). */
  tool?: boolean;
}

export function Pipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="not-prose my-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {steps.map((step, index) => (
        <Fragment key={step.label}>
          {index > 0 ? (
            <ArrowRight
              className="size-4 shrink-0 rotate-90 self-center text-fd-muted-foreground sm:rotate-0"
              aria-hidden="true"
            />
          ) : null}
          <div
            className={cn(
              'flex-1 rounded-lg border px-3 py-2.5 text-center',
              step.tool ? 'border-fd-primary/35 bg-fd-primary/8' : 'bg-fd-card',
            )}
          >
            <div
              className={cn(
                'text-sm font-medium',
                step.tool ? 'text-fd-primary' : 'font-mono text-fd-foreground',
              )}
            >
              {step.label}
            </div>
            {step.note ? <div className="mt-0.5 text-xs leading-5 text-fd-muted-foreground">{step.note}</div> : null}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
