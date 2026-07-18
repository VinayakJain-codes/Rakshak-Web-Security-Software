'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/client';
import { StatusBadge } from '../../../../components/ui/rakshak/StatusBadge';
import { AddGuardModal } from '../../../../components/ops/AddGuardModal';
import { Guard } from '../../../../types/guard';
import { useAuth } from '../../../../providers/AuthProvider';

export default function GuardsListPage() {
  const supabase = createClient();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tenantId } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [geofences, setGeofences] = useState<any[]>([]);

  const fetchGuards = async () => {
    try {
      if (!tenantId) return;
      const { data, error } = await supabase
        .from('guards')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name');
      
      if (error) throw error;
      setGuards(data || []);
    } catch (err) {
      console.error('Failed to fetch guards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      if (!tenantId) return;
      const { data } = await supabase.from('geofences').select('*').eq('tenant_id', tenantId);
      if (data) setGeofences(data);
    } catch (err) {
      console.error('Failed to fetch sites', err);
    }
  };

  useEffect(() => {
    fetchGuards();
    fetchSites();
  }, [supabase]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-label">Loading guards roster...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Guards Roster</h2>
          <p className="text-on-surface-variant font-label mt-1">Manage personnel, track real-time locations, and view check-ins.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Guard
        </button>
      </header>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="p-4 font-bold text-sm text-on-surface-variant uppercase font-label">Name</th>
              <th className="p-4 font-bold text-sm text-on-surface-variant uppercase font-label">Status</th>
              <th className="p-4 font-bold text-sm text-on-surface-variant uppercase font-label text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {guards.map(guard => (
              <tr key={guard.id} className="hover:bg-surface-container-low transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                      {(guard?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{guard?.name || 'Unknown Guard'}</div>
                      <div className="text-xs text-on-surface-variant font-mono mt-0.5">ID: {guard.id.substring(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge variant={guard.status === 'active' ? 'completed' : guard.status === 'critical' ? 'critical' : 'pending'}>
                    {guard.status}
                  </StatusBadge>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/ops/guards/${guard.id}`}>
                    <button className="bg-surface-container-high hover:bg-primary/10 hover:text-primary text-on-surface px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border border-outline-variant">
                      Manage Guard
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {guards.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-on-surface-variant font-label text-sm">
                  No guards found in this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && tenantId && (
        <AddGuardModal 
          tenantId={tenantId}
          geofences={geofences}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchGuards();
          }}
        />
      )}
    </div>
  );
}
