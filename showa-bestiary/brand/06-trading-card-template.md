# 06 — Trading Card Template

The trading card system turns the archive into a **collectible game-adjacent product** —
"Pokémon meets Natural History." Cards are the engagement engine: cheap to enter, addictive
to complete, and the bridge to the artbook and collector box.

ASCII wireframe → [../templates/card-wireframe.txt](../templates/card-wireframe.txt)

---

## 1. Physical Spec

| Attribute | Spec |
|-----------|------|
| Size | 63 × 88 mm (standard TCG / poker size) |
| Stock | 330–350gsm, linen or smooth, matte archive finish |
| Corners | Rounded 3mm |
| Finish tiers | Matte (common) · Spot-gloss creature (uncommon) · Foil (rare) · Foil + emboss (legendary) |
| Back | Shared archive back (agency seal, ID grid, "PROPERTY OF…") |

---

## 2. Card Anatomy (front)

```
┌───────────────────────────────┐
│ JP-Y001   [極秘]   ◎ 妖怪      │  ← ID · classification · collection mark
│ ┌───────────────────────────┐ │
│ │      CREATURE PORTRAIT     │ │  ← front-facing, signature color
│ │      (same art language    │ │
│ │       as posters)          │ │
│ │                       骨格 │ │  ← mini skeleton inset (corner)
│ └───────────────────────────┘ │
│   九 尾 狐                      │  ← kanji title (cream brush)
│   KYŪBI NO KITSUNE             │  ← romaji + common name
│ ┌────┬────┬────┐  THREAT ★★★★★ │
│ │力 4│速 5│知 5│  CLASS  極秘  │  ← 3 attributes + threat + class
│ └────┴────┴────┘               │
│ HABITAT 山地・神社             │  ← habitat
│ "field note flavor text…"      │  ← 1-line lore
│ No. ___/500    昭和49年 ◎      │  ← serial + date + seal
└───────────────────────────────┘
```

Card art is the **same illustration** used on the poster, recomposed for portrait card
ratio — one artwork, many products.

---

## 3. Data Fields (every card)

Pulled directly from [../catalog/creatures.json](../catalog/creatures.json):

| Field | Example |
|-------|---------|
| `id` | JP-Y001 |
| `collection` | 03 — Yokai |
| `kanji` | 九尾狐 |
| `reading` / `name_en` | Kyūbi no Kitsune / Nine-Tailed Fox |
| `classification` | 極秘 / TOP SECRET |
| `threat` | ★★★★★ (CATASTROPHIC) |
| `attributes` | {power, speed, intellect, …} 0–5 |
| `habitat` | 山地・神社 |
| `color` | #B8472A |
| `flavor` | one-line field note |
| `rarity` | legendary |

---

## 4. Attribute Icon Set

Three attributes shown per card (chosen per creature from this set). Same icons used on the
left rail of posters.

| Icon | JP | EN |
|------|----|----|
| 力 | 力 | STRENGTH |
| 速 | 速 | SPEED |
| 知 | 知 | INTELLIGENCE |
| 毒 | 毒 | VENOM |
| 隠 | 隠 | STEALTH |
| 火 | 火 | FIRE |
| 智 | 智 | WISDOM |
| 翔 | 翔 | FLIGHT |

Values are 0–5, shown as filled bars/pips. The 3 most characteristic attributes per creature
are listed in `creatures.json`.

---

## 5. Rarity & Classification Tiers

Rarity maps to the classification stamp + finish — it's both lore and collectibility:

| Rarity | Classification | Finish | Approx. pull rate |
|--------|---------------|--------|-------------------|
| Common | 公開 / OPEN | Matte | ~60% |
| Uncommon | 部外秘 / RESTRICTED | Spot-gloss creature | ~25% |
| Rare | 機密 / CONFIDENTIAL | Holo-foil | ~12% |
| Legendary | 極秘 / TOP SECRET | Foil + emboss, serial-numbered | ~3% |

Yokai skew rare/legendary; Beasts/Spirits fill common/uncommon with a few chase cards.

---

## 6. Pack & Set Structure

- **Booster pack:** 5 cards — 3 common, 1 uncommon, 1 rare/legendary slot. Foil-sealed,
  "evidence envelope" styling.
- **Collection box (per collection):** 10-card complete set + 1 guaranteed foil variant.
- **Master set:** all 30 launch cards + chase variants.
- **Promo / chase:** "Damaged Archive," "Redacted," and alt-art variants drive completion.

---

## 7. Card Back (shared)

```
┌───────────────────────────────┐
│   ◎  特殊生物調査局            │
│      SPECIAL ORGANISM          │
│      INVESTIGATION BUREAU      │
│   ┌───────────────────────┐    │
│   │  SHOWA BESTIARY 図鑑   │    │
│   │  pattern of monogram   │    │
│   └───────────────────────┘    │
│   極秘資料 · 昭和49年 · 1974   │
└───────────────────────────────┘
```

One shared back keeps the set unified and disguises card identity for pack/blind sales.

---

## 8. Future: Game Layer (Phase 4–5 optional)

The attributes + threat already imply a light battle/top-trumps game. Keep stats balanced
enough that a simple "compare-attribute" or deck game could be layered later without
re-statting. Don't build the game now — but don't paint into a corner.

---

## 9. Production Checklist (per card)

- [ ] 63×88mm, 3mm radius, bleed/safe verified
- [ ] Portrait recomposed from poster art, signature color
- [ ] Mini skeleton inset
- [ ] Kanji + romaji + EN name (QA'd)
- [ ] 3 attributes + values, threat, classification
- [ ] Habitat + 1-line flavor
- [ ] Rarity-correct finish + serial if legendary
- [ ] Shared archive back
- [ ] Data matches `creatures.json`
