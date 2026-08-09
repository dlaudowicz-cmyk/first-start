"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Check, Circle, CircleDot, Ban } from "lucide-react";
import { TASK_STATUSES, cn } from "@/lib/utils";
import { setTaskStatus } from "./actions";

const ICONS: Record<string, typeof Circle> = {
  open: Circle,
  "in progress": CircleDot,
  blocked: Ban,
  done: Check,
};

export type TaskRowData = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string | null;
  ventureName: string | null;
  ventureAccent: string | null;
  due: string | null;
  overdue: boolean;
  source: string | null;
};

export function TaskRow({ task }: { task: TaskRowData }) {
  const [pending, startTransition] = useTransition();
  const Icon = ICONS[task.status] ?? Circle;
  const isDone = task.status === "done";

  /** Clicking the icon cycles open → in progress → done → open. */
  const cycle = () => {
    const order = ["open", "in progress", "done"];
    const idx = order.indexOf(task.status);
    const next = order[(idx + 1) % order.length] ?? "open";
    startTransition(async () => {
      await setTaskStatus(task.id, next);
    });
  };

  return (
    <li className={cn("py-3 flex items-start gap-3", pending && "opacity-60")}>
      <button
        type="button"
        onClick={cycle}
        disabled={pending}
        aria-label={`Cycle status (currently ${task.status})`}
        className={cn(
          "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
          isDone
            ? "bg-emerald-600 border-emerald-600 text-white"
            : task.status === "blocked"
              ? "border-red-300 text-red-600"
              : "border-graphite-300 text-graphite-400 hover:border-graphite-900 hover:text-graphite-900",
        )}
      >
        <Icon className="h-3 w-3" />
      </button>

      <div className="min-w-0 flex-1">
        <Link
          href={`/tasks/${task.id}`}
          className={cn("font-medium hover:underline block truncate", isDone && "line-through text-graphite-400")}
        >
          {task.title}
        </Link>
        <div className="text-xs text-graphite-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
          {task.assignee && <span>{task.assignee}</span>}
          {task.ventureName && (
            <span className="inline-flex items-center gap-1">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: task.ventureAccent ?? "#caff3d" }}
              />
              {task.ventureName}
            </span>
          )}
          {task.due && (
            <span className={task.overdue && !isDone ? "text-red-600 font-medium" : undefined}>
              due {task.due}
            </span>
          )}
          {task.source && <span className="text-graphite-400">· {task.source}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {task.priority === "high" && !isDone && <span className="badge-warning text-[10px]">high</span>}
        <select
          className="text-xs rounded-md border border-graphite-200 bg-white px-1.5 py-1 capitalize"
          value={task.status}
          disabled={pending}
          onChange={(e) =>
            startTransition(async () => {
              await setTaskStatus(task.id, e.target.value);
            })
          }
          aria-label="Task status"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}
