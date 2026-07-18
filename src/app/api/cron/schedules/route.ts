import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vercel Cron or external schedulers can hit this endpoint securely
// using a secret bearer token. For now, we will allow it to run directly.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Fetch all recurring rules that are due
    // A rule is due if (last_triggered_at + interval_minutes) <= now()
    const { data: rules, error: fetchError } = await supabaseAdmin
      .from('guard_schedule_rules')
      .select('*');

    if (fetchError) throw fetchError;
    if (!rules || rules.length === 0) {
      return NextResponse.json({ success: true, message: 'No active rules found' });
    }

    const now = new Date();
    const rulesToTrigger = rules.filter(rule => {
      if (!rule.last_triggered_at) return true;
      const lastTriggered = new Date(rule.last_triggered_at);
      const diffMinutes = (now.getTime() - lastTriggered.getTime()) / (1000 * 60);
      return diffMinutes >= rule.interval_minutes;
    });

    if (rulesToTrigger.length === 0) {
      return NextResponse.json({ success: true, message: 'No rules due for execution' });
    }

    // 3. Generate new schedules
    const newSchedules = rulesToTrigger.map(rule => ({
      tenant_id: rule.tenant_id,
      guard_id: rule.guard_id,
      task_type: rule.task_type,
      scheduled_time: now.toISOString(),
      is_completed: false
    }));

    const { error: insertError } = await supabaseAdmin
      .from('guard_schedules')
      .insert(newSchedules);

    if (insertError) throw insertError;

    // 4. Update last_triggered_at on the rules
    const updatePromises = rulesToTrigger.map(rule => 
      supabaseAdmin
        .from('guard_schedule_rules')
        .update({ last_triggered_at: now.toISOString() })
        .eq('id', rule.id)
    );
    await Promise.all(updatePromises);

    // 5. Send push notifications for each new schedule
    const newNotifications = rulesToTrigger.map(rule => ({
      tenant_id: rule.tenant_id,
      guard_id: rule.guard_id,
      title: 'Task Reminder',
      message: `Your recurring task (${rule.task_type}) is now due for check-in.`,
      is_read: false
    }));

    await supabaseAdmin.from('guard_notifications').insert(newNotifications);

    return NextResponse.json({ 
      success: true, 
      generated: newSchedules.length 
    });

  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
