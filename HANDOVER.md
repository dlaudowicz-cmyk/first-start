# Being Bexly — Übergabe & Projektstand

> Stand: 08/2026 · Repo `dlaudowicz-cmyk/first-start` · Branch `claude/bexly-os-ai-9RgQb`
> **Einstiegsdokument.** Wer hier neu dazukommt (Mensch oder neue Session), liest
> zuerst diese Datei, dann `strategy/MASTERPLAN.md`.

---

## ⚠️ Aktueller Status: BEXLY PAUSIERT

**Die Produktion ruht, bis die Verträge mit Red Sun Films stehen.**

Begründung: An fremder IP wurde ohne dokumentierte Position gearbeitet. Bis zur
Unterschrift entstehen **keine neuen Bexly-Assets** — sonst verliert das Argument
„erst der Vertrag" seine Wirkung.

**Was als Nächstes ansteht:** die acht offenen Entscheidungen im Term Sheet
(§16), dann Gespräch mit Rainer, dann anwaltliche Prüfung.

---

## 1. Das Projekt in Kürze

**Being Bexly** — Animationsspielfilm für Kinder (6–11) & Familien.
Drei Feldmäuse entdecken, dass die Menschheit von schokoladensüchtigen Aliens
infiltriert wurde, und bekämpfen im Körper eines Roboterjungen die Invasion.

| | |
|---|---|
| **IP-Inhaber** | RED SUN FILMS GMBH, Grünwald — Rainer Matsutani (Idee/Konzept), Drehbuch mit Sandro Lang |
| **Technologie/Produktion** | Pushlabs — Daniel Laudowicz, Leipzig |
| **Ziel (12 Monate)** | **Filmfinanzierung** — finanzierungsreifes Paket, erste Entwicklungsförderung beantragt |
| **Ressourcen** | Daniel solo, **15 h/Woche** |

---

## 2. Die vier Kernerkenntnisse dieser Arbeitsphase

**1. Der stärkste Hebel ist das Kostenargument, nicht die Reichweite.**
Verifizierte Pipeline: figurentreue, vertonte Character-Clips zu einem Bruchteil
klassischer Kosten. Faktor **4–10 günstiger** als vergleichbare klassische
Produktion (Vollkostenvergleich, siehe `strategy/marktvergleich_animation.md`).

**2. Der Engpass ist die Arbeitszeit, nicht das Geld.**
Rechenleistung reicht für ~7,4 Min/Monat, ein Mensch schafft 2–4 Min/Monat.
→ Die Finanzierungsbitte lautet **„bezahlt ein kleines Team"**, nicht
„bezahlt die Animation".

**3. Rainer treibt die Förderung, Pushlabs liefert Material und Zahlen.**
Er kennt die Förderlandschaft; Daniel muss sie nicht lernen. Ohne diese
Arbeitsteilung ist der Plan bei 15 h/Woche nicht machbar.

**4. Zwei getrennte IPs treffen aufeinander.**
Being Bexly gehört Red Sun, die Produktionsplattform gehört Pushlabs. Geteilt
wird nur die **neu entstehende digitale Ebene**. Muss vertraglich sauber
getrennt werden — inklusive Produktname der Plattform.

---

## 3. Repository

```
strategy/                    ← Entscheidungsgrundlagen
├── MASTERPLAN.md            ★ zuerst lesen — Ziel, Phasen, Wochenrhythmus
├── kostenmodell.md          ★ verifizierte Stückkosten + BytePlus-Recherche
├── marktvergleich_animation.md   Vergleichszahlen klassischer Animation
├── term_sheet_pushlabs_redsun.md ★ aktives Verhandlungsdokument
├── kooperation_pushlabs_redsun.md  Deal-Logik, 3 Modelle, Empfehlung
├── onepager_rainer.md       Einstiegsdokument für Rainer
└── social-hub-90-days.md    Social-Strategie (⚠ für 15 h/Woche zu groß — durch MASTERPLAN ersetzt)

productions/                 ← Produktionsstandards & Material
├── CAMERA_AND_BLOCKING.md   ★ verbindliche Kamera-/Blocking-Standards
├── higgsfield_elements.md   ★ Element-IDs + verifizierte Rezepte
├── scene01_the-chase.md     fertige Shotlist (Verfolgung)
├── social_batch01.md        18 Social-Konzepte
└── 3d_druck.md              3D-Druck: Verfahren, Einstellungen, Fallstricke

bexly_os/                    ← markenbewusste KI
├── brand/brand_core.md      ★ Marken-Bibel (einzige Quelle der Wahrheit)
├── core.py, cli.py          Engine + Chat (python bexly.py)
└── modules/                 studio (CineForge), social, research

ip_studio/                   ← für eine EIGENE IP (getrennt von Bexly)
├── PLAYBOOK.md              5 Regeln, 5 Phasen, Rechte ab Tag 1
├── scaffold.py              IP anlegen, Figuren, Trefferquote, Kosten
└── templates/

tools/kostenrechner.py       Kosten je Minute, Annahmen justierbar
```

