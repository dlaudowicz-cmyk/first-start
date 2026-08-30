"use client";

import { useTransition } from "react";
import { setClientVenture } from "@/app/ventures/actions";

type VentureOption = { id: string; name: string; accent: string | null };

export function VentureLinks({
  clientId,
  ventures,
  linkedIds,
}: {
  clientId: string;
  ventures: VentureOption[];
  linkedIds: string[];
}) {
  const [pending, startTransition] = useTransition();
  const linked = new Set(linkedIds);

  return (
    <div>
      <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-1">Ventures</h2>
      <p className="text-xs text-ink-mute mb-3">
        A client can work with more than one venture. Exports mark these as shared.
      </p>
      {ventures.length === 0 ? (
        <p className="text-sm text-ink-mute">Noch keine Ventures angelegt.</p>
      ) : (
        <ul className="space-y-1.5">
          {ventures.map((v) => (
            <li key={v.id}>
              <label className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm cursor-pointer hover:bg-surface-2">
                <input
                  type="checkbox"
                  className="accent-neon"
                  checked={linked.has(v.id)}
                  disabled={pending}
                  onChange={(e) => {
                    const attached = e.target.checked;
                    startTransition(async () => {
                      await setClientVenture(clientId, v.id, attached);
                    });
                  }}
                />
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: v.accent ?? "#caff3d" }}
                />
                <span className="flex-1">{v.name}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
