"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toLucaAuthPassword } from "@/lib/auth/pin";

export type LoginState = { error?: string } | undefined;

/** Lucas Login: 4-stellige PIN statt Passwort. Die PIN ist technisch das
 * Supabase-Auth-Passwort des Luca-Kontos — Mutter setzt sie in der
 * Benutzerverwaltung. Kein separates PIN-System nötig. */
export async function loginLuca(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "");
  if (!/^\d{4}$/.test(pin)) {
    return { error: "Die PIN muss aus 4 Ziffern bestehen." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("role", "luca")
    .limit(1)
    .maybeSingle();

  if (!profile) {
    return { error: "Kein Luca-Konto gefunden. Bitte Mutter fragen." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: toLucaAuthPassword(pin),
  });

  if (error) {
    return { error: "PIN ist leider falsch. Nochmal versuchen!" };
  }

  redirect("/");
}

export async function loginMutter(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Bitte E-Mail und Passwort eingeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-Mail oder Passwort ist falsch." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
