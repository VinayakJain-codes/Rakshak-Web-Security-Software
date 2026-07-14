'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import { StatusBadge } from '../../../../../components/ui/rakshak/StatusBadge';

type Guard = {
  id: string;
  name: string;
  status: string;
  tenant_id: string;
};

type Location = {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
};

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for scheduling
  const [taskType, setTaskType] = useState('selfie');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    const loadGuardData = async () => {
      try {
        const { data: guardData } = await supabase.from('guards').select('*').eq('id', guardId).single();
        setGuard(guardData);

        const { data: locData } = await supabase.from('guard_locations').select('*').eq('guard_id', guardId).order('timestamp', { ascending: false }).limit(10);
        setLocations(locData || []);

        const { data: schedData } = await supabase.from('guard_schedules').select('*').eq('guard_id', guardId).order('scheduled_time', { ascending: true });
        setSchedules(schedData || []);

        const { data: checkinData } = await supabase.from('guard_checkins').select('*').eq('guard_id', guardId).order('timestamp', { ascending: false });
        setCheckins(checkinData || []);
      } catch (err) {
        console.error('Error loading guard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGuardData();
  }, [supabase, guardId]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard || !scheduledTime) return;

    try {
      const { data, error } = await supabase.from('guard_schedules').insert([{
        tenant_id: guard.tenant_id,
        guard_id: guard.id,
        task_type: taskType,
        scheduled_time: new Date(scheduledTime).toISOString()
      }]).select();

      if (error) throw error;
      setSchedules([...schedules, ...(data || [])]);
      setScheduledTime('');
    } catch (err: any) {
      alert(`Failed to schedule task: ${err.message}`);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]">Loading profile...</div>;
  if (!guard) return <div className="text-center py-10 text-error">Guard not found.</div>;

  const latestLocation = locations[0];

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
        {/* Left Col: Map and Live Location */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Real-Time Location Tracker
              </h3>
              {latestLocation && (
                <span className="text-xs text-on-surface-variant font-mono">
                  Last updated: {new Date(latestLocation.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex-1 bg-surface-container-highest relative flex items-center justify-center">
              {/* Map Placeholder */}
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=14&size=800x400&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:landscape|color:0xf5f5f5&style=feature:water|color:0xd3e3f3')] bg-cover bg-center opacity-50 pointer-events-none"></div>
              
              {latestLocation ? (
                <div className="z-10 bg-primary text-on-primary px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-2 border border-primary-container animate-bounce">
                  <span className="material-symbols-outlined text-[16px]">person_pin_circle</span>
                  {guard.name} is here
                </div>
              ) : (
                <div className="z-10 bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg font-label text-sm border border-outline-variant shadow-sm">
                  Location data unavailable
                </div>
              )}
            </div>
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
                        {ci.lat && ci.lng && (
                          <p className="text-[10px] text-on-surface-variant font-mono mt-2">
                            Lat: {ci.lat}, Lng: {ci.lng}
                          </p>
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
              <button type="submit" className="w-full bg-primary text-on-primary font-bold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                Set Reminder
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
