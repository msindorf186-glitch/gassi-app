import { requireRole } from "@/lib/auth/dal";
import { AdminNav } from "@/components/layout/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("mutter");

  return (
    <div className="min-h-screen bg-bg">
      <AdminNav />
      <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
    </div>
  );
}
