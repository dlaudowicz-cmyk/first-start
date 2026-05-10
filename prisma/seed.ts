import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.offerItem.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.companySettings.deleteMany();

  await prisma.companySettings.create({
    data: {
      id: "singleton",
      companyName: "Pushlabs",
      owner: "Daniel Laudowicz",
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

  const aurora = await prisma.client.create({
    data: {
      companyName: "Aurora Automotive GmbH",
      contactPerson: "Lena Hoffmann",
      email: "lena.hoffmann@aurora-auto.de",
      phone: "+49 30 1234 5678",
      address: "Industriestraße 22\n80331 München",
      vatId: "DE123456789",
      notes: "Premium electric vehicle launches. Prefers cinematic look.",
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
    },
  });

  const auroraProject = await prisma.project.create({
    data: {
      title: "Aurora EV-7 — Cinematic Reveal Film",
      type: "image film",
      status: "in production",
      shootStart: new Date("2026-05-18"),
      shootEnd: new Date("2026-05-21"),
      location: "Mojave Desert / Studio Berlin",
      budget: 86000,
      notes: "Hybrid live action + AI-generated environments.",
      clientId: aurora.id,
    },
  });

  const helixProject = await prisma.project.create({
    data: {
      title: "Helix — Annual Investor Reel 2026",
      type: "documentary",
      status: "confirmed",
      shootStart: new Date("2026-06-02"),
      shootEnd: new Date("2026-06-04"),
      location: "Munich HQ + Lab Facility",
      budget: 42000,
      notes: "Interviews with leadership + B-roll lab footage.",
      clientId: helix.id,
    },
  });

  const stellarProject = await prisma.project.create({
    data: {
      title: "Stellar SS26 — Social Media Campaign",
      type: "social media campaign",
      status: "offer sent",
      shootStart: new Date("2026-05-25"),
      shootEnd: new Date("2026-05-27"),
      location: "Berlin / Mallorca",
      budget: 28000,
      notes: "9:16 + 1:1 deliverables, 12 cutdowns.",
      clientId: stellar.id,
    },
  });

  await prisma.project.create({
    data: {
      title: "Internal — Pushlabs AI Reel",
      type: "AI film",
      status: "lead",
      location: "Remote",
      budget: 0,
      notes: "Showcase our generative pipeline.",
      clientId: aurora.id,
    },
  });

  const offer = await prisma.offer.create({
    data: {
      number: "AN-2026-001",
      date: new Date("2026-04-15"),
      validUntil: new Date("2026-05-15"),
      paymentTerms: "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      vatRate: 19,
      status: "sent",
      clientId: stellar.id,
      projectId: stellarProject.id,
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

  await prisma.invoice.create({
    data: {
      number: "RE-001-0026",
      date: new Date("2026-04-30"),
      dueDate: new Date("2026-05-14"),
      paymentTerms: "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      vatRate: 19,
      status: "sent",
      clientId: aurora.id,
      projectId: auroraProject.id,
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
      date: new Date("2026-05-05"),
      dueDate: new Date("2026-05-19"),
      paymentTerms: "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      vatRate: 19,
      status: "paid",
      paidAt: new Date("2026-05-09"),
      clientId: helix.id,
      projectId: helixProject.id,
      items: {
        create: [
          { position: 1, description: "Anzahlung Investor Reel 2026", quantity: 1, unit: "Pauschale", unitPrice: 14000 },
        ],
      },
    },
  });

  await prisma.companySettings.update({
    where: { id: "singleton" },
    data: { nextInvoiceNo: 28, nextOfferNo: 2 },
  });

  await prisma.expense.create({
    data: {
      travelDate: new Date("2026-05-18"),
      startTime: "07:00",
      endTime: "22:30",
      overnight: true,
      breakfast: false,
      lunch: true,
      dinner: false,
      people: 4,
      allowance: 0,
      notes: "Anreise Mojave Drehtag 1",
      projectId: auroraProject.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete.");
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
