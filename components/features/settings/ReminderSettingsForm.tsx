"use client";

import { useActionState } from "react";
import { updateReminderSettings } from "@/lib/data/settings-actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ReminderSettings } from "@/lib/reminder-engine";

export function ReminderSettingsForm({
  settings,
}: {
  settings: ReminderSettings & { walksPerDayTarget: number };
}) {
  const [state, action, pending] = useActionState(updateReminderSettings, undefined);

  return (
    <Card>
      <form action={action} className="flex flex-col gap-4">
        <h2 className="font-display font-semibold text-ink">Erinnerungsrhythmus</h2>

        <Field label="Startzeit">
          <input
            name="start_time"
            type="time"
            defaultValue={settings.startTime}
            className="rounded-xl border border-border bg-surface-raised px-4 py-2 text-ink"
          />
        </Field>
        <Field label="Intervall (Minuten)">
          <input
            name="interval_min"
            type="number"
            min={30}
            max={240}
            defaultValue={settings.intervalMin}
            className="rounded-xl border border-border bg-surface-raised px-4 py-2 text-ink"
          />
        </Field>
        <Field label="Eskalation nach (zusätzliche Minuten)">
          <input
            name="escalation_min"
            type="number"
            min={5}
            max={60}
            defaultValue={settings.escalationMin}
            className="rounded-xl border border-border bg-surface-raised px-4 py-2 text-ink"
          />
        </Field>
        <Field label="Tagesende (Erinnerungen pausieren)">
          <input
            name="day_end_time"
            type="time"
            defaultValue={settings.dayEndTime}
            className="rounded-xl border border-border bg-surface-raised px-4 py-2 text-ink"
          />
        </Field>
        <Field label="Spaziergänge pro Tag (Ziel)">
          <input
            name="walks_per_day_target"
            type="number"
            min={1}
            max={10}
            defaultValue={settings.walksPerDayTarget}
            className="rounded-xl border border-border bg-surface-raised px-4 py-2 text-ink"
          />
        </Field>

        {state?.error && <p className="text-sm text-critical">{state.error}</p>}
        {state?.success && <p className="text-sm text-accent-strong">Gespeichert.</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Speichere..." : "Speichern"}
        </Button>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-ink-soft">
      {label}
      {children}
    </label>
  );
}
