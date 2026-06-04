# 02 — Logo System

The logo system encodes the fiction: this is the visual identity of a *defunct government
agency*, not a lifestyle brand. It must scale from a debossed artbook spine to a 15mm sticker.

---

## 1. Logo Architecture

```
                 PRIMARY WORDMARK
            ┌──────────────────────┐
            │   SHOWA BESTIARY      │   ← Latin wordmark
            │   昭和  妖獣  図鑑      │   ← Japanese lockup
            └──────────────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
   AGENCY SEAL   COLLECTION      MONOGRAM
   (round mark)   MARKS (×3)     (single glyph)
```

There are **four** assets:
1. **Primary wordmark** — `SHOWA BESTIARY` + Japanese lockup.
2. **Agency seal** — circular "official agency" emblem (the brand's avatar/icon).
3. **Collection marks** — one per collection (Beasts / Spirits / Yokai).
4. **Monogram** — a single 朱 / 図 glyph for tiny applications and embossing.

---

## 2. Primary Wordmark

- **Latin line:** `SHOWA BESTIARY` set in a heavy condensed grotesque, all caps, tight
  tracking, slight ink-bleed weight gain. Optional ™.
- **Japanese line:** `昭和 妖獣 図鑑` (Shōwa Yōjū Zukan — "Shōwa Beast Compendium"),
  hand-brush styled, smaller, centered under the Latin line.
- **Tagline (optional):** `THE GREAT JAPANESE BESTIARY` in small monospace caps.

**Lockups**
- *Stacked* (default): Latin over Japanese over tagline.
- *Horizontal*: Latin + seal to the left, for web headers and store banner.
- *Compact*: Latin line only, for narrow spaces.

**Clear space:** minimum = cap-height of the "S" on all sides.
**Min size:** Latin wordmark legible to 24px height / 18mm print.

---

## 3. Agency Seal (icon / avatar)

A circular emblem reading as an official government stamp — this is the **app icon,
social avatar, favicon, and wax-seal motif.**

Construction:
- Double concentric ring (outer thin, inner heavy).
- **Top arc text:** `特殊生物調査局` (Special Organism Investigation Bureau).
- **Bottom arc text:** `EST. 昭和49 · 1974`.
- **Center glyph:** a single bold kanji `図` (zu — "diagram/map/record") or the 朱-red
  bracket-orchid mark seen on the masthead.
- **Defect:** intentionally imperfect ink, one broken ring segment.

Colorways: Hanko Red on cream (primary), Sumi Black on cream, cream knockout on dark.

---

## 4. Collection Marks

Each collection has a small circular sub-seal, used on cards, spines, and category headers.

| Collection | Mark glyph | Meaning | Default color |
|------------|-----------|---------|---------------|
| 01 BEASTS — 動物大図鑑 | 獣 | beast | Sumi Black |
| 02 SPIRITS — 日本の神獣図鑑 | 神 | deity/spirit | Indigo |
| 03 YOKAI — 妖怪大図鑑 | 妖 | apparition | Hanko Red |

Each sits inside the same ring system as the agency seal for family consistency, with the
collection's full kanji title arced around it.

---

## 5. Monogram

A single glyph mark for embossing, foil, wax seals, sticker centers, and as a repeating
pattern tile. Default glyph: **図**. Must work in 1-color at 8mm.

---

## 6. Clearance, Sizing, Spacing Summary

| Asset | Min print | Min digital | Clear space |
|-------|-----------|-------------|-------------|
| Primary wordmark | 18mm wide | 120px | 1× cap height |
| Agency seal | 12mm | 48px | 0.25× diameter |
| Collection mark | 8mm | 32px | 0.25× diameter |
| Monogram | 8mm | 24px | 0.5× glyph |

---

## 7. Color & Surface Rules

- Primary surface is **Archive Cream**; logos render in Sumi Black or Hanko Red.
- On dark/photographic grounds, use cream knockout.
- **Foil / specialty (collector tier):** copper or antique-gold foil seal on box and artbook.
- Never place the wordmark on a busy area of a poster — it lives in margins, spines, backs, and packaging, *not* over the creature art (the creature art uses kanji titles instead).

---

## 8. Misuse (Don't)

- ❌ Recolor into the creature's signature hue (logos stay in brand neutrals).
- ❌ Stretch, skew, or rotate the seal.
- ❌ Over-distress to illegibility — defect is subtle.
- ❌ Use the wordmark where a kanji creature title belongs.
- ❌ Recreate the seal text in a different font — it's a fixed lockup.

---

## 9. File Naming Convention (when assets are produced)

```
logo_wordmark_stacked_cream.svg
logo_wordmark_horizontal_black.svg
seal_agency_red.svg
mark_collection01_beasts.svg
mark_collection02_spirits.svg
mark_collection03_yokai.svg
monogram_zu.svg
```

Deliver every logo as layered SVG (vector) **and** a pre-distressed PNG at 300dpi for
print mockups.
