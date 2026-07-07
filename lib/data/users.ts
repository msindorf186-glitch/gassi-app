import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, role, display_name, email, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
