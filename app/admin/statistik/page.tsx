import { getStats } from "@/lib/data/admin";
import { getReminderSettings } from "@/lib/data/settings";
import { berlinDateKey } from "@/lib/date-berlin";
import { BarChart } from "@/components/features/stats/BarChart";
import { Card } from "@/components/ui/Card";

export default async function StatistikPage() {
  const settings = await getReminderSettings();
  const stats = await getStats(30);

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (29 - i));
    const key = berlinDateKey(d);
    return {
      label: d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin" }),
      value: stats.perDay[key] ?? 0,
    };
  });

  const daysWithTarget = days.filter((d) => d.value > 0);
  const successDays = days.filter((d) => d.value >= settings.walksPerDayTarget).length;
  const successRate = Math.round((successDays / 30) * 100);
  const avgPerDay = daysWithTarget.length
    ? (days.reduce((sum, d) => sum + d.value, 0) / 30).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Statistik</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="font-mono text-xl font-bold text-ink">{stats.totalWalks}</p>
          <p className="text-xs text-ink-soft">Spaziergänge (30 Tage)</p>
        </Card>
        <Card className="text-center">
          <p className="font-mono text-xl font-bold text-ink">{avgPerDay}</p>
          <p className="text-xs text-ink-soft">Ø pro Tag</p>
        </Card>
        <Card className="text-center">
          <p className="font-mono text-xl font-bold text-ink">{successRate}%</p>
          <p className="text-xs text-ink-soft">Erfolgsquote</p>
        </Card>
      </div>

      <Card>
        <p className="mb-3 text-sm text-ink-soft">Letzte 30 Tage</p>
        <BarChart data={days} target={settings.walksPerDayTarget} />
      </Card>
    </div>
  );
}
