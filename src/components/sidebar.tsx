"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Icon({ path, className = "w-4 h-4" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  dashboard: "M3 13h4v7H3zM10 4h4v16h-4zM17 9h4v11h-4z",
  curriculum: "M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14.5A2.5 2.5 0 0 1 17.5 21H4zM4 6.5V19a2 2 0 0 0 2 2 M8 8h8M8 12h8M8 16h5",
  workshop: "M12 3l9 5-9 5-9-5zM3 8v6l9 5 9-5V8 M7 11v5c0 1 2 3 5 3s5-2 5-3v-5",
  dozenten: "M12 4.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 20c0-3.5 3-6 7-6s7 2.5 7 6",
  tools: "M14.7 6.3a4 4 0 1 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4z M14.7 6.3l3 3",
  versionen: "M7 7h10M7 12h10M7 17h6 M4 7h.01M4 12h.01M4 17h.01",
  exporte: "M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  kommentare: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  einstellungen: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.13.31.44.51 1.51.51H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/curriculum", label: "Curriculum", icon: "curriculum" },
  { href: "/workshop", label: "Workshop", icon: "workshop" },
  { href: "/dozentenhandbuch", label: "Dozentenhandbuch", icon: "dozenten" },
  { href: "/tools", label: "Tools", icon: "tools" },
  { href: "/versionen", label: "Versionen", icon: "versionen" },
  { href: "/exporte", label: "Exporte", icon: "exporte" },
  { href: "/kommentare", label: "Kommentare", icon: "kommentare" },
  { href: "/einstellungen", label: "Einstellungen", icon: "einstellungen" },
];

export function Sidebar(): ReactNode {
  const pathname = usePathname();

  return (
    <aside className="no-print w-64 shrink-0 border-r border-border bg-surface backdrop-blur-xl flex flex-col h-screen sticky top-0 z-20">
      <div className="px-5 py-5 border-b border-border flex items-center gap-3">
        <span className="avatar-gradient w-8 h-8 rounded-xl shrink-0 shadow-lg" style={{ boxShadow: "0 4px 16px -4px var(--accent-glow)" }} />
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight gradient-text">AI CREATOR CURRICULUM</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mt-1">
            FAM <span className="text-muted">×</span> Pushlabs
          </p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((item, i) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`animate-fade-up stagger-${Math.min(i + 1, 4)} group relative flex items-center gap-2.5 rounded-lg px-3 py-2 mb-0.5 text-sm transition-all ${
                active
                  ? "text-foreground font-medium bg-gradient-to-r from-[color-mix(in_srgb,var(--accent)_14%,transparent)] to-transparent"
                  : "text-muted hover:text-foreground hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
              }`}
            >
              {active && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full avatar-gradient"
                  aria-hidden="true"
                />
              )}
              <Icon
                path={ICONS[item.icon]}
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? "text-accent" : ""}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-3 border-t border-border">
        <Link href="/akademie" className="text-xs text-muted hover:text-accent transition-colors">
          Online Academy →
        </Link>
      </div>
      <div className="px-5 py-4 border-t border-border flex items-center gap-2.5">
        <span className="avatar-gradient w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold">
          D
        </span>
        <span className="text-xs text-muted">Daniel Laudowicz · Admin</span>
      </div>
    </aside>
  );
}
