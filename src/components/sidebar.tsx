"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/workshop", label: "Workshop" },
  { href: "/dozentenhandbuch", label: "Dozentenhandbuch" },
  { href: "/tools", label: "Tools" },
  { href: "/versionen", label: "Versionen" },
  { href: "/exporte", label: "Exporte" },
  { href: "/kommentare", label: "Kommentare" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print w-60 shrink-0 border-r border-border bg-surface flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <p className="text-sm font-semibold tracking-tight">AI Creator Curriculum</p>
        <p className="text-xs text-muted mt-0.5">Fernseh Akademie Mitteldeutschland</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-5 py-2 text-sm border-l-2 transition-colors ${
                active
                  ? "border-accent text-foreground font-medium bg-background"
                  : "border-transparent text-muted hover:text-foreground hover:bg-background"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-border text-xs text-muted">
        Daniel Laudowicz · Admin
      </div>
    </aside>
  );
}
