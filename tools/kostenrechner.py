#!/usr/bin/env python3
"""Bexly Kostenrechner — Rechenkosten pro Minute fertigem Film.

Alle Stueckkosten sind in dieser Session real verifiziert (Higgsfield/Seedance).
Annahmen (Trefferquote, Aufloesungs-Faktor) sind oben einstellbar.

    python3 tools/kostenrechner.py
"""

# --- Vertragsdaten (Higgsfield Creator, 2 Jahre) -------------------------
MONATE            = 24
CREDITS_MONAT     = 6000
PREIS_LISTE_EUR   = 6000     # Listenpreis -> fuer Kalkulationen nach aussen
PREIS_GEZAHLT_EUR = 700      # tatsaechlich gezahlt (Rabatt) -> interne Sicht

# --- Verifizierte Stueckkosten (Credits) --------------------------------
CLIP_10S        = 35     # seedance_2_0, 720p, fast, 10s, mit image_references
VERTONUNG_10S   = 20     # seedance_2_5 video_edit + generate_audio
TTS_ZEILE       = 0.7    # seed_audio mit eigenem Stimm-Element
KEYFRAME        = 2      # nano_banana_pro 1k (Planung/Review)

# --- Annahmen (hier justieren) ------------------------------------------
SZENARIEN = {          # Name: (Generierungs-Versuche je brauchbarem Clip,
    "Optimistisch": (2, 1.0, 2),   #  Vertonungs-Versuche, Keyframes je 10s)
    "Realistisch":  (3, 1.2, 3),
    "Konservativ":  (4, 1.5, 3),
}
QUALI_FAKTOR = {       # Aufschlag fuer hoehere Aufloesung/Qualitaet
    "Social/PoC (720p fast)": 1.0,
    "Kino-Ziel (geschaetzt)": 2.5,   # NICHT verifiziert - Annahme!
}

gesamt_credits = MONATE * CREDITS_MONAT
p_liste   = PREIS_LISTE_EUR   / gesamt_credits
p_gezahlt = PREIS_GEZAHLT_EUR / gesamt_credits

def credits_pro_minute(versuche, vert_versuche, keyframes):
    pro_10s = (KEYFRAME * keyframes
               + CLIP_10S * versuche
               + VERTONUNG_10S * vert_versuche
               + TTS_ZEILE)
    return pro_10s * 6

print(f"Vertrag: {gesamt_credits:,} Credits ueber {MONATE} Monate".replace(",", "."))
print(f"  Listenpreis : {p_liste*100:.3f} Cent/Credit   ({PREIS_LISTE_EUR} EUR)")
print(f"  Gezahlt     : {p_gezahlt*100:.3f} Cent/Credit   ({PREIS_GEZAHLT_EUR} EUR)\n")

for qname, qf in QUALI_FAKTOR.items():
    print(f"=== {qname} ===")
    print(f"{'Szenario':<14}{'Cr/Min':>9}{'EUR/Min (Liste)':>18}{'EUR/Min (gezahlt)':>19}")
    for name, (v, vv, kf) in SZENARIEN.items():
        cpm = credits_pro_minute(v, vv, kf) * qf
        print(f"{name:<14}{cpm:>9.0f}{cpm*p_liste:>18.2f}{cpm*p_gezahlt:>19.2f}")
    # Projektionen im realistischen Fall
    cpm = credits_pro_minute(*SZENARIEN["Realistisch"]) * qf
    print(f"  -> Proof of Concept (3 Min): {cpm*3:>8.0f} Cr = {cpm*3*p_liste:>8.2f} EUR (Liste)")
    print(f"  -> Spielfilm (90 Min):       {cpm*90:>8.0f} Cr = {cpm*90*p_liste:>8.2f} EUR (Liste)")
    print(f"     entspricht {cpm*90/CREDITS_MONAT:.1f} Monatskontingenten\n")

cpm_r = credits_pro_minute(*SZENARIEN["Realistisch"])
print(f"Kapazitaet: {CREDITS_MONAT} Credits/Monat reichen rechnerisch fuer "
      f"{CREDITS_MONAT/cpm_r:.1f} Min/Monat (720p).")
print("Menschliche Kapazitaet bei 6 h Produktion/Woche: ca. 2-4 Min/Monat.")
print(">> Engpass ist die Arbeitszeit, nicht die Rechenleistung.")
