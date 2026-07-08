import { StatusBadge } from './StatusBadge';

interface AlertCardProps {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  location: string;
  timestamp: string;
  status: 'active' | 'pending' | 'resolved';
}

export function AlertCard({ severity, title, location, timestamp, status }: AlertCardProps) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-start gap-4 relative overflow-hidden group hover:bg-surface-container-low transition-colors">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        severity === 'critical' ? 'bg-error' :
        severity === 'warning' ? 'bg-amber-500' :
        'bg-primary'
      }`} />
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-on-surface truncate">{title}</h4>
          <span className="text-xs text-on-surface-variant font-mono">{timestamp}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-on-surface-variant flex items-center gap-1 font-label">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {location}
          </span>
          <div className="flex-1" />
          <StatusBadge 
            variant={status === 'resolved' ? 'completed' : status === 'active' ? 'critical' : 'pending'}
          >
            {status}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}
