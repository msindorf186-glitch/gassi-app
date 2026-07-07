"use client";

import { useActionState } from "react";
import { updatePushTexts } from "@/lib/data/settings-actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PushStage } from "@/types/database";

const labels: Record<PushStage, string> = {
  first: "1. Erinnerung (sanft, nach 60 Min)",
  second: "2. Erinnerung (direkt, nach Intervall)",
  urgent: "3. Erinnerung (dringend)",
};

export function PushTextEditor({ texts }: { texts: Record<PushStage, string> }) {
  const [state, action, pending] = useActionState(updatePushTexts, undefined);

  return (
    <Card>
      <form action={action} className="flex flex-col gap-4">
        <h2 className="font-display font-semibold text-ink">Push-Nachrichten</h2>
        {(Object.keys(labels) as PushStage[]).map((stage) => (
          <label key={stage} className="flex flex-col gap-1.5 text-sm text-ink-soft">
            {labels[stage]}
            <textarea
              name={stage}
              defaultValue={texts[stage]}
              rows={2}
              className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-ink"
            />
          </label>
        ))}

        {state?.error && <p className="text-sm text-critical">{state.error}</p>}
        {state?.success && <p className="text-sm text-accent-strong">Gespeichert.</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Speichere..." : "Speichern"}
        </Button>
      </form>
    </Card>
  );
}
