import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30',
        secondary: 'bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-700/80 shadow-xs hover:-translate-y-0.5 hover:border-slate-600',
        outline: 'border border-slate-800 bg-slate-950/60 text-slate-200 hover:bg-slate-900 hover:border-slate-700 hover:text-white',
        ghost: 'hover:bg-slate-800/70 hover:text-slate-100 text-slate-400',
        apple: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white font-bold shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-sm hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs md:text-sm',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
