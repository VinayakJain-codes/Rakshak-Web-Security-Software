'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import { StatusBadge } from '../../../../../components/ui/rakshak/StatusBadge';
import { Guard } from '../../../../../types/guard';

// Location type removed

type Schedule = {
  id: string;
  task_type: string;
  scheduled_time: string;
  is_completed: boolean;
};

type CheckIn = {
  id: string;
  photo_url: string;
  lat: number;
  lng: number;
  timestamp: string;
};

export default function GuardProfilePage() {
  const params = useParams();
  const guardId = params.id as string;
  const supabase = createClient();
  
  const [guard, setGuard] = useState<Guard | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [biometrics, setBiometrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for scheduling
  const [taskType, setTaskType] = useState('selfie');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(60);

  useEffect(() => {
    const loadGuardData = async () => {
      try {
        const { data: guardData } = await supabase.from('guards').select('*').eq('id', guardId).single();
        setGuard(guardData);

        const { data: schedData } = await supabase.from('guard_schedules').select('*').eq('guard_id', guardId).order('scheduled_time', { ascending: true });
        setSchedules(schedData || []);

        const { data: checkinData } = await supabase.from('guard_checkins').select('*').eq('guard_id', guardId).order('timestamp', { ascending: false });
        
        // Fetch signed URLs for private photos
        const processedCheckins = await Promise.all((checkinData || []).map(async (ci) => {
          if (ci.photo_url && !ci.photo_url.startsWith('http')) {
            const { data } = await supabase.storage.from('guard-selfies').createSignedUrl(ci.photo_url, 3600);
            return { ...ci, photo_url: data?.signedUrl || ci.photo_url };
          }
          return ci;
        }));
        setCheckins(processedCheckins);

        const { data: bioData } = await supabase.from('guard_biometrics').select('*').eq('guard_id', guardId).order('timestamp', { ascending: false }).limit(1).single();
        setBiometrics(bioData || null);
      } catch (err) {
        console.error('Error loading guard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGuardData();

    // Subscribe to live biometrics
    const channel = supabase.channel(`guard_bio_${guardId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guard_biometrics', filter: `guard_id=eq.${guardId}` }, (payload) => {
        setBiometrics(payload.new);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, guardId]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard) return;

    try {
      if (isRecurring) {
        const { error } = await supabase.from('guard_schedule_rules').insert([{
          tenant_id: guard.tenant_id,
          guard_id: guard.id,
          task_type: taskType,
          interval_minutes: intervalMinutes,
        }]);
        if (error) throw error;
        alert('Recurring schedule rule created successfully. The system will generate tasks automatically.');
      } else {
        if (!scheduledTime) return;
        const { data, error } = await supabase.from('guard_schedules').insert([{
          tenant_id: guard.tenant_id,
          guard_id: guard.id,
          task_type: taskType,
          scheduled_time: new Date(scheduledTime).toISOString()
        }]).select();

        if (error) throw error;
        setSchedules([...schedules, ...(data || [])]);
        setScheduledTime('');
      }
    } catch (err: any) {
      alert(`Failed to schedule task: ${err.message}`);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]">Loading profile...</div>;
  if (!guard) return <div className="text-center py-10 text-error">Guard not found.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">{guard.name}'s Profile</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-on-surface-variant font-mono text-sm">ID: {guard.id}</span>
            <StatusBadge variant={guard.status === 'active' ? 'completed' : guard.status === 'critical' ? 'critical' : 'pending'}>
              {guard.status}
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Live Biometrics Tracker */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">vital_signs</span>
                Live Biometrics Tracker
              </h3>
              {biometrics && (
                <span className="text-xs text-on-surface-variant font-mono">
                  Updated: {new Date(biometrics.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {biometrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-center">
                  <span className="block text-xs font-label text-on-surface-variant mb-1">Focus Score</span>
                  <span className={`font-bold text-2xl ${biometrics.focus_score > 70 ? 'text-success' : 'text-error'}`}>{Math.round(biometrics.focus_score)}%</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-center">
                  <span className="block text-xs font-label text-on-surface-variant mb-1">Stress Level</span>
                  <span className={`font-bold text-2xl ${biometrics.stress_score > 50 ? 'text-error' : 'text-on-surface'}`}>{Math.round(biometrics.stress_score)}/100</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-center">
                  <span className="block text-xs font-label text-on-surface-variant mb-1">Drowsy</span>
                  <span className={`font-bold text-2xl ${biometrics.is_drowsy ? 'text-error' : 'text-success'}`}>{biometrics.is_drowsy ? 'YES' : 'NO'}</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-center">
                  <span className="block text-xs font-label text-on-surface-variant mb-1">Distracted</span>
                  <span className={`font-bold text-2xl ${biometrics.is_distracted ? 'text-warning' : 'text-success'}`}>{biometrics.is_distracted ? 'YES' : 'NO'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-on-surface-variant text-sm font-label">No live biometrics data available. Guard may not be monitoring.</div>
            )}
          </div>

          {/* Uploaded Selfies Timeline */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
            <h3 className="font-headline font-bold text-on-surface mb-4">Check-In Timeline</h3>
            {checkins.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-sm font-label">No check-ins recorded yet.</div>
            ) : (
              <div className="space-y-4">
                {checkins.map(ci => (
                  <div key={ci.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                      <div className="w-0.5 h-full bg-outline-variant mt-1" />
                    </div>
                    <div className="pb-4">
                      <div className="font-bold text-sm text-on-surface mb-1">{new Date(ci.timestamp).toLocaleString()}</div>
                      <div className="bg-surface-container rounded-lg p-2 border border-outline-variant inline-block">
                        {ci.photo_url ? (
                          <img src={ci.photo_url} alt="Selfie" className="h-32 object-cover rounded" />
                        ) : (
                          <div className="w-32 h-32 bg-surface-container-high rounded flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[32px]">no_photography</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Scheduling & Status */}
        <div className="space-y-6">
          {/* Add Schedule */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
            <h3 className="font-headline font-bold text-on-surface mb-4">Schedule Task</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="flex gap-4 border-b border-outline-variant pb-3 mb-3">
                <label className="flex items-center gap-2 text-sm font-bold text-on-surface cursor-pointer">
                  <input type="radio" checked={!isRecurring} onChange={() => setIsRecurring(false)} className="accent-primary" />
                  One-time Task
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-on-surface cursor-pointer">
                  <input type="radio" checked={isRecurring} onChange={() => setIsRecurring(true)} className="accent-primary" />
                  Recurring Rule
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Task Type</label>
                <select 
                  value={taskType}
                  onChange={e => setTaskType(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                >
                  <option value="selfie">Selfie Upload</option>
                  <option value="patrol">Site Patrol</option>
                </select>
              </div>
              
              {!isRecurring ? (
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    required
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Repeat Every (Minutes)</label>
                  <input 
                    type="number" 
                    value={intervalMinutes}
                    onChange={e => setIntervalMinutes(parseInt(e.target.value))}
                    min={15}
                    required
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              )}
              <button type="submit" className="w-full bg-primary text-on-primary font-bold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                {isRecurring ? 'Create Rule' : 'Set Reminder'}
              </button>
            </form>
          </div>

          {/* Upcoming Schedules */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
            <h3 className="font-headline font-bold text-on-surface mb-4">Upcoming Reminders</h3>
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No tasks scheduled.</p>
              ) : (
                schedules.map(sch => (
                  <div key={sch.id} className="p-3 bg-surface-container-low border border-outline-variant rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-on-surface capitalize">{sch.task_type}</div>
                      <div className="text-xs text-on-surface-variant font-mono">
                        {new Date(sch.scheduled_time).toLocaleString()}
                      </div>
                    </div>
                    {sch.is_completed ? (
                      <span className="material-symbols-outlined text-success">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-warning">schedule</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
