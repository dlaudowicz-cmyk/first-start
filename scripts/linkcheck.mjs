/**
 * Crawls every page of the running app and reports dead internal links and
 * JavaScript errors.
 *
 * This exists because a search-and-replace during the German translation pass
 * rewrote `/invoices` to `/Rechnungen` inside href strings. Every page still
 * returned 200 — but the sidebar entry, the "Neue Rechnung" button and every
 * link into an invoice pointed at a route that does not exist. Checking pages
 * alone would not have found it; only following the links did.
 *
 * Usage: npm run dev, then `npm run linkcheck`
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const MAX_PAGES = 120;

const SEEDS = [
  "/", "/ventures", "/projects", "/clients", "/offers", "/invoices", "/expenses",
  "/tasks", "/people", "/contracts", "/vault", "/tools", "/assistant", "/settings",
];

/** Downloads and generated files — fetching them here would only be slow. */
const SKIP = /\/(pdf|report|dossier|export|backup|zugferd\.json)$/;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage();

const seen = new Set();
const queue = [...SEEDS];
const problems = [];

while (queue.length && seen.size < MAX_PAGES) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);

  const jsErrors = [];
  page.removeAllListeners("pageerror");
  page.on("pageerror", (e) => jsErrors.push(String(e)));

  let res;
  try {
    res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    problems.push(`ERR   ${path} — ${e.message.split("\n")[0]}`);
    continue;
  }
  if (res.status() !== 200) problems.push(`${res.status()}   ${path}`);
  if (jsErrors.length) problems.push(`JS    ${path} — ${jsErrors[0]}`);

  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  for (const h of hrefs) {
    if (h && h.startsWith("/") && !SKIP.test(h)) queue.push(h);
  }
}

console.log(`Geprüfte Seiten: ${seen.size}`);
if (problems.length === 0) {
  console.log("Keine toten Links, keine JS-Fehler.");
} else {
  console.log("\nProbleme:");
  for (const p of problems) console.log("  " + p);
}

await browser.close();
process.exit(problems.length === 0 ? 0 : 1);
