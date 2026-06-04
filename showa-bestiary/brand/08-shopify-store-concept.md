# 08 — Shopify Store Concept

The store is not a shop — it is **the public terminal of the archive.** Visitors should feel
they've accessed a declassified government database and can "acquire recovered records."
Every UX decision reinforces the fiction while converting efficiently.

---

## 1. Positioning of the Storefront

| Principle | Implementation |
|-----------|----------------|
| It's an archive, not a shop | "Records," "files," "acquire," "classified" language |
| Scarcity is canon | Classification levels = product tiers; numbered editions |
| Browse = explore the bestiary | Filter by collection, threat, attribute, color |
| Trust + premium | Clean, dark, museum-grade; not cluttered Etsy energy |

---

## 2. Information Architecture

```
Home (The Archive)
├── Collections
│   ├── 01 Beasts (動物大図鑑)
│   ├── 02 Spirits of Japan (日本の神獣図鑑)
│   └── 03 Yokai (妖怪大図鑑)
├── Creature (PDP) — one per creature, links all its products
├── Shop by Product
│   ├── Prints (A4 / A3 / Posters)
│   ├── Trading Cards (packs / sets / singles)
│   ├── Stickers & Postcards
│   ├── Collector (numbered / metal / canvas)
│   └── Artbook & Collector Box
├── The Bureau (lore / about / world)
├── Threat Index (interactive bestiary table)
└── Account (collection tracker — Phase 2)
```

---

## 3. Homepage ("The Archive")

1. **Hero:** dark, cinematic, masthead-style — three collection bars (Beasts / Spirits /
   Yokai) like the reference poster, with the warning footer.
2. **"Latest declassified files"** — newest creature drops.
3. **Collection rails** with collection seals.
4. **The Bureau** teaser (lore hook → emotional buy-in).
5. **Threat Index** entry point.
6. Email capture framed as **"Request clearance"** (newsletter = "field dispatches").

---

## 4. Product Detail Page (per creature)

Each creature gets ONE rich page acting as its archive record, then sells every format:

- Large archive-page artwork + zoom; variant gallery.
- Identity block: kanji, romaji, EN, ID, classification, **threat meter**, habitat, attribute bars (from `creatures.json`).
- 1–2 paragraphs of lore (the hook).
- **Buy module:** format selector → A4 / A3 / Poster / Card / Sticker / Numbered / Metal /
  Canvas, each its own variant/SKU.
- Cross-sell: "Complete the collection," "Add the booster pack," "Collector box."
- Social proof + "X of 500 recovered" scarcity counter on numbered items.

---

## 5. Catalog & SKU Model

Driven by `creatures.json` + `SCHEMA.md`. SKU pattern:

```
SHB-<creatureID>-<product>-<size/variant>
e.g.  SHB-JP-B002-PRINT-A3
      SHB-JP-Y001-CARD-FOIL
      SHB-JP-S005-METAL-50
      SHB-SET-BEASTS-CARDS
      SHB-BOX-COLLECTOR-01
```

- 30 creatures × ~6 base products ≈ 180 SKUs at launch (most via print-on-demand → low risk).
- Tag every product with: collection, threat, dominant color, attributes, rarity → powers filters.

---

## 6. Tech Stack & Apps

| Need | Choice |
|------|--------|
| Platform | Shopify (Basic → grow) |
| Theme | Customized dark editorial theme (Dawn-based or premium) |
| Fulfillment | Print-on-demand (Printful/Printify/Gelato/Prodigi) for prints/stickers/canvas/metal |
| In-house | Trading cards, artbook, collector box (held stock / fulfillment partner) |
| Reviews | Judge.me / Loox |
| Email/SMS | Klaviyo ("field dispatches") |
| Upsell | Bundle/upsell app for "complete the set" |
| Loyalty (P2) | "Clearance levels" — gamified archive completion |

---

## 7. Merchandising & Conversion

- **Tiered scarcity:** Open-file prints (always available) → Confidential limited runs →
  Top-Secret numbered editions (countdown + serials).
- **Bundles:** collection 10-print set, "Starter Dossier" (3 prints + card pack + stickers),
  collector box.
- **Drops:** new creatures released as "newly declassified files" on a schedule → recurring
  reasons to return; announce via dispatches.
- **Collection tracker (P2):** logged-in users see which records they "own" → completion drive.

---

## 8. Brand-Voice Microcopy

| UI element | Copy |
|-----------|------|
| Add to cart | `ACQUIRE RECORD` |
| Checkout | `PROCESS REQUISITION` |
| Newsletter | `REQUEST CLEARANCE` |
| Out of stock | `FILE SEALED` |
| Limited | `機密 · CONFIDENTIAL — limited recovery` |
| 404 | `RECORD REDACTED / NOT FOUND` |
| Order confirmation | `REQUISITION APPROVED — archive en route` |

Keep legal/checkout/shipping pages plain and trustworthy — fiction lives in browse, not in
payment.

---

## 9. Launch Checklist

- [ ] Theme customized (dark editorial, masthead hero)
- [ ] 3 collection pages + 30 creature PDPs
- [ ] Product feed generated from `creatures.json`
- [ ] POD products connected + test orders
- [ ] Threat Index interactive table
- [ ] The Bureau lore page
- [ ] Klaviyo flows (welcome, abandoned cart, dispatch, post-purchase)
- [ ] Reviews + bundles apps
- [ ] Policies, shipping, taxes (EU/DE first)
- [ ] Analytics + pixels
