import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { readProjectFile } from "@/lib/project-files-storage";

export const dynamic = "force-dynamic";

/**
 * Streams a project document. Files are stored outside `public/`, so this is
 * the only way to read them — which keeps contracts off guessable URLs.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  const record = await prisma.projectFile.findUnique({ where: { id: fileId } });
  // Guard against a file id from a different project being requested here.
  if (!record || record.projectId !== id) notFound();

  const bytes = await readProjectFile(record.projectId, record.storedName);
  if (!bytes) notFound();

  // `attachment` for everything: we never render untrusted uploads inline.
  const filename = record.originalName.replace(/"/g, "");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": record.mimeType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(bytes.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
