"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function CountdownCard({ nextWalkDueAtIso }: { nextWalkDueAtIso: string }) {
  const target = new Date(nextWalkDueAtIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = target - now;
  const isDue = remaining <= 0;

  return (
    <Card
      className={
        isDue
          ? "border-critical/40 bg-critical-soft text-center"
          : "text-center"
      }
    >
      <p className="text-sm text-ink-soft">
        {isDue ? "Zeit für einen Spaziergang!" : "Nächster Spaziergang in"}
      </p>
      <p
        className={
          "mt-1 font-mono text-3xl font-bold tabular-nums " +
          (isDue ? "text-critical" : "text-accent-strong")
        }
      >
        {isDue ? "🐾" : formatCountdown(remaining)}
      </p>
    </Card>
  );
}
