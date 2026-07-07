import { requireRole } from "@/lib/auth/dal";

export default async function LucaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("luca");
  return <div className="min-h-screen bg-bg">{children}</div>;
}
