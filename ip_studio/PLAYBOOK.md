# IP Studio — Playbook für eine eigene Character-IP

> Ausführbare Anleitung, keine Strategie-Prosa.
> Werkzeug: `ip_studio/scaffold.py` · Zielgröße: **15 h/Woche, solo**
> Alles, was hier entsteht, gehört dir.

---

## 0. Der eine Unterschied zu Being Bexly

*Being Bexly* wurde als klassischer 90-Minuten-Film geschrieben und wird jetzt
auf eine KI-Pipeline **retrofittet**. Das funktioniert — aber gegen den Strich.

**Deine eigene IP entwirfst du von Anfang an für die Pipeline.** Das ist kein
Kompromiss, sondern ein Vorteil: Du baust auf das, was nachweislich funktioniert,
und umgehst, was nachweislich klemmt.

| ✅ Verifizierte Stärken — darauf bauen | ❌ Verifizierte Schwächen — meiden |
|---|---|
| Figurentreue über Reference Elements | Dialoglastige Lip-Sync-Szenen |
| Distinkte Bewegungssignaturen je Figur | Lange durchchoreografierte Sequenzen |
| Look-Konsistenz über viele Shots | Exakte Wiederholbarkeit (Trefferquote ~1:3) |
| 10–30 s Clips, schnell und billig | 90-Minuten-Struktur solo (= 2–4 Jahre) |
| Nachträgliche Vertonung ohne Bildverlust | 4K/10-bit (Plattformgrenze, unbepreist) |

---

## 1. Die fünf Regeln

**1. Kurzform-nativ.** Erzähleinheit = **8–30 Sekunden**, nicht 90 Minuten.
Langform kann später kommen — aus einer IP, die bereits läuft.

**2. Maximal 3–4 Hauptfiguren.** Jede weitere Figur vervielfacht Referenz- und
Konsistenzarbeit. Being Bexly hat über zehn — das ist bei 15 h/Woche nicht
zu halten.

**3. Ein Hauptschauplatz.** Ein Clean-Plate-Environment, das immer wieder
funktioniert. Neue Orte sind der teuerste Konsistenzkiller.

**4. Visuell statt verbal.** Die Pipeline kann Bewegung und Ausdruck brillant,
präzisen Lip-Sync schlecht. Also: **Slapstick, Reaktion, Körpersprache** —
Dialog sparsam und als Off/Kommentar.

**5. Episodisch statt fortlaufend.** Jedes Stück steht für sich. Kein
Kontinuitäts-Albtraum, jederzeit einsteigbar, beliebig fortsetzbar.

> **Prüffrage für jede Idee:** Lässt sich der Kern in **15 Sekunden ohne Dialog**
> erzählen? Wenn nein — anpassen, nicht erzwingen.

---

## 2. Die drei Felder, auf die es je Figur ankommt

Aus der Produktion gelernt: Wiedererkennbarkeit entsteht nicht aus der
Hintergrundgeschichte, sondern aus drei Dingen. Sie stehen im Figurenblatt und
gehen **in jeden Prompt**:

| Feld | Wozu | Beispiel aus der Praxis |
|---|---|---|
| **Silhouette** | Erkennbarkeit als Umriss | Stachelhaare · blaue Mähne · sichtbare Mechanik |
| **Bewegungssignatur** | Charakter ohne Worte | „ängstlich — geduckt, zittrig, stolpert beim Zurückblicken" · „energisch — federnde Sprünge" · „mit Gewicht — schwerer Bounce, überschießender Schwung" |
| **Stimmungsbandbreite** | Emotionale Spielbreite | Panik → Hoffnung → Erleichterung |

Diese drei haben bei Cal/Liv/Sammy nachweislich funktioniert — im Video **und**
im 3D-Druck.

---

## 3. Ablauf in fünf Phasen

### Phase 1 — Konzept (1 Woche · ~10 h)
```bash
python3 ip_studio/scaffold.py new "Mein Titel"
```
- `brand_core.md` ausfüllen — besonders **Ziff. 3: „Warum passt die IP zur Pipeline?"**
  Wenn die Antwort dort schwach ist, stimmt das Konzept noch nicht.
- `strategy/rechteakte.md` starten — **ab Tag 1**, nicht später.
- Namens- und Markenrecherche (DPMA, EUIPO, Domain, Handles).

**Gate:** Kern in 15 Sekunden ohne Dialog erzählbar? Sonst zurück.

### Phase 2 — Figuren (1–2 Wochen · ~15 h)
```bash
python3 ip_studio/scaffold.py character mein-titel "Figurname"
```
- Je Figur: Silhouette, Bewegungssignatur, Stimmungsbandbreite.
- Character-Sheets generieren → als **Reference Elements** anlegen → IDs eintragen.
- Ein Environment-Clean-Plate erzeugen (ohne Figuren, für freie Kombination).

