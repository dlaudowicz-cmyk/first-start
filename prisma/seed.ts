import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Fixed reference date so seeded demo data stays internally consistent. */
const TODAY = new Date("2026-08-09");
const day = (offset: number) => new Date(TODAY.getTime() + offset * 86_400_000);

async function main() {
  // Order matters — children before parents.
  await prisma.task.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.toolSubscription.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.offerItem.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientVenture.deleteMany();
  await prisma.client.deleteMany();
  await prisma.ventureMember.deleteMany();
  await prisma.venture.deleteMany();
  await prisma.person.deleteMany();
  await prisma.companySettings.deleteMany();

  await prisma.companySettings.create({
    data: {
      id: "singleton",
      companyName: "Pushlabs",
      owner: "Daniel Laudowicz",
      tagline: "We make brands move",
      address: "Musterstraße 1\n10115 Berlin\nGermany",
      taxNumber: "DE-TAX-000/000/0000",
      vatId: "DE000000000",
      email: "hello@pushlabs.studio",
      phone: "+49 000 000 000",
      website: "pushlabs.studio",
      bankName: "Berliner Sparkasse",
      iban: "DE00 0000 0000 0000 0000 00",
      bic: "BELADEBEXXX",
      defaultVatRate: 19,
      invoicePrefix: "RE-001-",
      nextInvoiceNo: 26,
      offerPrefix: "AN-",
      nextOfferNo: 1,
    },
  });

  // ── Ventures ───────────────────────────────────────────────────────────────
  const studio = await prisma.venture.create({
    data: {
      name: "Pushlabs Studio",
      slug: "studio",
      kind: "studio",
      status: "active",
      tagline: "Cinematic production & AI film",
      description: "The core agency business — image films, commercials, AI-native production.",
      accent: "#caff3d",
      foundedAt: new Date("2025-01-15"),
    },
  });

  const backsley = await prisma.venture.create({
    data: {
      name: "Backsley",
      slug: "backsley",
      kind: "brand",
      status: "incubating",
      tagline: "Own brand venture",
      description: "Standalone brand operated under the Pushlabs roof.",
      accent: "#7dd3fc",
      foundedAt: new Date("2026-03-01"),
    },
  });

  const podcast = await prisma.venture.create({
    data: {
      name: "Pushlabs Podcast",
      slug: "podcast",
      kind: "podcast",
      status: "active",
      tagline: "Conversation format & cooperations",
      description: "Podcast production line, incl. partner cooperations.",
      accent: "#fca5a5",
      foundedAt: new Date("2026-06-01"),
    },
  });

  // ── People ─────────────────────────────────────────────────────────────────
  const daniel = await prisma.person.create({
    data: {
      name: "Daniel Laudowicz",
      type: "founder",
      role: "Founder & Executive Producer",
      email: "daniel@pushlabs.studio",
      location: "Berlin",
      skills: "Direction, Producing, AI pipeline, Client relations",
      status: "active",
    },
  });

  const donPiz = await prisma.person.create({
    data: {
      name: "Don Piz",
      type: "founder",
      role: "Co-Founder & Technical Lead",
      location: "Berlin",
      skills: "Engineering, Dashboards, Infrastructure, Post",
      status: "active",
    },
  });

  const gerd = await prisma.person.create({
    data: {
      name: "Gerd Gerlach",
      type: "partner",
      role: "Partner — Podcast cooperation",
      skills: "Format development, Moderation",
      status: "active",
    },
  });

  const rico = await prisma.person.create({
    data: {
      name: "Rico",
      type: "advisor",
      role: "Network contact — clinics",
      notes: "Potential door-opener for clinic/healthcare cooperations.",
      status: "prospect",
    },
  });

  await prisma.ventureMember.createMany({
    data: [
      { personId: daniel.id, ventureId: studio.id, role: "Executive Producer", allocation: 60 },
      { personId: daniel.id, ventureId: backsley.id, role: "Owner", allocation: 20 },
      { personId: daniel.id, ventureId: podcast.id, role: "Host & Producer", allocation: 20 },
      { personId: donPiz.id, ventureId: studio.id, role: "Technical Lead", allocation: 70 },
      { personId: donPiz.id, ventureId: podcast.id, role: "Technical Lead", allocation: 30 },
      { personId: gerd.id, ventureId: podcast.id, role: "Cooperation Partner" },
    ],
  });

  // ── Clients (n:m to ventures — Aurora is shared) ────────────────────────────
  const aurora = await prisma.client.create({
    data: {
      companyName: "Aurora Automotive GmbH",
      contactPerson: "Lena Hoffmann",
      email: "lena.hoffmann@aurora-auto.de",
      phone: "+49 30 1234 5678",
      address: "Industriestraße 22\n80331 München",
      vatId: "DE123456789",
      notes: "Premium electric vehicle launches. Prefers cinematic look.",
      ventures: { create: [{ ventureId: studio.id }, { ventureId: backsley.id }] },
    },
  });

  const helix = await prisma.client.create({
    data: {
      companyName: "Helix Biotech AG",
      contactPerson: "Dr. Marcus Reinhardt",
      email: "m.reinhardt@helix-bio.com",
      phone: "+49 89 9876 5432",
      address: "Wissenschaftspark 5\n81675 München",
      vatId: "DE987654321",
      notes: "Annual corporate film + investor reels.",
      ventures: { create: [{ ventureId: studio.id }] },
    },
  });

  const stellar = await prisma.client.create({
    data: {
      companyName: "Stellar Fashion House",
      contactPerson: "Camille Dubois",
      email: "camille@stellar-fashion.com",
      phone: "+49 30 5555 9999",
      address: "Torstraße 100\n10119 Berlin",
      vatId: "DE555555555",
      notes: "Quarterly SS/AW campaigns. Tight delivery windows.",
      ventures: { create: [{ ventureId: studio.id }] },
    },
  });

  const poro = await prisma.client.create({
    data: {
      companyName: "Poro Ventures",
      contactPerson: "Kickoff contact",
      address: "Berlin",
      notes: "Met at kickoff event. Potential cooperation via Backsley.",
      ventures: { create: [{ ventureId: backsley.id }] },
    },
  });

  // ── Projects ───────────────────────────────────────────────────────────────
  const auroraProject = await prisma.project.create({
    data: {
      title: "Aurora EV-7 — Cinematic Reveal Film",
      type: "image film",
      status: "in production",
      shootStart: day(9),
      shootEnd: day(12),
      location: "Mojave Desert / Studio Berlin",
      budget: 86000,
      notes: "Hybrid live action + AI-generated environments.",
      clientId: aurora.id,
      ventureId: studio.id,
    },
  });

  const helixProject = await prisma.project.create({
    data: {
      title: "Helix — Annual Investor Reel 2026",
      type: "documentary",
      status: "confirmed",
      shootStart: day(24),
      shootEnd: day(26),
      location: "Munich HQ + Lab Facility",
      budget: 42000,
      notes: "Interviews with leadership + B-roll lab footage.",
      clientId: helix.id,
      ventureId: studio.id,
    },
  });

  const stellarProject = await prisma.project.create({
    data: {
      title: "Stellar SS26 — Social Media Campaign",
      type: "social media campaign",
      status: "offer sent",
      shootStart: day(16),
      shootEnd: day(18),
      location: "Berlin / Mallorca",
      budget: 28000,
      notes: "9:16 + 1:1 deliverables, 12 cutdowns.",
      clientId: stellar.id,
      ventureId: studio.id,
    },
  });

  const backsleyProject = await prisma.project.create({
    data: {
      title: "Backsley — Brand Launch Film",
      type: "AI film",
      status: "lead",
      location: "Remote / AI pipeline",
      budget: 15000,
      notes: "First own-brand production under the Backsley venture.",
      clientId: poro.id,
      ventureId: backsley.id,
    },
  });

  const podcastProject = await prisma.project.create({
    data: {
      title: "Podcast — Season 1 (Ep. 1–2)",
      type: "editing",
      status: "confirmed",
      shootStart: day(5),
      shootEnd: day(6),
      location: "Studio Berlin",
      budget: 8000,
      notes: "Piggy setup required for the first two productions.",
      clientId: aurora.id,
      ventureId: podcast.id,
    },
  });

  // ── Offers ─────────────────────────────────────────────────────────────────
  await prisma.offer.create({
    data: {
      number: "AN-2026-001",
      date: day(-20),
      validUntil: day(10),
      paymentTerms: "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      vatRate: 19,
      status: "sent",
      clientId: stellar.id,
      projectId: stellarProject.id,
      ventureId: studio.id,
      items: {
        create: [
          { position: 1, description: "Konzept & Treatment", quantity: 1, unit: "Pauschale", unitPrice: 3500 },
          { position: 2, description: "Drehtag (inkl. Crew & Equipment)", quantity: 3, unit: "Tag", unitPrice: 6500 },
          { position: 3, description: "Postproduktion & Schnitt", quantity: 1, unit: "Pauschale", unitPrice: 5800 },
          { position: 4, description: "Cutdowns für Social Media (9:16, 1:1)", quantity: 12, unit: "Stk.", unitPrice: 250 },
        ],
      },
    },
  });

  await prisma.offer.create({
    data: {
      number: "AN-2026-002",
      date: day(-5),
      validUntil: day(25),
      paymentTerms: "50% Anzahlung, 50% nach Abnahme.",
      vatRate: 19,
      status: "draft",
      clientId: poro.id,
      projectId: backsleyProject.id,
      ventureId: backsley.id,
      items: {
        create: [
          { position: 1, description: "AI-Konzept & Moodboard", quantity: 1, unit: "Pauschale", unitPrice: 2200 },
          { position: 2, description: "AI-Videogenerierung & Grading", quantity: 1, unit: "Pauschale", unitPrice: 7400 },
        ],
      },
    },
  });

  // ── Invoices ───────────────────────────────────────────────────────────────
  await prisma.invoice.create({
    data: {
      number: "RE-001-0026",
      date: day(-14),
      dueDate: day(0),
      paymentTerms: "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      vatRate: 19,
      status: "sent",
      clientId: aurora.id,
      projectId: auroraProject.id,
      ventureId: studio.id,
      items: {
        create: [
          { position: 1, description: "Vorproduktion & Treatment", quantity: 1, unit: "Pauschale", unitPrice: 8500 },
          { position: 2, description: "Drehtag — Hauptdreh", quantity: 4, unit: "Tag", unitPrice: 9800 },
          { position: 3, description: "AI-Postproduktion (Compositing)", quantity: 1, unit: "Pauschale", unitPrice: 12400 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "RE-001-0027",
      date: day(-9),
      dueDate: day(5),
      paymentTerms: "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      vatRate: 19,
      status: "paid",
      paidAt: day(-5),
      clientId: helix.id,
      projectId: helixProject.id,
      ventureId: studio.id,
      items: {
        create: [
          { position: 1, description: "Anzahlung Investor Reel 2026", quantity: 1, unit: "Pauschale", unitPrice: 14000 },
        ],
      },
    },
  });

  await prisma.companySettings.update({
    where: { id: "singleton" },
    data: { nextInvoiceNo: 28, nextOfferNo: 3 },
  });

  // ── Expenses ───────────────────────────────────────────────────────────────
  await prisma.expense.create({
    data: {
      travelDate: day(9),
      startTime: "07:00",
      endTime: "22:30",
      overnight: true,
      lunch: true,
      people: 4,
      allowance: 0,
      notes: "Anreise Mojave Drehtag 1",
      projectId: auroraProject.id,
      ventureId: studio.id,
    },
  });

  // ── Contracts ──────────────────────────────────────────────────────────────
  await prisma.contract.createMany({
    data: [
      {
        title: "Podcast-Kooperation — Rahmenvertrag",
        type: "cooperation",
        counterparty: "Gerd Gerlach",
        status: "in review",
        startDate: day(20),
        notes: "Vertragsentwurf liegt bei den jeweiligen Juristen zur Prüfung.",
        ventureId: podcast.id,
        personId: gerd.id,
      },
      {
        title: "Aurora EV-7 — Produktionsvertrag",
        type: "client",
        counterparty: "Aurora Automotive GmbH",
        status: "signed",
        signedAt: day(-30),
        startDate: day(-28),
        endDate: day(40),
        value: 86000,
        ventureId: studio.id,
        clientId: aurora.id,
      },
      {
        title: "Helix — Jahresrahmenvertrag 2026",
        type: "client",
        counterparty: "Helix Biotech AG",
        status: "active",
        signedAt: new Date("2026-01-20"),
        startDate: new Date("2026-02-01"),
        endDate: new Date("2027-01-31"),
        noticePeriodDays: 90,
        value: 42000,
        ventureId: studio.id,
        clientId: helix.id,
      },
      {
        title: "Studio Berlin — Mietvertrag",
        type: "lease",
        counterparty: "Berlin Studio Spaces GmbH",
        status: "active",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2027-03-31"),
        noticePeriodDays: 90,
        value: 1850,
        notes: "Monatliche Miete. Kündigungsfrist 3 Monate zum Quartalsende.",
      },
      {
        title: "NDA — Backsley Brand Development",
        type: "nda",
        counterparty: "Poro Ventures",
        status: "draft",
        ventureId: backsley.id,
        clientId: poro.id,
      },
    ],
  });

  // ── Vault (references only — never secrets) ─────────────────────────────────
  await prisma.credential.createMany({
    data: [
      {
        service: "Google Workspace — pushlabs.studio",
        category: "account",
        url: "https://admin.google.com",
        identifier: "daniel@pushlabs.studio",
        storageLocation: "1Password",
        vaultRef: "1Password → Pushlabs → Google Workspace (Admin)",
        mfaLocation: "1Password TOTP + Hardware key (Daniel)",
        sharedWith: "Daniel, Don Piz",
        criticality: "critical",
        rotatedAt: day(-60),
        rotateEveryDays: 180,
        notes: "Zentrale Firmen-E-Mail und Cloud-Ablage.",
        ownerId: daniel.id,
      },
      {
        service: "Domain Registrar — pushlabs.studio",
        category: "domain",
        identifier: "daniel@pushlabs.studio",
        storageLocation: "1Password",
        vaultRef: "1Password → Pushlabs → Registrar",
        mfaLocation: "1Password TOTP",
        criticality: "critical",
        notes: "Domain-Verlängerung automatisch aktiv.",
        ownerId: daniel.id,
      },
      {
        service: "Business Bank Account",
        category: "bank",
        storageLocation: "1Password + TAN-App",
        vaultRef: "1Password → Pushlabs → Banking",
        mfaLocation: "Banking-App (Daniel, Gerätebindung)",
        criticality: "critical",
        sharedWith: "Daniel",
        ownerId: daniel.id,
      },
      {
        service: "Higgsfield — AI video generation",
        category: "api",
        url: "https://higgsfield.ai",
        identifier: "team@pushlabs.studio",
        storageLocation: "1Password",
        vaultRef: "1Password → Pushlabs → AI Tools → Higgsfield",
        criticality: "high",
        notes: "API-Key für AI-Videopipeline. Nutzung projektbezogen abrechnen.",
        ownerId: donPiz.id,
        ventureId: studio.id,
      },
      {
        service: "Anthropic API",
        category: "api",
        url: "https://console.anthropic.com",
        identifier: "team@pushlabs.studio",
        storageLocation: "1Password",
        vaultRef: "1Password → Pushlabs → AI Tools → Anthropic",
        criticality: "high",
        notes: "Für die geplante AI-Assistant-Anbindung im Pushlabs OS.",
        ownerId: donPiz.id,
      },
      {
        service: "Telekom Business — Glasfaser",
        category: "account",
        identifier: "Kundennummer im Vertrag",
        storageLocation: "1Password",
        vaultRef: "1Password → Pushlabs → Infrastructure → Telekom",
        criticality: "normal",
        notes: "Zweite dedizierte Leitung angefragt — Kosten prüfen.",
        ownerId: donPiz.id,
      },
      {
        service: "Instagram / LinkedIn — Pushlabs",
        category: "social",
        storageLocation: "1Password",
        vaultRef: "1Password → Pushlabs → Social",
        mfaLocation: "1Password TOTP",
        sharedWith: "Daniel, Don Piz",
        criticality: "normal",
        ownerId: daniel.id,
      },
    ],
  });

  // ── Tools / SaaS inventory ─────────────────────────────────────────────────
  await prisma.toolSubscription.createMany({
    data: [
      {
        name: "Google Workspace",
        category: "infra",
        plan: "Business Standard",
        seats: 3,
        costPerMonth: 41.4,
        billingCycle: "monthly",
        renewalDate: day(21),
        status: "active",
        ownerId: daniel.id,
      },
      {
        name: "Adobe Creative Cloud",
        category: "production",
        plan: "All Apps (Teams)",
        seats: 2,
        costPerMonth: 145.0,
        billingCycle: "yearly",
        renewalDate: new Date("2027-01-15"),
        status: "active",
        ownerId: donPiz.id,
      },
      {
        name: "Higgsfield",
        category: "ai",
        plan: "Pro",
        seats: 1,
        costPerMonth: 79.0,
        billingCycle: "monthly",
        status: "active",
        ownerId: donPiz.id,
        ventureId: studio.id,
      },
      {
        name: "1Password",
        category: "infra",
        plan: "Teams",
        seats: 3,
        costPerMonth: 17.85,
        billingCycle: "monthly",
        status: "active",
        ownerId: daniel.id,
        notes: "Single source of truth für alle Secrets — Vault verweist hierauf.",
      },
      {
        name: "Frame.io",
        category: "production",
        plan: "Pro",
        seats: 2,
        costPerMonth: 30.0,
        billingCycle: "monthly",
        status: "evaluating",
        ownerId: donPiz.id,
      },
      {
        name: "Telekom Glasfaser (2. Leitung)",
        category: "infra",
        plan: "Business Fiber",
        costPerMonth: 0,
        billingCycle: "monthly",
        status: "evaluating",
        ownerId: donPiz.id,
        notes: "Kosten bei der Telekom erfragen.",
      },
    ],
  });

  // ── Action items from the strategy meeting ─────────────────────────────────
  const source = "Strategie-Meeting 2026-08-09";
  await prisma.task.createMany({
    data: [
      {
        title: "Notar kontaktieren",
        detail: "Notar kontaktieren, um die Gründung einer Unternehmergesellschaft (UG) zu besprechen.",
        priority: "high",
        assigneeId: daniel.id,
        source,
      },
      {
        title: "Unternehmensgründung prüfen",
        detail: "Möglichkeiten von Raketenstart für den Prozess der Firmengründung untersuchen.",
        priority: "high",
        assigneeLabel: "Die Gruppe",
        source,
      },
      {
        title: "Infogespräch mit Raketenstart buchen",
        detail: "Informationsgespräch mit Raketenstart für Donnerstag, den 13., um 16:00 Uhr buchen.",
        priority: "high",
        dueDate: new Date("2026-08-13T16:00:00Z"),
        assigneeId: daniel.id,
        source,
      },
      {
        title: "Zentrale E-Mail-Adresse einrichten",
        detail: "Zentrale E-Mail-Adresse unter der Domain Pushlabs einrichten.",
        priority: "high",
        assigneeId: daniel.id,
        source,
      },
      {
        title: "Podcast-Kooperationsvertrag prüfen lassen",
        detail: "Vertragsentwurf zur Podcast-Kooperation durch die jeweiligen Juristen prüfen lassen.",
        priority: "high",
        assigneeLabel: "Gerd Gerlach, Don Piz",
        ventureId: podcast.id,
        source,
      },
      {
        title: "Internetanschluss prüfen",
        detail: "Bei der Telekom nach den Kosten für eine dedizierte zweite Glasfaserleitung erkundigen.",
        assigneeId: donPiz.id,
        source,
      },
      {
        title: "Einheitliche Datenstruktur festlegen",
        detail: "Einheitliche Ordnerstruktur für alle laufenden Projekte erstellen.",
        assigneeLabel: "Die Gruppe",
        source,
      },
      {
        title: "Dashboard für Angebote & Rechnungen programmieren",
        detail:
          "Dashboard für die automatisierte Generierung von Angeboten und Rechnungen. Umgesetzt im Pushlabs OS (Offers + Invoices inkl. PDF-Export).",
        status: "done",
        completedAt: day(0),
        assigneeId: donPiz.id,
        source,
      },
      {
        title: "Am Poro-Kickoff teilnehmen",
        detail: "Am 4.9. um 18:00 Uhr am Kickoff der Poro teilnehmen, Kontakte knüpfen und die Agentur vorstellen.",
        priority: "high",
        dueDate: new Date("2026-09-04T18:00:00Z"),
        assigneeLabel: "Daniel, Don Piz",
        source,
      },
      {
        title: "Rico kontaktieren",
        detail: "Kontakt zu Rico aufnehmen, um Netzwerkmöglichkeiten und Kooperationen mit Kliniken zu besprechen.",
        assigneeLabel: "Die Gruppe",
        source,
      },
      {
        title: "Leistungsportfolio bündeln",
        detail: "Leistungsportfolio bündeln und Showcase-Beispiele für alle angebotenen Dienstleistungen erstellen.",
        assigneeLabel: "Die Gruppe",
        ventureId: studio.id,
        source,
      },
      {
        title: "POG Account erstellen",
        detail: "Account anlegen und die grundlegende Struktur für die Verwaltung aufbauen.",
        assigneeId: daniel.id,
        source,
      },
      {
        title: "Pushlabs OS weiterentwickeln",
        detail: "Entwicklung des Betriebssystems sowie des Dashboards für Pushlabs OS vorantreiben.",
        status: "in progress",
        priority: "high",
        assigneeId: daniel.id,
        source,
      },
      {
        title: "Abnahmeprozess fertigstellen",
        detail: "Prozess für die Abnahme von Aufgaben und Dokumenten innerhalb der Arbeitsumgebung abschließen.",
        assigneeLabel: "Die Gruppe",
        source,
      },
      {
        title: "Buchhaltung automatisieren",
        detail:
          "Erstellung von Angeboten, Rechnungen und Projektstatusberichten in der Workspace-Infrastruktur automatisieren.",
        status: "in progress",
        assigneeLabel: "Die Gruppe",
        source,
      },
      {
        title: "Piggy einrichten",
        detail: "Piggy-Konfiguration für die nächsten beiden Podcast-Produktionen betriebsbereit machen.",
        priority: "high",
        assigneeId: daniel.id,
        ventureId: podcast.id,
        projectId: podcastProject.id,
        source,
      },
      {
        title: "Betrugserkennung implementieren",
        detail:
          "Mechanismen zur Erkennung von Betrugsfällen vor deren Eintreten sowie Untertitel-Anpassungen integrieren.",
        assigneeLabel: "Die Gruppe",
        source,
      },
    ],
  });

  const counts = {
    ventures: await prisma.venture.count(),
    people: await prisma.person.count(),
    clients: await prisma.client.count(),
    projects: await prisma.project.count(),
    contracts: await prisma.contract.count(),
    credentials: await prisma.credential.count(),
    tools: await prisma.toolSubscription.count(),
    tasks: await prisma.task.count(),
  };
  // eslint-disable-next-line no-console
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
