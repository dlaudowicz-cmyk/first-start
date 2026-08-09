"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { setActiveVenture } from "@/app/actions/venture";

type VentureOption = { id: string; name: string; slug: string; accent: string | null; status: string };

export function VentureSwitcher({
  ventures,
  activeSlug,
}: {
  ventures: VentureOption[];
  activeSlug: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const active = ventures.find((v) => v.slug === activeSlug) ?? null;

  const choose = (slug: string) => {
    setOpen(false);
    startTransition(async () => {
      await setActiveVenture(slug);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {active ? (
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: active.accent ?? "#caff3d" }}
          />
        ) : (
          <Layers className="h-3.5 w-3.5 text-white/50 shrink-0" />
        )}
        <span className="flex-1 truncate">{active ? active.name : "All ventures"}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-white/40 shrink-0" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-graphite-900 py-1 shadow-lg"
        >
          <Option label="All ventures" selected={!active} onSelect={() => choose("all")} icon />
          {ventures.map((v) => (
            <Option
              key={v.id}
              label={v.name}
              hint={v.status !== "active" ? v.status : undefined}
              accent={v.accent}
              selected={active?.slug === v.slug}
              onSelect={() => choose(v.slug)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Option({
  label,
  hint,
  accent,
  selected,
  onSelect,
  icon,
}: {
  label: string;
  hint?: string;
  accent?: string | null;
  selected: boolean;
  onSelect: () => void;
  icon?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
          selected ? "text-white bg-white/5" : "text-white/70 hover:bg-white/5 hover:text-white",
        )}
      >
        {icon ? (
          <Layers className="h-3.5 w-3.5 text-white/50 shrink-0" />
        ) : (
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: accent ?? "#caff3d" }}
          />
        )}
        <span className="flex-1 truncate">{label}</span>
        {hint && <span className="text-[10px] uppercase tracking-wider text-white/40">{hint}</span>}
        {selected && <Check className="h-3.5 w-3.5 text-neon-300 shrink-0" />}
      </button>
    </li>
  );
}
