# Pushlabs Production OS

Internal AI-assisted production & business OS for **Pushlabs** — an AI-native cinematic production company. Local-first MVP, no external backend required.

> Premium · cinematic · clean · minimal

## Stack

- **Next.js 15** (App Router, server actions, route handlers)
- **TypeScript** everywhere
- **Tailwind CSS** with a custom graphite + sand/gold palette
- **SQLite** via **Prisma**
- **React Hook Form** + **Zod** for form validation
- **@react-pdf/renderer** for offers & invoices
- Local file storage (logos in `public/uploads/`)

## Features

| Module | Highlights |
|---|---|
| **Dashboard** | Active projects · unpaid invoices · monthly revenue · upcoming shoots · quick actions |
| **Clients** | Full CRUD, contact info, VAT ID, project list per client |
| **Projects** | 7 production types, 6-step status workflow, shoot dates, location, budget |
| **Offers** | Dynamic line items, live totals, VAT, validity date, payment terms, PDF export |
| **Invoices** | Auto-numbered starting `RE-001-0026`, PDF export, **ZUGFeRD-ready JSON** export |
| **Travel / Spesen** | German per-diem calculator (>8h, full day, overnight, meal deductions). Configurable rates. |
| **AI Assistant** | 7 structured prompt templates with live preview + copy. **No API call yet** — see TODO. |
| **Settings** | Company info, banking, tax, default VAT, invoice/offer numbering, logo upload |

## Getting started

```bash
# 1. Install
npm install

# 2. Set up the database (creates prisma/dev.db)
npm run db:push

# 3. Seed demo data (Aurora, Helix, Stellar + invoices RE-001-0026 / RE-001-0027)
npm run db:seed

# 4. Run the app
npm run dev
# → http://localhost:3000
```

### Useful scripts

```bash
npm run dev          # Next.js dev server
npm run build        # production build (runs prisma generate first)
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run db:push      # apply schema to SQLite
npm run db:seed      # seed demo data
npm run db:reset     # wipe and re-seed
```

## Data model

```
Client ─┬─ Project ─┬─ Offer ──┬─ OfferItem
        │           ├─ Invoice ┬─ InvoiceItem
        │           └─ Expense
        ├─ Offer
        └─ Invoice

CompanySettings  (singleton row, id="singleton")
```

All money / VAT calculations live in **`src/lib/calculations.ts`** — never inside UI components. Spesen rates are isolated in **`src/lib/spesen-rates.ts`** and the rule logic in **`src/lib/spesen.ts`**.

## Invoice numbering

Numbering starts at `RE-001-0026` and auto-increments. The next number is reserved atomically by **`reserveNextInvoiceNumber()`** in `src/lib/invoice-numbering.ts`. Prefix and counter are editable from the **Settings** page.

## ZUGFeRD-ready invoice data

Each invoice has two export endpoints:

- `/invoices/[id]/pdf` — branded PDF (also viewable inline)
- `/invoices/[id]/zugferd.json` — structured JSON shaped close to the ZUGFeRD BASIC profile / EN 16931, ready for future XML mapping

The JSON shape is built by **`buildZugferdInvoice()`** in `src/lib/zugferd.ts`. It contains `seller`, `buyer`, line items with positions and net totals, and the document totals (line net, tax basis, VAT, grand total).

## Travel expenses (Spesen)

Domestic Germany rules implemented in `src/lib/spesen.ts`:

- **>8h same-day** → small allowance
- **full 24h day** → full allowance
- **overnight (arrival/departure)** → small allowance per logged travel day
- Subtract **breakfast 20%**, **lunch 40%**, **dinner 40%** of the full allowance if provided
- Multiply by `people`, never below 0

Rates live in `src/lib/spesen-rates.ts` — update there when the law changes:

```ts
export const SPESEN_RATES = {
  fullAllowance: 28,
  smallAllowance: 14,
  breakfastReductionPct: 20,
  lunchReductionPct: 40,
  dinnerReductionPct: 40,
  currency: "EUR",
} as const;
```

## Project structure

```
src/
  app/
    page.tsx                  # Dashboard
    layout.tsx
    globals.css
    clients/                  # list, [id], [id]/edit, new, actions.ts
    projects/                 # list, [id], [id]/edit, new, actions.ts
    offers/                   # list, [id], [id]/edit, [id]/pdf, new, actions.ts
    invoices/                 # list, [id], [id]/edit, [id]/pdf, [id]/zugferd.json, new, actions.ts
    expenses/                 # calculator + history
    assistant/                # prompt templates
    settings/                 # company + numbering + logo
  components/
    sidebar.tsx
    page-header.tsx
    status-badge.tsx
    line-items-editor.tsx
    empty-state.tsx
  lib/
    db.ts                     # Prisma singleton
    schemas.ts                # Zod schemas (client, project, offer, invoice, expense, settings)
    calculations.ts           # net / vat / gross — single source of truth
    invoice-numbering.ts
    spesen.ts                 # German Spesen logic
    spesen-rates.ts           # configurable rates
    zugferd.ts                # ZUGFeRD-ready JSON builder
    prompt-templates.ts       # AI Assistant templates
    pdf/document.tsx          # shared PDF for offers + invoices
    utils.ts                  # cn(), formatCurrency, formatDate, status enums
prisma/
  schema.prisma
  seed.ts
  dev.db                      # gitignored
```

## TODO — future work

### AI API integration
The **AI Assistant** page intentionally renders prompt templates only — no model is called. To wire up Anthropic Claude:

1. Add `@anthropic-ai/sdk` and an `ANTHROPIC_API_KEY` env var.
2. Create `src/app/api/assistant/route.ts` with a streaming endpoint that takes `{ templateId, input }`, builds the prompt via `PROMPT_TEMPLATES[templateId].build(input)`, and streams the response.
3. Replace the "Copy" button in `assistant-workspace.tsx` with a "Generate" button that streams into a result panel.
4. Persist generated outputs to a new `AssistantRun` Prisma model if desired.

### Full ZUGFeRD XML
Today we ship a clean structured JSON. To produce a valid Factur-X / ZUGFeRD 2.x PDF/A-3:

1. Map `ZugferdInvoice` → UN/CEFACT `CrossIndustryInvoice` XML (BASIC profile is enough for B2B in Germany).
2. Embed the XML as `factur-x.xml` attachment inside the PDF (PDF/A-3 conformance, `AFRelationship=Source`).
3. Add the XMP metadata required by Factur-X (`fx:DocumentType`, `fx:DocumentFileName`, `fx:Version`, `fx:ConformanceLevel`).
4. Validate against the [Mustangproject](https://www.mustangproject.org/) reference validator.

`@react-pdf/renderer` does not produce PDF/A-3 directly — likely path is to render with @react-pdf, then post-process with `pdf-lib` to attach the XML and set XMP metadata. Pin this work behind a feature flag.

### Other
- Multi-user / auth (currently single-user local)
- Recurring invoices
- Reverse-charge VAT (intra-EU B2B `0%` with note)
- Partial payments / dunning
- CSV / DATEV export
- Backups: zip `prisma/dev.db` + `public/uploads` on demand
