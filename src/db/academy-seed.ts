import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  projects,
  curriculumModules,
  versions,
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
} from "./schema";

const id = () => randomUUID();

// Maps Academy courses onto real curriculum modules (§42 publishing link) —
// numbers refer to CurriculumModule.number from src/db/seed.ts.
const COURSES = [
  {
    moduleNumber: 3,
    title: "Generative Bildproduktion",
    modules: [
      {
        title: "Grundlagen der Bildgenerierung",
        lessons: [
          { title: "Text-to-Image mit Nano Banana", type: "video" as const, minutes: 18 },
          { title: "Prompt-Struktur für Bildserien", type: "prompt_block" as const, minutes: 12 },
        ],
      },
      {
        title: "Konsistenz herstellen",
        lessons: [
          { title: "Charakterkonsistenz über mehrere Bilder", type: "video" as const, minutes: 22 },
          { title: "Referenzhierarchien aufbauen", type: "text" as const, minutes: 15 },
        ],
      },
    ],
  },
  {
    moduleNumber: 4,
    title: "Generative Videoproduktion",
    modules: [
      {
        title: "Von Keyframes zu Video",
        lessons: [
          { title: "Image-to-Video mit Veo", type: "video" as const, minutes: 20 },
          { title: "First Frame / Last Frame Technik", type: "text" as const, minutes: 14 },
        ],
      },
      {
        title: "Kamera- und Objektbewegung",
        lessons: [
          { title: "Kamerabewegung steuern", type: "video" as const, minutes: 16 },
          { title: "Typische Fehlerbilder erkennen", type: "text" as const, minutes: 10 },
        ],
      },
    ],
  },
  {
    moduleNumber: 6,
    title: "Schnitt und Postproduktion",
    modules: [
      {
        title: "Rohschnitt",
        lessons: [
          { title: "Medien organisieren und sichten", type: "text" as const, minutes: 10 },
          { title: "Schnitttechnik und Timing", type: "video" as const, minutes: 19 },
        ],
      },
    ],
  },
  {
    moduleNumber: 7,
    title: "Konzeption, Storytelling und Dramaturgie",
    modules: [
      {
        title: "Vom Briefing zum Treatment",
        lessons: [
          { title: "Briefinganalyse", type: "text" as const, minutes: 12 },
          { title: "Storyboard-Grundlagen", type: "video" as const, minutes: 17 },
        ],
      },
    ],
  },
];

