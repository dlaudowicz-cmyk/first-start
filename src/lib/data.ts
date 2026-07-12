import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  projects,
  curriculumModules,
  workshopDays,
  workshopDayModules,
  tools,
  versions,
} from "@/db/schema";

// MVP is single-project (see docs/CONCEPT-REVIEW.md §1); the schema already
// supports many projects so this is the only place that assumption lives.
export async function getActiveProject() {
  const [project] = await db.select().from(projects).limit(1);
  return project ?? null;
}

export async function getModules(projectId: string) {
  return db
    .select()
    .from(curriculumModules)
    .where(eq(curriculumModules.projectId, projectId))
    .orderBy(asc(curriculumModules.orderIndex));
}

export async function getModule(moduleId: string) {
  const [module] = await db
    .select()
    .from(curriculumModules)
    .where(eq(curriculumModules.id, moduleId));
  return module ?? null;
}

export async function getWorkshopDays(projectId: string) {
  return db
    .select()
    .from(workshopDays)
    .where(eq(workshopDays.projectId, projectId))
    .orderBy(asc(workshopDays.dayNumber));
}

export async function getWorkshopDayModuleNumbers(workshopDayId: string) {
  const rows = await db
    .select({ number: curriculumModules.number, title: curriculumModules.title })
    .from(workshopDayModules)
    .innerJoin(
      curriculumModules,
      eq(workshopDayModules.moduleId, curriculumModules.id),
    )
    .where(eq(workshopDayModules.workshopDayId, workshopDayId));
  return rows;
}

export async function getTools() {
  return db.select().from(tools).orderBy(asc(tools.category), asc(tools.name));
}

export async function getVersions(projectId: string) {
  return db
    .select()
    .from(versions)
    .where(eq(versions.projectId, projectId))
    .orderBy(asc(versions.versionNumber));
}
