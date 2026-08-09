import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { ExpenseCalculator } from "./expense-calculator";
import { getActiveVenture, ventureScope } from "@/lib/venture-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpensesList } from "./expenses-list";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const active = await getActiveVenture();
  const [expenses, projects] = await Promise.all([
    prisma.expense.findMany({
      where: ventureScope(active),
      orderBy: { travelDate: "desc" },
      include: { project: true },
      take: 50,
    }),
    prisma.project.findMany({
      where: ventureScope(active),
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.travelDate);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, e) => sum + e.allowance, 0);

  return (
    <>
      <PageHeader
        title="Travel expenses · Spesen"
        description="German per-diem calculator (Verpflegungsmehraufwand). Rates configurable in src/lib/spesen-rates.ts."
      />

      <ExpenseCalculator projects={projects} />

      <section className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-xl text-graphite-900">Recent expenses</h2>
          <div className="text-sm text-graphite-500">
            This month: <span className="font-medium text-graphite-900 tabular-nums">{formatCurrency(monthTotal)}</span>
          </div>
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-graphite-500">No expenses logged yet.</p>
        ) : (
          <ExpensesList
            rows={expenses.map((e) => ({
              id: e.id,
              date: formatDate(e.travelDate),
              project: e.project?.title ?? "—",
              people: e.people,
              overnight: e.overnight,
              breakfast: e.breakfast,
              lunch: e.lunch,
              dinner: e.dinner,
              total: e.allowance,
              notes: e.notes,
            }))}
          />
        )}
      </section>
    </>
  );
}
