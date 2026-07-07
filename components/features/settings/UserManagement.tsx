"use client";

import { useActionState, useState } from "react";
import { createUser, updateUserPassword } from "@/lib/data/users-actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { UserRole } from "@/types/database";

type User = {
  user_id: string;
  role: UserRole;
  display_name: string;
  email: string;
};

export function UserManagement({ users }: { users: User[] }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        <h2 className="font-display font-semibold text-ink">Konten</h2>
        {users.map((u) => (
          <UserRow key={u.user_id} user={u} />
        ))}
      </Card>

      <CreateUserForm />
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateUserPassword, undefined);

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{user.display_name}</p>
          <p className="text-xs text-ink-faint">
            {user.role === "luca" ? "Luca" : "Mutter"} · {user.email}
          </p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-sm text-accent-strong underline underline-offset-2"
        >
          {user.role === "luca" ? "PIN ändern" : "Passwort ändern"}
        </button>
      </div>

      {editing && (
        <form action={action} className="mt-3 flex gap-2">
          <input type="hidden" name="user_id" value={user.user_id} />
          <input type="hidden" name="role" value={user.role} />
          <input
            name="password"
            type={user.role === "luca" ? "tel" : "password"}
            placeholder={user.role === "luca" ? "Neue 4-stellige PIN" : "Neues Passwort"}
            className="flex-1 rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm text-ink"
          />
          <Button type="submit" size="md" disabled={pending}>
            {pending ? "..." : "OK"}
          </Button>
        </form>
      )}
      {state?.error && <p className="mt-1 text-xs text-critical">{state.error}</p>}
      {state?.success && <p className="mt-1 text-xs text-accent-strong">Aktualisiert.</p>}
    </div>
  );
}

function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined);
  const [role, setRole] = useState<UserRole>("luca");

  return (
    <Card>
      <form action={action} className="flex flex-col gap-3">
        <h2 className="font-display font-semibold text-ink">Neues Konto anlegen</h2>
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="luca"
              checked={role === "luca"}
              onChange={() => setRole("luca")}
            />
            Luca
          </label>
          <label className="flex flex-1 items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="mutter"
              checked={role === "mutter"}
              onChange={() => setRole("mutter")}
            />
            Mutter
          </label>
        </div>
        <input
          name="display_name"
          placeholder="Anzeigename"
          required
          className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-ink"
        />
        <input
          name="email"
          type="email"
          placeholder="E-Mail (für den Login)"
          required
          className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-ink"
        />
        <input
          name="password"
          type={role === "luca" ? "tel" : "password"}
          placeholder={role === "luca" ? "4-stellige PIN" : "Passwort"}
          required
          className="rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-ink"
        />
        {state?.error && <p className="text-sm text-critical">{state.error}</p>}
        {state?.success && <p className="text-sm text-accent-strong">Konto angelegt.</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Lege an..." : "Konto anlegen"}
        </Button>
      </form>
    </Card>
  );
}
