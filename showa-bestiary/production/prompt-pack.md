# Production — AI Image Prompt Pack

This pack turns the brand spec into ready-to-use generation prompts so you can produce the
actual **archive-page artwork** for every creature, in any capable image model (Midjourney,
Flux, SDXL, DALL·E, Ideogram, Firefly, etc.). Every prompt encodes the SHOWA BESTIARY rules
from [`../brand/01-brand-guide.md`](../brand/01-brand-guide.md) so output stays on-brand.

> **Workflow tip:** generate the *portrait + texture + color* with these prompts, then add the
> precise **kanji, ID, stamps and metadata as a vector overlay** in your design tool (per the
> poster template) — image models render kanji unreliably, so never trust generated Japanese
> text. Treat AI output as the *painted plate*; the typography/archive layer is composited on top.

---

## 1. Master Style Block (prepend / reuse for every creature)

```
1970s Japanese propaganda poster, Showa-era graphic design, vintage natural-history
field-guide plate, screenprint / risograph aesthetic, heavy halftone dots, visible color
misregistration, ink bleed, screenprint grain, aged and foxed cream paper, distressed print
marks, ukiyo-e line confidence, monochromatic dominant-color palette, dramatic museum
lighting, highly detailed, poster art --ar 2:3
```

## 2. Composition Block (reuse for every creature)

```
front-facing aggressive creature portrait, direct intense eye contact, large open snarling
mouth, head-on symmetrical framing, subject fills 80-90% of frame, vintage anatomical
skeleton diagram inset in the top-right corner, three small square scientific icon panels
stacked on the left edge, large empty band across the bottom third reserved for a title,
official archive document layout
```

## 3. Negatives (where supported)

```
--no modern, photographic realism, clean vector, smooth gradients, 3d render, cute, chibi,
text artifacts, watermark, signature, frame border cropping the face, profile view, passive pose
```

> For Midjourney append `--ar 2:3 --style raw`; for SDXL/Flux put the master + composition
> blocks in the positive prompt and the negatives in the negative prompt.

---

## 4. Per-Creature Prompts

Each creature below = **Master block + Composition block + the creature line**. The dominant
color is the creature's signature hue. Add the kanji/ID/stamps as an overlay afterward.



### Collection 01 — Beasts (動物大図鑑)

