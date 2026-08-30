import Image from "next/image";
import { prisma } from "@/lib/db";
import { getActiveVenture, listVentures } from "@/lib/venture-context";
import { SidebarNav } from "./sidebar-nav";
import { VentureSwitcher } from "./venture-switcher";

export async function Sidebar() {
  const [ventures, active, settings] = await Promise.all([
    listVentures(),
    getActiveVenture(),
    prisma.companySettings.findUnique({
      where: { id: "singleton" },
      select: { companyName: true, owner: true },
    }),
  ]);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-graphite-950 text-white sticky top-0 h-screen">
      <div className="p-5 border-b border-white/10 space-y-4">
        {/* Helle Wortmarke mit Alphakanal — die dunkle Variante hat einen
            weissen Grund und wuerde hier als Kasten stehen. */}
        <Image
          src="/brand/pushlabs-logo-light.png"
          alt={settings?.companyName ?? "Pushlabs"}
          width={2172}
          height={724}
          className="w-full h-auto"
          priority
        />
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
