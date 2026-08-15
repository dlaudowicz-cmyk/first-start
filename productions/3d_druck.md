# 3D-Druck der Figuren — Handmuster & Pitch-Requisiten

> Stand 08/2026. **Zweck: Handmuster und Pitch-Requisiten.**
> ⚠️ Kein Merch-Vertrieb ohne Vereinbarung mit Red Sun Films — Merchandising ist
> im Term-Sheet-Entwurf ein lizenzpflichtiges Recht (§4.1).

---

## 1. Erzeugung — die Einstellungen, die zählen

**Werkzeug:** Higgsfield `generate_3d`, Modell `image_to_3d` (Meshy)
**Kosten: 20 Credits je Figur** (≈ 0,83 € Listenpreis)

| Parameter | Wert | Warum |
|---|---|---|
| `target_polycount` | **200000** | **Kostet nichts extra** (verifiziert: gleicher Preis wie 30.000) — mehr Detail im Druck |
| `topology` | `triangle` | STL ist ohnehin Dreiecksnetz; `quad` nur für Weiterbearbeitung |
| `symmetry_mode` | `auto` | erkennt Symmetrie selbst |
| `should_texture` | `false` | Für Handbemalung nicht nötig. `true` nur, wenn du eine Farbvorlage willst (kostet mehr) |
| `enable_rigging` | `false` | Für Druck sinnlos; rigged nicht-humanoide Figuren ohnehin schlecht |

**Grenze des Verfahrens:** Das Mesh gibt nur wieder, was im Quellbild steht.
Rückseiten werden geraten. Für bessere Geometrie: vorher ein Turnaround
(Front/Seite/Rücken) erzeugen und `multi_image_to_3d` nutzen.

---

## 2. Druckvorbereitung — die vier üblichen Probleme

GLB aus KI-Generierung ist **nicht druckfertig**. Vor dem Slicen prüfen
(Blender, Meshmixer, Netfabb o. ä.):

### a) Wasserdichtheit (manifold)
Löcher und offene Kanten schließen. In Blender: *3D-Print Toolbox* → „Check All",
dann „Make Manifold". Ohne das schlägt der Slicer fehl oder druckt Artefakte.

### b) ⚠️ Dünne Teile — bei diesen Figuren das Hauptrisiko
**Betroffen: Mäuseschwänze, Ohren, Schnurrhaare, Finger.**
Am Testdruck bereits sichtbar: Die Schwänze sind sehr dünn und liegen auf.

Faustregeln:
- **Resin:** min. **1,0–1,5 mm** Materialstärke an der dünnsten Stelle
- **FDM:** min. **2 mm** (feiner geht kaum zuverlässig)
- Schwänze **verdicken** oder als **separates Teil** drucken und stecken/kleben
- Bei Serienabsicht: Schwanz konstruktiv anlegen (Auflagepunkt, Bogen zum Boden)

### c) Stand & Auflage
KI-Meshes haben oft keine ebene Standfläche. Entweder Sohle plan schneiden oder
**Sockel** ergänzen — Sockel löst zusätzlich das Schwanz- und Kippproblem und
sieht bei Sammelfiguren ohnehin professioneller aus.

### d) Wandstärke & Hohlraum
Für Resin: aushöhlen (1,5–2 mm Wand) + **Entlüftungslöcher**, sonst Saugnapf-
Effekt und Materialverschwendung. Für kleine Figuren < 8 cm kann massiv
einfacher sein.

---

## 3. Verfahren & Maßstab

| | Empfehlung |
|---|---|
| **Verfahren** | **Resin (SLA/MSLA)** für Figuren dieser Detailstufe. FDM verliert Fell, Gesichter, Schnurrhaare |
| **Höhe** | 7–10 cm — genug Detail, noch handlich für den Tisch |
| **Schichthöhe** | 0,03–0,05 mm |
| **Ausrichtung** | schräg stellen (Stützen an Rückseite/Sohle, nicht im Gesicht) |

### ⚠️ Maßstabsfrage (Canon)
Im aktuellen Testdruck sind die Mäuse etwa so groß wie Jet. Im Canon sind sie
winzige Feldmäuse, die **in seinen Körper gesaugt werden**.

- Für **Sammelfiguren** ist einheitliche Größe normal und verkaufslogisch.
- Für die **Pitch-Requisite** ist ein **maßstabsgetreues Set** (winzige Mäuse
  neben Jet) erzählerisch stärker — es zeigt den Kern der Geschichte auf einen Blick.

Beides ist vertretbar — aber bewusst entscheiden und benennen können.

---

## 4. Figurenstand

| Figur | Media-ID (Quelle) | 3D-Job | Status |
|---|---|---|---|
| Cal | `620065cb-…` | — | gedruckt (Testdruck) |
| Liv | `459f435b-…` | — | gedruckt (Testdruck) |
| Sammy | `1db3bdb3-…` | — | gedruckt (Testdruck) |
| Jet Bexly | `a2023bde-…` | — | gedruckt (Testdruck) |
| **Biff** | `ece56844-92ea-43a0-aa3e-cc8e1afc11f4` | `5eef3419-0b7a-468b-83bc-debdc211e1d7` | Mesh erzeugt |
| **General Nogath** | `0aa168f7-2b49-4347-991c-15d8ace4c3bd` | `4c30c715-27aa-4132-9725-17ba136ec9eb` | Mesh erzeugt |
| **Cocosia** | `c2f53d4f-4cab-4b8a-b165-98a3ea1b3c86` | `f7502913-ca74-479c-b607-f6daa7b10ced` | Mesh erzeugt |

Weitere verfügbar: Bauer Moe `bc16119d-…`, Amy `8ed83bed-…`, Rob `1d57aee4-…`,
Chok `d18c6354-…`, Gussok-Guard `18dc132d-…`.

---

## 5. Warum das strategisch zählt
Eine Figur auf dem Tisch schlägt jede Folie. Für Finanzierung, Lizenzgespräche
und Social („vom Clip zur Figur") ist der physische Beweis das stärkste
Einzelargument — und er kostet unter 1 € Rechenleistung je Figur.
