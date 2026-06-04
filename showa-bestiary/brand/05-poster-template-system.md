# 05 — Poster Template System

A reusable, grid-based template so any creature can be produced as a consistent "archive
page." Every poster is the same skeleton with swapped content — this is what makes 30 (then
100+) creatures feel like one coherent universe.

ASCII wireframe → [../templates/poster-wireframe.txt](../templates/poster-wireframe.txt)

---

## 1. Canvas & Formats

| Format | Aspect | Print size | Use |
|--------|--------|-----------|-----|
| A-Series (master) | 1:√2 | A4 / A3 / A2 | Core prints & posters |
| Square | 1:1 | 30×30 / 50×50cm | Social/limited variants |
| Card-portrait | 5:7 | 63×88mm (×scale) | Trading cards (see doc 06) |

Design the master at **A2 @ 300dpi** (4960×7016px) and scale down. Bleed 3mm, safe margin
8mm. The portrait orientation is canonical.

---

## 2. The Grid

A 12-column × 16-row modular grid. Key zones:

```
 Row 1        ── Header band (classification · ID · stamp)
 Rows 2–11    ── Main subject field (creature portrait)
   Cols 1–2     · Left icon rail (3 attribute panels)
   Cols 10–12   · Top-right skeleton diagram (rows 2–5)
 Rows 12–14   ── Kanji title band (bottom third)
 Rows 15–16   ── Metadata strip + footer warning
```

---

## 3. Zone Specifications

### Zone A — Header Band (Row 1)
- Left: **Classification stamp** (公開 / 機密 / 極秘).
- Center: collection title in small kanji (e.g. `動物大図鑑`).
- Right: **creature ID** (`JP-B002`) in monospace + small agency seal.

### Zone B — Main Subject (Rows 2–11)
- Front-facing creature, **aggressive, direct eye contact, large open mouth**.
- Occupies **80–90%** of this field; bleeds toward edges.
- Built in the creature's **single signature color** over the dark/cream ground.
- All six texture/defect layers applied here most heavily.

### Zone C — Left Icon Rail (Cols 1–2, within subject field)
- **Three** stacked square attribute panels (see doc 06 §Attributes for icon set).
- Each panel: icon glyph + tiny JP/EN label + value bar.
- Framed like specimen tags; aged, bordered.

### Zone D — Skeleton Diagram (Cols 10–12, Rows 2–5)
- **Anatomical skeleton** of the creature, vintage scientific-illustration line style.
- Bone/cream line on a boxed, labeled panel ("FIG. 1 · 骨格").
- Slightly faded, like a plate pasted into a field notebook.

### Zone E — Kanji Title Band (Rows 12–14)
- **Oversized cream brush kanji** per [04-kanji-style-guide.md](04-kanji-style-guide.md).
- Romaji + common name directly beneath, condensed caps.

### Zone F — Metadata Strip + Footer (Rows 15–16)
- Fields: `ID · CLASSIFICATION · THREAT(★) · HABITAT · COLLECTION`.
- Typewriter/monospace, small caps, government-form styling.
- **Archive registration seal** in a corner.
- House footer warning line (JP + EN) along the very bottom.

---

## 4. The Per-Creature "Recipe" (what changes)

Everything else is fixed; only these swap per creature:

1. Creature portrait artwork
2. Signature dominant color
3. Skeleton diagram
4. 3 attribute icons + values
5. Kanji title + romaji + common name
6. ID, classification, threat level, habitat
7. Collection mark/title

All of (5)(6) and attribute values come straight from
[../catalog/creatures.json](../catalog/creatures.json) — the template reads the data file so
text never drifts.

---

## 5. Texture Layer Stack (top → bottom)

```
1. Crop marks / registration marks (overlay)
2. Distress: scratches, fiber flecks
3. Halftone dot screen (midtones/shadows)
4. Color misregistration (signature channel offset 1–3px)
5. Screenprint grain
6. Type + stamps + diagram + icons
7. Creature portrait (signature color)
8. Aged-paper base (foxing, tea stain, edge darkening)
```

---

## 6. Variant System (same creature, multiple SKUs)

| Variant | Change | Tier |
|---------|--------|------|
| Standard | Base archive page | Entry (A4/A3) |
| Negative/Night | Inverted dark plate | Limited |
| Blueprint | Cyanotype-style mono | Limited |
| Foil / Numbered | Foil seal + serial | Collector |
| Damaged Archive | Heavier "recovered" distress + redaction bars | Special drop |

Variants reuse the same grid — only the texture/color treatment changes — so they remain
unmistakably the same record.

---

## 7. Production Checklist (per poster)

- [ ] Subject front-facing, aggressive, 80–90% frame
- [ ] Skeleton diagram present, top-right, labeled
- [ ] 3 attribute panels, left rail, values match `creatures.json`
- [ ] Oversized cream brush kanji, bottom third, QA'd
- [ ] Single signature color + base palette
- [ ] All 6 texture/defect layers
- [ ] Header: classification + ID + collection
- [ ] Metadata strip + footer warning
- [ ] ≥1 archive stamp + registration seal
- [ ] Exported at A4/A3/A2 + bleed/safe verified
