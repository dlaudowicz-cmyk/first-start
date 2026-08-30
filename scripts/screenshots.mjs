/**
 * Nimmt Screenshots aller Hauptseiten auf, damit Änderungen an der Oberfläche
 * überprüfbar sind statt nur behauptet. Der Dev-Server muss laufen.
 *
 *   npm run dev            # in einem Terminal
 *   npm run screenshots    # in einem zweiten
 *
 * Ergebnis liegt in screenshots/ (gitignored).
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "screenshots";

/** Seiten mit fester URL. Detailseiten werden unten dynamisch ermittelt. */
const PAGES = [
  ["dashboard", "/"],
  ["clients", "/clients"],
  ["projects", "/projects"],
  ["offers", "/offers"],
  ["invoices", "/invoices"],
  ["expenses", "/expenses"],
  ["ventures", "/ventures"],
  ["people", "/people"],
  ["contracts", "/contracts"],
  ["vault", "/vault"],
  ["tools", "/tools"],
  ["tasks", "/tasks"],
  ["assistant", "/assistant"],
  ["settings", "/settings"],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  // Der vorinstallierte Browser der Umgebung; lokal faellt Playwright selbst zurueck.
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();

const problems = [];
page.on("pageerror", (e) => problems.push("JS-Fehler: " + String(e).slice(0, 200)));

let failed = 0;
for (const [name, path] of PAGES) {
  const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
  const status = res?.status() ?? 0;
  if (status >= 400) { failed++; problems.push(`${path} -> HTTP ${status}`); }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(String(status).padEnd(4), path.padEnd(14), "->", `${name}.png`);
}

// Eine Projekt-Detailseite mitnehmen — dort sitzen Pipeline-Panel und Datei-Vault.
await page.goto(BASE + "/projects", { waitUntil: "networkidle" });
const href = await page.locator('a[href^="/projects/c"]').first().getAttribute("href").catch(() => null);
if (href) {
  await page.goto(BASE + href, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/project-detail.png` });
  console.log("200 ", "projekt-detail".padEnd(14), "-> project-detail.png");
}

await browser.close();

console.log("---");
if (problems.length) {
  console.log("Probleme:\n  " + [...new Set(problems)].join("\n  "));
  process.exit(failed > 0 ? 1 : 0);
}
console.log("Alle Seiten laden fehlerfrei.");
