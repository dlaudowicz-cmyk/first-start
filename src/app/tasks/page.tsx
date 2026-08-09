import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { getActiveVenture, ventureScope } from "@/lib/venture-context";
import { formatDate, daysUntil, TASK_STATUSES } from "@/lib/utils";
import { TaskRow, type TaskRowData } from "./task-row";

export const dynamic = "force-dynamic";

const GROUPS: Array<{ key: string; label: string }> = [
  { key: "in progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "open", label: "Open" },
  { key: "done", label: "Done" },
];

export default async function TasksPage() {
  const active = await getActiveVenture();
  const tasks = await prisma.task.findMany({
    where: ventureScope(active),
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    include: { assignee: true, venture: true },
  });

  const rows: TaskRowData[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: TASK_STATUSES.includes(t.status as never) ? t.status : "open",
    priority: t.priority,
    assignee: t.assignee?.name ?? t.assigneeLabel ?? null,
    ventureName: t.venture?.name ?? null,
    ventureAccent: t.venture?.accent ?? null,
    due: t.dueDate ? formatDate(t.dueDate) : null,
    overdue: (() => {
      const d = daysUntil(t.dueDate);
      return d != null && d < 0;
    })(),
    source: t.source,
  }));

  const openCount = rows.filter((r) => r.status !== "done").length;

  return (
    <>
      <PageHeader
        title="Tasks"
        description={
          active
            ? `Action items for ${active.name}.`
            : "Company-wide action items — from meetings, decisions and follow-ups."
        }
        actions={
          <Link href="/tasks/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Add task
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No tasks"
          description="Add action items so nothing from a meeting gets lost."
          action={
            <Link href="/tasks/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Add task
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-graphite-500 mb-4">
            {openCount} open of {rows.length} total
          </p>
          <div className="space-y-6">
            {GROUPS.map((group) => {
              const groupRows = rows.filter((r) => r.status === group.key);
              if (groupRows.length === 0) return null;
              return (
                <section key={group.key} className="card p-5">
                  <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500 mb-1">
                    {group.label}{" "}
                    <span className="text-graphite-400 font-normal">({groupRows.length})</span>
                  </h2>
                  <ul className="divide-y divide-graphite-100">
                    {groupRows.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
