"use client";

import { useActionState } from "react";
import { createWalk } from "@/lib/walks/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function WalkForm() {
  const [state, action, pending] = useActionState(createWalk, undefined);
  const now = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <form action={action} className="flex flex-col gap-4">
      <Card className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">Uhrzeit</span>
        <span className="font-mono text-lg text-ink">{now}</span>
      </Card>

      <Card>
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Dauer in Minuten (optional)
          <input
            name="duration_min"
            type="number"
            min={1}
            max={180}
            placeholder="z. B. 15"
            className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-ink"
          />
        </label>
      </Card>

      <Card className="flex flex-col gap-2">
        <CheckboxRow name="peed" label="Hund hat Pipi gemacht" />
        <CheckboxRow name="pooped" label="Hund hat Kot abgesetzt" />
        <CheckboxRow name="drank" label="Hund hat getrunken" />
      </Card>

      <Card>
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Notiz (optional)
          <textarea
            name="notes"
            rows={2}
            placeholder="z. B. hat einer Katze nachgeschaut"
            className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-ink"
          />
        </label>
      </Card>

      <Card>
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Fotos (bis zu 2)
          <input
            name="photos"
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-accent-strong"
          />
        </label>
      </Card>

      <Card className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">📍 Route aufzeichnen</span>
        <input name="record_route" type="checkbox" className="h-5 w-9 accent-accent" />
      </Card>

      {state?.error && <p className="text-sm text-critical">{state.error}</p>}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Speichere..." : "Speichern"}
      </Button>
    </form>
  );
}

function CheckboxRow({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center justify-between text-sm text-ink">
      {label}
      <input name={name} type="checkbox" className="h-5 w-5 accent-accent" />
    </label>
  );
}
