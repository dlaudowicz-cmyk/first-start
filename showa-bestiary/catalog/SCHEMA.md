# Catalog Schema — `creatures.json`

`creatures.json` is the **single source of truth** for the entire SHOWA BESTIARY universe.
Every product — posters, trading cards, artbook pages, and store listings — should read
from this file so IDs, kanji, attributes, and threat levels never contradict each other.

---

## Top-level structure

```jsonc
{
  "meta":        { ...brand + scales + enums },
  "collections": [ { collection objects } ],
  "creatures":   [ { creature objects } ]
}
```

## `meta`

| Field | Description |
|-------|-------------|
| `brand`, `title`, `bureau`, `archive_year` | Brand constants used in copy/stamps |
| `threat_scale` | Ordered 0-indexed list; a creature's `threat` (1–5) maps to `threat_scale[threat-1]` |
| `classification_levels` | Allowed values for `classification` |
| `attribute_keys` | The full attribute vocabulary (a creature uses any 3) |

## `collections[]`

| Field | Description |
|-------|-------------|
| `id` | "01" / "02" / "03" |
| `name_en`, `name_jp` | Display names |
| `title_jp`, `title_en` | Masthead titles (e.g. 動物大図鑑 / The Great Bestiary of Earth) |
| `mark_glyph` | Single kanji for the collection seal (獣 / 神 / 妖) |

## `creatures[]`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Catalog ID, `JP-<C><NNN>` (C = B/S/Y). Immutable once published. |
| `collection` | string | FK to `collections[].id` |
| `name_en` | string | Common English name |
| `kanji` | string | Brush-title kanji (see kanji style guide) |
| `reading` | string | Romaji reading of the kanji |
| `classification` | string | One of `meta.classification_levels` (also drives card rarity finish) |
| `threat` | int 1–5 | Index into `threat_scale`; rendered as ★ pips |
| `rarity` | string | common \| uncommon \| rare \| legendary (card pull tier) |
| `color` | string | Signature dominant HEX (one per creature) |
| `habitat` | string | Bilingual habitat string |
| `attributes` | object | Exactly 3 keys from `attribute_keys`, each 0–5 |
| `flavor` | string | One-line field-note used on cards/PDP |
| `notes` | string? | Optional production/canon notes (e.g. duplicate kanji) |

---

## Derived mappings

| Output | Source |
|--------|--------|
| Card rarity finish | `rarity` → matte / spot-gloss / foil / foil+emboss |
| Classification stamp | `classification` |
| Threat badge ★ | `threat` |
| Poster left-rail icons | the 3 keys in `attributes` |
| Signature poster color | `color` |
| SKU root | `SHB-<id>-<product>-<variant>` |

---

## Editing rules

1. **IDs are immutable** once a creature ships. Add new creatures with new IDs; never renumber.
2. Each creature must have **exactly 3** attributes drawn from `attribute_keys`.
3. `color` is unique-enough to read as that creature's signature hue.
4. New collections append (04, 05, …); update `mark_glyph` + masthead titles.
5. Validate after every edit:
   ```bash
   python3 -c "import json;json.load(open('showa-bestiary/catalog/creatures.json'));print('valid')"
   ```
6. Canon duplicates (e.g. 山王 for Gorilla & Macaque, 狼神 for Wolf & Japanese Wolf) are
   intentional and disambiguated by `id`; see `notes` and the kanji style guide.
