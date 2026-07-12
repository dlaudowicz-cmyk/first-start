import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  getCourseModulesWithLessons,
  getActiveProgram,
  getDemoEnrollment,
  getLessonProgressForEnrollment,
} from "@/lib/academy-data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { setLessonStatus } from "../actions";

const LESSON_TYPE_LABEL: Record<string, string> = {
  video: "Video",
  text: "Text",
  prompt_block: "Prompt-Block",
  assignment_brief: "Aufgabenbeschreibung",
};

export default async function CourseViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { courseId } = await params;
  const { lesson: lessonParam } = await searchParams;

  const course = await getCourse(courseId);
  if (!course) notFound();

  const modulesWithLessons = await getCourseModulesWithLessons(courseId);
  const program = await getActiveProgram();
  const enrollment = program ? await getDemoEnrollment(program.id) : null;
  const progress = enrollment ? await getLessonProgressForEnrollment(enrollment.id) : [];
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p.status]));

  const allLessons = modulesWithLessons.flatMap((m) => m.lessons);
  const activeLesson = allLessons.find((l) => l.id === lessonParam) ?? allLessons[0];
  const activeStatus = activeLesson ? progressByLesson.get(activeLesson.id) ?? "offen" : "offen";

  const markComplete = enrollment && activeLesson
    ? setLessonStatus.bind(null, enrollment.id, activeLesson.id, "abgeschlossen")
    : undefined;
  const markInProgress = enrollment && activeLesson
    ? setLessonStatus.bind(null, enrollment.id, activeLesson.id, "in_bearbeitung")
    : undefined;

  return (
    <div>
      <PageHeader title={course.title} subtitle={course.description ?? undefined} />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1 h-fit">
          <h2 className="text-sm font-semibold mb-3 px-1">Inhalte</h2>
          <div className="space-y-4">
            {modulesWithLessons.map((mod) => (
              <div key={mod.id}>
                <p className="text-xs font-medium text-muted uppercase tracking-wide px-1 mb-1">{mod.title}</p>
                <ul>
                  {mod.lessons.map((l) => {
                    const status = progressByLesson.get(l.id) ?? "offen";
                    const isActive = activeLesson?.id === l.id;
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/akademie/kurse/${courseId}?lesson=${l.id}`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                            isActive ? "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-foreground font-medium" : "text-muted hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                              status === "abgeschlossen"
                                ? "bg-success-bg text-success"
                                : status === "in_bearbeitung"
                                  ? "bg-warning-bg text-warning"
                                  : "border border-border"
                            }`}
                          >
                            {status === "abgeschlossen" ? "✓" : ""}
                          </span>
                          {l.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          {activeLesson ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">{LESSON_TYPE_LABEL[activeLesson.lessonType]}</p>
                  <h2 className="text-lg font-semibold mt-1">{activeLesson.title}</h2>
                </div>
                <StatusBadge status={activeStatus} />
              </div>

              {activeLesson.lessonType === "video" && (
                <div className="aspect-video rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,black)] flex items-center justify-center text-sm text-muted mb-4">
                  ▶ Video-Platzhalter ({activeLesson.estimatedMinutes} Min.)
                </div>
              )}

              {activeLesson.lessonType === "prompt_block" ? (
                <pre className="rounded-lg border border-border bg-background p-4 text-sm whitespace-pre-wrap mb-4">
                  {activeLesson.content}
                </pre>
              ) : (
                <p className="text-sm leading-relaxed mb-4">{activeLesson.content}</p>
              )}

              <div className="flex gap-2">
                {markInProgress && (
                  <form action={markInProgress}>
                    <button type="submit" className="text-sm rounded-md border border-border px-3 py-1.5 font-medium hover:bg-background">
                      Als in Bearbeitung markieren
                    </button>
                  </form>
                )}
                {markComplete && (
                  <form action={markComplete}>
                    <button type="submit" className="text-sm btn-primary">
                      Als abgeschlossen markieren
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Keine Lektionen in diesem Kurs.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
