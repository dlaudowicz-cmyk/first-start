"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { FILE_CATEGORY_KEYS, MAX_FILE_BYTES, sanitizeFilename, formatBytes } from "@/lib/project-files";
import { deleteProjectFile, writeProjectFile } from "@/lib/project-files-storage";

export type UploadResult = { ok: true; name: string } | { ok: false; error: string };

export async function uploadProjectFile(projectId: string, formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  const rawCategory = String(formData.get("category") || "other");
  const notes = String(formData.get("notes") || "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `File is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_FILE_BYTES)}.` };
  }
  const category = FILE_CATEGORY_KEYS.includes(rawCategory) ? rawCategory : "other";

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) return { ok: false, error: "Project not found." };

  const originalName = sanitizeFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  const storedName = await writeProjectFile(projectId, originalName, bytes);

  await prisma.projectFile.create({
    data: {
      projectId,
      category,
      originalName,
      storedName,
      mimeType: file.type || "application/octet-stream",
      size: bytes.byteLength,
      notes: notes || null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { ok: true, name: originalName };
}

export async function removeProjectFile(fileId: string) {
  const record = await prisma.projectFile.findUnique({ where: { id: fileId } });
  if (!record) return;
  await deleteProjectFile(record.projectId, record.storedName);
  await prisma.projectFile.delete({ where: { id: fileId } });
  revalidatePath(`/projects/${record.projectId}`);
}
