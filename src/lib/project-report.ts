/**
 * Project status report data — the third leg of automated paperwork next to
 * offers and invoices. Kept separate from the PDF component so the numbers can
 * be reused (and tested) without rendering.
 */
import { prisma } from "./db";
import { calculateTotals } from "./calculations";
import { round2 } from "./calculations";

export type ProjectReport = NonNullable<Awaited<ReturnType<typeof buildProjectReport>>>;

export async function buildProjectReport(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      venture: true,
      offers: { include: { items: true }, orderBy: { date: "asc" } },
      invoices: { include: { items: true }, orderBy: { date: "asc" } },
      expenses: { orderBy: { travelDate: "asc" } },
      tasks: { include: { assignee: true }, orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
    },
  });
  if (!project) return null;

  const settings = await prisma.companySettings.findUnique({ where: { id: "singleton" } });

  const offers = project.offers.map((o) => {
    const t = calculateTotals(o.items, o.vatRate);
    return { id: o.id, number: o.number, date: o.date, status: o.status, net: t.net, gross: t.gross };
  });

  const invoices = project.invoices.map((inv) => {
    const t = calculateTotals(inv.items, inv.vatRate);
    return {
      id: inv.id,
      number: inv.number,
      date: inv.date,
      dueDate: inv.dueDate,
      status: inv.status,
      paidAt: inv.paidAt,
      net: t.net,
      vat: t.vat,
      gross: t.gross,
    };
  });

  const invoicedNet = round2(invoices.reduce((s, i) => s + i.net, 0));
  const invoicedGross = round2(invoices.reduce((s, i) => s + i.gross, 0));
  const paidGross = round2(invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.gross, 0));
  const openGross = round2(
    invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.gross, 0),
  );
  const expenseTotal = round2(project.expenses.reduce((s, e) => s + e.allowance, 0));

  const budget = project.budget ?? null;
  // Budget is tracked net, so compare it against the invoiced net.
  const budgetUsedPct = budget && budget > 0 ? round2((invoicedNet / budget) * 100) : null;
  const budgetRemaining = budget != null ? round2(budget - invoicedNet) : null;

  const openTasks = project.tasks.filter((t) => t.status !== "done");
  const doneTasks = project.tasks.filter((t) => t.status === "done");

  return {
    project: {
      id: project.id,
      title: project.title,
      type: project.type,
      status: project.status,
      shootStart: project.shootStart,
      shootEnd: project.shootEnd,
      location: project.location,
      budget,
      notes: project.notes,
    },
    client: project.client,
    venture: project.venture,
    settings,
    offers,
    invoices,
    expenses: project.expenses.map((e) => ({
      id: e.id,
      travelDate: e.travelDate,
      people: e.people,
      overnight: e.overnight,
      allowance: e.allowance,
      notes: e.notes,
    })),
    tasks: project.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee?.name ?? t.assigneeLabel ?? null,
    })),
    totals: {
      invoicedNet,
      invoicedGross,
      paidGross,
      openGross,
      expenseTotal,
      budgetUsedPct,
      budgetRemaining,
      offerCount: offers.length,
      invoiceCount: invoices.length,
      openTaskCount: openTasks.length,
      doneTaskCount: doneTasks.length,
    },
  };
}
