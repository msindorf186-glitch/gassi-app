import { getReminderSettings } from "@/lib/data/settings";
import { getDayRatings } from "@/lib/data/admin";
import { getSession } from "@/lib/auth/dal";
import { berlinDateKey } from "@/lib/date-berlin";
import { Card } from "@/components/ui/Card";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const now = new Date();
  const [year, month] = berlinDateKey(now).split("-").map(Number);
  const settings = await getReminderSettings();
  const ratings = await getDayRatings(year, month, settings.walksPerDayTarget);

  const todayKey = berlinDateKey(now);
  const today = ratings[todayKey] ?? { count: 0, rating: "red" as const };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    const key = berlinDateKey(d);
    return {
      key,
      label: d.toLocaleDateString("de-DE", { weekday: "short", timeZone: "Europe/Berlin" })[0],
      ...(ratings[key] ?? { count: 0, rating: "red" as const }),
    };
  });

  const monthEntries = Object.values(ratings);
  const successRate = monthEntries.length
    ? Math.round(
        (monthEntries.filter((d) => d.rating === "green").length / monthEntries.length) * 100
      )
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">
        Willkommen, {session?.displayName}
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="font-mono text-2xl font-bold text-ink">
            {today.count}/{settings.walksPerDayTarget}
          </p>
          <p className="text-sm text-ink-soft">Spaziergänge heute</p>
        </Card>
        <Card className="text-center">
          <p className="font-mono text-2xl font-bold text-ink">{successRate}%</p>
          <p className="text-sm text-ink-soft">Erfolgsquote diesen Monat</p>
        </Card>
      </div>

      <Card>
        <p className="mb-2 text-sm text-ink-soft">Diese Woche</p>
        <div className="grid grid-cols-7 gap-1.5">
          {last7.map((day) => (
            <div
              key={day.key}
              className={
                "flex aspect-square items-center justify-center rounded-lg text-sm font-semibold text-white " +
                (day.rating === "green"
                  ? "bg-accent"
                  : day.rating === "yellow"
                    ? "bg-amber"
                    : "bg-critical")
              }
              title={`${day.key}: ${day.count}/${settings.walksPerDayTarget}`}
            >
              {day.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
