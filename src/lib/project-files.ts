/**
 * Shared project-file definitions. Deliberately free of Node built-ins so that
 * client components can import the categories and formatting helpers; all
 * filesystem access lives in `project-files-storage.ts` (server only).
 */

/**
 * The canonical folder structure every project gets — the "einheitliche
 * Ordnerstruktur" in one place. Adding a category here makes it appear for all
 * projects at once; existing files keep whatever category they were filed under.
 */
export const FILE_CATEGORIES = [
  { key: "briefing", label: "Briefing & Konzept" },
  { key: "contract", label: "Verträge" },
  { key: "script", label: "Drehbuch & Storyboard" },
  { key: "schedule", label: "Dispo & Zeitplan" },
  { key: "rushes", label: "Rushes & Footage" },
  { key: "deliverable", label: "Deliverables" },
  { key: "invoice", label: "Belege & Rechnungen" },
  { key: "other", label: "Sonstiges" },
] as const;

export type FileCategory = (typeof FILE_CATEGORIES)[number]["key"];

export const FILE_CATEGORY_KEYS: readonly string[] = FILE_CATEGORIES.map((c) => c.key);

export function categoryLabel(key: string): string {
  return FILE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

/** 50 MB per file — enough for documents and stills, not for full rushes. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

/**
 * Strips directory components and anything that could confuse a filesystem.
 * Implemented with plain string operations so this stays client-safe.
 */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "";
  const cleaned = base.replace(/[^A-Za-z0-9._\- ]+/g, "_").trim();
  if (cleaned === "" || cleaned === "." || cleaned === "..") return "file";
  return cleaned.slice(0, 120);
}

/** Lower-cased extension including the dot, or "" when there is none. */
export function extensionOf(name: string): string {
  const base = sanitizeFilename(name);
  const idx = base.lastIndexOf(".");
  return idx > 0 ? base.slice(idx).toLowerCase() : "";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}
