"use client";

import { useActionState, useState } from "react";
import { loginLuca, loginMutter } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Mode = "choose" | "luca" | "mutter";

export function LoginView() {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg px-6 py-12">
      <div className="text-center">
        <p className="text-3xl">🐾</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          Gassi-App
        </h1>
      </div>

      {mode === "choose" && (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button size="lg" onClick={() => setMode("luca")} className="w-full">
            Ich bin Luca
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setMode("mutter")}
            className="w-full"
          >
            Ich bin Mutter
          </Button>
        </div>
      )}

      {mode === "luca" && <LucaLoginForm onBack={() => setMode("choose")} />}
      {mode === "mutter" && <MutterLoginForm onBack={() => setMode("choose")} />}
    </main>
  );
}

function LucaLoginForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState(loginLuca, undefined);

  return (
    <Card className="w-full max-w-sm">
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Deine PIN
          <input
            name="pin"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            autoFocus
            required
            className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-ink"
          />
        </label>
        {state?.error && <p className="text-sm text-critical">{state.error}</p>}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Prüfe..." : "Los geht's"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink-faint underline underline-offset-2"
        >
          Zurück
        </button>
      </form>
    </Card>
  );
}

function MutterLoginForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState(loginMutter, undefined);

  return (
    <Card className="w-full max-w-sm">
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          E-Mail
          <input
            name="email"
            type="email"
            required
            autoFocus
            className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-ink"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
          Passwort
          <input
            name="password"
            type="password"
            required
            className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-ink"
          />
        </label>
        {state?.error && <p className="text-sm text-critical">{state.error}</p>}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Melde an..." : "Anmelden"}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink-faint underline underline-offset-2"
        >
          Zurück
        </button>
      </form>
    </Card>
  );
}
