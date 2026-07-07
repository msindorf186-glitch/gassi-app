import { listUsers } from "@/lib/data/users";
import { UserManagement } from "@/components/features/settings/UserManagement";

export default async function BenutzerPage() {
  const users = await listUsers();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-ink">Benutzer</h1>
      <UserManagement users={users} />
    </div>
  );
}