**Gate:** Zwei Figuren nebeneinander im selben Bild — bleiben beide erkennbar?

### Phase 3 — Pilot (2 Wochen · ~20 h)
- **Ein** Stück, 15–30 s, vollständig fertig: Shotlist → Clips → Vertonung → Schnitt.
- Versuche mitzählen:
```bash
python3 ip_studio/scaffold.py log mein-titel --versuche 7 --verwendet 3
```

**Gate:** Würdest du das selbst teilen? Ehrlich. Wenn nein — nachbessern, bevor
skaliert wird.

### Phase 4 — Test (4 Wochen · ~6 h/Woche)
- **2 Posts/Woche**, nicht mehr. Konstanz schlägt Frequenz.
- Beobachten: Welche Figur bekommt eigene Fans? Welches Format trägt?
- Kosten und Trefferquote laufend messen:
```bash
python3 ip_studio/scaffold.py status mein-titel
```

**Gate:** Gibt es ein Format und eine Figur, die tragen? Wenn nach 8 Stücken
nichts zündet: Konzept ändern, nicht Frequenz erhöhen.

### Phase 5 — Skalieren (offen)
Auf Gewinner-Figur und -Format verdoppeln. Erst dann Merch/3D-Druck, Lizenz,
Langform. **Nicht vorher** — sonst investierst du in etwas, das kein Publikum hat.

---

## 4. Rechte ab Tag 1 — der Unterschied zu Being Bexly

Bei Being Bexly arbeitest du an fremder IP ohne dokumentierte Position. **Hier
machst du es andersherum**, und es kostet fünf Minuten pro Eintrag:

- **Nachweiskette führen** (`rechteakte.md`) — Git-Historie ist ein brauchbarer Zeitnachweis.
- **Dritte vorher schriftlich klären** — Zeichner, Sprecher, Komponisten. Ohne
  Vereinbarung entstehen Miturheberschaften, die kaum auflösbar sind.
- **Werkzeug-Bedingungen prüfen** — Rechte am Output, kommerzielle Nutzung,
  Trainingsdaten-Zusicherungen. Für Lizenzverträge und Förderungen ein hartes Kriterium.
- **Stimmen** brauchen die Einwilligung der sprechenden Person (Persönlichkeitsrecht).
- **Sauber trennen** von Auftragsarbeiten: eigene Dateien, eigene Accounts, eigene
  Referenz-Elemente. Vermischung ist der häufigste Streitgrund.

---

## 5. Das Werkzeug

| Befehl | Zweck |
|---|---|
| `scaffold.py new "Titel"` | IP anlegen (Brand Core, Rechteakte, Vorlagen, Registry) |
| `scaffold.py character <slug> "Name"` | Figurenblatt mit den drei Pflichtfeldern |
| `scaffold.py log <slug> --versuche N --verwendet M` | Trefferquote messen |
| `scaffold.py status <slug>` | Stand + Kosten je Minute (**gemessen**, nicht geschätzt) |

Die Stückkosten im Rechner sind real verifiziert: 35 Cr je 10-s-Clip, 20 Cr
Vertonung, 0,7 Cr Dialogzeile, 2 Cr Keyframe, 20 Cr 3D-Mesh.

**Beispiel:** Bei gemessener Trefferquote 2,33 kostet eine fertige Minute
674 Credits ≈ 28 € — ein 3-Minuten-Kurzfilm also **rund 84 €** Rechenkosten.

---

## 6. Die Zeitfrage — ehrlich

**15 h/Woche tragen keine zwei IPs.** Phase 1–3 brauchen zusammen ~45 h, also
**gut drei Wochen deiner gesamten Kapazität**. In dieser Zeit steht Being Bexly
faktisch still.

Drei gangbare Wege:

| Weg | Konsequenz |
|---|---|
| **Eigene IP zuerst** | Being Bexly ruht ~6 Wochen. Danach hast du eine IP, die dir gehört — und einen zweiten Beweisfall für die Plattform. |
| **Being Bexly zuerst** | Term Sheet klären, Proof of Concept bauen. Eigene IP danach. Vorteil: der Verhandlungszeitpunkt ist jetzt. |
| **Klein parallel** | Eigene IP bewusst als Mini-Format (1 Post/Woche, 2 Figuren). Langsamer, aber beides bleibt in Bewegung. |

Es gibt keine richtige Antwort — aber es gibt eine falsche: **beides in voller
Größe gleichzeitig.** Dann wird keins fertig.

---

## 7. Der erste konkrete Schritt
```bash
python3 ip_studio/scaffold.py new "Dein Titel"
```
Dann `brand_core.md` öffnen und **Ziff. 3** zuerst beantworten — warum passt
diese IP zur Pipeline? Alles andere folgt daraus.
