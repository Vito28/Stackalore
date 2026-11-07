import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const cornerCardVariants = cva(
  'tech-glass group relative isolate overflow-hidden border text-fd-foreground transition-[border-color,box-shadow,transform] duration-300',
  {
    variants: {
      accent: {
        info:
          '[--corner-accent:var(--color-cyan-500)] hover:border-cyan-500/35 hover:shadow-[0_20px_60px_-38px_rgb(6_182_212/0.55)]',
        attention:
          '[--corner-accent:var(--color-amber-500)] hover:border-amber-500/35 hover:shadow-[0_20px_60px_-38px_rgb(245_158_11/0.5)]',
        urgent:
          '[--corner-accent:var(--color-red-500)] hover:border-red-500/35 hover:shadow-[0_20px_60px_-38px_rgb(239_68_68/0.5)]',
        neutral:
          '[--corner-accent:var(--color-fd-muted-foreground)] hover:border-fd-foreground/25 hover:shadow-lg',
      },
      interactive: {
        true: 'hover:-translate-y-0.5',
        false: '',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      accent: 'info',
      interactive: false,
      padding: 'md',
    },
  },
);

export interface CornerCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cornerCardVariants> {}

export function CornerCard({
  accent,
  children,
  className,
  interactive,
  padding,
  ...props
}: CornerCardProps) {
  return (
    <div
      className={cn(
        cornerCardVariants({ accent, interactive, padding }),
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.5)_0%,transparent_28%,transparent_72%,rgb(6_182_212/0.06)_100%)] dark:bg-[linear-gradient(115deg,rgb(255_255_255/0.035)_0%,transparent_32%,transparent_75%,rgb(6_182_212/0.035)_100%)]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -top-24 -right-20 z-0 size-48 rounded-full bg-cyan-300/12 blur-3xl dark:bg-cyan-400/5"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -top-px -left-px z-20 size-4 border-t-2 border-l-2 border-(--corner-accent) transition-[width,height] duration-300 group-hover:size-6"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -right-px -bottom-px z-20 size-4 border-r-2 border-b-2 border-(--corner-accent) transition-[width,height] duration-300 group-hover:size-6"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
