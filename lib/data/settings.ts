import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ReminderSettings } from "@/lib/reminder-engine";

export async function getReminderSettings(): Promise<ReminderSettings & { walksPerDayTarget: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reminder_settings")
    .select("start_time, interval_min, escalation_min, day_end_time, walks_per_day_target")
    .eq("id", true)
    .single();

  return {
    startTime: (data?.start_time ?? "05:45").slice(0, 5),
    intervalMin: data?.interval_min ?? 90,
    escalationMin: data?.escalation_min ?? 15,
    dayEndTime: (data?.day_end_time ?? "21:00").slice(0, 5),
    walksPerDayTarget: data?.walks_per_day_target ?? 4,
  };
}
