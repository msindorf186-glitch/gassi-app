import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToSubscription } from "@/lib/push/web-push";
import {
  getCycleStart,
  getStageAt,
  isWithinReminderWindow,
  type ReminderStage,
} from "@/lib/reminder-engine";
import type { PushStage } from "@/types/database";
import { startOfBerlinDay } from "@/lib/date-berlin";

const STAGE_ORDER: Record<Exclude<ReminderStage, "none">, number> = {
  first: 1,
  second: 2,
  urgent: 3,
};

export async function runReminderCheck() {
  const supabase = createAdminClient();
  const now = new Date();

  const { data: settingsRow } = await supabase
    .from("reminder_settings")
    .select("start_time, interval_min, escalation_min, day_end_time")
    .eq("id", true)
    .single();

  if (!settingsRow) return { skipped: "no-settings" as const };

  const settings = {
    startTime: settingsRow.start_time.slice(0, 5),
    intervalMin: settingsRow.interval_min,
    escalationMin: settingsRow.escalation_min,
    dayEndTime: settingsRow.day_end_time.slice(0, 5),
  };

  if (!isWithinReminderWindow(now, settings)) {
    return { skipped: "outside-window" as const };
  }

  const { data: lucaProfiles } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("role", "luca");

  const results = [];

  for (const profile of lucaProfiles ?? []) {
    const { data: lastWalk } = await supabase
      .from("walks")
      .select("walked_at")
      .eq("user_id", profile.user_id)
      .gte("walked_at", startOfBerlinDay(now).toISOString())
      .order("walked_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastWalkAt = lastWalk ? new Date(lastWalk.walked_at) : null;
    const cycleStart = getCycleStart(now, lastWalkAt, settings);
    const stage = getStageAt(now, cycleStart, settings);

    if (stage === "none") {
      results.push({ userId: profile.user_id, sent: false, reason: "not-due" });
      continue;
    }

    const { data: latestCycle } = await supabase
      .from("reminder_cycles")
      .select("id, cycle_start_at, stage_sent")
      .order("cycle_start_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isSameCycle =
      latestCycle && new Date(latestCycle.cycle_start_at).getTime() === cycleStart.getTime();
    const alreadySentLevel = isSameCycle && latestCycle.stage_sent ? STAGE_ORDER[latestCycle.stage_sent] : 0;

    if (STAGE_ORDER[stage] <= alreadySentLevel) {
      results.push({ userId: profile.user_id, sent: false, reason: "already-sent" });
      continue;
    }

    const { data: pushText } = await supabase
      .from("push_texts")
      .select("message")
      .eq("stage", stage satisfies PushStage)
      .single();

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", profile.user_id);

    for (const sub of subscriptions ?? []) {
      try {
        await sendPushToSubscription(sub, {
          title: "Gassi-App",
          body: pushText?.message ?? "Zeit für einen Spaziergang!",
          url: "/",
        });
      } catch {
        // Abgelaufene Subscriptions ignorieren wir hier bewusst — sie werden
        // beim nächsten erfolgreichen Re-Subscribe des Geräts überschrieben.
      }
    }

    if (isSameCycle && latestCycle) {
      await supabase
        .from("reminder_cycles")
        .update({ stage_sent: stage })
        .eq("id", latestCycle.id);
    } else {
      await supabase.from("reminder_cycles").insert({
        cycle_start_at: cycleStart.toISOString(),
        stage_sent: stage,
      });
    }

    results.push({ userId: profile.user_id, sent: true, stage });
  }

  return { results };
}
