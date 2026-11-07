import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const badgeVariants = {
  brand:
    'border-brand-indigo/20 bg-brand-indigo/5 text-brand-indigo dark:bg-brand-indigo/10 dark:text-brand-blue',
  interactive:
    'border-viz-current/20 bg-viz-current/5 text-viz-current dark:bg-viz-current/10',
  playground:
    'border-viz-transform/20 bg-viz-transform/5 text-viz-transform dark:bg-viz-transform/10',
} as const;

interface LiveBadgeProps {
  children: ReactNode;
  variant?: keyof typeof badgeVariants;
  className?: string;
}

export function LiveBadge({
  children,
  variant = 'brand',
  className,
}: LiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-2 rounded-full border px-2.5 text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-35 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-current shadow-glow-current" />
      </span>
      {children}
    </span>
  );
}
