import { getSession } from "@/lib/auth/dal";
import { getTodayWalks, getLastWalkAt } from "@/lib/data/walks";
import { getReminderSettings } from "@/lib/data/settings";
import { getCycleStart, getNextWalkDueAt } from "@/lib/reminder-engine";
import { CountdownCard } from "@/components/features/dashboard/CountdownCard";
import { ProgressRingCard } from "@/components/features/dashboard/ProgressRingCard";
import { LinkButton } from "@/components/ui/Button";
import { PushNotificationManager } from "@/components/features/push/PushNotificationManager";
import { InstallPrompt } from "@/components/features/push/InstallPrompt";

export default async function LucaDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [todayWalks, lastWalkAt, settings] = await Promise.all([
    getTodayWalks(session.userId),
    getLastWalkAt(session.userId),
    getReminderSettings(),
  ]);

  const now = new Date();
  const cycleStart = getCycleStart(now, lastWalkAt, settings);
  const nextWalkDueAt = getNextWalkDueAt(cycleStart, settings);

  const today = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Hallo {session.displayName} 👋
        </h1>
        <p className="text-sm text-ink-soft capitalize">{today}</p>
      </div>

      <InstallPrompt />
      <PushNotificationManager />

      <CountdownCard nextWalkDueAtIso={nextWalkDueAt.toISOString()} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface-raised p-4 text-center">
          <p className="font-mono text-2xl font-bold text-ink">
            {todayWalks.length}/{settings.walksPerDayTarget}
          </p>
          <p className="text-sm text-ink-soft">erledigt</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-raised p-4 text-center">
          <p className="font-mono text-2xl font-bold text-ink">
            {Math.max(0, settings.walksPerDayTarget - todayWalks.length)}
          </p>
          <p className="text-sm text-ink-soft">noch offen</p>
        </div>
      </div>

      <ProgressRingCard done={todayWalks.length} target={settings.walksPerDayTarget} />

      <div className="mt-auto pt-4">
        <LinkButton href="/spaziergang/neu" size="lg" className="w-full">
          🐾 Gassi bestätigen
        </LinkButton>
      </div>
    </main>
  );
}
