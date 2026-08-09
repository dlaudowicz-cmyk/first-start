#!/usr/bin/env python3
"""Render vault.json into a searchable, filterable vault.html page.

Usage: python3 build_vault.py [--out vault.html]
"""

import argparse
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VAULT_FILE = ROOT / "vault.json"

STYLES = """
:root {
  --paper: #E9ECE9;
  --card: #F3F5F2;
  --ink: #14201C;
  --ink-soft: #4C5A55;
  --ink-faint: #7C8A85;
  --rule: #CDD6D1;
  --accent: #0E6B5E;
  --accent-soft: rgba(14, 107, 94, 0.10);
  --pending: #8A7A4E;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #0E1614;
    --card: #16211E;
    --ink: #DFE7E3;
    --ink-soft: #9DACA6;
    --ink-faint: #6E7D78;
    --rule: #26332F;
    --accent: #47C6A9;
    --accent-soft: rgba(71, 198, 169, 0.12);
    --pending: #C4AE76;
  }
}
:root[data-theme="dark"] {
  --paper: #0E1614;
  --card: #16211E;
  --ink: #DFE7E3;
  --ink-soft: #9DACA6;
  --ink-faint: #6E7D78;
  --rule: #26332F;
  --accent: #47C6A9;
  --accent-soft: rgba(71, 198, 169, 0.12);
  --pending: #C4AE76;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: "Iowan Old Style", Charter, "Palatino Linotype", Palatino, Georgia, serif;
  font-size: 17px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

.mono {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
}

.wrap {
  max-width: 60rem;
  margin: 0 auto;
  padding: 0 1.5rem 5rem;
}

/* ---- masthead ---- */

.masthead {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 3.5rem 0 1.75rem;
}
.eyebrow {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
}
.masthead h1 {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 3rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.015em;
  text-wrap: balance;
}
.lede {
  margin: 0;
  max-width: 42ch;
  color: var(--ink-soft);
}
.meta {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.75rem;
  color: var(--ink-faint);
  font-variant-numeric: tabular-nums;
}

.notice {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--rule);
  border-left: 3px solid var(--pending);
  background: var(--card);
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.notice strong { color: var(--ink); font-weight: 600; }

/* ---- toolbar ---- */

.toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
}
.searchbox { position: relative; display: flex; align-items: center; }
.searchbox .hint {
  position: absolute;
  right: 0.85rem;
  font-size: 0.7rem;
  color: var(--ink-faint);
  pointer-events: none;
  transition: opacity 0.12s ease;
}
/* Give way to the browser's own clear button once there is a query. */
#search:not(:placeholder-shown) ~ .hint { opacity: 0; }
#search {
  width: 100%;
  padding: 0.7rem 3.5rem 0.7rem 0.9rem;
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.9rem;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--rule);
  border-radius: 2px;
}
#search::placeholder { color: var(--ink-faint); }
#search:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
  border-color: transparent;
}

.chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.chip {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  padding: 0.35rem 0.7rem;
  color: var(--ink-soft);
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 2px;
  cursor: pointer;
}
.chip:hover { color: var(--ink); border-color: var(--ink-faint); }
.chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.chip[aria-pressed="true"] {
  color: var(--paper);
  background: var(--accent);
  border-color: var(--accent);
}

/* ---- sections ---- */

.section { margin-top: 2.75rem; }
.section-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--ink);
}
.section-mark {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
}
.section-head h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  flex: 1;
}
.section-count {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  color: var(--ink-faint);
  font-variant-numeric: tabular-nums;
}

.entry {
  display: grid;
  grid-template-columns: 3.25rem 1fr 9.5rem;
  gap: 0 1rem;
  align-items: start;
  padding: 1rem 0.6rem 1rem 0.5rem;
  border-bottom: 1px solid var(--rule);
}
.entry:hover { background: var(--accent-soft); }
.entry:hover .addr { color: var(--accent); }
/* .entry sets display:grid, which outranks the UA [hidden] rule — restate it. */
.entry[hidden], .section[hidden] { display: none; }

.addr {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.75rem;
  color: var(--ink-faint);
  padding-top: 0.2rem;
  font-variant-numeric: tabular-nums;
}
.entry-title {
  margin: 0 0 0.15rem;
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.3;
}
.entry-desc { margin: 0; font-size: 0.92rem; color: var(--ink-soft); max-width: 58ch; }
.tag {
  display: inline-block;
  margin-left: 0.5rem;
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.15rem 0.4rem;
  color: var(--ink-soft);
  border: 1px solid var(--rule);
  border-radius: 2px;
  vertical-align: 0.15em;
  white-space: nowrap;
}

.link-cell {
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  padding-top: 0.25rem;
  text-align: right;
  overflow-wrap: anywhere;
}
.link-cell a { color: var(--accent); text-decoration: none; border-bottom: 1px solid currentColor; }
.link-cell a:hover { opacity: 0.75; }
.link-cell a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.pending { color: var(--ink-faint); font-size: 0.65rem; letter-spacing: 0.06em; }
.pending .src {
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0;
  color: var(--ink-soft);
}

.empty {
  display: none;
  padding: 3rem 0;
  text-align: center;
  color: var(--ink-soft);
}
.empty.on { display: block; }

footer {
  margin-top: 3.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--rule);
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  color: var(--ink-faint);
  line-height: 1.7;
}

@media (max-width: 640px) {
  .entry { grid-template-columns: 2.5rem 1fr; }
  .link-cell { grid-column: 2; text-align: left; padding-top: 0.5rem; }
  .toolbar { position: static; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
"""

