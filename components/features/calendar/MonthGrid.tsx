import Link from "next/link";
import type { DayRating } from "@/lib/stats";

const ratingClasses: Record<DayRating, string> = {
  green: "bg-accent text-white",
  yellow: "bg-amber text-white",
  red: "bg-critical text-white",
};

export function MonthGrid({
  year,
  month,
  ratings,
}: {
  year: number;
  month: number;
  ratings: Record<string, { count: number; rating: DayRating }>;
}) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // Montag = 0

  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {["M", "D", "M", "D", "F", "S", "S"].map((label, i) => (
        <div key={i} className="pb-1 text-center text-xs font-semibold text-ink-faint">
          {label}
        </div>
      ))}
      {cells.map((day, i) => {
        if (day === null) return <div key={`b${i}`} />;
        const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const rating = ratings[key];
        return (
          <Link
            key={key}
            href={`/admin/kalender/${key}`}
            className={
              "flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-transform hover:scale-105 " +
              (rating ? ratingClasses[rating.rating] : "border border-border bg-surface-raised text-ink-faint")
            }
          >
            {day}
          </Link>
        );
      })}
    </div>
  );
}
