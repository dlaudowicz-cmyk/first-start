# 04 — Kanji Style Guide

The oversized cream brush-kanji title is the **signature graphic element** of SHOWA
BESTIARY. It is the first thing a viewer reads emotionally and the strongest "Japanese
archive" cue. This guide governs how kanji are chosen, drawn, placed, and verified.

---

## 1. Role of the Kanji Title

- It **replaces** the wordmark on the front of every poster/card. The brand logo lives in
  margins and packaging; the *creature's* kanji name owns the art.
- It carries the creature's identity, mood, and signature feeling.
- It must read as **hand-painted**, not typeset — confident, heavy, slightly irregular.

---

## 2. Visual Specification

| Attribute | Spec |
|-----------|------|
| Color | **Archive Cream** `#E8DCC0` (knockout against the dark portrait) |
| Style | Hand-painted brush (筆文字), heavy weight, bold strokes |
| Texture | Heavy brush dry-drag, ink bleed at stroke ends, screenprint grain |
| Size | Oversized — title spans most of the poster width, in the **bottom third** |
| Placement | Bottom third, horizontally centered (or left-set for 1–2 glyph names) |
| Stroke logic | Thick-to-thin brush dynamics; visible bristle marks; intentional gaps |
| Edge | Slight ink bleed/halo; never a clean vector edge |

A small **romaji / common name** sits directly beneath the kanji in condensed caps, and the
metadata strip sits below that.

---

## 3. The Naming System

Each creature has a kanji "code-name" — often **not** the literal dictionary word, but a
more evocative, propaganda-flavored title (e.g. Wolf → 狼神 *"Wolf God"*, not just 狼).
This is deliberate: it makes the names feel like classifications coined by the agency.

### Master name list (with readings + meaning)

**Collection 01 — BEASTS**

| ID | Creature | Kanji | Reading | Literal meaning |
|----|----------|-------|---------|-----------------|
| JP-B001 | Panda | 熊猫 | yūmyō / xióngmāo | "bear-cat" (panda) |
| JP-B002 | Tiger | 虎神 | koshin | tiger god |
| JP-B003 | Wolf | 狼神 | rōshin | wolf god |
| JP-B004 | Gorilla | 山王 | sannō | mountain king |
| JP-B005 | Orca | 海神 | kaijin | sea god |
| JP-B006 | Rhinoceros | 陸神 | rikujin | land god |
| JP-B007 | King Cobra | 蛇神 | jashin | serpent god |
| JP-B008 | Snow Leopard | 雪豹 | yukihyō | snow leopard |
| JP-B009 | Polar Bear | 白熊 | shirokuma | white bear |
| JP-B010 | Eagle | 天空王 | tenkūō | sky king |

**Collection 02 — SPIRITS OF JAPAN**

| ID | Creature | Kanji | Reading | Literal meaning |
|----|----------|-------|---------|-----------------|
| JP-S001 | Kitsune | 狐王 | kō-ō | fox king |
| JP-S002 | Karasu | 烏王 | u-ō | crow king |
| JP-S003 | Tanuki | 狸神 | rishin | tanuki god |
| JP-S004 | Crane | 天鶴 | tenkaku | heaven crane |
| JP-S005 | Sacred Deer | 神鹿 | shinroku | divine deer |
| JP-S006 | Japanese Macaque | 山王 | sannō | mountain king |
| JP-S007 | Owl | 夜王 | ya-ō | night king |
| JP-S008 | Mountain Bear | 山神 | yamagami | mountain god |
| JP-S009 | Japanese Wolf | 狼神 | rōshin | wolf god |
| JP-S010 | Dragon Koi | 龍鯉 | ryūri | dragon carp |

**Collection 03 — YOKAI**

| ID | Creature | Kanji | Reading | Literal meaning |
|----|----------|-------|---------|-----------------|
| JP-Y001 | Kyūbi no Kitsune | 九尾狐 | kyūbi-gitsune | nine-tailed fox |
| JP-Y002 | Tengu | 天狗 | tengu | tengu |
| JP-Y003 | Oni | 鬼神 | kishin | demon god |
| JP-Y004 | Kappa | 河童 | kappa | river-child |
| JP-Y005 | Orochi | 大蛇 | orochi | great serpent |
| JP-Y006 | Nue | 鵺 | nue | nue |
| JP-Y007 | Kamaitachi | 鎌鼬 | kamaitachi | sickle-weasel |
| JP-Y008 | Karasu Tengu | 烏天狗 | karasu-tengu | crow tengu |
| JP-Y009 | Nekomata | 猫又 | nekomata | forked-cat |
| JP-Y010 | White Serpent | 白蛇神 | hakujashin | white serpent god |

> **Note on intentional duplicates:** 山王 (Gorilla / Macaque) and 狼神 (Wolf / Japanese
> Wolf) repeat across collections — mirroring the source masthead. This is *canon*, framed
> in-universe as the agency reusing a classification across a "foreign" and a "native"
> specimen. The unique **ID number** always disambiguates. If duplicate kanji are undesired
> for product SKUs, the secondary entry can be retitled (e.g. Macaque → 嶺王 *reiō* "peak
> king"); decide once and lock it in `creatures.json`.

---

## 4. Layout Rules by Glyph Count

| Glyphs | Treatment |
|--------|-----------|
| 1 (鵺) | Single massive glyph, centered, can exceed bottom third for drama |
| 2 (虎神) | Balanced pair, centered, largest common case |
| 3 (天空王) | Even tracking, slightly reduced size to fit width |
| 4 (九尾狐 is 3; 烏天狗 is 3) | Tighten tracking; never shrink below readable weight |

Vertical (tategaki) titles are an allowed alternate layout for tall card formats — top-to-
bottom, right column.

---

## 5. Reproduction & QA Rules

- **Never** auto-generate kanji from a system font and call it final — they must be brush-
  drawn or brush-styled to spec.
- **Verify glyph correctness** with a native/fluent reviewer before any print run. Wrong or
  malformed kanji breaks the entire authenticity premise.
- Keep stroke order and proportion correct even while stylizing — distortion is in texture
  and weight, not in dropping or mangling strokes.
- Maintain a master `kanji/` library: one clean vector per creature + textured raster.
- Romaji uses the creature's reading (above); common English name in smaller caps.

```
kanji/
  JP-B002_koshin_虎神.svg
  JP-S001_koo_狐王.svg
  JP-Y006_nue_鵺.svg
  ...
```

---

## 6. Extending the System (future creatures)

When adding creatures beyond the launch 30:
1. Pick an **evocative** kanji code-name (god/king/spirit suffixes: 神 / 王 / 鬼 work well).
2. Confirm reading + meaning, check it isn't an unintended duplicate.
3. Add to `creatures.json` with reading and literal meaning.
4. Commission the brush glyph; QA with a fluent reviewer.
5. Lock it — names are canon once published.
