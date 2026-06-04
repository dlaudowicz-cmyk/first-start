# 07 — Artbook Structure

**Title:** THE GREAT JAPANESE BESTIARY
**Subtitle:** Recovered Archives of the Special Organism Investigation Bureau · 昭和49年
**Format:** 240 × 300mm hardcover, smyth-sewn, 120–200 pages, matte litho + spot UV on seals.
**Role:** the flagship narrative artifact — it converts a poster buyer into a *fan of the
universe*, and anchors the Kickstarter and collector box.

The book is presented as **the declassified archive itself**, reassembled and annotated.

---

## 1. Page Budget (target ~176 pages)

| Section | Pages | Contents |
|---------|-------|----------|
| Front matter | 8 | Title, "declassification notice," credits, warning |
| Foreword / Lore intro | 10 | The agency's history; how the archive was found |
| Collection 01 — Beasts | 44 | 10 creatures (full profiles) + divider + plates |
| Collection 02 — Spirits | 44 | 10 creatures + divider + plates |
| Collection 03 — Yokai | 44 | 10 creatures + divider + plates |
| Field notes & ephemera | 12 | Fake documents, memos, maps, redactions |
| Appendix | 6 | Classification key, threat scale, glossary |
| Back matter | 8 | Index, edition seal, colophon, certificate pocket |

10 creatures × 3 collections = 30 creature profiles. Each profile ≈ 4 pages.

---

## 2. The Creature Profile (4-page module)

Repeating spread template per creature:

```
SPREAD A
 Left  — full-bleed poster artwork (the archive page)
 Right — IDENTIFICATION: kanji, romaji, EN, ID, classification,
         threat, habitat, range map, attribute panels

SPREAD B
 Left  — skeleton/anatomy plate (enlarged), annotated
 Right — FIELD NOTES: lore, sightings log, agency commentary,
         "specimen" photos/sketches, redacted lines
```

Every profile reads from the same module so 30 creatures feel catalogued, not curated.

---

## 3. Lore Bible (the spine of the universe)

The artbook is where the fiction becomes deep enough to license. Core canon to establish:

- **The Bureau:** 特殊生物調査局 (Special Organism Investigation Bureau), founded Shōwa 49
  (1974) after a series of unexplained encounters. Officially never existed.
- **The Mandate:** locate, document, classify, and contain legendary organisms — beasts,
  divine fauna (神獣), and yōkai.
- **The Method:** field agents, "specimen" recovery, anatomical study, threat assessment.
- **The Collapse:** the Bureau was dissolved/erased; agents scattered; the archive was hidden.
- **The Recovery:** "we" recovered the surviving pages — hence the products.
- **Three classes of being:** Beasts (natural apex), Spirits/神獣 (divine native fauna),
  Yokai (supernatural threats) — explaining the three collections in-world.

Keep a separate evolving `lore/` doc as the canon grows; the artbook is its first publication.

---

## 4. Fake Document / Ephemera System

Interstitial pages that sell authenticity (also reusable as stickers/prints/box inserts):

- Bureau memoranda (typewritten, stamped, redacted)
- Hand-annotated range maps of Japan
- "Recovered" photographs with caption tags
- Containment & handling protocols
- Incident reports (CATASTROPHIC-class sightings)
- Personnel ID cards & clearance forms
- Censorship/redaction bars over "sensitive" passages

---

## 5. Editions

| Edition | Spec | Tier |
|---------|------|------|
| Standard | Hardcover, 176pp | Retail |
| Archive (Numbered) | Slipcase, foil seal, numbered, certificate | Collector |
| Bureau (Deluxe) | Cloth bind, gilt edges, art prints, in collector box | Kickstarter top tier |

---

## 6. Typography & Layout Rules

- Body: humanist serif; labels/forms: monospace typewriter; titles: brush kanji.
- Bilingual headers (JP primary). Generous margins like a real reference volume.
- Consistent footer: page no., collection mark, `極秘資料`.
- Apply the brand texture system at *reduced* intensity inside the book so long-form pages
  stay readable — heavy distress only on plates and ephemera.

---

## 7. Production Notes

- Drive every profile from `creatures.json` so book data never contradicts cards/posters.
- Build a master InDesign (or equivalent) template with the 4-page module + ephemera masters.
- Spot-UV or foil only on seals/stamps to keep cost controlled.
- Back-cover certificate pocket links the book to the collector box and numbered editions.
