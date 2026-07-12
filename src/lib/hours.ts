import type { curriculumModules } from "@/db/schema";

export type ModuleRow = typeof curriculumModules.$inferSelect;

export type Warning = {
  level: "error" | "warning";
  message: string;
  moduleId?: string;
};

export type HoursReport = {
  totalHours: number;
  theoryHours: number;
  practiceHours: number;
  theoryPercent: number;
  practicePercent: number;
  targetHours: number;
  deviation: number; // positive = over target, negative = under target
  remainingHours: number; // target - total, floor at 0 semantics handled by caller
  warnings: Warning[];
};

/**
 * Pure calculation per Übergabedokument §5.3. No I/O — takes plain rows so it
 * is trivially unit-testable and reusable from both server components and
 * export generation.
 */
export function computeHoursReport(
  modules: ModuleRow[],
  targetHours: number,
): HoursReport {
  const totalHours = modules.reduce((sum, m) => sum + m.hoursTotal, 0);
  const theoryHours = modules.reduce((sum, m) => sum + m.hoursTheory, 0);
  const practiceHours = modules.reduce((sum, m) => sum + m.hoursPractice, 0);
  const theoryPercent = totalHours > 0 ? (theoryHours / totalHours) * 100 : 0;
  const practicePercent = totalHours > 0 ? (practiceHours / totalHours) * 100 : 0;
  const deviation = totalHours - targetHours;
  const remainingHours = Math.max(targetHours - totalHours, 0);

  const warnings: Warning[] = [];

  if (deviation < 0) {
    warnings.push({
      level: "warning",
      message: `Curriculum liegt ${Math.abs(deviation)} Stunden unter dem Sollumfang von ${targetHours} Stunden.`,
    });
  } else if (deviation > 0) {
    warnings.push({
      level: "error",
      message: `Curriculum überschreitet den Sollumfang von ${targetHours} Stunden um ${deviation} Stunden.`,
    });
  }

  for (const m of modules) {
    if (m.hoursTotal <= 0) {
      warnings.push({
        level: "error",
        message: `Lernbereich ${m.number} – ${m.title}: keine Stunden hinterlegt.`,
        moduleId: m.id,
      });
    }
    if (!m.learningGoal || m.learningGoal.trim() === "") {
      warnings.push({
        level: "warning",
        message: `Lernbereich ${m.number} – ${m.title}: kein Lernziel hinterlegt.`,
        moduleId: m.id,
      });
    }
    if (!m.assessment || m.assessment.trim() === "") {
      warnings.push({
        level: "warning",
        message: `Lernbereich ${m.number} – ${m.title}: kein Leistungsnachweis hinterlegt.`,
        moduleId: m.id,
      });
    }
    if (
      (!m.practicalTask || m.practicalTask.trim() === "") &&
      (!m.learningResult || m.learningResult.trim() === "")
    ) {
      warnings.push({
        level: "warning",
        message: `Lernbereich ${m.number} – ${m.title}: kein praktisches Ergebnis hinterlegt.`,
        moduleId: m.id,
      });
    }
    if (m.duplicateOfModuleId) {
      const other = modules.find((o) => o.id === m.duplicateOfModuleId);
      warnings.push({
        level: "warning",
        message: `Lernbereich ${m.number} – ${m.title}: als Überschneidung mit "${other?.title ?? m.duplicateOfModuleId}" markiert.`,
        moduleId: m.id,
      });
    }
  }

  return {
    totalHours,
    theoryHours,
    practiceHours,
    theoryPercent,
    practicePercent,
    targetHours,
    deviation,
    remainingHours,
    warnings,
  };
}
