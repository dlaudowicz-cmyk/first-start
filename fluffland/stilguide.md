# FLUFFLAND – Produktions-Stilguide (Render-Pipeline)

> **Untergeordnet zur [Series Bible v1.0](SERIES-BIBLE.md).** Bei Widersprüchen gilt
> immer die Series Bible. Dieser Guide beschreibt nur, *wie* wir die Bilder erzeugen.

## Render-Pipeline

- **Plattform:** Higgsfield (`generate_image`)
- **Modell:** **Seedream 4.5** (`seedream_v4_5`)
- **Auflösung:** **erst 2K** (`quality: basic`) zum Iterieren → **4K final** (`quality: high`)
- **Seitenverhältnis:** `16:9` für Szenen/Key-Visuals · `1:1` für Charakter-Karten
- **Figurentreue:** immer über **Reference Elements** (`<<<element_id>>>` im Prompt) —
  damit die Figuren exakt den Original-Häkel-/Amigurumi-Kuscheltieren entsprechen.

## Figuren-Registry (NUR diese Elements verwenden)

| Figur | Element-ID |
|------|-----------|
| Crossi (+ Butter) | `4485356f-8698-439f-b078-f2acf90d74d7` |
| Zeddy | `e8ba46fb-d1b0-4149-8b38-954246b37731` |
| Risto | `d1c8c996-10f4-4ffb-8a44-9bc330273543` |
| Manny | `c2fcef57-3ea9-48bb-81a5-f0773f806056` |
| Cora | `66df984f-ce71-4b33-a7a8-56abdf6a080f` |
| Nana (+ Clip & Clap) | `62970da1-b9e0-4989-a19e-eb4e99a6482a` |
| Lunelle | `9d05e09a-7904-4878-917c-d4f01c721a82` |
| Mini-Fluffs | `d0389b51-0d44-41fd-9d4b-73fcc506b819` |

> Alle anderen Elements in der Bibliothek (Willowbrook, Cal, Jet, Gussok … ) gehören zu
> **anderen Projekten** und werden für FLUFFLAND **nie** verwendet.

## Material & Welt

- **Figuren:** gehäkelte/gestrickte Amigurumi-Plüsch-Optik (exakt wie Referenz).
- **Welt:** weiche **Wattewelt** in Pastell — Wolken, Boden, Deko aus Plüsch/Filz/Wolle/Watte.
- Keine harten Materialien (kein Metall/Glas/Beton/Maschinen).

## Farb-Direktion (Hybrid-Entscheidung)

Basis = **Bible-Palette** (cream, cloud white, peach, lavender, pastel pink, baby blue,
butter yellow; Akzente mint/soft gold/coral) — **plus FLUFFLAND-Signatur:**

- **Wasser** = Zuckerwatte-**Rosa mit Glitzer** (kein Blau)
- **Rasen/Wiese** = **rosa** Fluff-Gras
- **Baby blue & mint** nur **sparsam als Akzent**
- **Kompositions-Richtwert (optional):** ~70 % Weiß/Creme · ~30 % Rosa · ~10 % Lila/Akzent
- Himmel: Sonnenauf-/untergang oder magisches Twilight (nie Sturm/Dunkelheit)

## Canon-Reminder für Renders (aus der Series Bible)

- **Crossi:** keine Beine/Füße · Butter fast immer oben drauf
- **Butter:** kleinste Figur (#9) · keine Beine · winzige Arme
- **Risto:** Affen-**Handpuppe** · keine Beine/kein Unterkörper · Puppenbewegung
- **Nana:** **integrierter Bauch-Reißverschluss** (kein Beutel!) · Clip & Clap reisen *in ihr*
- **Mini-Fluffs:** keine Arme/Beine · rund · Vielfalt über Farbe/Frisur-Flausch/Accessoires
- **Manny:** Hawaiihemd · steht nie wie ein Mensch
- **Zeddy:** größte Figur · sichtbare Flicken
- Alle: kleine schwarze Knopfaugen eng beieinander · matt · runde Silhouette · als schwarze Silhouette erkennbar

## Wiederverwendbarer Prompt-Baustein

> *`<<<ELEMENT_ID>>>` [Name] … [Szene/Pose]. Keep the character exactly as in the
> reference: crocheted amigurumi plush, same shape, colors and texture. FLUFFLAND
> cotton-wool world in pastel tones; water = glittering pink, grass = pink fluff,
> baby-blue only as a sparing accent. Soft cinematic warm lighting, gentle bokeh,
> dreamy plush tactile mood. [16:9 scene / 1:1 character card].*

## Key-Visuals (aktueller Stand)

- **Charakter-Karten (grauer Hintergrund, 1:1):** 8 Figuren erstellt — referenztreu.
- **Szenen-Key-Visuals (16:9):** Crew + 5 Episoden erstellt.
- ⚠️ **Offen:** **Nana** muss mit korrektem **Bauch-Reißverschluss** (statt Nest/Beutel) neu gerendert werden.

> Hinweis: Bild-URLs liegen auf Higgsfield-CDN und können ablaufen. Für dauerhafte
> Ablage PNGs herunterladen und unter `fluffland/visuals/` sichern (Host-Allowlist nötig).
