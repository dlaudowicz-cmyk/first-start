import type { Pipeline } from "./pipelines";

export type QcTaskDraft = {
  title: string;
  detail: string;
  priority: string;
  source: string;
};

/**
 * Decides which QC gates still need a task. Pure so it can be tested without a
 * request context — the server action does the database work around it.
 *
 * A gate that already has a task on the project is skipped, which makes
 * re-seeding safe after the pipeline gains a new gate.
 */
export function planQcTasks(pipeline: Pipeline, existingTitles: Iterable<string>): {
  create: QcTaskDraft[];
  skipped: number;
} {
  const seen = new Set(existingTitles);
  const create: QcTaskDraft[] = [];
  let skipped = 0;

  for (const gate of pipeline.qcGates) {
    if (seen.has(gate.title)) {
      skipped++;
      continue;
    }
    create.push({
      title: gate.title,
      detail: [`Wann: ${gate.when}`, "", ...gate.checks.map((c) => `· ${c}`)].join("\n"),
      // Gates from the specification are binding; our additions are advisory.
      priority: gate.source === "spec" ? "high" : "normal",
      source: `${pipeline.name} ${pipeline.version}`,
    });
  }

  return { create, skipped };
}
