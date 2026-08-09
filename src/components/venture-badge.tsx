export function VentureBadge({
  name,
  accent,
  muted,
}: {
  name: string | null | undefined;
  accent?: string | null;
  muted?: boolean;
}) {
  if (!name) {
    return <span className="text-xs text-graphite-400">Company-wide</span>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${muted ? "text-graphite-500" : "text-graphite-700"}`}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: accent ?? "#caff3d" }}
      />
      {name}
    </span>
  );
}
