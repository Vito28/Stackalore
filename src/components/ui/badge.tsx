import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const badgeVariants = cva(
  'inline-flex w-fit items-center gap-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.2em]',
  {
    variants: {
      variant: {
        info: 'text-cyan-700 dark:text-cyan-300',
        attention: 'text-amber-700 dark:text-amber-300',
        urgent: 'text-red-700 dark:text-red-300',
        neutral: 'text-fd-muted-foreground',
      },
      surface: {
        plain: '',
        soft: 'border border-current/20 bg-current/5 px-3 py-1.5 backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'info',
      surface: 'plain',
    },
  },
);

export interface TechBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  marker?: string;
}

export function TechBadge({
  children,
  className,
  marker,
  surface,
  variant,
  ...props
}: TechBadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ surface, variant }), className)}
      {...props}
    >
      {marker && (
        <span className="select-none opacity-65" aria-hidden="true">
          {marker}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
