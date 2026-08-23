import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
        secondary:
          'border-zinc-800 bg-zinc-900/90 text-zinc-300',
        apple:
          'border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold',
        warning:
          'border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold',
        destructive:
          'border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold',
        outline: 'border-zinc-700 text-zinc-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
