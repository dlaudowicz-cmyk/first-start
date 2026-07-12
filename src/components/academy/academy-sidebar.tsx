"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AcademyRole } from "@/lib/academy-role";
import { RoleSwitcher } from "./role-switcher";

const NAV: { href: string; label: string; roles: AcademyRole[] }[] = [
  { href: "/akademie/dashboard", label: "Dashboard", roles: ["teilnehmer", "dozent", "admin"] },
  { href: "/akademie/programme", label: "Programme", roles: ["teilnehmer", "admin"] },
  { href: "/akademie/aufgaben", label: "Aufgaben", roles: ["teilnehmer"] },
  { href: "/akademie/zertifikate", label: "Zertifikate", roles: ["teilnehmer"] },
  { href: "/akademie/dozent", label: "Abgaben-Queue", roles: ["dozent"] },
  { href: "/akademie/admin", label: "Curriculum-Sync", roles: ["admin"] },
];

export function AcademySidebar({ role }: { role: AcademyRole }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <aside className="no-print w-64 shrink-0 border-r border-border bg-surface backdrop-blur-xl flex flex-col h-screen sticky top-0 z-20">
      <div className="px-5 py-5 border-b border-border flex items-center gap-3">
        <span className="avatar-gradient w-8 h-8 rounded-xl shrink-0 shadow-lg" style={{ boxShadow: "0 4px 16px -4px var(--accent-glow)" }} />
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight gradient-text">ONLINE ACADEMY</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mt-1">
            FAM <span className="text-muted">×</span> Pushlabs
          </p>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-border">
        <RoleSwitcher role={role} />
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 mb-0.5 text-sm transition-all ${
                active
                  ? "text-foreground font-medium bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_14%,transparent)] to-transparent"
                  : "text-muted hover:text-foreground hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full avatar-gradient" aria-hidden="true" />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <Link href="/dashboard" className="text-xs text-muted hover:text-accent transition-colors">
          ← Zum Curriculum Studio
        </Link>
      </div>
    </aside>
  );
}
