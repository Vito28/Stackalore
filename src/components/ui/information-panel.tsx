import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const informationVariants = cva(
  'tech-glass relative overflow-hidden border border-fd-border/75 py-5 pr-5 pl-6 text-fd-foreground',
  {
    variants: {
      variant: {
        info: '[--information-accent:var(--color-cyan-500)]',
        attention: '[--information-accent:var(--color-amber-500)]',
        urgent: '[--information-accent:var(--color-red-500)]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

const icons = {
  info: Info,
  attention: AlertTriangle,
  urgent: OctagonAlert,
} as const;

const labels = {
  info: 'Information',
  attention: 'Needs attention',
  urgent: 'Urgent',
} as const;

export interface InformationPanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof informationVariants> {
  title?: ReactNode;
  icon?: ReactNode;
}

export function InformationPanel({
  children,
  className,
  icon,
  title,
  variant = 'info',
  ...props
}: InformationPanelProps) {
  const selectedVariant = variant ?? 'info';
  const Icon = icons[selectedVariant];

  return (
    <div
      role={selectedVariant === 'urgent' ? 'alert' : 'note'}
      className={cn(informationVariants({ variant: selectedVariant }), className)}
      {...props}
    >
      <span
        className="absolute inset-y-0 left-0 w-px bg-(--information-accent) shadow-[0_0_8px_var(--information-accent),0_0_20px_var(--information-accent)]"
        aria-hidden="true"
      />
      <div className="flex items-start gap-3.5">
        <span
          className="mt-0.5 grid size-8 shrink-0 place-items-center border border-(--information-accent)/25 bg-(--information-accent)/8 text-(--information-accent)"
          aria-hidden="true"
        >
          {icon ?? <Icon className="size-4" strokeWidth={1.8} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-(--information-accent)">
            <span className="mr-2 opacity-65" aria-hidden="true">{'//'}</span>
            {title ?? labels[selectedVariant]}
          </p>
          <div className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