export async function academySeed() {
  const [project] = await db.select().from(projects).limit(1);
  const [latestVersion] = await db.select().from(versions).limit(1);
  if (!project) return;

  const learnerId = id();
  await db.insert(users).values({
    id: learnerId,
    name: "Alex Teilnehmer",
    email: "alex.teilnehmer@example.com",
    role: "teilnehmer",
  });

  const [daniel] = await db.select().from(users).where(eq(users.role, "admin")).limit(1);

  const programId = id();
  await db.insert(programs).values({
    id: programId,
    curriculumVersionId: latestVersion?.id,
    title: project.title,
    subtitle: project.subtitle,
    description: "Academy-Umsetzung des freigegebenen Curriculums als buchbares Programm.",
    type: "professional_certificate",
    status: "aktiv",
    targetHours: project.targetHours,
    certificateType: "Professional Certificate",
  });

  const cohortId = id();
  await db.insert(cohorts).values({
    id: cohortId,
    programId,
    title: "Kohorte Januar 2027",
    startDate: "2027-01-04",
    endDate: "2027-06-30",
    capacity: 16,
    status: "aktiv",
  });

  const allModules = await db.select().from(curriculumModules).where(eq(curriculumModules.projectId, project.id));
  const moduleByNumber = new Map(allModules.map((m) => [m.number, m]));

  const enrollmentId = id();
  await db.insert(enrollments).values({
    id: enrollmentId,
    userId: learnerId,
    programId,
    cohortId,
    status: "aktiv",
    certificateStatus: "ausgestellt",
  });

  const createdLessonIds: string[] = [];
  let firstAssignmentLessonId: string | null = null;
  let secondAssignmentLessonId: string | null = null;

  for (const [courseIndex, c] of COURSES.entries()) {
    const curriculumModule = moduleByNumber.get(c.moduleNumber);
    const courseId = id();
    await db.insert(courses).values({
      id: courseId,
      programId,
      curriculumModuleId: curriculumModule?.id,
      title: c.title,
      description: curriculumModule?.summary,
      orderIndex: courseIndex,
      estimatedHours: curriculumModule?.hoursTotal ?? 0,
      status: "freigegeben",
    });

    for (const [moduleIndex, m] of c.modules.entries()) {
      const courseModuleId = id();
      await db.insert(courseModules).values({
        id: courseModuleId,
        courseId,
        title: m.title,
        orderIndex: moduleIndex,
        estimatedMinutes: m.lessons.reduce((sum, l) => sum + l.minutes, 0),
      });

      for (const [lessonIndex, l] of m.lessons.entries()) {
        const lessonId = id();
        createdLessonIds.push(lessonId);
        await db.insert(lessons).values({
          id: lessonId,
          courseModuleId,
          title: l.title,
          lessonType: l.type,
          content:
            l.type === "prompt_block"
              ? "Beispiel-Prompt: 'Konsistente Figur X in drei Einstellungen, neutraler Hintergrund, Studiolicht.'"
              : `Lektionsinhalt: ${l.title}.`,
          videoUrl: l.type === "video" ? "https://example.com/mux/placeholder" : null,
          estimatedMinutes: l.minutes,
          orderIndex: lessonIndex,
        });

        // First course fully completed, second course in progress, rest untouched —
        // gives the progress bars/dashboard something realistic to show.
        let status: "offen" | "in_bearbeitung" | "abgeschlossen" = "offen";
        if (courseIndex === 0) status = "abgeschlossen";
        else if (courseIndex === 1 && moduleIndex === 0) status = lessonIndex === 0 ? "abgeschlossen" : "in_bearbeitung";

        await db.insert(lessonProgress).values({
          id: id(),
          enrollmentId,
          lessonId,
          status,
          completedAt: status === "abgeschlossen" ? new Date().toISOString() : null,
        });

        if (courseIndex === 0 && moduleIndex === 1 && lessonIndex === 0) firstAssignmentLessonId = lessonId;
        if (courseIndex === 1 && moduleIndex === 0 && lessonIndex === 0) secondAssignmentLessonId = lessonId;
      }
    }
  }

  if (firstAssignmentLessonId) {
    const assignmentId = id();
    await db.insert(assignments).values({
      id: assignmentId,
      lessonId: firstAssignmentLessonId,
      title: "Konsistente Bildserie einreichen",
      description: "Reiche drei konsistente Einstellungen einer Figur inkl. Prompt-Dokumentation ein.",
      assignmentType: "image_series",
      dueDate: "2027-01-20",
      rubricCriteria: "Briefingtreue, Konsistenz, Bildqualität, Prompt-Dokumentation",
    });

    const submissionId = id();
    await db.insert(submissions).values({
      id: submissionId,
      assignmentId,
      enrollmentId,
      status: "bestanden",
      content: "3 Bilder + Prompt-Dokumentation eingereicht.",
      toolDocumentation: "Nano Banana, 6 Iterationen, finale Prompts im Anhang.",
      reflection: "Konsistenz über Bild 2/3 schwierig, über Referenzbild gelöst.",
      score: 92,
    });

    if (daniel) {
      await db.insert(submissionFeedback).values({
        id: id(),
        submissionId,
        reviewerId: daniel.id,
        content: "Sehr saubere Konsistenz, Prompt-Dokumentation vorbildlich. Weiter so.",
        score: 92,
      });
    }
  }

  if (secondAssignmentLessonId) {
    const assignmentId = id();
    await db.insert(assignments).values({
      id: assignmentId,
      lessonId: secondAssignmentLessonId,
      title: "Video-Shots einreichen",
      description: "Reiche mindestens zwei verwendbare Video-Shots aus deinen Keyframes ein.",
      assignmentType: "video",
      dueDate: "2027-02-10",
      rubricCriteria: "Konsistenz, Kamerasprache, technische Umsetzung",
    });

    await db.insert(submissions).values({
      id: id(),
      assignmentId,
      enrollmentId,
      status: "eingereicht",
      content: "2 Shots eingereicht, Iteration 3.",
      toolDocumentation: "Veo, First-Frame/Last-Frame-Technik verwendet.",
      reflection: "Kamerabewegung im zweiten Shot noch nicht ideal.",
    });
  }

  await db.insert(certificates).values({
    id: id(),
    enrollmentId,
    certificateType: "Modulzertifikat",
    certificateNumber: "AIC-2027-0001",
    issuedAt: new Date().toISOString(),
    verificationCode: "AIC-VERIFY-0001",
    status: "ausgestellt",
  });
}

if (require.main === module) {
  academySeed()
    .then(() => {
      console.log("Academy seed complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
