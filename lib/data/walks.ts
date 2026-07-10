import "server-only";
import { createClient } from "@/lib/supabase/server";
import { startOfBerlinDay } from "@/lib/date-berlin";

export async function getTodayWalks(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("walks")
    .select("id, walked_at, duration_min, notes, peed, pooped, drank, has_route")
    .eq("user_id", userId)
    .gte("walked_at", startOfBerlinDay(new Date()).toISOString())
    .order("walked_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getLastWalkAt(userId: string): Promise<Date | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("walks")
    .select("walked_at")
    .eq("user_id", userId)
    .order("walked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? new Date(data.walked_at) : null;
}
