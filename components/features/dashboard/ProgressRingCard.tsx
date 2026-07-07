import { Card } from "@/components/ui/Card";

export function ProgressRingCard({ done, target }: { done: number; target: number }) {
  const pct = target > 0 ? Math.min(1, done / target) : 0;
  const circumference = 2 * Math.PI * 28;
  const dashoffset = circumference * (1 - pct);

  const message =
    done >= target
      ? "Alle Spaziergänge heute erledigt — super gemacht!"
      : done === 0
        ? "Noch kein Spaziergang heute — leg los!"
        : "Heutiges Ziel fast geschafft — weiter so!";

  return (
    <Card className="flex items-center gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div>
        <p className="font-mono text-lg font-bold text-ink">
          {done}/{target}
        </p>
        <p className="text-sm text-ink-soft">{message}</p>
      </div>
    </Card>
  );
}
