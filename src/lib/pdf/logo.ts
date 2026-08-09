import { promises as fs } from "fs";
import path from "path";

/**
 * @react-pdf renders raster images only — PNG and JPEG. An SVG logo is still
 * valid for the web UI, so we fall back to the text wordmark rather than
 * failing the PDF.
 */
const EMBEDDABLE: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/**
 * Reads the uploaded logo and returns it as a data URI for @react-pdf.
 * Returns null when there is no logo, the format is not embeddable, or the
 * file has gone missing — every caller treats null as "use the wordmark".
 */
export async function loadLogoDataUri(logoPath: string | null | undefined): Promise<string | null> {
  if (!logoPath) return null;

  const ext = path.extname(logoPath).toLowerCase();
  const mime = EMBEDDABLE[ext];
  if (!mime) return null;

  // logoPath is a public URL path like "/uploads/logo-123.png".
  const absolute = path.join(process.cwd(), "public", logoPath.replace(/^\/+/, ""));

  // Keep the read inside public/uploads even if the stored path contains "..".
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (!absolute.startsWith(uploadsRoot + path.sep)) return null;

  try {
    const buffer = await fs.readFile(absolute);
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}
