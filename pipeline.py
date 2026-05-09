#!/usr/bin/env python3
"""Video Production Pipeline — script, storyboard, Seedance 2 prompts, shot-status tracking."""

import anthropic
import argparse
import json
import os
import sys
import uuid
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PROJECTS_DIR = Path("projects")

STATUS_ORDER = ["idea", "storyboard", "prompt_ready", "video_generated", "in_premiere", "done"]

STATUS_LABELS = {
    "idea":            "Idee",
    "storyboard":      "Storyboard",
    "prompt_ready":    "Prompt fertig",
    "video_generated": "Video generiert",
    "in_premiere":     "In Premiere",
    "done":            "Fertig",
}

STATUS_COLORS_ANSI = {
    "idea":            "\033[90m",
    "storyboard":      "\033[34m",
    "prompt_ready":    "\033[33m",
    "video_generated": "\033[35m",
    "in_premiere":     "\033[36m",
    "done":            "\033[32m",
}
RESET = "\033[0m"

# ---------------------------------------------------------------------------
# Storage helpers
# ---------------------------------------------------------------------------

def _ensure_dir() -> Path:
    PROJECTS_DIR.mkdir(exist_ok=True)
    return PROJECTS_DIR


def _project_path(project_id: str) -> Path:
    return _ensure_dir() / f"{project_id}.json"


