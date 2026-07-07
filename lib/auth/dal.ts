import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  return {
    userId: user.id,
    role: profile.role as UserRole,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
  };
});

/** Erzwingt eine eingeloggte Session; leitet sonst zum Login um. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Erzwingt eine bestimmte Rolle; leitet Fehlzugriffe in den jeweils anderen Bereich um. */
export async function requireRole(role: UserRole) {
  const session = await requireSession();
  if (session.role !== role) {
    redirect(session.role === "mutter" ? "/admin" : "/");
  }
  return session;
}