**JP-B001 · 熊猫 · Panda**  — *signature color `#3A3A3A` · threat ★★☆☆☆ · rarity common*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce panda rendered in a dominant #3A3A3A color scheme on aged cream paper, embodying raw muscular power, explosive speed, sharp predatory intelligence, threat class CAUTION, habitat bamboo forest, highlands
```
Overlay afterward: kanji **熊猫** (yūmyō) cream brush, bottom third · ID `JP-B001` · classification `公開` · threat `★★☆☆☆` · attribute icons: power, speed, intellect · ≥1 archive stamp.

**JP-B002 · 虎神 · Tiger**  — *signature color `#D9772B` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce tiger rendered in a dominant #D9772B color scheme on aged cream paper, embodying raw muscular power, explosive speed, silent stealth, threat class SEVERE, habitat jungle, mountains
```
Overlay afterward: kanji **虎神** (koshin) cream brush, bottom third · ID `JP-B002` · classification `機密` · threat `★★★★☆` · attribute icons: power, speed, stealth · ≥1 archive stamp.

**JP-B003 · 狼神 · Wolf**  — *signature color `#2E3A66` · threat ★★★☆☆ · rarity uncommon*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce wolf rendered in a dominant #2E3A66 color scheme on aged cream paper, embodying raw muscular power, explosive speed, sharp predatory intelligence, threat class DANGEROUS, habitat forest, snowfield
```
Overlay afterward: kanji **狼神** (rōshin) cream brush, bottom third · ID `JP-B003` · classification `部外秘` · threat `★★★☆☆` · attribute icons: power, speed, intellect · ≥1 archive stamp.

**JP-B004 · 山王 · Gorilla**  — *signature color `#3C4042` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce gorilla rendered in a dominant #3C4042 color scheme on aged cream paper, embodying raw muscular power, sharp predatory intelligence, explosive speed, threat class SEVERE, habitat mountain forest
```
Overlay afterward: kanji **山王** (sannō) cream brush, bottom third · ID `JP-B004` · classification `機密` · threat `★★★★☆` · attribute icons: power, intellect, speed · ≥1 archive stamp.

**JP-B005 · 海神 · Orca**  — *signature color `#1F6B6B` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce orca rendered in a dominant #1F6B6B color scheme on aged cream paper, embodying raw muscular power, explosive speed, sharp predatory intelligence, threat class SEVERE, habitat open ocean
```
Overlay afterward: kanji **海神** (kaijin) cream brush, bottom third · ID `JP-B005` · classification `機密` · threat `★★★★☆` · attribute icons: power, speed, intellect · ≥1 archive stamp.

**JP-B006 · 陸神 · Rhinoceros**  — *signature color `#7A5C2E` · threat ★★★☆☆ · rarity uncommon*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce rhinoceros rendered in a dominant #7A5C2E color scheme on aged cream paper, embodying raw muscular power, explosive speed, silent stealth, threat class DANGEROUS, habitat savanna, plains
```
Overlay afterward: kanji **陸神** (rikujin) cream brush, bottom third · ID `JP-B006` · classification `部外秘` · threat `★★★☆☆` · attribute icons: power, speed, stealth · ≥1 archive stamp.

**JP-B007 · 蛇神 · King Cobra**  — *signature color `#1E6B4F` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce king cobra rendered in a dominant #1E6B4F color scheme on aged cream paper, embodying lethal venom, explosive speed, silent stealth, threat class SEVERE, habitat jungle, riverbank
```
Overlay afterward: kanji **蛇神** (jashin) cream brush, bottom third · ID `JP-B007` · classification `機密` · threat `★★★★☆` · attribute icons: venom, speed, stealth · ≥1 archive stamp.

**JP-B008 · 雪豹 · Snow Leopard**  — *signature color `#6E7B85` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce snow leopard rendered in a dominant #6E7B85 color scheme on aged cream paper, embodying silent stealth, explosive speed, raw muscular power, threat class SEVERE, habitat alpine, snow peaks
```
Overlay afterward: kanji **雪豹** (yukihyō) cream brush, bottom third · ID `JP-B008` · classification `機密` · threat `★★★★☆` · attribute icons: stealth, speed, power · ≥1 archive stamp.

**JP-B009 · 白熊 · Polar Bear**  — *signature color `#5B7C8C` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce polar bear rendered in a dominant #5B7C8C color scheme on aged cream paper, embodying raw muscular power, silent stealth, explosive speed, threat class SEVERE, habitat ice field, arctic
```
Overlay afterward: kanji **白熊** (shirokuma) cream brush, bottom third · ID `JP-B009` · classification `機密` · threat `★★★★☆` · attribute icons: power, stealth, speed · ≥1 archive stamp.

**JP-B010 · 天空王 · Eagle**  — *signature color `#B6862C` · threat ★★★☆☆ · rarity uncommon*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce eagle rendered in a dominant #B6862C color scheme on aged cream paper, embodying mastery of flight, explosive speed, raw muscular power, threat class DANGEROUS, habitat mountains, cliffs
```
Overlay afterward: kanji **天空王** (tenkūō) cream brush, bottom third · ID `JP-B010` · classification `部外秘` · threat `★★★☆☆` · attribute icons: flight, speed, power · ≥1 archive stamp.


### Collection 02 — Spirits of Japan (日本の神獣図鑑)

**JP-S001 · 狐王 · Kitsune**  — *signature color `#9E2B25` · threat ★★★☆☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce kitsune rendered in a dominant #9E2B25 color scheme on aged cream paper, embodying sharp predatory intelligence, silent stealth, ancient wisdom, threat class DANGEROUS, habitat countryside, shrines
```
Overlay afterward: kanji **狐王** (kō-ō) cream brush, bottom third · ID `JP-S001` · classification `機密` · threat `★★★☆☆` · attribute icons: intellect, stealth, wisdom · ≥1 archive stamp.

**JP-S002 · 烏王 · Karasu**  — *signature color `#1E2A33` · threat ★★★☆☆ · rarity uncommon*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce karasu rendered in a dominant #1E2A33 color scheme on aged cream paper, embodying sharp predatory intelligence, mastery of flight, silent stealth, threat class DANGEROUS, habitat cities, forest
```
Overlay afterward: kanji **烏王** (u-ō) cream brush, bottom third · ID `JP-S002` · classification `部外秘` · threat `★★★☆☆` · attribute icons: intellect, flight, stealth · ≥1 archive stamp.

**JP-S003 · 狸神 · Tanuki**  — *signature color `#6B4A2E` · threat ★★☆☆☆ · rarity common*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce tanuki rendered in a dominant #6B4A2E color scheme on aged cream paper, embodying sharp predatory intelligence, silent stealth, ancient wisdom, threat class CAUTION, habitat hills, woods
```
Overlay afterward: kanji **狸神** (rishin) cream brush, bottom third · ID `JP-S003` · classification `公開` · threat `★★☆☆☆` · attribute icons: intellect, stealth, wisdom · ≥1 archive stamp.

**JP-S004 · 天鶴 · Crane**  — *signature color `#B23A48` · threat ★☆☆☆☆ · rarity common*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce crane rendered in a dominant #B23A48 color scheme on aged cream paper, embodying mastery of flight, ancient wisdom, explosive speed, threat class HARMLESS, habitat wetlands, rivers
```
Overlay afterward: kanji **天鶴** (tenkaku) cream brush, bottom third · ID `JP-S004` · classification `公開` · threat `★☆☆☆☆` · attribute icons: flight, wisdom, speed · ≥1 archive stamp.

**JP-S005 · 神鹿 · Sacred Deer**  — *signature color `#4E6B3A` · threat ★★☆☆☆ · rarity uncommon*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce sacred deer rendered in a dominant #4E6B3A color scheme on aged cream paper, embodying ancient wisdom, explosive speed, silent stealth, threat class CAUTION, habitat sacred groves, forest
```
Overlay afterward: kanji **神鹿** (shinroku) cream brush, bottom third · ID `JP-S005` · classification `部外秘` · threat `★★☆☆☆` · attribute icons: wisdom, speed, stealth · ≥1 archive stamp.

**JP-S006 · 山王 · Japanese Macaque**  — *signature color `#A8552E` · threat ★★☆☆☆ · rarity common*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce japanese macaque rendered in a dominant #A8552E color scheme on aged cream paper, embodying sharp predatory intelligence, explosive speed, ancient wisdom, threat class CAUTION, habitat mountains, hot springs
```
Overlay afterward: kanji **山王** (sannō) cream brush, bottom third · ID `JP-S006` · classification `公開` · threat `★★☆☆☆` · attribute icons: intellect, speed, wisdom · ≥1 archive stamp.

**JP-S007 · 夜王 · Owl**  — *signature color `#4B3A66` · threat ★★★☆☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce owl rendered in a dominant #4B3A66 color scheme on aged cream paper, embodying silent stealth, ancient wisdom, mastery of flight, threat class DANGEROUS, habitat deep forest, night
```
Overlay afterward: kanji **夜王** (ya-ō) cream brush, bottom third · ID `JP-S007` · classification `機密` · threat `★★★☆☆` · attribute icons: stealth, wisdom, flight · ≥1 archive stamp.

**JP-S008 · 山神 · Mountain Bear**  — *signature color `#5A3A28` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce mountain bear rendered in a dominant #5A3A28 color scheme on aged cream paper, embodying raw muscular power, sharp predatory intelligence, silent stealth, threat class SEVERE, habitat deep mountains
```
Overlay afterward: kanji **山神** (yamagami) cream brush, bottom third · ID `JP-S008` · classification `機密` · threat `★★★★☆` · attribute icons: power, intellect, stealth · ≥1 archive stamp.

**JP-S009 · 狼神 · Japanese Wolf**  — *signature color `#3A4A55` · threat ★★★★☆ · rarity legendary*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce japanese wolf rendered in a dominant #3A4A55 color scheme on aged cream paper, embodying explosive speed, sharp predatory intelligence, silent stealth, threat class SEVERE, habitat mountain forest (extinct?)
```
Overlay afterward: kanji **狼神** (rōshin) cream brush, bottom third · ID `JP-S009` · classification `機密` · threat `★★★★☆` · attribute icons: speed, intellect, stealth · ≥1 archive stamp.

**JP-S010 · 龍鯉 · Dragon Koi**  — *signature color `#C0392B` · threat ★★★☆☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce dragon koi rendered in a dominant #C0392B color scheme on aged cream paper, embodying ancient wisdom, raw muscular power, explosive speed, threat class DANGEROUS, habitat waterfalls, rivers
```
Overlay afterward: kanji **龍鯉** (ryūri) cream brush, bottom third · ID `JP-S010` · classification `機密` · threat `★★★☆☆` · attribute icons: wisdom, power, speed · ≥1 archive stamp.


### Collection 03 — Yokai (妖怪大図鑑)

**JP-Y001 · 九尾狐 · Kyūbi no Kitsune**  — *signature color `#B8472A` · threat ★★★★★ · rarity legendary*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce kyūbi no kitsune rendered in a dominant #B8472A color scheme on aged cream paper, embodying supernatural fire, sharp predatory intelligence, ancient wisdom, threat class CATASTROPHIC, habitat mountains, shrines
```
Overlay afterward: kanji **九尾狐** (kyūbi-gitsune) cream brush, bottom third · ID `JP-Y001` · classification `極秘` · threat `★★★★★` · attribute icons: fire, intellect, wisdom · ≥1 archive stamp.

**JP-Y002 · 天狗 · Tengu**  — *signature color `#B0392B` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce tengu rendered in a dominant #B0392B color scheme on aged cream paper, embodying mastery of flight, sharp predatory intelligence, raw muscular power, threat class SEVERE, habitat high mountains, old shrines
```
Overlay afterward: kanji **天狗** (tengu) cream brush, bottom third · ID `JP-Y002` · classification `極秘` · threat `★★★★☆` · attribute icons: flight, intellect, power · ≥1 archive stamp.

**JP-Y003 · 鬼神 · Oni**  — *signature color `#A82B22` · threat ★★★★★ · rarity legendary*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce oni rendered in a dominant #A82B22 color scheme on aged cream paper, embodying raw muscular power, supernatural fire, sharp predatory intelligence, threat class CATASTROPHIC, habitat hells, mountains
```
Overlay afterward: kanji **鬼神** (kishin) cream brush, bottom third · ID `JP-Y003` · classification `極秘` · threat `★★★★★` · attribute icons: power, fire, intellect · ≥1 archive stamp.

**JP-Y004 · 河童 · Kappa**  — *signature color `#3E7A55` · threat ★★★☆☆ · rarity uncommon*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce kappa rendered in a dominant #3E7A55 color scheme on aged cream paper, embodying silent stealth, sharp predatory intelligence, explosive speed, threat class DANGEROUS, habitat rivers, marshes
```
Overlay afterward: kanji **河童** (kappa) cream brush, bottom third · ID `JP-Y004` · classification `機密` · threat `★★★☆☆` · attribute icons: stealth, intellect, speed · ≥1 archive stamp.

**JP-Y005 · 大蛇 · Orochi**  — *signature color `#2E6B4A` · threat ★★★★★ · rarity legendary*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce orochi rendered in a dominant #2E6B4A color scheme on aged cream paper, embodying raw muscular power, lethal venom, supernatural fire, threat class CATASTROPHIC, habitat valleys, great rivers
```
Overlay afterward: kanji **大蛇** (orochi) cream brush, bottom third · ID `JP-Y005` · classification `極秘` · threat `★★★★★` · attribute icons: power, venom, fire · ≥1 archive stamp.

**JP-Y006 · 鵺 · Nue**  — *signature color `#5A3A4A` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce nue rendered in a dominant #5A3A4A color scheme on aged cream paper, embodying silent stealth, sharp predatory intelligence, mastery of flight, threat class SEVERE, habitat night sky, palaces
```
Overlay afterward: kanji **鵺** (nue) cream brush, bottom third · ID `JP-Y006` · classification `極秘` · threat `★★★★☆` · attribute icons: stealth, intellect, flight · ≥1 archive stamp.

**JP-Y007 · 鎌鼬 · Kamaitachi**  — *signature color `#6B5A2E` · threat ★★★☆☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce kamaitachi rendered in a dominant #6B5A2E color scheme on aged cream paper, embodying explosive speed, silent stealth, raw muscular power, threat class DANGEROUS, habitat whirlwinds, passes
```
Overlay afterward: kanji **鎌鼬** (kamaitachi) cream brush, bottom third · ID `JP-Y007` · classification `機密` · threat `★★★☆☆` · attribute icons: speed, stealth, power · ≥1 archive stamp.

**JP-Y008 · 烏天狗 · Karasu Tengu**  — *signature color `#2A2E38` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce karasu tengu rendered in a dominant #2A2E38 color scheme on aged cream paper, embodying mastery of flight, explosive speed, sharp predatory intelligence, threat class SEVERE, habitat deep mountains, ancient cedars
```
Overlay afterward: kanji **烏天狗** (karasu-tengu) cream brush, bottom third · ID `JP-Y008` · classification `極秘` · threat `★★★★☆` · attribute icons: flight, speed, intellect · ≥1 archive stamp.

**JP-Y009 · 猫又 · Nekomata**  — *signature color `#7A2E3A` · threat ★★★★☆ · rarity rare*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce nekomata rendered in a dominant #7A2E3A color scheme on aged cream paper, embodying silent stealth, sharp predatory intelligence, supernatural fire, threat class SEVERE, habitat old houses, mountains
```
Overlay afterward: kanji **猫又** (nekomata) cream brush, bottom third · ID `JP-Y009` · classification `機密` · threat `★★★★☆` · attribute icons: stealth, intellect, fire · ≥1 archive stamp.

**JP-Y010 · 白蛇神 · White Serpent**  — *signature color `#C9C2B0` · threat ★★★★☆ · rarity legendary*
```
[MASTER STYLE BLOCK] + [COMPOSITION BLOCK] +
a fierce white serpent rendered in a dominant #C9C2B0 color scheme on aged cream paper, embodying ancient wisdom, lethal venom, sharp predatory intelligence, threat class SEVERE, habitat sacred sites, waters
```
Overlay afterward: kanji **白蛇神** (hakujashin) cream brush, bottom third · ID `JP-Y010` · classification `極秘` · threat `★★★★☆` · attribute icons: wisdom, venom, intellect · ≥1 archive stamp.


---

## 5. Consistency Checklist (per generated plate)

- [ ] Front-facing, aggressive, open mouth, 80–90% of frame
- [ ] Single dominant signature color over aged cream
- [ ] Halftone + misregistration + grain + paper aging visible
- [ ] Space left top-right for skeleton diagram and left edge for 3 icons
- [ ] Bottom third clear for the kanji title overlay
- [ ] Generated Japanese text ignored — kanji added as vetted vector overlay
- [ ] Final composite matches `../templates/poster-wireframe.txt`
