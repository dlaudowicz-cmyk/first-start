# Pushlabs Company OS

The internal operating system for **Pushlabs** — an AI-native cinematic production company. Local-first, no external backend, one SQLite file.

> Pushlabs · We make brands move

It has two layers:

- **Company layer** — the roof: ventures, people, contracts, access, tools, tasks
- **Operations layer** — the work: clients, projects, offers, invoices, travel expenses

Every venture (Pushlabs Studio, Backsley, the podcast, whatever comes next) runs **under the Pushlabs roof** and can be viewed in isolation or exported as a self-contained archive.

## Stack

- **Next.js 15** (App Router, server actions, route handlers)
- **TypeScript** everywhere
- **Tailwind CSS** — black + neon lime brand palette
- **SQLite** via **Prisma**
- **React Hook Form** + **Zod** validation
- **@react-pdf/renderer** for offers, invoices and venture dossiers
- **JSZip** for venture export archives
- Local file storage (logos in `public/uploads/`)

## Getting started

```bash
npm install          # also runs `prisma generate`
cp .env.example .env # DATABASE_URL="file:./dev.db"
npm run db:push      # create prisma/dev.db
npm run db:seed      # demo data: 3 ventures, 4 people, 17 action items
npm run dev          # → http://localhost:3000
```

### Scripts

```bash
npm run dev          # dev server
npm run build        # production build (runs prisma generate first)
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run db:push      # apply schema to SQLite
npm run db:seed      # seed demo data
npm run db:reset     # wipe and re-seed
```

## Modules

### Company layer

| Module | What it holds |
|---|---|
| **Ventures** | Every business line under the roof — kind, status, accent colour, team, clients, revenue, contracts. Each has a **Dossier PDF** and a **ZIP export**. |
| **People** | Founders, employees, freelancers, partners, advisors. Day rates, skills, and per-venture role + allocation. |
| **Contracts** | Client deals, freelancer agreements, cooperations, NDAs, leases. Notice periods and an expiry warning at 120 days. |
| **Vault** | Which accounts, APIs and access the company holds — **references only, no secrets** (see below). Rotation tracking. |
| **Tools & SaaS** | Subscription inventory with seats, owner, renewal date and a normalized monthly run rate. |
| **Tasks** | Action items with assignee, priority, due date, source meeting and venture scope. Inline status cycling. |

### Operations layer

| Module | Highlights |
|---|---|
| **Dashboard** | Scoped or holding-wide: active projects, unpaid invoices, monthly revenue, open tasks, expiring contracts, venture tiles |
| **Clients** | CRUD, VAT ID, **many-to-many venture links** (a client can book several ventures) |
| **Projects** | 7 production types, 6-step status workflow, shoot dates, budget, venture assignment, **status report PDF**, **file vault** |
| **Offers** | Dynamic line items, live totals, validity, payment terms, PDF export |
| **Invoices** | Auto-numbered from `RE-001-0026`, PDF export, **ZUGFeRD-ready JSON** |
| **Travel / Spesen** | German per-diem calculator with configurable rates |
| **AI Assistant** | 7 structured prompt templates with live preview + copy (no API call yet) |
| **Settings** | Company info, banking, tax, VAT default, numbering, logo upload |

## Documents

Three PDF families, all sharing the brand header (uploaded logo when it is a PNG or JPEG, otherwise the wordmark — `@react-pdf` cannot rasterize SVG):

| Document | Route |
|---|---|
| Offer | `/offers/<id>/pdf` |
| Invoice | `/invoices/<id>/pdf` |
| **Project status report** | `/projects/<id>/report` |
| Venture dossier | `/ventures/<slug>/dossier` |

The **status report** is the client-facing counterpart to an invoice: project meta, shoot window, a budget-usage bar (red past 100%), all offers and invoices with totals, Spesen, and the task list. Figures come from `src/lib/project-report.ts`, so they can be reused without rendering.

## Project file vault

Every project gets the **same eight categories**, defined once in `src/lib/project-files.ts`:

