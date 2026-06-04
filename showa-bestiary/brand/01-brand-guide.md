# 01 — Visual Brand Guide

The master design bible for SHOWA BESTIARY. Every poster, card, sticker, page, and
storefront pulls from this document. If a decision isn't covered here, ask: *"Would this
look like it was printed by a secret government press in 1974?"*

---

## 1. Brand Essence

| Pillar | Definition |
|--------|------------|
| **Archive** | Everything is a recovered classified document. Numbered, stamped, catalogued. |
| **Aggression** | Creatures confront the viewer. Direct eye contact, open mouths, no passivity. |
| **Reverence** | These beings are dangerous *and* sacred. Treated with the gravity of a museum. |
| **Decay** | The paper is 50 years old. Aging, ink bleed, and misregistration are features, not flaws. |
| **Propaganda** | Bold, declarative, monumental — the visual language of 1970s Japanese state print. |

**One-line essence:** *Scientific record + propaganda artwork + museum document + monster trading card.*

---

## 2. Creative DNA / Reference Stack

- 1970s Japanese propaganda & public-information posters
- Shōwa-era graphic design and signage
- Kaiju / tokusatsu culture (Godzilla, Daikaijū)
- Natural history encyclopedias & Victorian field guides
- Vintage scientific anatomical plates
- Japanese street art & screenprint culture
- Ukiyo-e (composition, line confidence, flat dramatic color)

The *fusion* is the brand. No single reference should dominate a piece.

---

## 3. Composition Law (applies to every poster)

```
┌─────────────────────────────────────────────┐
│  CLASSIFICATION BAR  ·  ID NUMBER  ·  STAMP   │  ← top margin
│ ┌────┐                              ┌───────┐ │
│ │ICON│      MAIN SUBJECT            │ SKELE │ │
│ ├────┤   front-facing creature      │ TON   │ │
│ │ICON│   aggressive, eye contact    │ DIAGRAM│ │
│ ├────┤   open mouth, 80–90% frame   └───────┘ │
│ │ICON│                                        │
│ └────┘                                        │
│                                               │
│            大 KANJI TITLE 大                   │  ← bottom third
│            romaji · common name                │
│  ID · CLASSIFICATION · THREAT · HABITAT        │
└─────────────────────────────────────────────┘
```

**Mandatory elements on every poster:**
1. Front-facing creature portrait, aggressive, direct eye contact, large open mouth, dominating 80–90% of the composition.
2. Anatomical skeleton diagram, top-right, vintage scientific-illustration style.
3. Three stacked icon panels on the left (attributes).
4. Large hand-painted kanji title in the bottom third, cream-colored, heavy brush texture, oversized.
5. Archive metadata strip (ID, classification, threat, habitat).
6. At least one archive stamp.

Full spec → [05-poster-template-system.md](05-poster-template-system.md).

---

## 4. Color Philosophy

**One dominant color per creature.** The portrait is built on a near-monochrome ground in
that creature's signature hue, against the shared aged-paper base.

### Shared base palette (every poster)

| Role | Name | HEX | Use |
|------|------|-----|-----|
| Paper base | Archive Cream | `#E8DCC0` | Aged paper ground, kanji fill |
| Deep ink | Sumi Black | `#1A1714` | Linework, deep shadow, borders |
| Warning red | Hanko Red | `#C0392B` | Stamps, classification, threat accents |
| Aged shadow | Tea Stain | `#8A6F4E` | Foxing, edge darkening, grime |
| Highlight | Bone | `#F2EAD6` | Skeleton diagram, top highlights |

### Signature creature colors

| Creature | Color | HEX |
|----------|-------|-----|
| Tiger | Orange | `#D9772B` |
| Wolf | Indigo | `#2E3A66` |
| Kitsune | Crimson | `#9E2B25` |
| Karasu | Black/Blue | `#1E2A33` |
| Orca | Teal | `#1F6B6B` |
| King Cobra | Emerald | `#1E6B4F` |
| Owl (Eule) | Purple | `#4B3A66` |
| Panda | Charcoal/Cream | `#3A3A3A` |
| Gorilla | Gunmetal | `#3C4042` |
| Rhinoceros | Earth Ochre | `#7A5C2E` |
| Snow Leopard | Pale Slate | `#6E7B85` |
| Polar Bear | Ice Blue | `#5B7C8C` |
| Eagle | Sky Gold | `#B6862C` |

