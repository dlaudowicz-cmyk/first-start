"use client";

import type { AcademyRole } from "@/lib/academy-role";
import { setAcademyRole } from "@/app/akademie/actions";

const LABELS: Record<AcademyRole, string> = {
  teilnehmer: "Teilnehmer",
  dozent: "Dozent",
  admin: "Admin",
};

export function RoleSwitcher({ role }: { role: AcademyRole }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-muted mb-1">Ansicht als</span>
      <select
        defaultValue={role}
        onChange={(e) => setAcademyRole(e.target.value as AcademyRole)}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
      >
        {(Object.keys(LABELS) as AcademyRole[]).map((r) => (
          <option key={r} value={r}>
            {LABELS[r]}
          </option>
        ))}
      </select>
    </label>
  );
}
