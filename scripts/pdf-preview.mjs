/**
 * Renders a generated PDF to PNG so it can actually be looked at.
 *
 * A PDF that returns 200 and weighs 70 KB can still be wrong: the logo sat in a
 * grey box, the tagline was printed twice, and the footer ended in a dangling
 * separator — none of which any status code would have revealed.
 *
 * Usage:
 *   node scripts/pdf-preview.mjs /invoices/<id>/pdf out.png
 *   node scripts/pdf-preview.mjs ./some-file.pdf out.png
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [, , source, outPath = "pdf-preview.png"] = process.argv;
if (!source) {
  console.error("Aufruf: node scripts/pdf-preview.mjs <Pfad-oder-Route> [ausgabe.png]");
  process.exit(1);
}

const BASE = process.env.BASE_URL || "http://localhost:3000";

let bytes;
if (source.startsWith("/") && !fs.existsSync(source)) {
  const res = await fetch(BASE + source);
  if (!res.ok) {
    console.error(`${res.status} bei ${BASE + source}`);
    process.exit(1);
  }
  bytes = Buffer.from(await res.arrayBuffer());
} else {
  bytes = fs.readFileSync(source);
}

const lib = path.resolve("node_modules/pdfjs-dist/legacy/build/pdf.min.js");
const worker = path.resolve("node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js");
if (!fs.existsSync(lib)) {
  console.error("pdfjs-dist fehlt — npm install ausführen.");
  process.exit(1);
}

const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff">
<script src="file://${lib}"></script>
<div id="pages"></div>
<script>
window.__done = false;
pdfjsLib.GlobalWorkerOptions.workerSrc = "file://${worker}";
const raw = atob("${bytes.toString("base64")}");
const data = new Uint8Array(raw.length);
for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
pdfjsLib.getDocument({ data }).promise.then(async (pdf) => {
  for (let n = 1; n <= pdf.numPages; n++) {
    const p = await pdf.getPage(n);
    const viewport = p.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.display = "block";
    document.getElementById("pages").appendChild(canvas);
    await p.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  }
  window.__done = true;
}).catch((e) => { window.__err = String(e); window.__done = true; });
</script></body>`;

const tmpHtml = path.join(path.dirname(path.resolve(outPath)), ".pdf-preview.html");
fs.writeFileSync(tmpHtml, html);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
await page.goto("file://" + tmpHtml);
await page.waitForFunction("window.__done === true", null, { timeout: 60000 });

const err = await page.evaluate("window.__err || null");
if (err) {
  console.error("PDF konnte nicht gelesen werden:", err);
  await browser.close();
  fs.unlinkSync(tmpHtml);
  process.exit(1);
}

await page.locator("#pages").screenshot({ path: outPath });
await browser.close();
fs.unlinkSync(tmpHtml);
console.log("geschrieben:", outPath);
