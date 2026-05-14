# Übergabe: Webseite www.laudowicz.de verbessern

## Ziel
Bestehende Portfolio-Webseite von Dominic (?) Laudowicz unter
`https://www.laudowicz.de` analysieren und verbessern.

Schwerpunkte laut Auftraggeber:
- Design & Optik
- Inhalte & Texte
- Mobile & Performance
- SEO & Auffindbarkeit

## Was bisher geklärt ist
- Zweck der Seite: **Portfolio**
- Quellcode liegt **nicht** in diesem Repo. Vermutlich bei einem Hoster
  (WordPress, Wix, Strato o.ä.). Auftraggeber muss ihn besorgen.
- Branch für die Arbeit: `claude/improve-laudowicz-website-MADIc`
- Repo: `dlaudowicz-cmyk/first-start` (enthält aktuell nur `assistant.py`,
  ein Python-CLI — nichts mit der Webseite zu tun)

## Warum die vorherige Session blockiert war
Die Sandbox dieser Claude-Code-Session blockt externe Hosts
(`curl https://www.laudowicz.de` → 403, `x-deny-reason: host_not_allowed`).
Kein Browser, kein Playwright, keine Netzanbindung zu Drittseiten.

## Was die nächste Instanz / Person tun muss

### Schritt 1: Zugang zur aktuellen Seite herstellen
Mindestens eines davon besorgen:
- **Quellcode** der Live-Seite (FTP-Download, WordPress-Export, Zip)
- **HTML-Quelltext** (Browser → „Seitenquelltext anzeigen" → speichern)
- **Screenshots** von Desktop- und Mobile-Ansicht
- **Lighthouse-Report** als JSON (Chrome DevTools → Lighthouse → Analyze)

### Schritt 2: Analyse
- Semantik & Accessibility (Heading-Struktur, alt-Texte, ARIA, Kontrast)
- SEO (Meta-Tags, OG-Tags, strukturierte Daten, Sitemap, robots.txt)
- Performance (LCP, CLS, INP, Bildgrößen, ungenutztes JS/CSS)
- Mobile-Layout (Viewport, Touch-Targets, Schriftgrößen)
- Inhaltliche Qualität der Portfolio-Sektionen

### Schritt 3: Vom Auftraggeber noch holen
- Voller Name + Beruf/Fachgebiet
- Welche Projekte/Arbeiten sollen ins Portfolio
- Bevorzugter Stil (minimalistisch / dunkel-modern / bunt / klassisch)
- Sprache(n) der Seite (DE? EN? beides?)
- Kontakt-/Impressum-Daten
- Bestehende Markenfarben oder Logo

### Schritt 4: Umsetzung
- Auf Branch `claude/improve-laudowicz-website-MADIc` arbeiten
- Statisches HTML/CSS/JS bevorzugt (einfach zu hosten, schnell)
- Mobile-first, semantisch, Lighthouse 90+ in allen Kategorien
- Commit & Push wenn fertig
- **Keinen PR** ohne ausdrückliche Anweisung erstellen

## Bessere Umgebung für diese Aufgabe
- **Claude Code lokal** + Playwright MCP → echter Browser, kann
  `laudowicz.de` direkt aufrufen, screenshotten, Lighthouse fahren
- **claude.ai (Web)** → kann Seiten via Websuche aufrufen, aber kein
  direkter Repo-Zugriff
- **Claude Desktop App** mit Web-Browsing → ähnlich wie claude.ai

## Status
Offen — noch keine Datei der Webseite gesehen, keine Änderung gemacht.