SCRIPT = """
const search = document.getElementById('search');
const chips = Array.from(document.querySelectorAll('.chip'));
const entries = Array.from(document.querySelectorAll('.entry'));
const sections = Array.from(document.querySelectorAll('.section'));
const empty = document.getElementById('empty');
const tally = document.getElementById('tally');
let activeCategory = 'all';

function apply() {
  const query = search.value.trim().toLowerCase();
  const words = query ? query.split(/\\s+/) : [];
  let shown = 0;

  for (const entry of entries) {
    const haystack = entry.dataset.search;
    const matchesText = words.every(w => haystack.includes(w));
    const matchesCat = activeCategory === 'all' || entry.dataset.category === activeCategory;
    const visible = matchesText && matchesCat;
    entry.hidden = !visible;
    if (visible) shown++;
  }

  for (const section of sections) {
    const rows = Array.from(section.querySelectorAll('.entry'));
    const live = rows.filter(r => !r.hidden).length;
    section.hidden = live === 0;
    section.querySelector('.section-count').textContent =
      live === rows.length ? `${rows.length} entries` : `${live} of ${rows.length}`;
  }

  empty.classList.toggle('on', shown === 0);
  tally.textContent = shown === entries.length
    ? `${entries.length} resources`
    : `${shown} of ${entries.length} resources`;
}

search.addEventListener('input', apply);
for (const chip of chips) {
  chip.addEventListener('click', () => {
    activeCategory = chip.dataset.category;
    for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
    apply();
  });
}
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  } else if (event.key === 'Escape' && document.activeElement === search) {
    search.value = '';
    apply();
  }
});
apply();
"""

LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def esc(value) -> str:
    return html.escape(str(value or ""), quote=True)


