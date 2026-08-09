/** Minimal RFC-4180 CSV writer — no dependency, handles quotes and newlines. */

function escapeCell(value: unknown): string {
  if (value == null) return "";
  const raw = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], columns?: Array<keyof T>): string {
  if (rows.length === 0) return "";
  const keys = (columns ?? (Object.keys(rows[0]) as Array<keyof T>)) as Array<keyof T>;
  const header = keys.map((k) => escapeCell(String(k))).join(",");
  const body = rows.map((row) => keys.map((k) => escapeCell(row[k])).join(",")).join("\r\n");
  return `${header}\r\n${body}\r\n`;
}
