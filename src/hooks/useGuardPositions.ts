'use client';

import { useState, useEffect } from 'react';
import { GuardPin, GuardStatus } from '../types/guard';
import { createClient } from '../utils/supabase/client';

export function useGuardPositions() {
  const [guards, setGuards] = useState<GuardPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function fetchGuards() {
      try {
        const { data, error } = await supabase
          .from('guards')
          .select('*');

        if (error) throw error;

        if (active && data) {
          // Map DB rows to GuardPin structure
          const mappedGuards: GuardPin[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            status: row.status as GuardStatus,
            position: row.position || { lat: 23.0225, lng: 72.5714 },
            siteId: row.site_id || '',
            shiftStart: row.shift_start ? new Date(row.shift_start).getTime() : Date.now(),
            shiftEnd: row.shift_end ? new Date(row.shift_end).getTime() : null,
            telemetry: row.telemetry || {
              biometricVector: 'N/A',
              gpsCoordinates: row.position || { lat: 23.0225, lng: 72.5714 },
              networkEpochTime: Date.now(),
              accelerometerVector: [0, 0, 0],
              ambientBrightness: 0,
              rootDetectionStatus: 'unknown',
              batteryLevel: 100,
              signalStrength: 0,
              lastSyncedAt: Date.now(),
            },
            avatarUrl: row.avatar_url || undefined,
          }));

          setGuards(mappedGuards);
          setLastUpdated(Date.now());
        }
      } catch (err) {
        console.error('Error fetching guards telemetry:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchGuards();

    // Subscribe to real-time changes on public.guards table
    const subscription = supabase
      .channel('live-guards')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guards' },
        () => {
          // Re-fetch when any change occurs (insert, update, delete) to keep data synchronized
          fetchGuards();
        }
      )
      .subscribe();

    // Simulate minor GPS drift locally for rendering aesthetics
    const interval = setInterval(() => {
      setGuards((currentGuards) =>
        currentGuards.map((guard) => {
          if (guard.status === 'active') {
            const driftLat = (Math.random() - 0.5) * 0.0001;
            const driftLng = (Math.random() - 0.5) * 0.0001;
            return {
              ...guard,
              position: {
                lat: guard.position.lat + driftLat,
                lng: guard.position.lng + driftLng,
              },
              telemetry: {
                ...guard.telemetry,
                lastSyncedAt: Date.now(),
              }
            };
          }
          return guard;
        })
      );
      setLastUpdated(Date.now());
    }, 4000);

    return () => {
      active = false;
      supabase.removeChannel(subscription);
      clearInterval(interval);
    };
  }, [supabase]);

  return { guards, isLoading, lastUpdated };
}
