/**
 * Venture export — turns one venture's slice of the database into a handover
 * archive. Ventures are softly separated (a nullable `ventureId` per record),
 * so a complete extraction is a filtered query plus packaging. Records that
 * also belong to another venture are marked `shared` rather than hidden, so a
 * handover is complete without pretending the overlap doesn't exist.
 */
import { prisma } from "./db";
import { calculateTotals } from "./calculations";
import { toCsv } from "./csv";
import { monthlyCost } from "./utils";

export type VentureExport = Awaited<ReturnType<typeof buildVentureExport>>;

export async function buildVentureExport(slug: string) {
  const venture = await prisma.venture.findUnique({
    where: { slug },
    include: {
      members: { include: { person: true } },
      clients: {
        include: {
          client: {
            include: {
              ventures: { include: { venture: { select: { name: true, slug: true } } } },
            },
          },
        },
      },
      projects: { include: { client: true, files: true } },
      offers: { include: { items: true, client: true, project: true } },
      invoices: { include: { items: true, client: true, project: true } },
      expenses: { include: { project: true } },
      contracts: { include: { client: true, person: true } },
      credentials: { include: { owner: true } },
      tools: { include: { owner: true } },
      tasks: { include: { assignee: true, project: true } },
    },
  });
  if (!venture) return null;

  const settings = await prisma.companySettings.findUnique({ where: { id: "singleton" } });

  const clients = venture.clients.map((cv) => {
    const otherVentures = cv.client.ventures
      .map((v) => v.venture.name)
      .filter((name) => name !== venture.name);
    return {
      id: cv.client.id,
      companyName: cv.client.companyName,
      contactPerson: cv.client.contactPerson,
      email: cv.client.email,
      phone: cv.client.phone,
      address: cv.client.address,
      vatId: cv.client.vatId,
      notes: cv.client.notes,
      shared: otherVentures.length > 0,
      alsoInVentures: otherVentures,
    };
  });

  const projects = venture.projects.map((p) => ({
    id: p.id,
    title: p.title,
    client: p.client.companyName,
    type: p.type,
    status: p.status,
    shootStart: p.shootStart,
    shootEnd: p.shootEnd,
    location: p.location,
    budget: p.budget,
    notes: p.notes,
    fileCount: p.files.length,
  }));

  /** Filed documents, so the export can carry the actual bytes too. */
  const files = venture.projects.flatMap((p) =>
    p.files.map((f) => ({
      id: f.id,
      projectId: p.id,
      projectTitle: p.title,
      category: f.category,
      originalName: f.originalName,
      storedName: f.storedName,
      mimeType: f.mimeType,
      size: f.size,
      notes: f.notes,
      createdAt: f.createdAt,
    })),
  );

  const offers = venture.offers.map((o) => {
    const totals = calculateTotals(o.items, o.vatRate);
    return {
      id: o.id,
      number: o.number,
      date: o.date,
      validUntil: o.validUntil,
      client: o.client.companyName,
      project: o.project?.title ?? null,
      status: o.status,
      vatRate: o.vatRate,
      net: totals.net,
      vat: totals.vat,
      gross: totals.gross,
      paymentTerms: o.paymentTerms,
      notes: o.notes,
      items: [...o.items]
        .sort((a, b) => a.position - b.position)
        .map((i) => ({
          position: i.position,
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
          lineNet: i.quantity * i.unitPrice,
        })),
    };
  });

  const invoices = venture.invoices.map((inv) => {
    const totals = calculateTotals(inv.items, inv.vatRate);
    return {
      id: inv.id,
      number: inv.number,
      date: inv.date,
      dueDate: inv.dueDate,
      client: inv.client.companyName,
      project: inv.project?.title ?? null,
      status: inv.status,
      paidAt: inv.paidAt,
      vatRate: inv.vatRate,
      net: totals.net,
      vat: totals.vat,
      gross: totals.gross,
      paymentTerms: inv.paymentTerms,
      notes: inv.notes,
      items: [...inv.items]
        .sort((a, b) => a.position - b.position)
        .map((i) => ({
          position: i.position,
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
          lineNet: i.quantity * i.unitPrice,
        })),
    };
  });

  const people = venture.members.map((m) => ({
    id: m.person.id,
    name: m.person.name,
    roleInVenture: m.role,
    allocation: m.allocation,
    type: m.person.type,
    email: m.person.email,
    phone: m.person.phone,
    location: m.person.location,
    skills: m.person.skills,
  }));

  const contracts = venture.contracts.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    counterparty: c.counterparty,
    status: c.status,
    signedAt: c.signedAt,
    startDate: c.startDate,
    endDate: c.endDate,
    noticePeriodDays: c.noticePeriodDays,
    value: c.value,
    client: c.client?.companyName ?? null,
    person: c.person?.name ?? null,
    notes: c.notes,
  }));

  // Vault export carries references only — there are no secrets in the database.
  const credentials = venture.credentials.map((c) => ({
    id: c.id,
    service: c.service,
    category: c.category,
    url: c.url,
    identifier: c.identifier,
    storageLocation: c.storageLocation,
    vaultRef: c.vaultRef,
    mfaLocation: c.mfaLocation,
    sharedWith: c.sharedWith,
    criticality: c.criticality,
    owner: c.owner?.name ?? null,
    rotatedAt: c.rotatedAt,
    rotateEveryDays: c.rotateEveryDays,
    notes: c.notes,
  }));

  const tools = venture.tools.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    plan: t.plan,
    seats: t.seats,
    cost: t.costPerMonth,
    billingCycle: t.billingCycle,
    normalizedMonthlyCost: monthlyCost(t.costPerMonth, t.billingCycle),
    renewalDate: t.renewalDate,
    status: t.status,
    owner: t.owner?.name ?? null,
    url: t.url,
    notes: t.notes,
  }));

  const tasks = venture.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    detail: t.detail,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    assignee: t.assignee?.name ?? t.assigneeLabel ?? null,
    project: t.project?.title ?? null,
    source: t.source,
    completedAt: t.completedAt,
  }));

  const expenses = venture.expenses.map((e) => ({
    id: e.id,
    travelDate: e.travelDate,
    startTime: e.startTime,
    endTime: e.endTime,
    overnight: e.overnight,
    breakfast: e.breakfast,
    lunch: e.lunch,
    dinner: e.dinner,
    people: e.people,
    allowance: e.allowance,
    project: e.project?.title ?? null,
    notes: e.notes,
  }));

  const revenuePaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.gross, 0);
  const revenueOpen = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((s, i) => s + i.gross, 0);
  const pipeline = offers.filter((o) => o.status === "sent" || o.status === "draft").reduce((s, o) => s + o.gross, 0);
  const toolMonthly = tools
    .filter((t) => t.status === "active")
    .reduce((s, t) => s + t.normalizedMonthlyCost, 0);

  const invoiceDates = invoices.map((i) => new Date(i.date).getTime()).sort((a, b) => a - b);

  return {
    venture: {
      id: venture.id,
      name: venture.name,
      slug: venture.slug,
      kind: venture.kind,
      status: venture.status,
      tagline: venture.tagline,
      description: venture.description,
      foundedAt: venture.foundedAt,
    },
    holding: settings
      ? {
          companyName: settings.companyName,
          owner: settings.owner,
          address: settings.address,
          taxNumber: settings.taxNumber,
          vatId: settings.vatId,
        }
      : null,
    summary: {
      clients: clients.length,
      sharedClients: clients.filter((c) => c.shared).length,
      projects: projects.length,
      offers: offers.length,
      invoices: invoices.length,
      contracts: contracts.length,
      credentials: credentials.length,
      tools: tools.length,
      tasks: tasks.length,
      openTasks: tasks.filter((t) => t.status !== "done").length,
      files: files.length,
      teamSize: people.length,
      revenuePaid,
      revenueOpen,
      offerPipeline: pipeline,
      toolCostPerMonth: toolMonthly,
      firstInvoice: invoiceDates.length ? new Date(invoiceDates[0]) : null,
      lastInvoice: invoiceDates.length ? new Date(invoiceDates[invoiceDates.length - 1]) : null,
    },
    clients,
    people,
    projects,
    offers,
    invoices,
    expenses,
    contracts,
    credentials,
    tools,
    tasks,
    files,
  };
}

