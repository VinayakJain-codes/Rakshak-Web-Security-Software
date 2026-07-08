import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error';
  className?: string;
}

export function KPICard({ title, value, trend, icon, variant = 'primary', className }: KPICardProps) {
  return (
    <div className={twMerge(
      'bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group',
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 bg-${variant}-container text-on-${variant}-container rounded-lg`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        
        {trend && (
          <span className={clsx(
            'text-xs font-bold px-2 py-1 rounded-full',
            trend.direction === 'up' && variant !== 'error' ? `bg-${variant}-container/20 text-${variant}` : '',
            trend.direction === 'down' && variant === 'error' ? 'bg-error-container text-on-error-container' : ''
          )}>
            {trend.value}
          </span>
        )}
      </div>
      
      <h3 className="text-on-surface-variant font-label text-sm uppercase tracking-wider font-semibold">
        {title}
      </h3>
      
      <p className="text-3xl font-headline font-black text-on-surface mt-1">
        {value}
      </p>
      
      <div className="mt-4 w-full h-1 bg-surface-container rounded-full overflow-hidden">
        <div className={`bg-${variant} h-full w-[70%] group-hover:w-[85%] transition-all duration-500`}></div>
      </div>
    </div>
  );
}