```
Briefing & Konzept · Verträge · Drehbuch & Storyboard · Dispo & Zeitplan
Rushes & Footage · Deliverables · Belege & Rechnungen · Sonstiges
```

Add a category there and it appears for every project at once — that is the "einheitliche Ordnerstruktur", enforced by the app rather than by discipline.

Bytes are stored in `storage/projects/<projectId>/` (gitignored), **not** under `public/`, and served through `/projects/<id>/files/<fileId>`. That route checks the file belongs to the project in the URL, forces `Content-Disposition: attachment` and sets `nosniff`, so a contract is never reachable by guessing a URL and an upload is never rendered inline. Stored names are UUIDs; the original name lives in the database. Limit is 50 MB per file.

Filesystem access sits in `project-files-storage.ts` (server only) while categories and formatting live in `project-files.ts`, so client components can import the shared parts without pulling in `fs`.

## Venture scoping

The sidebar has a **venture switcher**. Picking a venture stores a cookie and every list, form default and dashboard figure narrows to that venture. "All ventures" gives the holding view.

Ventures are **softly separated**: each operational record carries a nullable `ventureId` (null = company-wide), and clients relate many-to-many. That keeps the holding view and a shared client base possible while still allowing a clean extraction — see the export below.

```
PUSHLABS  (holding)
├── People · Contracts · Vault · Tools · Tasks     ← company-wide or venture-scoped
└── Ventures
    ├── Pushlabs Studio ── clients · projects · offers · invoices · expenses
    ├── Backsley ───────── clients · projects · offers · invoices · expenses
    └── Podcast ────────── …
```

## Venture export

`/ventures/<slug>/export` builds a ZIP containing everything that venture owns:

```
backsley-export-2026-08-09.zip
├── README.md                        overview, key figures, shared-record notes
├── data/*.json                      complete records, machine-readable
├── data/*.csv                       flat views for Excel / accounting
├── documents/<slug>-dossier-*.pdf   venture dossier
├── documents/offers/*.pdf           offer PDFs
├── documents/invoices/*.pdf         invoice PDFs
├── documents/projects/<project>/    status report + filed documents by category
└── zugferd/*.zugferd.json           structured invoice data
```

**Shared records.** If a client books more than one venture, the export includes it in full and flags it `"shared": true` with the list of other ventures, plus a note in the README. A handover is complete without pretending the overlap doesn't exist.

`/ventures/<slug>/dossier` gives just the PDF — the thing you hand a bank, buyer or tax advisor.

## The vault is deliberately secret-free

`Credential` has **no password, key or token field**. It records:

- which service exists, and its login identifier (not the password)
- where the secret actually lives (`1Password → Pushlabs → …`)
- where 2FA lives, who has access, who owns it
- when it was last rotated and how often it should be

So a leaked copy of `prisma/dev.db` cannot compromise a single system. 1Password (or whatever manager you use) stays the tresor; this is the index. Swapping to an encrypted in-app vault would mean owning key management, rotation and recovery — a decision to make deliberately, not by default.

## Calculation rules

All money and VAT logic lives in **`src/lib/calculations.ts`** — never in UI components. Spesen rates sit in **`src/lib/spesen-rates.ts`** with the rules in **`src/lib/spesen.ts`**:

- **>8h absence** → small allowance (14 €)
- **full 24h day** → full allowance (28 €)
- **overnight (arrival/departure)** → small allowance per logged travel day
- subtract **breakfast 20%**, **lunch 40%**, **dinner 40%** of the full allowance
- multiply by `people`, never below 0

Tool costs normalize through `monthlyCost()` so yearly and monthly subscriptions can be summed.

## Invoice numbering

Starts at `RE-001-0026` and auto-increments. `reserveNextInvoiceNumber()` in `src/lib/invoice-numbering.ts` reserves the next number; prefix and counter are editable in **Settings**.

## Project structure