/** CSV views for the records a bookkeeper or acquirer actually opens in Excel. */
export function exportCsvFiles(data: NonNullable<VentureExport>) {
  return {
    "clients.csv": toCsv(
      data.clients.map((c) => ({
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        vatId: c.vatId,
        shared: c.shared ? "yes" : "no",
        alsoInVentures: c.alsoInVentures.join("; "),
      })),
    ),
    "projects.csv": toCsv(
      data.projects.map((p) => ({
        title: p.title,
        client: p.client,
        type: p.type,
        status: p.status,
        shootStart: p.shootStart,
        shootEnd: p.shootEnd,
        location: p.location,
        budget: p.budget,
        fileCount: p.fileCount,
      })),
    ),
    "invoices.csv": toCsv(
      data.invoices.map((i) => ({
        number: i.number,
        date: i.date,
        dueDate: i.dueDate,
        client: i.client,
        project: i.project,
        status: i.status,
        paidAt: i.paidAt,
        net: i.net,
        vatRate: i.vatRate,
        vat: i.vat,
        gross: i.gross,
      })),
    ),
    "offers.csv": toCsv(
      data.offers.map((o) => ({
        number: o.number,
        date: o.date,
        validUntil: o.validUntil,
        client: o.client,
        status: o.status,
        net: o.net,
        vat: o.vat,
        gross: o.gross,
      })),
    ),
    "contracts.csv": toCsv(
      data.contracts.map((c) => ({
        title: c.title,
        type: c.type,
        counterparty: c.counterparty,
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        noticePeriodDays: c.noticePeriodDays,
        value: c.value,
      })),
    ),
    "tools.csv": toCsv(
      data.tools.map((t) => ({
        name: t.name,
        category: t.category,
        plan: t.plan,
        seats: t.seats,
        cost: t.cost,
        billingCycle: t.billingCycle,
        normalizedMonthlyCost: t.normalizedMonthlyCost,
        renewalDate: t.renewalDate,
        status: t.status,
        owner: t.owner,
      })),
    ),
    "expenses.csv": toCsv(
      data.expenses.map((e) => ({
        travelDate: e.travelDate,
        project: e.project,
        people: e.people,
        overnight: e.overnight,
        allowance: e.allowance,
      })),
    ),
    "tasks.csv": toCsv(
      data.tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee,
        dueDate: t.dueDate,
        source: t.source,
      })),
    ),
  };
}
