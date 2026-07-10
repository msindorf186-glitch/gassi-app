"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { toLucaAuthPassword } from "@/lib/auth/pin";
import type { UserRole } from "@/types/database";

export type UserFormState = { error?: string; success?: boolean } | undefined;

export async function createUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireRole("mutter");

  const role = formData.get("role") as UserRole;
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!displayName || !email || !password) {
    return { error: "Bitte alle Felder ausfüllen." };
  }
  if (role === "luca" && !/^\d{4}$/.test(password)) {
    return { error: "Lucas PIN muss aus 4 Ziffern bestehen." };
  }

  const authPassword = role === "luca" ? toLucaAuthPassword(password) : password;

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: authPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: "Konto konnte nicht angelegt werden: " + createError?.message };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    user_id: created.user.id,
    role,
    display_name: displayName,
    email,
  });

  if (profileError) {
    return { error: "Profil konnte nicht angelegt werden." };
  }

  revalidatePath("/admin/benutzer");
  return { success: true };
}

export async function updateUserPassword(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireRole("mutter");

  const userId = String(formData.get("user_id") ?? "");
  const role = formData.get("role") as UserRole;
  const password = String(formData.get("password") ?? "");

  if (role === "luca" && !/^\d{4}$/.test(password)) {
    return { error: "Lucas PIN muss aus 4 Ziffern bestehen." };
  }
  if (role === "mutter" && password.length < 8) {
    return { error: "Das Passwort muss mindestens 8 Zeichen haben." };
  }

  const authPassword = role === "luca" ? toLucaAuthPassword(password) : password;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: authPassword });

  if (error) return { error: "Konnte nicht aktualisiert werden." };

  revalidatePath("/admin/benutzer");
  return { success: true };
}
