import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  primary:
    'border-cyan-600/70 bg-cyan-500 text-slate-950 shadow-[0_0_24px_-8px_rgb(6_182_212/0.72)] hover:border-cyan-400 hover:bg-cyan-400 dark:border-cyan-300/60 dark:bg-cyan-300 dark:hover:bg-cyan-200',
  outline:
    'border-fd-border bg-fd-background/35 text-fd-foreground hover:border-cyan-500/50 hover:bg-cyan-500/8 hover:text-cyan-700 dark:bg-fd-background/20 dark:hover:text-cyan-300',
  ghost:
    'border-transparent text-fd-muted-foreground hover:border-fd-border hover:bg-fd-accent/60 hover:text-fd-foreground',
  secondary:
    'border-fd-border bg-fd-card/55 text-fd-foreground shadow-sm backdrop-blur-md hover:border-cyan-500/45 hover:bg-fd-accent/70 dark:bg-fd-card/35',
} as const;

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-[2px] border p-2 font-mono text-sm font-semibold uppercase tracking-[0.12em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:translate-y-px [&_svg]:shrink-0',
  {
    variants: {
      variant: variants,
      // fumadocs use `color` instead of `variant`
      color: variants,
      size: {
        default: 'h-11 px-5 text-xs',
        sm: 'h-9 gap-1.5 px-3 text-[0.6875rem]',
        lg: 'h-13 px-7 text-sm',
        icon: 'size-11 p-0 [&_svg]:size-5',
        'icon-sm': 'size-9 p-0 [&_svg]:size-4.5',
        'icon-xs': 'size-8 p-0 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  color,
  size,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        buttonVariants({
          variant: variant ?? (color ? undefined : 'primary'),
          color,
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}
