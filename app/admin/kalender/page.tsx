import Link from "next/link";
import { getDayRatings } from "@/lib/data/admin";
import { getReminderSettings } from "@/lib/data/settings";
import { MonthGrid } from "@/components/features/calendar/MonthGrid";
import { Card } from "@/components/ui/Card";
import { berlinDateKey } from "@/lib/date-berlin";

type Props = { searchParams: Promise<{ year?: string; month?: string }> };

const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default async function KalenderPage({ searchParams }: Props) {
  const now = new Date();
  const [nowYear, nowMonth] = berlinDateKey(now).split("-").map(Number);
  const params = await searchParams;
  const year = Number(params.year) || nowYear;
  const month = Number(params.month) || nowMonth;

  const settings = await getReminderSettings();
  const ratings = await getDayRatings(year, month, settings.walksPerDayTarget);

  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  const counts = Object.values(ratings);
  const summary = {
    green: counts.filter((c) => c.rating === "green").length,
    yellow: counts.filter((c) => c.rating === "yellow").length,
    red: counts.filter((c) => c.rating === "red").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/kalender?year=${prev.year}&month=${prev.month}`}
          className="rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-accent-soft"
        >
          ← Zurück
        </Link>
        <h1 className="font-display text-lg font-bold text-ink">
          {MONATE[month - 1]} {year}
        </h1>
        <Link
          href={`/admin/kalender?year=${next.year}&month=${next.month}`}
          className="rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-accent-soft"
        >
          Weiter →
        </Link>
      </div>

      <Card>
        <MonthGrid year={year} month={month} ratings={ratings} />
      </Card>

      <Card className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-soft">🟢 Erledigt</span>
          <span className="font-mono text-ink">{summary.green} Tage</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-soft">🟡 Teilweise</span>
          <span className="font-mono text-ink">{summary.yellow} Tage</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-soft">🔴 Zu wenig</span>
          <span className="font-mono text-ink">{summary.red} Tage</span>
        </div>
      </Card>
    </div>
  );
}
