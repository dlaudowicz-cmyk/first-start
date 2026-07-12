"use client";

import { StatusBadge } from "@/components/ui";
import { setVersionStatus } from "./actions";

const STATUS_OPTIONS = [
  "entwurf",
  "intern_geprueft",
  "fam_geprueft",
  "ihk_fassung",
  "freigegeben",
  "archiviert",
];

export function VersionStatusForm({
  versionId,
  status,
}: {
  versionId: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={status} />
      <select
        defaultValue={status}
        className="text-xs rounded border border-border bg-background px-1 py-0.5"
        onChange={(e) => setVersionStatus(versionId, e.target.value)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
