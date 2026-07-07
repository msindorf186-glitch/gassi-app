import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PushStage } from "@/types/database";

export async function getPushTexts(): Promise<Record<PushStage, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("push_texts").select("stage, message");

  const defaults: Record<PushStage, string> = {
    first: "Bald ist es wieder Zeit, mit dem Hund Gassi zu gehen.",
    second: "Jetzt ist es Zeit, mit dem Hund spazieren zu gehen.",
    urgent: "Bitte gehe jetzt dringend mit dem Hund Gassi.",
  };

  for (const row of data ?? []) {
    defaults[row.stage] = row.message;
  }

  return defaults;
}
