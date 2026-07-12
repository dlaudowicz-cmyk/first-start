import type { projects, curriculumModules, workshopDays, tools } from "@/db/schema";
import { computeHoursReport } from "@/lib/hours";

type Project = typeof projects.$inferSelect;
type Module = typeof curriculumModules.$inferSelect;
type WorkshopDay = typeof workshopDays.$inferSelect;
type Tool = typeof tools.$inferSelect;

export function buildMarkdownExport(
  project: Project,
  modules: Module[],
  days: WorkshopDay[],
  toolList: Tool[],
): string {
  const report = computeHoursReport(modules, project.targetHours);
  const lines: string[] = [];

  lines.push(`# ${project.title}`);
  if (project.subtitle) lines.push(`### ${project.subtitle}`);
  lines.push("");
  lines.push(`**Institution:** ${project.institution ?? "–"}`);
  lines.push(`**Status:** ${project.status}`);
  lines.push(`**Stundenumfang:** ${report.totalHours} / ${report.targetHours} Stunden (Abweichung: ${report.deviation})`);
  lines.push(`**Theorie/Praxis:** ${Math.round(report.theoryPercent)}% / ${Math.round(report.practicePercent)}%`);
  lines.push("");
  lines.push("## Curriculum");
  lines.push("");
  lines.push("| Nr. | Lernbereich | Stunden | Status |");
  lines.push("|---:|---|---:|---|");
  for (const m of modules) {
    lines.push(`| ${m.number} | ${m.title} | ${m.hoursTotal} | ${m.status} |`);
  }
  lines.push("");

  for (const m of modules) {
    lines.push(`### ${m.number}. ${m.title}`);
    if (m.summary) lines.push(`${m.summary}`);
    lines.push("");
    if (m.learningGoal) lines.push(`**Lernziel:** ${m.learningGoal}`);
    if (m.qualificationContent) lines.push(`**Qualifikationsinhalte:** ${m.qualificationContent}`);
    if (m.applicationCompetence) lines.push(`**Anwendungskompetenz:** ${m.applicationCompetence}`);
    if (m.practicalTask) lines.push(`**Praktische Aufgabe:** ${m.practicalTask}`);
    if (m.learningResult) lines.push(`**Lernergebnis:** ${m.learningResult}`);
    if (m.assessment) lines.push(`**Leistungsnachweis:** ${m.assessment}`);
    if (m.tools) lines.push(`**Tools:** ${m.tools}`);
    lines.push(`**Stunden:** ${m.hoursTotal} (Theorie ${m.hoursTheory} / Praxis ${m.hoursPractice})`);
    lines.push("");
  }

  lines.push("## Workshop (5 Tage)");
  lines.push("");
  for (const d of days) {
    lines.push(`### Tag ${d.dayNumber}: ${d.title}`);
    if (d.goal) lines.push(`**Tagesziel:** ${d.goal}`);
    lines.push(`**Stunden:** ${d.hours}`);
    if (d.theory) lines.push(`- Theorie: ${d.theory}`);
    if (d.liveDemo) lines.push(`- Live-Demo: ${d.liveDemo}`);
    if (d.exercise) lines.push(`- Übung: ${d.exercise}`);
    if (d.groupTask) lines.push(`- Gruppenaufgabe: ${d.groupTask}`);
    if (d.output) lines.push(`**Tagesergebnis:** ${d.output}`);
    lines.push("");
  }

  lines.push("## Tool-Matrix");
  lines.push("");
  lines.push("| Tool | Kategorie | Anbieter | Einsatzzweck | Status |");
  lines.push("|---|---|---|---|---|");
  for (const t of toolList) {
    lines.push(`| ${t.name} | ${t.category ?? ""} | ${t.provider ?? ""} | ${t.purpose ?? ""} | ${t.status} |`);
  }
  lines.push("");

  return lines.join("\n");
}

export function buildJsonExport(
  project: Project,
  modules: Module[],
  days: WorkshopDay[],
  toolList: Tool[],
) {
  const report = computeHoursReport(modules, project.targetHours);
  return {
    project,
    hoursReport: report,
    modules,
    workshopDays: days,
    tools: toolList,
    generatedAt: new Date().toISOString(),
  };
}