```
src/
  app/
    page.tsx                     Dashboard (venture-scoped)
    actions/venture.ts           switch active venture
    ventures/                     list, new, [slug], [slug]/edit,
                                  [slug]/export (ZIP), [slug]/dossier (PDF)
    people/                       list, new, [id] (+ membership editor), [id]/edit
    contracts/ vault/ tools/      list, new, [id], [id]/edit
    tasks/                        board, new, [id]
    clients/                      list, new, [id] (+ venture links), [id]/edit
    projects/                     list, new, [id] (+ file vault), [id]/edit,
                                  [id]/report (PDF), [id]/files/[fileId] (download)
    offers/ invoices/             list, new, [id], [id]/edit, [id]/pdf
    invoices/[id]/zugferd.json    ZUGFeRD-ready payload
    expenses/ assistant/ settings/
  components/
    sidebar.tsx                  server shell
    sidebar-nav.tsx              Operations / Company sections
    venture-switcher.tsx         scope picker
    venture-badge.tsx  pushlabs-mark.tsx
    form-field.tsx               Field / FormSection / FormActions
    line-items-editor.tsx  status-badge.tsx  page-header.tsx  empty-state.tsx
  lib/
    db.ts  schemas.ts  form.ts  utils.ts  csv.ts
    calculations.ts              net / vat / gross — single source of truth
    project-report.ts            status report figures
    project-files.ts             categories + formatting (client-safe)
    project-files-storage.ts     filesystem access (server only)
    venture-context.ts           active venture + scope helpers
    venture-export.ts            export builder
    venture-export-readme.ts     archive README generator
    zugferd.ts  invoice-numbering.ts  spesen.ts  spesen-rates.ts
    prompt-templates.ts
    pdf/document.tsx             offers + invoices
    pdf/project-report.tsx       project status report
    pdf/venture-dossier.tsx      venture dossier
    pdf/logo.ts                  logo → data URI, with format guard
prisma/
  schema.prisma  seed.ts  dev.db (gitignored)
```

## Data model

```
Venture ─┬─ VentureMember ── Person
         ├─ ClientVenture ── Client (many-to-many)
         ├─ Project ─┬─ Offer ── OfferItem
         │           ├─ Invoice ── InvoiceItem
         │           └─ Expense
         ├─ Contract · Credential · ToolSubscription · Task
         └─ (all operational records: nullable ventureId)

CompanySettings   singleton row, id="singleton"
```

## TODO — future work

### AI API integration
The **AI Assistant** renders prompt templates only; no model is called. To wire up Claude:

1. Add `@anthropic-ai/sdk` and an `ANTHROPIC_API_KEY` env var.
2. Create `src/app/api/assistant/route.ts` that takes `{ templateId, input }`, builds the prompt via `PROMPT_TEMPLATES[templateId].build(input)` and streams the response.
3. Replace the "Copy" button in `assistant-workspace.tsx` with "Generate" streaming into a result panel.
4. Optionally persist runs in a new `AssistantRun` model.

A natural follow-up: a template that parses a meeting summary into `Task` records automatically.

### Full ZUGFeRD XML
Today the app ships clean structured JSON. For a valid Factur-X / ZUGFeRD 2.x PDF/A-3:

1. Map `ZugferdInvoice` → UN/CEFACT `CrossIndustryInvoice` XML (BASIC profile suffices for German B2B).
2. Embed it as `factur-x.xml` in the PDF (PDF/A-3, `AFRelationship=Source`).
3. Add the Factur-X XMP metadata (`fx:DocumentType`, `fx:DocumentFileName`, `fx:Version`, `fx:ConformanceLevel`).
4. Validate with [Mustangproject](https://www.mustangproject.org/).

`@react-pdf/renderer` does not emit PDF/A-3 — render first, then post-process with `pdf-lib`.

### Other
- Multi-user / auth (currently single-user local)
- SVG logo support in PDFs (needs rasterizing before `@react-pdf` can embed it)
- Streaming uploads for large rushes (current limit is 50 MB in memory)
- Recurring invoices, partial payments, dunning
- Reverse-charge VAT (0% intra-EU B2B with note)
- DATEV export
- One-click backup: zip `prisma/dev.db` + `public/uploads`
