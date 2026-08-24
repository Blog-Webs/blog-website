import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
  {
    variants: {
      variant: {
        default:
          'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800',
        secondary:
          'border-slate-800/80 bg-slate-950/80 text-slate-300',
        apple:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold shadow-xs',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold',
        warning:
          'border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold',
        destructive:
          'border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold',
        outline: 'border-slate-700 text-slate-300',
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
