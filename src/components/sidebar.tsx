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
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-graphite-100 bg-white sticky top-0 h-screen">
      <div className="p-6 border-b border-graphite-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-graphite-900 flex items-center justify-center">
            <span className="text-white font-display text-base leading-none">P</span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Pushlabs</div>
            <div className="text-[11px] text-graphite-500 -mt-0.5">Production OS</div>
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-graphite-900 text-white"
                      : "text-graphite-700 hover:bg-graphite-100 hover:text-graphite-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-graphite-100 text-[11px] text-graphite-500">
        <div className="font-medium text-graphite-700">Daniel Laudowicz</div>
        <div>Pushlabs Studio</div>
      </div>
    </aside>
  );
}
