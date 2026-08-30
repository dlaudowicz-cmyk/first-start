"use client";

import { useState, useTransition } from "react";
import { ListPlus, GitBranch, AlertTriangle, HelpCircle } from "lucide-react";
import type { Pipeline } from "@/lib/pipelines";
import { TRACK_LABELS } from "@/lib/pipelines";
import { cn } from "@/lib/utils";
import { seedQcTasks } from "./pipeline-actions";

const TRACK_ORDER: Array<Pipeline["stages"][number]["track"]> = [
  "source",
  "graded",
  "ungraded",
  "master",
  "future",
];

const TRACK_TONE: Record<string, string> = {
  source: "border-line",
  graded: "border-ok/30",
  ungraded: "border-blue-200",
  master: "border-line",
  future: "border-dashed border-line",
};

export function PipelinePanel({ projectId, pipeline }: { projectId: string; pipeline: Pipeline }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [tab, setTab] = useState<"stages" | "qc" | "open">("stages");

  const seed = () => {
    setResult(null);
    startTransition(async () => {
      const r = await seedQcTasks(projectId);
      setResult(
        r.created === 0 && r.skipped === 0
          ? "Keine QC-Gates gefunden."
          : `${r.created} Aufgabe${r.created === 1 ? "" : "n"} angelegt${
              r.skipped > 0 ? `, ${r.skipped} bereits vorhanden` : ""
            }.`,
      );
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <GitBranch className="h-4 w-4 text-ink-mute shrink-0" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute truncate">
            {pipeline.name} {pipeline.version}
          </h2>
        </div>
        <button type="button" onClick={seed} className="btn-secondary text-xs shrink-0" disabled={pending}>
          <ListPlus className="h-3.5 w-3.5" />
          {pending ? "Lege an…" : "QC-Gates als Aufgaben"}
        </button>
      </div>
      <p className="text-xs text-ink-mute">
        {pipeline.author} · {pipeline.status}
      </p>
      <p className="text-sm text-ink-mute mt-2">{pipeline.summary}</p>
      {result && <p className="mt-2 text-xs text-ok">{result}</p>}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {pipeline.rules.map((r) => (
          <span key={r.label} className="badge-neutral text-[11px]">
            <span className="text-ink-mute">{r.label}:</span> {r.value}
          </span>
        ))}
      </div>

      <div className="mt-5 flex gap-1 border-b border-line-soft">
        <Tab active={tab === "stages"} onClick={() => setTab("stages")}>
          Ablauf
        </Tab>
        <Tab active={tab === "qc"} onClick={() => setTab("qc")}>
          QC-Gates ({pipeline.qcGates.length})
        </Tab>
        <Tab active={tab === "open"} onClick={() => setTab("open")}>
          Offen &amp; Kompromisse
        </Tab>
      </div>

      {tab === "stages" && (
        <div className="mt-4 space-y-4">
          {TRACK_ORDER.map((track) => {
            const stages = pipeline.stages.filter((s) => s.track === track);
            if (stages.length === 0) return null;
            return (
              <div key={track}>
                <div className="text-[10px] uppercase tracking-wider text-ink-faint mb-1.5">
                  {TRACK_LABELS[track]}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stages.map((s) => (
                    <div
                      key={s.key}
                      className={cn("rounded-lg border p-3", TRACK_TONE[track] ?? "border-line")}
                    >
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {s.title}
                        {s.optional && <span className="badge-neutral text-[10px]">optional</span>}
                      </div>
                      {s.tool && <div className="text-xs text-ink-mute">{s.tool}</div>}
                      {s.detail && (
                        <ul className="mt-1.5 text-xs text-ink-mute space-y-0.5">
                          {s.detail.map((d) => (
                            <li key={d}>· {d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "qc" && (
        <ul className="mt-4 space-y-3">
          {pipeline.qcGates.map((g) => (
            <li key={g.key} className="rounded-lg border border-line-soft p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium">{g.title}</div>
                <span className={g.source === "spec" ? "badge-info text-[10px]" : "badge-warning text-[10px]"}>
                  {g.source === "spec" ? "Spec" : "Empfehlung"}
                </span>
              </div>
              <div className="text-xs text-ink-mute mt-0.5">{g.when}</div>
              <ul className="mt-2 text-xs text-ink space-y-1">
                {g.checks.map((c) => (
                  <li key={c} className="flex gap-1.5">
                    <span className="text-ink-faint">·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {tab === "open" && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-faint mb-1.5">
              <HelpCircle className="h-3 w-3" /> Noch offen
            </div>
            <ul className="space-y-2">
              {pipeline.openDecisions.map((d) => (
                <li key={d.question} className="rounded-lg border border-line-soft p-3">
                  <div className="text-sm font-medium">
                    {d.question}: <span className="font-normal text-ink-mute">{d.options}</span>
                  </div>
                  {d.note && <p className="mt-1 text-xs text-ink-mute">{d.note}</p>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-faint mb-1.5">
              <AlertTriangle className="h-3 w-3" /> Bewusste Kompromisse
            </div>
            <ul className="space-y-2">
              {pipeline.tradeoffs.map((t) => (
                <li key={t.title} className="rounded-lg border border-warn/30 bg-warn/10 p-3">
                  <div className="text-sm font-medium text-warn">{t.title}</div>
                  <p className="mt-1 text-xs text-ink">{t.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors",
        active
          ? "border-neon text-ink"
          : "border-transparent text-ink-mute hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
