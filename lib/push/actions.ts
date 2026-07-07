"use server";

import { requireSession } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

type SerializedSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeToPush(sub: SerializedSubscription) {
  const session = await requireSession();
  const supabase = await createClient();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: session.userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth_key: sub.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) return { success: false as const };
  return { success: true as const };
}

export async function unsubscribeFromPush(endpoint: string) {
  await requireSession();
  const supabase = await createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { success: true as const };
}
