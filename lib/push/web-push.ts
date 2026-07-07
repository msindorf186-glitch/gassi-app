import "server-only";
import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_CONTACT_EMAIL || "mailto:kontakt@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export type PushPayload = { title: string; body: string; url?: string };

export async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth_key: string },
  payload: PushPayload
) {
  ensureConfigured();

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
    },
    JSON.stringify(payload)
  );
}