def render_entry(entry: dict, category: str, address: str) -> str:
    haystack = " ".join(
        [
            entry.get("title", ""),
            entry.get("description", ""),
            entry.get("type", ""),
            entry.get("source", ""),
            category,
        ]
    ).lower()

    url = entry.get("url")
    if url:
        label = entry.get("source") or url.split("//")[-1].split("/")[0]
        link = (
            f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(label)} &#8599;</a>'
        )
    else:
        source = entry.get("source", "source unknown")
        link = f'<span class="pending"><span class="src">{esc(source)}</span>link pending</span>'

    return f"""        <article class="entry" data-category="{esc(category)}" data-search="{esc(haystack)}">
          <div class="addr">{esc(address)}</div>
          <div>
            <h3 class="entry-title">{esc(entry.get("title", "Untitled"))}<span class="tag">{esc(entry.get("type", "Resource"))}</span></h3>
            <p class="entry-desc">{esc(entry.get("description", ""))}</p>
          </div>
          <div class="link-cell">{link}</div>
        </article>"""


def render(vault: dict) -> str:
    categories = vault.get("categories", [])
    total = sum(len(c.get("entries", [])) for c in categories)

    chips = ['<button class="chip" type="button" data-category="all" aria-pressed="true">All</button>']
    sections = []

    for index, category in enumerate(categories):
        name = category["name"]
        letter = LETTERS[index % len(LETTERS)]
        entries = category.get("entries", [])
        chips.append(
            f'<button class="chip" type="button" data-category="{esc(name)}" '
            f'aria-pressed="false">{esc(name)}</button>'
        )
        rows = "\n".join(
            render_entry(entry, name, f"{letter}{position}")
            for position, entry in enumerate(entries, 1)
        )
        sections.append(
            f"""      <section class="section">
        <div class="section-head">
          <span class="section-mark">{letter}</span>
          <h2>{esc(name)}</h2>
          <span class="section-count">{len(entries)} entries</span>
        </div>
{rows}
      </section>"""
        )

    pending = sum(1 for c in categories for e in c.get("entries", []) if not e.get("url"))
    notice = ""
    if pending:
        notice = f"""    <div class="notice">
      <span class="mono">!</span>
      <p style="margin:0"><strong>{pending} of {total} entries have no link yet.</strong>
      They were transcribed from a screenshot in which the URLs were truncated, so only the
      source domain is recorded. Add the real URLs to <span class="mono">vault.json</span> and
      re-run <span class="mono">build_vault.py</span>.</p>
    </div>"""

    return f"""<title>{esc(vault.get("title", "Resource Vault"))}</title>
<style>{STYLES}</style>
<div class="wrap">
  <header class="masthead">
    <span class="eyebrow">Personal index</span>
    <h1>{esc(vault.get("title", "Resource Vault"))}</h1>
    <p class="lede">{esc(vault.get("subtitle", ""))}</p>
    <p class="meta"><span id="tally">{total} resources</span> &middot; {len(categories)} categories
      &middot; updated {esc(vault.get("updated", ""))}</p>
  </header>

{notice}

  <div class="toolbar">
    <div class="searchbox">
      <input id="search" type="search" placeholder="Search titles, descriptions, tags&hellip;"
             autocomplete="off" aria-label="Search the vault">
      <span class="hint mono">press /</span>
    </div>
    <div class="chips" role="group" aria-label="Filter by category">
      {"".join(chips)}
    </div>
  </div>

  <main>
{chr(10).join(sections)}
    <p class="empty" id="empty">No entries match that search.</p>
  </main>

  <footer>
    Built from <span class="mono">vault.json</span> by <span class="mono">build_vault.py</span>.<br>
    Search and browse the same data from the terminal with
    <span class="mono">/vault</span> in <span class="mono">assistant.py</span>.
  </footer>
</div>
<script>{SCRIPT}</script>
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default=str(ROOT / "vault.html"), help="output HTML path")
    args = parser.parse_args()

    with open(VAULT_FILE) as f:
        vault = json.load(f)

    output = Path(args.out)
    output.write_text(render(vault))

    total = sum(len(c.get("entries", [])) for c in vault.get("categories", []))
    print(f"Wrote {output} — {total} entries across {len(vault.get('categories', []))} categories.")


if __name__ == "__main__":
    main()
