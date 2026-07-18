'use client';

import { useState, useEffect } from 'react';
import { GuardPin, GuardStatus } from '../types/guard';
import { createClient } from '../utils/supabase/client';

export function useGuardPositions(tenantId: string | null) {
  const [guards, setGuards] = useState<GuardPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function fetchGuards() {
      try {
        if (!tenantId) return;

        const { data: guardsData, error } = await supabase
          .from('guards')
          .select('*')
          .eq('tenant_id', tenantId);

        if (error) throw error;

        if (active && guardsData) {
          // Map DB rows to GuardPin structure, defaulting position
          const mappedGuards: GuardPin[] = guardsData.map((row: any) => {
            const position = { lat: 0, lng: 0 };
            
            return {
              id: row.id,
              name: row.name,
              status: row.status as GuardStatus,
              position: position,
              siteId: row.site_id || '',
              shiftStart: row.shift_start ? new Date(row.shift_start).getTime() : Date.now(),
              shiftEnd: row.shift_end ? new Date(row.shift_end).getTime() : null,
              avatarUrl: row.avatar_url || undefined,
            };
          });

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guards', filter: `tenant_id=eq.${tenantId}` }, () => fetchGuards())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(subscription);
    };
  }, [tenantId, supabase]);

  return { guards, isLoading, lastUpdated };
}
