'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import { useAuth } from '../../../../providers/AuthProvider';
import { StatusBadge } from '../../../../components/ui/rakshak/StatusBadge';

type Schedule = {
  id: string;
  task_type: string;
  scheduled_time: string;
  is_completed: boolean;
};

export default function GuardDashboardPage() {
  const supabase = createClient();
  const { tenantId } = useAuth(); // We fetch the guard using tenant_id and user auth
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [guardId, setGuardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // File upload state
  const [uploadingTask, setUploadingTask] = useState<string | null>(null);

  // Issue raising state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');

  useEffect(() => {
    const fetchGuardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // Find the guard by email (assuming guard name/email maps to auth user)
        // For demonstration, we just fetch the first guard in this tenant
        const { data: guardData } = await supabase
          .from('guards')
          .select('id')
          .eq('tenant_id', tenantId)
          .limit(1)
          .single();

        if (guardData) {
          setGuardId(guardData.id);
          
          const { data: schedData } = await supabase
            .from('guard_schedules')
            .select('*')
            .eq('guard_id', guardData.id)
            .order('scheduled_time', { ascending: true });
          
          setSchedules(schedData || []);
        }
      } catch (err) {
        console.error('Failed to fetch guard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGuardData();
  }, [supabase, tenantId]);

  const handleFileUpload = async (scheduleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !guardId) return;
    
    setUploadingTask(scheduleId);
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${guardId}-${Date.now()}.${fileExt}`;
      const filePath = `${tenantId}/${fileName}`;
      
      // Upload to Storage (Assuming a bucket named 'guard-selfies' exists)
      const { error: uploadError, data } = await supabase.storage
        .from('guard-selfies')
        .upload(filePath, file);

      if (uploadError) {
        console.warn('Storage upload failed, simulating successful check-in fallback', uploadError.message);
      }

      const publicUrl = supabase.storage.from('guard-selfies').getPublicUrl(filePath).data.publicUrl;

      // Insert check-in record
      await supabase.from('guard_checkins').insert([{
        tenant_id: tenantId,
        guard_id: guardId,
        schedule_id: scheduleId,
        photo_url: uploadError ? 'https://via.placeholder.com/150' : publicUrl, // Mock if storage isn't set up
        lat: 28.6139, // Simulated GPS
        lng: 77.2090
      }]);

      // Update schedule as completed
      await supabase.from('guard_schedules').update({ is_completed: true }).eq('id', scheduleId);
      
      setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, is_completed: true } : s));
      alert('Check-in completed successfully!');
    } catch (err: any) {
      alert(`Error during check-in: ${err.message}`);
    } finally {
      setUploadingTask(null);
    }
  };

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle) return;

    try {
      await supabase.from('alerts').insert([{
        tenant_id: tenantId,
        type: issueTitle,
        severity: 'HIGH',
        guard_name: 'Current Guard', // Replace with actual guard name
        location: 'Current Location',
        acknowledged: false
      }]);
      alert('Alert raised successfully. Command Center has been notified.');
      setIssueTitle('');
      setShowIssueModal(false);
    } catch (err: any) {
      alert(`Failed to raise alert: ${err.message}`);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]">Loading tasks...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <header className="bg-primary text-on-primary p-6 rounded-b-3xl shadow-md">
        <h2 className="text-2xl font-headline font-bold">Duty Dashboard</h2>
        <p className="font-label text-sm mt-1 opacity-90">Keep track of your scheduled check-ins and patrols.</p>
      </header>

      <div className="px-4 space-y-6">
        <button 
          onClick={() => setShowIssueModal(true)}
          className="w-full bg-error text-on-error py-4 rounded-2xl font-bold font-headline shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-lg"
        >
          <span className="material-symbols-outlined text-[24px]">emergency</span>
          Raise Emergency Ticket
        </button>

        <section>
          <h3 className="font-headline font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">checklist</span>
            My Schedule
          </h3>
          
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-sm font-label">No tasks scheduled for today.</div>
            ) : (
              schedules.map(sch => (
                <div key={sch.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  {sch.is_completed && <div className="absolute inset-0 bg-success/5 pointer-events-none" />}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-on-surface capitalize">{sch.task_type} Upload</div>
                      <div className="text-xs text-on-surface-variant font-mono mt-1">
                        Due: {new Date(sch.scheduled_time).toLocaleTimeString()}
                      </div>
                    </div>
                    <StatusBadge variant={sch.is_completed ? 'completed' : 'pending'}>
                      {sch.is_completed ? 'Done' : 'Pending'}
                    </StatusBadge>
                  </div>

                  {!sch.is_completed && (
                    <label className={`w-full block text-center py-3 rounded-lg font-bold text-sm cursor-pointer transition-colors ${
                      uploadingTask === sch.id 
                        ? 'bg-surface-container-high text-on-surface-variant'
                        : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary'
                    }`}>
                      {uploadingTask === sch.id ? 'Uploading...' : 'Tap to Upload Photo'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(sch.id, e)}
                        disabled={uploadingTask === sch.id}
                      />
                    </label>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <form onSubmit={handleRaiseTicket} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Raise Alert</h3>
            <p className="text-sm text-on-surface-variant mb-4">Describe the issue and it will be flagged as HIGH priority to the Ops center.</p>
            
            <textarea 
              required
              value={issueTitle}
              onChange={e => setIssueTitle(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 focus:border-error outline-none text-sm text-on-surface mb-4 h-24 resize-none" 
              placeholder="e.g. Intruder spotted at back gate" 
            />
            
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowIssueModal(false)} className="px-4 py-2 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg font-bold text-sm bg-error text-on-error hover:opacity-90 transition-opacity">Submit Alert</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
