import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-Role-Client — umgeht Row-Level-Security.
 * Nur für den Cron-Job (Erinnerungs-Zustandsmaschine) und serverseitige
 * Admin-Operationen verwenden, niemals mit Nutzereingaben ungeprüft füttern.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