Per-creature colors for all 30 are stored in [../catalog/creatures.json](../catalog/creatures.json).

**Rule:** a poster uses its signature color + the shared base palette only. No rainbow.
Misregistration (see §6) may expose a second offset channel, but the piece reads as monochrome.

---

## 5. Typography System

| Use | Typeface direction | Notes |
|-----|-------------------|-------|
| Kanji title | Hand-painted brush, custom | Cream, heavy texture, oversized. See [04-kanji-style-guide.md](04-kanji-style-guide.md). |
| Romaji / common name | Condensed grotesque (e.g. Helvetica-style, heavy) | All caps, tight tracking, under the kanji. |
| Metadata / field labels | Monospace or typewriter (e.g. Courier-like) | "Government form" feel. Small caps. |
| Classification banner | Bold condensed slab | High contrast, declarative. |
| Lore / artbook body | Humanist serif | Readable long-form, period-appropriate. |

Set Latin and Japanese as a deliberate pair — they must feel printed by the same press.

---

## 6. Texture & Print-Defect System (Mandatory)

Every finished artifact must carry these, layered:

1. **Screenprint grain** — coarse ink texture across flat color.
2. **Halftone dots** — visible dot pattern in midtones and shadows.
3. **Color misregistration** — the dominant color channel offset 1–3px from the key (black) plate.
4. **Ink bleed** — slight spread where heavy ink meets paper, especially kanji.
5. **Paper aging** — foxing spots, tea staining, uneven warmth toward edges.
6. **Distressed print marks** — scratches, roller streaks, fiber flecks, registration crop marks.

Defects should feel *authentic and restrained*, not "grunge filter." Think of a well-kept
but genuinely 50-year-old print.

---

## 7. Logos, Stamps, Kanji

These three sub-systems have their own dedicated documents:
- Logo system → [02-logo-system.md](02-logo-system.md)
- Archive stamp system → [03-archive-stamp-system.md](03-archive-stamp-system.md)
- Kanji style guide → [04-kanji-style-guide.md](04-kanji-style-guide.md)

---

## 8. Tone of Voice

- **Declarative, clinical, ominous.** Field-report cadence.
- Write as the *agency*, never as a modern brand. No emojis, no marketing fluff in-universe.
- Bilingual where it adds authenticity (JP primary, EN secondary).
- Recurring footer warning (the archive's standard caution):

> ⚠ 警告：これらの生物の一部は非常に危険です。遭遇した場合は、刺激せず、直ちにその場を離れてください。
> **WARNING: Some of these creatures are extremely dangerous. If encountered, do not provoke and leave the area immediately.**

---

## 9. Do / Don't

| Do | Don't |
|----|-------|
| One dominant color per creature | Multi-color rainbow portraits |
| Direct, aggressive, front-facing subjects | Profile or passive poses |
| Heavy aging and print defects | Clean, crisp digital finish |
| Treat every product as an archive document | Refer to it as "AI art" or "a poster" |
| Bilingual, in-universe copy | Modern marketing slang |
| Numbered, stamped, classified | Untracked one-offs |

---

## 10. Quality Bar (ship checklist)

A piece is on-brand only if **all** are true:
- [ ] Front-facing, aggressive subject at 80–90% frame
- [ ] Skeleton diagram, top-right
- [ ] 3 attribute icon panels, left
- [ ] Oversized cream brush kanji, bottom third
- [ ] Single dominant signature color + base palette
- [ ] All 6 texture/defect layers present
- [ ] ID, classification, threat, habitat metadata
- [ ] At least one archive stamp
- [ ] Logotype lockup present
- [ ] Reads as a 1974 classified document, not a modern print
