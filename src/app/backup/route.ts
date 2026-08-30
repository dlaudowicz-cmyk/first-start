import { buildBackup } from "@/lib/backup";

export const dynamic = "force-dynamic";

/** Lädt eine Vollsicherung als ZIP herunter — Datenbank plus alle Dateien. */
export async function GET() {
  const { archive, filename } = await buildBackup();

  return new Response(new Uint8Array(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(archive.byteLength),
    },
  });
}
