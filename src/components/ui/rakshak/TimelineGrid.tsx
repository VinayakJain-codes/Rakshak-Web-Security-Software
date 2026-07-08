import { StatusBadge } from './StatusBadge';

interface TimelineEvent {
  id: string;
  timestamp: string;
  eventName: string;
  status: 'active' | 'pending' | 'critical' | 'completed';
  statusLabel: string;
  description: string;
  actor: string;
}

interface TimelineGridProps {
  events: TimelineEvent[];
}

export function TimelineGrid({ events }: TimelineGridProps) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-on-surface-variant font-label">
        <p>No events found for this shift.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left font-label text-sm">
        <thead>
          <tr className="bg-surface-container-high/30 text-on-surface-variant border-b border-outline-variant">
            <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest whitespace-nowrap">Timestamp</th>
            <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Event</th>
            <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Status</th>
            <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Description</th>
            <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Actor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-surface-container-low transition-colors group">
              <td className="px-6 py-4 text-on-surface font-mono text-xs whitespace-nowrap">{event.timestamp}</td>
              <td className="px-6 py-4 font-semibold text-on-surface">{event.eventName}</td>
              <td className="px-6 py-4">
                <StatusBadge variant={event.status}>{event.statusLabel}</StatusBadge>
              </td>
              <td className="px-6 py-4 text-on-surface-variant min-w-[200px]">{event.description}</td>
              <td className="px-6 py-4 text-on-surface-variant font-medium">{event.actor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
