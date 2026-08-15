#!/usr/bin/env python3
"""IP Studio — Geruest und Werkzeug fuer eine EIGENE Character-IP.

Nimmt die Lehren aus der Being-Bexly-Produktion und macht sie IP-unabhaengig
wiederverwendbar (das "second unrelated production"-Ziel aus Blueprint V2).

Alles, was hier entsteht, gehoert dir. Die Rechteakte wird ab Tag 1 mitgefuehrt.

    python3 ip_studio/scaffold.py new "Mein IP-Titel"
    python3 ip_studio/scaffold.py character <ip-slug> "Figurname"
    python3 ip_studio/scaffold.py log <ip-slug> --versuche 4 --verwendet 1
    python3 ip_studio/scaffold.py status <ip-slug>
"""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IPS = ROOT / "ips"

# --- Die Pipeline-Konstanten (real verifiziert, siehe strategy/kostenmodell.md)
CREDITS = {"clip_10s": 35, "vertonung_10s": 20, "tts_zeile": 0.7,
           "keyframe": 2, "mesh_3d": 20}
EUR_PRO_CREDIT = 6000 / 144000  # Listenpreis Higgsfield Creator


def slugify(text: str) -> str:
    s = text.lower()
    for a, b in [("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")]:
        s = s.replace(a, b)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "ip"


def tpl(name: str) -> str:
    return (Path(__file__).parent / "templates" / name).read_text(encoding="utf-8")


# --- Befehle -------------------------------------------------------------
def cmd_new(args):
    slug = slugify(args.titel)
    base = IPS / slug
    if base.exists():
        sys.exit(f"FEHLER: {base} existiert bereits.")

    for d in ("characters", "productions", "assets", "strategy"):
        (base / d).mkdir(parents=True, exist_ok=True)

    heute = date.today().isoformat()
    subs = {"{{TITEL}}": args.titel, "{{SLUG}}": slug,
            "{{DATUM}}": heute, "{{AUTOR}}": args.autor}

    def schreibe(ziel: Path, vorlage: str):
        text = tpl(vorlage)
        for k, v in subs.items():
            text = text.replace(k, v)
        ziel.write_text(text, encoding="utf-8")

    schreibe(base / "brand_core.md", "brand_core.md")
    schreibe(base / "strategy" / "rechteakte.md", "rechteakte.md")
    schreibe(base / "characters" / "_vorlage.md", "character.md")
    schreibe(base / "productions" / "_vorlage.md", "shotlist.md")

    (base / "ip.json").write_text(json.dumps({
        "titel": args.titel, "slug": slug, "autor": args.autor,
        "erstellt": heute, "characters": [], "produktionen": [],
        "messungen": {"versuche": 0, "verwendet": 0},
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"IP angelegt: {base}")
    print("\nNaechste Schritte:")
    print(f"  1. {base/'brand_core.md'} ausfuellen (Kern der IP)")
    print(f"  2. {base/'strategy'/'rechteakte.md'} — Urheberschaft ab heute dokumentieren")
    print(f"  3. python3 ip_studio/scaffold.py character {slug} \"Erste Figur\"")


def _lade(slug):
    p = IPS / slug / "ip.json"
    if not p.exists():
        sys.exit(f"FEHLER: IP '{slug}' nicht gefunden. Erst 'new' ausfuehren.")
    return p, json.loads(p.read_text(encoding="utf-8"))


def cmd_character(args):
    p, data = _lade(args.slug)
    cslug = slugify(args.name)
    ziel = IPS / args.slug / "characters" / f"{cslug}.md"
    if ziel.exists():
        sys.exit(f"FEHLER: {ziel} existiert bereits.")
    text = tpl("character.md").replace("{{FIGUR}}", args.name)
    text = text.replace("{{TITEL}}", data["titel"]).replace("{{DATUM}}", date.today().isoformat())
    ziel.write_text(text, encoding="utf-8")
    data["characters"].append({"name": args.name, "slug": cslug, "element_id": None})
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Figur angelegt: {ziel}")
    print("WICHTIG: Silhouette, Bewegungssignatur und Stimmungsbandbreite ausfuellen —")
    print("das sind die drei Felder, die in der Pipeline nachweislich den Unterschied machen.")


def cmd_log(args):
    p, data = _lade(args.slug)
    m = data["messungen"]
    m["versuche"] += args.versuche
    m["verwendet"] += args.verwendet
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Erfasst: {args.versuche} Versuche, {args.verwendet} verwendet.")
    _trefferquote(m, verbose=True)


def _trefferquote(m, verbose=False):
    if not m["verwendet"]:
        if verbose:
            print("Noch keine verwendbaren Clips erfasst.")
        return None
    q = m["versuche"] / m["verwendet"]
    if verbose:
        print(f"Gemessene Trefferquote: {q:.2f} Versuche je verwendbarem Clip "
              f"({m['verwendet']}/{m['versuche']})")
    return q


def cmd_status(args):
    _, data = _lade(args.slug)
    print(f"IP:      {data['titel']}  ({data['slug']})")
    print(f"Autor:   {data['autor']}   seit {data['erstellt']}")
    print(f"Figuren: {len(data['characters'])}"
          + ("  -> " + ", ".join(c["name"] for c in data["characters"]) if data["characters"] else ""))

    q = _trefferquote(data["messungen"], verbose=True) or 3.0
    gemessen = _trefferquote(data["messungen"]) is not None
    pro_10s = (CREDITS["keyframe"] * 3 + CREDITS["clip_10s"] * q
               + CREDITS["vertonung_10s"] * 1.2 + CREDITS["tts_zeile"])
    pro_min = pro_10s * 6
    quelle = "gemessen" if gemessen else "Annahme 3.0"
    print(f"\nKosten je Minute ({quelle}): {pro_min:.0f} Credits "
          f"= {pro_min*EUR_PRO_CREDIT:.2f} EUR (Listenpreis)")
    for name, minuten in (("Kurzfilm 3 Min", 3), ("Pilotfolge 8 Min", 8)):
        print(f"  {name:<18}{pro_min*minuten:>8.0f} Cr = {pro_min*minuten*EUR_PRO_CREDIT:>8.2f} EUR")


def main():
    ap = argparse.ArgumentParser(description="IP Studio — eigene Character-IP aufsetzen und steuern")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p1 = sub.add_parser("new", help="Neue IP anlegen")
    p1.add_argument("titel")
    p1.add_argument("--autor", default="Daniel Laudowicz / Pushlabs")
    p1.set_defaults(func=cmd_new)

    p2 = sub.add_parser("character", help="Figur anlegen")
    p2.add_argument("slug"); p2.add_argument("name")
    p2.set_defaults(func=cmd_character)

    p3 = sub.add_parser("log", help="Generierungs-Versuche erfassen (misst die Trefferquote)")
    p3.add_argument("slug")
    p3.add_argument("--versuche", type=int, required=True)
    p3.add_argument("--verwendet", type=int, required=True)
    p3.set_defaults(func=cmd_log)

    p4 = sub.add_parser("status", help="Stand und Kosten anzeigen")
    p4.add_argument("slug")
    p4.set_defaults(func=cmd_status)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
