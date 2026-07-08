'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../../../utils/supabase/client';

interface SupportTicket {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
}

export default function AdminSupportPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [tenantsMap, setTenantsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketError) throw ticketError;

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, name');

      const tMap: Record<string, string> = {};
      tenantData?.forEach(t => {
        tMap[t.id] = t.name;
      });

      setTickets(ticketData || []);
      setTenantsMap(tMap);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  const updateTicketStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      loadData(); // Reload to reflect changes
    } catch (err: any) {
      alert(`Failed to update ticket: ${err.message}`);
    }
  };

  const openTickets = tickets.filter(t => t.status === 'OPEN');
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS');
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-error text-on-error';
      case 'HIGH': return 'bg-[var(--color-orange)] text-white';
      case 'MEDIUM': return 'bg-secondary text-on-secondary';
      case 'LOW': return 'bg-surface-container-highest text-on-surface';
      default: return 'bg-surface-container-highest text-on-surface';
    }
  };

  const renderTicketCard = (ticket: SupportTicket) => (
    <div key={ticket.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${getSeverityColor(ticket.severity)}`}>
          {ticket.severity}
        </span>
        <span className="text-[10px] font-mono text-on-surface-variant">
          {new Date(ticket.created_at).toLocaleDateString()}
        </span>
      </div>
      <h4 className="font-bold text-on-surface text-sm mb-1 line-clamp-2">{ticket.title}</h4>
      <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{ticket.description}</p>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[14px] text-primary">corporate_fare</span>
        <span className="text-xs font-bold text-primary">{tenantsMap[ticket.tenant_id] || 'Unknown Org'}</span>
      </div>

      <div className="flex gap-2 justify-end border-t border-outline-variant pt-3">
        {ticket.status === 'OPEN' && (
          <button 
            onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
            className="text-xs font-bold text-secondary hover:underline px-2 py-1"
          >
            Start Progress
          </button>
        )}
        {ticket.status === 'IN_PROGRESS' && (
          <>
            <button 
              onClick={() => updateTicketStatus(ticket.id, 'OPEN')}
              className="text-xs font-bold text-on-surface-variant hover:underline px-2 py-1"
            >
              Revert
            </button>
            <button 
              onClick={() => updateTicketStatus(ticket.id, 'RESOLVED')}
              className="text-xs font-bold bg-primary text-on-primary rounded px-3 py-1 hover:opacity-90 transition-opacity"
            >
              Resolve
            </button>
          </>
        )}
        {ticket.status === 'RESOLVED' && (
          <button 
            onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
            className="text-xs font-bold text-on-surface-variant hover:underline px-2 py-1"
          >
            Re-open
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px] text-on-surface-variant font-label">Loading support queues...</div>;
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Global Support Queues</h2>
        <p className="text-on-surface-variant font-label">Kanban-style ticket management.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-250px)]">
        {/* Open Column */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              Open
            </h3>
            <span className="text-xs font-mono bg-surface-container-highest px-2 py-1 rounded text-on-surface-variant">
              {openTickets.length}
            </span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {openTickets.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center mt-10">No open tickets.</p>
            ) : (
              openTickets.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-orange)]"></span>
              In Progress
            </h3>
            <span className="text-xs font-mono bg-surface-container-highest px-2 py-1 rounded text-on-surface-variant">
              {inProgressTickets.length}
            </span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {inProgressTickets.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center mt-10">No tickets in progress.</p>
            ) : (
              inProgressTickets.map(renderTicketCard)
            )}
          </div>
        </div>

        {/* Resolved Column */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Resolved
            </h3>
            <span className="text-xs font-mono bg-surface-container-highest px-2 py-1 rounded text-on-surface-variant">
              {resolvedTickets.length}
            </span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {resolvedTickets.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center mt-10">No resolved tickets.</p>
            ) : (
              resolvedTickets.map(renderTicketCard)
            )}
          </div>
        </div>
      </div>
    </>
  );
}
