import { prisma } from "@/lib/db";
import { getActiveVenture, listVentures } from "@/lib/venture-context";
import { PushlabsMark } from "./pushlabs-mark";
import { SidebarNav } from "./sidebar-nav";
import { VentureSwitcher } from "./venture-switcher";

export async function Sidebar() {
  const [ventures, active, settings] = await Promise.all([
    listVentures(),
    getActiveVenture(),
    prisma.companySettings.findUnique({
      where: { id: "singleton" },
      select: { companyName: true, owner: true, tagline: true },
    }),
  ]);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-graphite-950 text-white sticky top-0 h-screen">
      <div className="p-5 border-b border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <PushlabsMark size={36} />
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight text-neon-300 truncate">
              {(settings?.companyName ?? "Pushlabs").toUpperCase()}
            </div>
            <div className="text-[10px] text-white/50 -mt-0.5 uppercase tracking-wider truncate">
              {settings?.tagline ?? "We make brands move"}
            </div>
          </div>
        </div>
        <VentureSwitcher ventures={ventures} activeSlug={active?.slug ?? null} />
      </div>

      <SidebarNav />

      <div className="p-4 border-t border-white/10 text-[11px] text-white/50">
        <div className="font-medium text-white/80">{settings?.owner ?? "Daniel Laudowicz"}</div>
        <div>Company OS</div>
      </div>
    </aside>
  );
}
