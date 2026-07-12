import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  programs,
  courses,
  courseModules,
  lessons,
  cohorts,
  enrollments,
  lessonProgress,
  assignments,
  submissions,
  submissionFeedback,
  certificates,
  curriculumModules,
} from "@/db/schema";

// Single demo program/learner for the click-dummy (see docs/ACADEMY-PLAN.md).
export async function getActiveProgram() {
  const [program] = await db.select().from(programs).limit(1);
  return program ?? null;
}

export async function getDemoLearner() {
  const [learner] = await db.select().from(users).where(eq(users.role, "teilnehmer")).limit(1);
  return learner ?? null;
}

export async function getDemoEnrollment(programId: string) {
  const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.programId, programId)).limit(1);
  return enrollment ?? null;
}

export async function getCourses(programId: string) {
  return db
    .select()
    .from(courses)
    .where(eq(courses.programId, programId))
    .orderBy(asc(courses.orderIndex));
}

export async function getCourse(courseId: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
  return course ?? null;
}

export async function getCourseModulesWithLessons(courseId: string) {
  const mods = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(asc(courseModules.orderIndex));

  const result = [];
  for (const mod of mods) {
    const lessonRows = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseModuleId, mod.id))
      .orderBy(asc(lessons.orderIndex));
    result.push({ ...mod, lessons: lessonRows });
  }
  return result;
}

export async function getLesson(lessonId: string) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  return lesson ?? null;
}

export async function getLessonProgressForEnrollment(enrollmentId: string) {
  return db.select().from(lessonProgress).where(eq(lessonProgress.enrollmentId, enrollmentId));
}

export async function getCohorts(programId: string) {
  return db.select().from(cohorts).where(eq(cohorts.programId, programId));
}

export async function getAssignmentsForCourse(courseId: string) {
  const mods = await db.select().from(courseModules).where(eq(courseModules.courseId, courseId));
  const modIds = mods.map((m) => m.id);
  if (modIds.length === 0) return [];
  const lessonRows = await db.select().from(lessons);
  const relevantLessonIds = lessonRows.filter((l) => modIds.includes(l.courseModuleId)).map((l) => l.id);
  const allAssignments = await db.select().from(assignments);
  return allAssignments.filter((a) => relevantLessonIds.includes(a.lessonId));
}

export async function getAllAssignmentsWithContext() {
  const rows = await db
    .select({
      assignment: assignments,
      lesson: lessons,
    })
    .from(assignments)
    .innerJoin(lessons, eq(assignments.lessonId, lessons.id));
  return rows;
}

export async function getSubmissionsForEnrollment(enrollmentId: string) {
  return db.select().from(submissions).where(eq(submissions.enrollmentId, enrollmentId));
}

export async function getAllSubmissionsWithContext() {
  const rows = await db
    .select({
      submission: submissions,
      assignment: assignments,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id));
  return rows;
}

export async function getFeedbackForSubmission(submissionId: string) {
  return db.select().from(submissionFeedback).where(eq(submissionFeedback.submissionId, submissionId));
}

export async function getCertificatesForEnrollment(enrollmentId: string) {
  return db.select().from(certificates).where(eq(certificates.enrollmentId, enrollmentId));
}

export async function getUnmappedCurriculumModules(projectId: string, programId: string) {
  const allModules = await db
    .select()
    .from(curriculumModules)
    .where(eq(curriculumModules.projectId, projectId))
    .orderBy(asc(curriculumModules.orderIndex));
  const mappedCourses = await db.select().from(courses).where(eq(courses.programId, programId));
  const mappedModuleIds = new Set(mappedCourses.map((c) => c.curriculumModuleId).filter(Boolean));
  return allModules.map((m) => ({
    module: m,
    course: mappedCourses.find((c) => c.curriculumModuleId === m.id) ?? null,
    mapped: mappedModuleIds.has(m.id),
  }));
}
