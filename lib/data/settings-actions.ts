"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import type { PushStage } from "@/types/database";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateReminderSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireRole("mutter");
  const supabase = await createClient();

  const { error } = await supabase
    .from("reminder_settings")
    .update({
      start_time: String(formData.get("start_time")),
      interval_min: Number(formData.get("interval_min")),
      escalation_min: Number(formData.get("escalation_min")),
      day_end_time: String(formData.get("day_end_time")),
      walks_per_day_target: Number(formData.get("walks_per_day_target")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { error: "Einstellungen konnten nicht gespeichert werden." };

  revalidatePath("/admin/einstellungen");
  revalidatePath("/");
  return { success: true };
}

export async function updatePushTexts(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireRole("mutter");
  const supabase = await createClient();

  const stages: PushStage[] = ["first", "second", "urgent"];
  const updates = stages.map((stage) =>
    supabase
      .from("push_texts")
      .update({ message: String(formData.get(stage) ?? "") })
      .eq("stage", stage)
  );

  const results = await Promise.all(updates);
  if (results.some((r) => r.error)) {
    return { error: "Texte konnten nicht gespeichert werden." };
  }

  revalidatePath("/admin/einstellungen");
  return { success: true };
}
