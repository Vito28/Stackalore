import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  primary:
    'border-transparent bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90',
  outline:
    'border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-muted',
  ghost:
    'border-transparent text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground',
  secondary:
    'border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent',
} as const;

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: variants,
      // fumadocs components use `color` instead of `variant`
      color: variants,
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 gap-1.5 px-3 text-[0.8125rem]',
        lg: 'h-11 px-5 text-[0.95rem]',
        icon: 'size-10 p-0 [&_svg]:size-5',
        'icon-sm': 'size-8 p-0 [&_svg]:size-4',
        'icon-xs': 'size-7 p-0 [&_svg]:size-3.5',
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