---

## 4. Verifizierte Produktionsdaten

### Stückkosten (real gemessen, Higgsfield/Seedance)
| Leistung | Credits |
|---|---|
| 10s Clip, figurentreu (720p, fast) | 35 |
| 10s nachträglich vertonen (`video_edit`) | 20 |
| Dialogzeile (TTS, eigenes Stimm-Element) | 0,7 |
| Keyframe (1k) | 2 |
| 3D-Mesh aus Bild (Meshy `image_to_3d`) | 20 |

Credit-Preis **4,167 Cent** (Listenpreis; nach außen immer damit rechnen, nie
mit dem Rabatt). → ~34 €/Min, PoC 3 Min ≈ 102 €, 90-Minüter ≈ 3.053 €.

### Verfahren, die nachweislich funktionieren
- **Figurentreue** über Reference Elements + Environment-Clean-Plate als `image_references`
- **Distinkte Bewegungssignatur je Figur** (Gewicht/Timing/Energie im Prompt)
- **Nachträgliche Vertonung ohne Bildverlust**: `seedance_2_5`, `mode: video_edit`,
  `generate_audio: true`, Job-ID als `video_references` (Pixel-Differenz ~1,5 %)
- **Blocking** (Screen Direction, 180°-Regel) sobald mehrere Clips eine Szene bilden
- **Micro-Motion-Cue** für Lebendigkeit (Fell, Schnurrhaare, Ohren, Atmung)
- **3D-Mesh:** `target_polycount: 200000` kostet nicht mehr als 30000

### Bekannte Grenzen
- Higgsfield reicht nur **480p/720p** durch; Seedance kann nativ bis 4K
- **BytePlus ModelArk** (international) für höhere Auflösung — 480p $0,09/s,
  720p $0,21/s, **1080p/4K unbepreist** → Kino-Kalkulation noch nicht abschließbar
- Bei 720p ist Higgsfield ~25 % **günstiger** als der Direktzugang
- **Musik** ist über Higgsfield nicht verfügbar → Lizenzbibliothek nötig
- 3D-Meshes sind **nicht wasserdicht** und brauchen Nachbearbeitung; Referenzbilder
  müssen **Einzelfiguren** sein (Character-Sheets erzeugen Mehrfach-Meshes)

---

## 5. Erzeugte Nachweise
- **Demo-Reel 44 s** — Verfolgung + drei Bewegungssignaturen (Cal/Liv/Sammy), mit Lower-Thirds
- **Vertonter Clip** — Sounddesign nachträglich, Bild unverändert
- **Cal-Sprachzeile** über eigenes Stimm-Element
- **3D-Druck** — vier bemalte Figuren (Cal, Liv, Sammy, Jet) als Handmuster

---

## 6. Offene Punkte

**Vertraglich (blockiert alles andere)**
- [ ] Acht Entscheidungen im Term Sheet §16 (Exklusivität, Struktur, Quoten, Recoup, Accounts, Laufzeit, Produktname)
- [ ] Gespräch mit Rainer · [ ] anwaltliche Prüfung

**Fachlich vor Förderantrag**
- [ ] Nutzungsbedingungen des Modellanbieters prüfen (Rechte am Output, kommerzielle Nutzung, Trainingsdaten)
- [ ] BytePlus-Preise 1080p/4K ermitteln
- [ ] Vergleichszahl klassischer Animation von Rainer bestätigen lassen
- [ ] Trefferquote messen (Schätzung 1:3 durch echte Daten ersetzen)
- [ ] Qualitätsäquivalenz am Proof of Concept beweisen

**Marke**
- [ ] Markenfarben, Logo, Claim, Handles, Domain

---

## 7. Für die nächste Session
1. `strategy/MASTERPLAN.md` lesen — dort steht Ziel, Reihenfolge und was bewusst **nicht** getan wird
2. Bexly ist pausiert — keine neuen Assets ohne Vertrag
3. Produktionsstandards aus `productions/CAMERA_AND_BLOCKING.md` und die Rezepte aus `productions/higgsfield_elements.md` gelten unverändert
4. Markenwissen immer in `bexly_os/brand/brand_core.md` pflegen, nie im Code

---

## 8. Kontakt
RED SUN FILMS GMBH · Dr.-Max-Straße 10, 82031 Grünwald · info@redsunfilms.com
Pushlabs · Gutenbergplatz 3, 04103 Leipzig · hello@pushlabs.de