def _load_project(project_id: str) -> dict:
    path = _project_path(project_id)
    if not path.exists():
        raise FileNotFoundError(f"Projekt nicht gefunden: {project_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def _save_project(project: dict) -> None:
    _project_path(project["id"]).write_text(
        json.dumps(project, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def _all_projects() -> list:
    return [
        json.loads(p.read_text(encoding="utf-8"))
        for p in sorted(_ensure_dir().glob("*.json"))
    ]

# ---------------------------------------------------------------------------
# CLI commands
# ---------------------------------------------------------------------------

def cmd_new(args):
    project = {
        "id":      str(uuid.uuid4())[:8],
        "title":   args.title,
        "created": datetime.now().isoformat(),
        "concept": args.concept or "",
        "script":  "",
        "shots":   [],
    }
    _save_project(project)
    print(f"Projekt erstellt: \"{project['title']}\"  (ID: {project['id']})")
    print(f"Storyboard generieren: python pipeline.py generate {project['id']}")


def cmd_list(args):
    projects = _all_projects()
    if not projects:
        print("Noch keine Projekte. Erstelle eins mit:  python pipeline.py new \"Titel\"")
        return
    print(f"\n  {'ID':<10}  {'Titel':<35}  {'Shots'}")
    print(f"  {'─'*8}  {'─'*33}  {'─'*12}")
    for p in projects:
        total = len(p["shots"])
        done  = sum(1 for s in p["shots"] if s["status"] == "done")
        print(f"  {p['id']:<10}  {p['title']:<35}  {done}/{total} fertig")
    print()


def cmd_generate(args):
    try:
        project = _load_project(args.project_id)
    except FileNotFoundError as e:
        print(e); sys.exit(1)

    concept = args.concept or project.get("concept") or ""
    if not concept:
        concept = input("Beschreib dein Konzept / deine Idee: ").strip()
        project["concept"] = concept

    print(f"\nGeneriere Storyboard für \"{project['title']}\" …\n")

    system = (
        "Du bist ein professioneller Filmregisseur und KI-Video-Produzent. "
        "Du erstellst strukturierte Storyboards mit optimierten Prompts für Seedance 2. "
        "Antworte AUSSCHLIESSLICH mit validem JSON — kein Fließtext davor oder danach."
    )

    prompt = f"""Konzept: {concept}

Erstelle ein vollständiges Storyboard als JSON nach diesem exakten Schema:
{{
  "script_summary": "Kurze Zusammenfassung des Gesamtkonzepts (2-3 Sätze)",
  "shots": [
    {{
      "id": "shot_001",
      "scene": 1,
      "shot": 1,
      "title": "Kurztitel des Shots",
      "description": "Visuelle Beschreibung – was ist zu sehen, Stimmung, Kontext",
      "camera": "Kamerabewegung und Einstellungsgröße",
      "duration": "5",
      "seedance_prompt": "Cinematic [style], [subject], [action], [camera movement], [lighting], [mood], [color palette], ultra HD, photorealistic — alles auf Englisch, sehr detailliert",
      "first_frame_prompt": "Static image prompt for the first frame — composition, lighting, subject in initial pose — auf Englisch",
      "status": "idea",
      "notes": ""
    }}
  ]
}}

Erstelle 8–14 Shots. Seedance-Prompts und First-Frame-Prompts müssen auf Englisch sein und maximal detailliert (Kamera, Bewegung, Licht, Atmosphäre, Stil, Farbpalette). Keine anderen Felder hinzufügen."""

    client = anthropic.Anthropic()
    response_text = ""

    with client.messages.stream(
        model="claude-opus-4-7",
        max_tokens=8000,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
            response_text += text
    print("\n")

    # Strip markdown code fences if present
    text = response_text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    text = text.strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        print(f"JSON-Fehler beim Parsen: {e}")
        print("Rohantwort wurde in 'last_response.json' gespeichert.")
        Path("last_response.json").write_text(response_text, encoding="utf-8")
        sys.exit(1)

    project["script"] = data.get("script_summary", "")

    # Preserve existing status/notes when re-generating
    existing = {s["id"]: s for s in project.get("shots", [])}
    new_shots = []
    for shot in data.get("shots", []):
        if shot["id"] in existing:
            shot["status"] = existing[shot["id"]]["status"]
            shot["notes"]  = existing[shot["id"]]["notes"]
        shot.setdefault("status", "idea")
        shot.setdefault("notes", "")
        shot["updated"] = datetime.now().isoformat()
        new_shots.append(shot)

    project["shots"] = new_shots
    _save_project(project)
    print(f"Storyboard gespeichert — {len(new_shots)} Shots.")
    print(f"Review:    python pipeline.py review {project['id']}")
    print(f"Dashboard: python pipeline.py serve")


def cmd_status(args):
    try:
        project = _load_project(args.project_id)
    except FileNotFoundError as e:
        print(e); sys.exit(1)

    for shot in project["shots"]:
        if shot["id"] == args.shot_id:
            shot["status"]  = args.status
            shot["updated"] = datetime.now().isoformat()
            _save_project(project)
            color = STATUS_COLORS_ANSI.get(args.status, "")
            print(f"{shot['id']}  →  {color}{STATUS_LABELS[args.status]}{RESET}")
            return

    print(f"Shot nicht gefunden: {args.shot_id}")
    sys.exit(1)


def cmd_note(args):
    try:
        project = _load_project(args.project_id)
    except FileNotFoundError as e:
        print(e); sys.exit(1)

    for shot in project["shots"]:
        if shot["id"] == args.shot_id:
            shot["notes"]   = args.note
            shot["updated"] = datetime.now().isoformat()
            _save_project(project)
            print(f"Notiz gespeichert für {args.shot_id}.")
            return

    print(f"Shot nicht gefunden: {args.shot_id}")
    sys.exit(1)


def cmd_review(args):
    try:
        project = _load_project(args.project_id)
    except FileNotFoundError as e:
        print(e); sys.exit(1)

    shots = project["shots"]
    print(f"\n{'═' * 62}")
    print(f"  {project['title']}   [{project['id']}]")
    if project.get("script"):
        summary = project["script"]
        if len(summary) > 120:
            summary = summary[:117] + "…"
        print(f"  {summary}")
    print(f"{'═' * 62}")

    for shot in shots:
        color = STATUS_COLORS_ANSI.get(shot["status"], "")
        label = STATUS_LABELS.get(shot["status"], shot["status"])
        dur   = shot.get("duration", "?")
        desc  = shot.get("description", "")
        if len(desc) > 80:
            desc = desc[:77] + "…"
        print(f"\n  {shot['id']}  {shot.get('title', '')}")
        print(f"  {color}● {label}{RESET}   "
              f"Szene {shot.get('scene','?')} / Shot {shot.get('shot','?')}   {dur}s")
        print(f"  {desc}")
        if shot.get("notes"):
            print(f"  \033[90m↳ {shot['notes']}{RESET}")

    print(f"\n{'─' * 62}")
    counts: dict = {}
    for shot in shots:
        counts[shot["status"]] = counts.get(shot["status"], 0) + 1
    for status in STATUS_ORDER:
        if status in counts:
            color = STATUS_COLORS_ANSI[status]
            print(f"  {color}{counts[status]:>2}×  {STATUS_LABELS[status]}{RESET}")
    print()


def cmd_export(args):
    """Export all Seedance prompts for a project as Markdown."""
    try:
        project = _load_project(args.project_id)
    except FileNotFoundError as e:
        print(e); sys.exit(1)

    lines = [f"# {project['title']}\n", f"{project.get('script', '')}\n\n"]
    for shot in project["shots"]:
        lines.append(f"## {shot['id']} — {shot.get('title', '')}\n")
        lines.append(f"**Status:** {STATUS_LABELS.get(shot['status'], shot['status'])}  \n")
        lines.append(f"**Kamera:** {shot.get('camera', '')}  \n")
        lines.append(f"**Dauer:** {shot.get('duration', '?')}s  \n\n")
        lines.append(f"**Beschreibung:** {shot.get('description', '')}  \n\n")
        if shot.get("seedance_prompt"):
            lines.append(f"**Seedance-Prompt:**\n```\n{shot['seedance_prompt']}\n```\n\n")
        if shot.get("first_frame_prompt"):
            lines.append(f"**First Frame:**\n```\n{shot['first_frame_prompt']}\n```\n\n")
        if shot.get("notes"):
            lines.append(f"**Notizen:** {shot['notes']}  \n\n")
        lines.append("---\n\n")

    out_path = Path(f"{project['id']}_prompts.md")
    out_path.write_text("".join(lines), encoding="utf-8")
    print(f"Exportiert: {out_path}")

# ---------------------------------------------------------------------------
# Web dashboard (embedded HTML + REST API via built-in http.server)
# ---------------------------------------------------------------------------

_DASHBOARD_HTML = """\
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Video Pipeline</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f13;color:#e0e0e0;min-height:100vh}
header{height:56px;padding:0 28px;border-bottom:1px solid #1e1e28;display:flex;align-items:center;gap:16px;position:fixed;top:0;left:0;right:0;background:#0f0f13;z-index:100}
header h1{font-size:16px;font-weight:700;color:#fff;letter-spacing:.3px}
header .updated{font-size:11px;color:#444;margin-left:auto}
.sidebar{width:220px;position:fixed;top:56px;left:0;bottom:0;background:#111116;border-right:1px solid #1e1e28;overflow-y:auto;padding:12px 8px}
.main{margin-left:220px;padding:80px 32px 48px}
.proj-item{padding:9px 12px;border-radius:8px;cursor:pointer;margin-bottom:3px;transition:background .1s}
.proj-item:hover{background:#1a1a22}
.proj-item.active{background:#1e1e2e}
.proj-item .name{font-size:13px;color:#ddd;font-weight:500}
.proj-item .meta{font-size:11px;color:#555;margin-top:2px}
.empty{color:#444;font-size:13px;padding:20px 12px}
h2{font-size:20px;font-weight:700;margin-bottom:6px}
.summary{font-size:13px;color:#777;line-height:1.6;max-width:760px;margin-bottom:24px}
.stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px}
.stat-pill{padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid transparent}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
.card{background:#141418;border:1px solid #1e1e28;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px}
.card-id{font-size:11px;color:#444;font-family:monospace}
.card-title{font-size:14px;font-weight:600;color:#eee}
.card-desc{font-size:12px;color:#888;line-height:1.5}
.prompt-box{background:#0d0d12;border-radius:6px;padding:10px;font-size:11px;color:#6a90c8;font-family:monospace;line-height:1.6;max-height:72px;overflow:hidden;cursor:pointer;position:relative;transition:max-height .2s}
.prompt-box.open{max-height:400px}
.prompt-box::after{content:'▾';position:absolute;bottom:6px;right:8px;font-size:10px;color:#555}
.prompt-box.open::after{content:'▴'}
.badge{display:inline-block;padding:4px 11px;border-radius:16px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid transparent;user-select:none;transition:filter .15s}
.badge:hover{filter:brightness(1.25)}
.notes{width:100%;background:#0d0d12;border:1px solid #1e1e28;border-radius:6px;padding:8px;font-size:12px;color:#bbb;resize:vertical;min-height:44px;font-family:inherit}
.notes:focus{outline:none;border-color:#333}
.no-proj{display:flex;align-items:center;justify-content:center;height:calc(100vh - 56px);color:#333;font-size:15px;margin-left:220px}
/* status colors */
.s-idea{background:#1e1e1e;color:#777;border-color:#2a2a2a}
.s-storyboard{background:#0c2040;color:#4a9ee0;border-color:#163460}
.s-prompt_ready{background:#2e1800;color:#f09050;border-color:#4a2c00}
.s-video_generated{background:#200a3e;color:#b06af0;border-color:#3c1868}
.s-in_premiere{background:#00252e;color:#40c8d8;border-color:#004858}
.s-done{background:#0a2010;color:#48c068;border-color:#184030}
</style>
</head>
<body>
<header>
  <h1>Video Production Pipeline</h1>
  <span class="updated" id="ts"></span>
</header>
<div class="sidebar" id="sidebar"><div class="empty">Lade …</div></div>
<div id="root"></div>
<script>
const SL=["idea","storyboard","prompt_ready","video_generated","in_premiere","done"];
const SN={idea:"Idee",storyboard:"Storyboard",prompt_ready:"Prompt fertig",video_generated:"Video generiert",in_premiere:"In Premiere",done:"Fertig"};
let projects=[],current=null;

async function api(path,method='GET',body=null){
  const o={method,headers:{'Content-Type':'application/json'}};
  if(body)o.body=JSON.stringify(body);
  const r=await fetch('/api'+path,o);
  return r.json();
}

async function refresh(){
  projects=await api('/projects');
  renderSidebar();
  if(current){
    const p=projects.find(x=>x.id===current);
    renderProject(p);
  } else {
    document.getElementById('root').innerHTML='<div class="no-proj">← Projekt auswählen</div>';
  }
  document.getElementById('ts').textContent='Aktualisiert '+new Date().toLocaleTimeString('de-DE');
}

function renderSidebar(){
  const el=document.getElementById('sidebar');
  if(!projects.length){el.innerHTML='<div class="empty">Noch keine Projekte.<br>pipeline new "Titel"</div>';return;}
  el.innerHTML=projects.map(p=>{
    const done=p.shots.filter(s=>s.status==='done').length;
    return `<div class="proj-item${p.id===current?' active':''}" onclick="open_proj('${p.id}')">
      <div class="name">${esc(p.title)}</div>
      <div class="meta">${p.id} &nbsp;·&nbsp; ${done}/${p.shots.length}</div>
    </div>`;
  }).join('');
}

function open_proj(id){
  current=id;
  const p=projects.find(x=>x.id===id);
  renderProject(p);
  renderSidebar();
}

function renderProject(p){
  const root=document.getElementById('root');
  if(!p){root.innerHTML='<div class="no-proj">Nicht gefunden</div>';return;}

  const counts={};
  SL.forEach(s=>counts[s]=0);
  p.shots.forEach(s=>counts[s.status]=(counts[s.status]||0)+1);

  const pills=SL.filter(s=>counts[s]>0).map(s=>
    `<span class="stat-pill s-${s}">${counts[s]} ${SN[s]}</span>`
  ).join('');

  const cards=p.shots.map(s=>`
    <div class="card">
      <div class="card-id">${s.id} &nbsp;·&nbsp; Sz ${s.scene}/Sh ${s.shot} &nbsp;·&nbsp; ${s.duration||'?'}s</div>
      <div class="card-title">${esc(s.title||'')}</div>
      <div class="card-desc">${esc(s.description||'')}</div>
      ${s.seedance_prompt?`<div class="prompt-box" onclick="this.classList.toggle('open')">${esc(s.seedance_prompt)}</div>`:''}
      <div>
        <span class="badge s-${s.status}" onclick="cycle('${p.id}','${s.id}','${s.status}')">${SN[s.status]||s.status}</span>
        ${s.camera?`<span style="font-size:11px;color:#555;margin-left:10px">${esc(s.camera)}</span>`:''}
      </div>
      <textarea class="notes" placeholder="Notizen …" onblur="save_note('${p.id}','${s.id}',this.value)">${esc(s.notes||'')}</textarea>
    </div>`).join('');

  root.innerHTML=`
    <div class="main">
      <h2>${esc(p.title)}</h2>
      <div class="summary">${esc(p.script||'')}</div>
      <div class="stats">${pills}</div>
      <div class="shots">${cards}</div>
    </div>`;
}

async function cycle(pid,sid,cur){
  const next=SL[(SL.indexOf(cur)+1)%SL.length];
  await api('/project/'+pid+'/shot/'+sid+'/status','POST',{status:next});
  const p=projects.find(x=>x.id===pid);
  if(p){const s=p.shots.find(x=>x.id===sid);if(s)s.status=next;}
  renderProject(projects.find(x=>x.id===pid));
  renderSidebar();
}

async function save_note(pid,sid,note){
  await api('/project/'+pid+'/shot/'+sid+'/note','POST',{note});
}

function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

refresh();
setInterval(refresh,15000);
</script>
</body>
</html>
"""


class _Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # quiet

    def _json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/index.html"):
            body = _DASHBOARD_HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif path == "/api/projects":
            self._json(_all_projects())
        else:
            self._json({"error": "not found"}, 404)

    def do_POST(self):
        parts = urlparse(self.path).path.strip("/").split("/")
        # /api/project/<id>/shot/<shot_id>/(status|note)
        if (len(parts) == 6 and parts[0] == "api" and parts[1] == "project"
                and parts[3] == "shot"):
            pid, sid, action = parts[2], parts[4], parts[5]
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}

            try:
                project = _load_project(pid)
            except FileNotFoundError:
                self._json({"error": "project not found"}, 404)
                return

            for shot in project["shots"]:
                if shot["id"] == sid:
                    if action == "status" and "status" in body:
                        shot["status"]  = body["status"]
                        shot["updated"] = datetime.now().isoformat()
                    elif action == "note" and "note" in body:
                        shot["notes"]   = body["note"]
                        shot["updated"] = datetime.now().isoformat()
                    _save_project(project)
                    self._json({"ok": True})
                    return

            self._json({"error": "shot not found"}, 404)
        else:
            self._json({"error": "not found"}, 404)


def cmd_serve(args):
    port = args.port
    server = HTTPServer(("localhost", port), _Handler)
    print(f"Dashboard:  http://localhost:{port}")
    print("Ctrl+C zum Beenden.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer gestoppt.")

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        prog="pipeline",
        description="Video Production Pipeline — Storyboard · Prompts · Shot-Tracking",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Workflow:
  python pipeline.py new "Mein Projekt" --concept "Kurze Idee"
  python pipeline.py generate <id>           # Storyboard + Seedance-Prompts via Claude
  python pipeline.py review   <id>           # Übersicht im Terminal
  python pipeline.py status   <id> shot_001 prompt_ready
  python pipeline.py note     <id> shot_001 "Seedance Job #1234"
  python pipeline.py export   <id>           # Prompts als Markdown exportieren
  python pipeline.py serve                   # Web-Dashboard auf http://localhost:8080
""",
    )
    sub = parser.add_subparsers(dest="cmd")

    # new
    p = sub.add_parser("new", help="Neues Projekt anlegen")
    p.add_argument("title", help="Projekttitel")
    p.add_argument("--concept", "-c", help="Kurzbeschreibung der Idee")
    p.set_defaults(func=cmd_new)

    # list
    p = sub.add_parser("list", help="Alle Projekte anzeigen")
    p.set_defaults(func=cmd_list)

    # generate
    p = sub.add_parser("generate", help="Storyboard + Seedance-Prompts generieren")
    p.add_argument("project_id")
    p.add_argument("--concept", "-c", help="Konzept überschreiben")
    p.set_defaults(func=cmd_generate)

    # status
    p = sub.add_parser("status", help="Shot-Status setzen")
    p.add_argument("project_id")
    p.add_argument("shot_id")
    p.add_argument("status", choices=STATUS_ORDER)
    p.set_defaults(func=cmd_status)

    # note
    p = sub.add_parser("note", help="Notiz zu einem Shot hinzufügen")
    p.add_argument("project_id")
    p.add_argument("shot_id")
    p.add_argument("note")
    p.set_defaults(func=cmd_note)

    # review
    p = sub.add_parser("review", help="Projektübersicht im Terminal")
    p.add_argument("project_id")
    p.set_defaults(func=cmd_review)

    # export
    p = sub.add_parser("export", help="Prompts als Markdown exportieren")
    p.add_argument("project_id")
    p.set_defaults(func=cmd_export)

    # serve
    p = sub.add_parser("serve", help="Web-Dashboard starten")
    p.add_argument("--port", "-p", type=int, default=8080)
    p.set_defaults(func=cmd_serve)

    args = parser.parse_args()
    if not args.cmd:
        parser.print_help()
        return
    args.func(args)


if __name__ == "__main__":
    main()
