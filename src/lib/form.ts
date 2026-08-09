/** Helpers for turning form strings into database values. */

/** Empty / whitespace-only strings become null so the DB stays clean. */
export function nullify(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Date input ("YYYY-MM-DD") to Date, or null when blank. */
export function toDate(value?: string | null): Date | null {
  const v = nullify(value);
  return v ? new Date(v) : null;
}

/** Date to the value format `<input type="date">` expects. */
export function dateInput(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

/** Turn a display name into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
