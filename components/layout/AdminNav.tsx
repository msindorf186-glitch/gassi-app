import Link from "next/link";
import { logout } from "@/lib/auth/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/kalender", label: "Kalender" },
  { href: "/admin/statistik", label: "Statistik" },
  { href: "/admin/einstellungen", label: "Einstellungen" },
  { href: "/admin/benutzer", label: "Benutzer" },
];

export function AdminNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface-raised">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 overflow-x-auto px-4 py-3">
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent-strong"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <form action={logout}>
          <button className="whitespace-nowrap text-sm text-ink-faint underline underline-offset-2">
            Abmelden
          </button>
        </form>
      </nav>
    </header>
  );
}
