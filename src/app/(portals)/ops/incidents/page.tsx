'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { createClient } from '../../../../utils/supabase/client';
import { useAuth } from '../../../../providers/AuthProvider';

type Status = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface Incident {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  createdAt: string;
}

const StatusPill = ({ status }: { status: Status }) => {
  const styles = {
    OPEN: 'bg-error-container text-on-error-container',
    INVESTIGATING: 'bg-[var(--color-orange-container)] text-[var(--color-on-orange-container)]',
    RESOLVED: 'bg-[var(--color-green-container)] text-[var(--color-on-green-container)]',
    CLOSED: 'bg-surface-container-high text-on-surface-variant'
  };
  
  return (
    <span className={clsx('px-2.5 py-1 text-[10px] font-bold font-label rounded-full tracking-wider flex items-center gap-1 w-fit', styles[status])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};

export default function IncidentsPage() {
  const supabase = createClient();
  const { tenantId } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [assignee, setAssignee] = useState('');

  const loadIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Incident[] = data.map((row: any) => ({
          id: row.id.substring(0, 8).toUpperCase(),
          title: row.title,
          status: row.status as Status,
          priority: row.priority as Priority,
          assignee: row.assignee,
          createdAt: new Date(row.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
        setIncidents(mapped);
      }
    } catch (err) {
      console.error('Error loading incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();

    // Subscribe to live incident changes
    const channel = supabase
      .channel('live-incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        () => {
          loadIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const { error } = await supabase
        .from('incidents')
        .insert([
          {
            title,
            priority,
            assignee: assignee || 'Unassigned',
            status: 'OPEN',
            tenant_id: tenantId
          }
        ]);

      if (error) throw error;

      // Reset
      setTitle('');
      setPriority('MEDIUM');
      setAssignee('');
      setShowLogModal(false);

      loadIncidents();
    } catch (err: any) {
      alert(`Failed to log incident: ${err.message}`);
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.title.toLowerCase().includes(search.toLowerCase()) || 
    inc.id.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px] text-on-surface-variant font-label">Loading incidents...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Incident Management</h1>
          <p className="text-sm font-label text-on-surface-variant mt-1">Track, assign, and resolve escalated security events.</p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="bg-primary text-on-primary font-bold font-label px-4 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Log Incident
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search incidents by ID or keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-label focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <button className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-label font-bold text-sm text-on-surface flex items-center gap-2 hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Filter
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Incident ID</th>
                <th className="p-4 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Priority</th>
                <th className="p-4 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Assignee</th>
                <th className="p-4 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Created</th>
                <th className="p-4 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant font-label text-sm">
                    No incidents logged.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-mono text-sm text-on-surface font-medium">{inc.id}</td>
                    <td className="p-4 font-label font-bold text-sm text-on-surface">{inc.title}</td>
                    <td className="p-4">
                      <StatusPill status={inc.status} />
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "text-xs font-bold font-label flex items-center gap-1",
                        inc.priority === 'HIGH' ? 'text-error' : inc.priority === 'MEDIUM' ? 'text-[var(--color-orange)]' : 'text-on-surface-variant'
                      )}>
                        <span className="material-symbols-outlined text-[14px]">flag</span>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-label text-on-surface-variant flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                        {inc.assignee === 'Unassigned' ? '?' : inc.assignee.charAt(0)}
                      </div>
                      {inc.assignee}
                    </td>
                    <td className="p-4 text-sm font-label text-on-surface-variant">{inc.createdAt}</td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-1.5 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors" title="View Details">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button className="p-1.5 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Incident Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <form onSubmit={handleLogIncident} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-headline font-bold text-on-surface">Log New Incident</h3>
                    <button type="button" onClick={() => setShowLogModal(false)} className="text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-1">Incident Title</label>
                        <input 
                          type="text" 
                          required
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none text-sm text-on-surface" 
                          placeholder="e.g. Unauthorized visitor near perimeter" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-1">Priority</label>
                        <select 
                          value={priority}
                          onChange={e => setPriority(e.target.value as Priority)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none text-sm text-on-surface"
                        >
                            <option value="LOW">Low Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="HIGH">High Priority</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-1">Assignee Name</label>
                        <input 
                          type="text" 
                          value={assignee}
                          onChange={e => setAssignee(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none text-sm text-on-surface" 
                          placeholder="e.g. Rajesh Kumar" 
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg font-bold text-sm bg-primary text-on-primary hover:opacity-90 transition-opacity">Submit Incident</button>
                    </div>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}
