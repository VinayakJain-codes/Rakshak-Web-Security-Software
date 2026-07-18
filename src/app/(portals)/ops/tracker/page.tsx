'use client';

import React, { useState, useEffect } from 'react';
import { useGuardPositions } from '../../../../hooks/useGuardPositions';
import { StatusBadge } from '../../../../components/ui/rakshak/StatusBadge';
import { createClient } from '../../../../utils/supabase/client';
import { useAuth } from '../../../../providers/AuthProvider';

export default function OpsTrackerPage() {
  const supabase = createClient();
  const { tenantId } = useAuth();
  const { guards, isLoading: guardsLoading, lastUpdated } = useGuardPositions();
  const [geofences, setGeofences] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Guard State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuardName, setNewGuardName] = useState('');
  const [newGuardSite, setNewGuardSite] = useState('');

  useEffect(() => {
    loadSites();
  }, [supabase]);

  const loadSites = async () => {
    try {
      const { data: geoData } = await supabase.from('geofences').select('*');
      if (geoData) {
        setGeofences(geoData);
      }
    } catch (err) {
      console.error('Error loading sites:', err);
    }
  };

  const filteredGuards = guards.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGuard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuardName.trim() || !tenantId) return;

    try {
      const { error } = await supabase.from('guards').insert([{
        tenant_id: tenantId,
        name: newGuardName,
        status: 'pending',
        site_id: newGuardSite || null,
      }]);

      if (error) throw error;
      
      setShowAddModal(false);
      setNewGuardName('');
      setNewGuardSite('');
      // useGuardPositions has a realtime subscription, so it will update automatically
    } catch (e: any) {
      alert(`Error adding guard: ${e.message}`);
    }
  };

  const handleSendAlert = (guardName: string) => {
    // In a real application, this might insert into an alerts table or send a push notification
    alert(`Alert notification sent to ${guardName}`);
  };

  if (guardsLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[500px]">Loading guards...</div>;
  }

  return (
    <div className="flex flex-col h-full -m-4 md:-m-8 p-4 md:p-8 bg-surface-container-lowest">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Guards Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage personnel and send critical alerts</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Guard
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col flex-1 shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input 
              type="text" 
              placeholder="Search guards..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-3 py-2 text-sm font-label focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="text-xs text-on-surface-variant font-mono hidden md:block">
            Last synced: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant text-sm font-label sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 border-b border-outline-variant font-medium">Name</th>
                <th className="p-4 border-b border-outline-variant font-medium">Status</th>
                <th className="p-4 border-b border-outline-variant font-medium hidden md:table-cell">Assigned Site</th>
                <th className="p-4 border-b border-outline-variant font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuards.map(guard => (
                <tr key={guard.id} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
                        {guard.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-bold text-on-surface">{guard.name}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge variant={guard.status} showDot={true}>
                      {guard.status === 'active' ? 'Active' : guard.status === 'pending' ? 'Pending' : guard.status === 'critical' ? 'Critical' : 'Completed'}
                    </StatusBadge>
                  </td>
                  <td className="p-4 hidden md:table-cell text-on-surface-variant text-sm">
                    {geofences.find(g => g.id === guard.siteId)?.site_name || 'Unassigned'}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleSendAlert(guard.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-error text-error hover:bg-error-container hover:border-error-container transition-colors text-sm font-label font-medium"
                      title={`Send alert to ${guard.name}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                      Alert
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGuards.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant font-label">
                    No guards found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guard Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleAddGuard}>
              <div className="p-6">
                <h2 className="text-xl font-headline font-bold mb-2 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  Add New Guard
                </h2>
                <p className="text-on-surface-variant text-sm mb-6">
                  Register a new guard to your workforce. They will initially have a 'Pending' status.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newGuardName}
                      onChange={(e) => setNewGuardName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Assign Site (Optional)</label>
                    <select
                      value={newGuardSite}
                      onChange={(e) => setNewGuardSite(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                    >
                      <option value="">Select a site...</option>
                      {geofences.map(geo => (
                        <option key={geo.id} value={geo.id}>{geo.site_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container p-4 border-t border-outline-variant flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-label font-bold text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newGuardName.trim()}
                  className="px-4 py-2 font-label font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Guard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
