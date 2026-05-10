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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PushlabsMark } from "./pushlabs-mark";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: Clapperboard },
  { href: "/offers", label: "Offers", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: ReceiptEuro },
  { href: "/expenses", label: "Travel & Spesen", icon: Plane },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-graphite-950 text-white sticky top-0 h-screen">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <PushlabsMark size={36} />
          <div>
            <div className="text-sm font-semibold tracking-tight text-neon-300">PUSHLABS</div>
            <div className="text-[10px] text-white/50 -mt-0.5 uppercase tracking-wider">
              We make brands move
            </div>
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
                    active
                      ? "bg-white/5 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-neon-300 rounded-r"
                    />
                  )}
                  <Icon className={cn("h-4 w-4", active ? "text-neon-300" : "text-white/50")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10 text-[11px] text-white/50">
        <div className="font-medium text-white/80">Daniel Laudowicz</div>
        <div>Pushlabs Studio</div>
      </div>
    </aside>
  );
}
