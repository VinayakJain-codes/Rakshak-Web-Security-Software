import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-label border transition-colors',
  {
    variants: {
      variant: {
        active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        critical: 'bg-error-container text-on-error-container border-error/20',
        completed: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
      },
    },
    defaultVariants: {
      variant: 'active',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ children, variant, className, showDot = true }: StatusBadgeProps) {
  return (
    <span className={twMerge(badgeVariants({ variant }), className)} role="status">
      {showDot && (
        <span
          className={twMerge(
            'w-1.5 h-1.5 rounded-full',
            variant === 'active' && 'bg-green-500',
            variant === 'pending' && 'bg-amber-500',
            variant === 'critical' && 'bg-error',
            variant === 'completed' && 'bg-outline'
          )}
        />
      )}
      {children}
    </span>
  );
}
