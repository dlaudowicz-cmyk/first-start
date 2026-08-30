"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clapperboard,
  FileText,
  ReceiptEuro,
  Plane,
  Sparkles,
  Settings,
  Layers,
  Contact,
  FileSignature,
  KeyRound,
  Boxes,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  clients: Users,
  projects: Clapperboard,
  offers: FileText,
  invoices: ReceiptEuro,
  expenses: Plane,
  ventures: Layers,
  people: Contact,
  contracts: FileSignature,
  vault: KeyRound,
  tools: Boxes,
  tasks: ListChecks,
  assistant: Sparkles,
  settings: Settings,
} as const;

type IconKey = keyof typeof ICONS;

const SECTIONS: Array<{ label: string | null; items: Array<{ href: string; label: string; icon: IconKey }> }> = [
  {
    label: "Betrieb",
    items: [
      { href: "/", label: "Übersicht", icon: "dashboard" },
      { href: "/clients", label: "Kunden", icon: "clients" },
      { href: "/projects", label: "Projekte", icon: "projects" },
      { href: "/offers", label: "Angebote", icon: "offers" },
      { href: "/invoices", label: "Rechnungen", icon: "invoices" },
      { href: "/expenses", label: "Reisen & Spesen", icon: "expenses" },
    ],
  },
  {
    label: "Unternehmen",
    items: [
      { href: "/ventures", label: "Ventures", icon: "ventures" },
      { href: "/people", label: "Personen", icon: "people" },
      { href: "/contracts", label: "Verträge", icon: "contracts" },
      { href: "/vault", label: "Zugänge", icon: "vault" },
      { href: "/tools", label: "Werkzeuge & Abos", icon: "tools" },
      { href: "/tasks", label: "Aufgaben", icon: "tasks" },
    ],
  },
  {
    label: null,
    items: [
      { href: "/assistant", label: "KI-Assistent", icon: "assistant" },
      { href: "/settings", label: "Einstellungen", icon: "settings" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="p-3 flex-1 overflow-y-auto">
      {SECTIONS.map((section, i) => (
        <div key={section.label ?? `section-${i}`} className={i > 0 ? "mt-5" : undefined}>
          {section.label && (
            <div className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
              {section.label}
            </div>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
                      active ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-neon-300"
                      />
                    )}
                    <Icon className={cn("h-4 w-4", active ? "text-neon-300" : "text-white/50")} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
