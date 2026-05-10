"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import { cn } from "@/lib/utils";

type TemplateMeta = {
  id: string;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
};

export function AssistantWorkspace({ templates }: { templates: TemplateMeta[] }) {
  const [activeId, setActiveId] = useState(templates[0]?.id);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const active = templates.find((t) => t.id === activeId)!;
  const builder = PROMPT_TEMPLATES.find((t) => t.id === activeId)!;
  const input = inputs[active.id] ?? "";
  const generatedPrompt = useMemo(() => builder.build(input), [builder, input]);

  const copy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="card p-3 lg:col-span-1 h-fit">
        <ul className="space-y-1">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setActiveId(t.id)}
                className={cn(
                  "w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors",
                  t.id === active.id
                    ? "bg-graphite-900 text-white"
                    : "text-graphite-700 hover:bg-graphite-100",
                )}
              >
                <div className="font-medium">{t.title}</div>
                <div
                  className={cn(
                    "text-xs mt-0.5 line-clamp-2",
                    t.id === active.id ? "text-graphite-200" : "text-graphite-500",
                  )}
                >
                  {t.description}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="lg:col-span-3 space-y-6">
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-sand-100 text-sand-700 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl text-graphite-900">{active.title}</h2>
              <p className="text-sm text-graphite-500 mt-1">{active.description}</p>
            </div>
          </div>

          <div className="mt-5">
            <label className="label">{active.inputLabel}</label>
            <textarea
              value={input}
              onChange={(e) => setInputs({ ...inputs, [active.id]: e.target.value })}
              placeholder={active.inputPlaceholder}
              className="input min-h-[160px] font-mono text-[13px]"
            />
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-graphite-100">
            <h3 className="text-sm font-medium uppercase tracking-wider text-graphite-500">Generated prompt preview</h3>
            <button onClick={copy} className="btn-secondary text-xs">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="px-5 py-4 text-[13px] leading-relaxed whitespace-pre-wrap font-mono text-graphite-800 bg-graphite-50/50 max-h-[60vh] overflow-y-auto">
            {generatedPrompt}
          </pre>
        </div>
      </section>
    </div>
  );
}
