# 03 — Archive Stamp System

Stamps are the single most important *authenticity* device in the brand. They sell the
fiction that each product is a processed government document. They appear on posters, card
backs, packaging, certificates, and shipping materials.

All stamps share a **hanko / official-seal** aesthetic: hand-pressed, slightly uneven ink,
Hanko Red (`#C0392B`) by default, with deliberate gaps and over-inked edges.

---

## 1. Stamp Categories

| # | Stamp | Purpose | Typical placement |
|---|-------|---------|-------------------|
| 1 | **Classification stamp** | Security level | Top of poster / card front |
| 2 | **Threat-level stamp** | Danger rating | Near metadata strip |
| 3 | **Archive registration seal** | "Filed/catalogued" mark with ID | Bottom corner |
| 4 | **Agency seal** | The bureau's official round mark | Anywhere, 1 per artifact min |
| 5 | **Date / fiscal stamp** | Shōwa-era date | Footer |
| 6 | **Authenticity / edition seal** | Numbered collector proof | Certificate, back of print |
| 7 | **Handling stamps** | Flavor: 取扱注意 (handle w/ care) etc. | Packaging, margins |

---

## 2. Classification Levels

A four-tier security ladder that doubles as a *rarity/collectibility signal*.

| Level | JP | EN | Color | Used for |
|-------|----|----|-------|----------|
| 1 | 公開 | OPEN FILE | Sumi Black | Common creatures, entry prints |
| 2 | 部外秘 | RESTRICTED | Tea Stain | Standard Beasts/Spirits |
| 3 | 機密 | CONFIDENTIAL | Hanko Red | Most Yokai, limited runs |
| 4 | 極秘 | TOP SECRET | Hanko Red + box rule | Rarest creatures, collector tier |

The masthead reference uses **極秘資料 / TOP SECRET ARCHIVE** as the house-level mark.

---

## 3. Threat-Level System

A five-step scale, shown as a stamped badge AND as filled bars in the metadata strip.

| Tier | JP label | EN | Meaning |
|------|----------|----|---------|
| ☆ | 無害 | HARMLESS | No recorded danger |
| ☆☆ | 要注意 | CAUTION | Capable of harm if provoked |
| ☆☆☆ | 危険 | DANGEROUS | Actively hazardous |
| ☆☆☆☆ | 高危険 | SEVERE | Lethal; avoid contact |
| ☆☆☆☆☆ | 災害級 | CATASTROPHIC | Kaiju-class; evacuate |

Yokai trend high (☆☆☆☆–☆☆☆☆☆); most Beasts sit ☆☆☆–☆☆☆☆. Threat per creature is stored
in [../catalog/creatures.json](../catalog/creatures.json).

---

## 4. Archive Registration Seal

The "this document was processed" mark. Composition:

```
   ┌───────────────────────┐
   │  特殊生物調査局         │   ← bureau
   │  ┌─────────────────┐   │
   │  │  JP-Y001        │   │   ← creature ID
   │  │  受理 · FILED   │   │   ← "accepted"
   │  └─────────────────┘   │
   │  昭和49年   No. ____    │   ← date + serial
   └───────────────────────┘
```

The serial `No. ____` is overprinted per unit for numbered editions, reinforcing scarcity.

---

## 5. Date / Fiscal Stamp

- Default in-universe date: **昭和四十九年 (Shōwa 49 / 1974)**.
- Rectangular date-stamp style, slightly rotated, partially over the border.
- Variant stamps for "REVISED" filings can use later Shōwa years (50–64) for series lore.

---

## 6. Authenticity / Edition Seal (Collector tier)

For numbered prints, metal posters, and the collector box certificate:
- Round embossed/foil seal + hand-numbered `___ / 500`.
- Pairs with a printed **Archive Certificate** (see artbook & collector box).
- May carry a unique QR or serial that resolves to a digital "archive page" (Phase 2+).

---

## 7. Flavor / Handling Stamps (library)

Small in-universe utility stamps for packaging and margins:

| JP | EN |
|----|----|
| 取扱注意 | HANDLE WITH CARE |
| 複製禁止 | DO NOT REPRODUCE |
| 標本 | SPECIMEN |
| 観察記録 | OBSERVATION RECORD |
| 回収済 | RECOVERED |
| 封印 | SEALED |
| 検閲済 | CENSORED / REVIEWED |

---

## 8. Application Rules

- **Minimum one** stamp per artifact (the agency seal counts).
- Stamps are placed with intentional imperfection: slight rotation (±3–8°), partial overlap
  with borders, uneven ink density, occasional double-strike ghost.
- Never align a stamp perfectly to the grid — they are *pressed by hand*.
- Don't bury legibility of ID/classification under heavy distress.
- Red is the dominant stamp color; black and tea-stain are secondary.

---

## 9. Production Notes

- Build each stamp as a vector master, then generate 2–3 distressed PNG variants (different
  ink-density "presses") so repeated stamps don't look identical across products.
- Maintain a `stamps/` asset library mirroring the categories above.
- For physical premium products, real **letterpress / foil deboss** of the agency seal is the
  target finish on boxes and certificates.

```
stamps/
  classification_top-secret.svg
  classification_confidential.svg
  threat_badge_4.svg
  registration_seal.svg
  seal_agency_red.svg
  date_showa49.svg
  authenticity_edition.svg
  handling_specimen.svg
```
