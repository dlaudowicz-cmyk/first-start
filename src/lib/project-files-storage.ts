import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { extensionOf } from "./project-files";

/**
 * Server-only filesystem access for project documents.
 *
 * Project documents are deliberately NOT under `public/`: contracts and
 * briefings should not be reachable by guessing a URL. They are streamed
 * through `/projects/[id]/files/[fileId]` instead.
 */
function projectDir(projectId: string): string {
  // basename() on the id blocks a crafted id from escaping the storage root.
  return path.join(process.cwd(), "storage", "projects", path.basename(projectId));
}

/** Writes the bytes and returns the opaque stored filename. */
export async function writeProjectFile(projectId: string, originalName: string, bytes: Buffer): Promise<string> {
  const dir = projectDir(projectId);
  await fs.mkdir(dir, { recursive: true });
  // A UUID keeps the stored name unique and unguessable while preserving the
  // extension so downloads open in the right application.
  const storedName = `${randomUUID()}${extensionOf(originalName)}`;
  await fs.writeFile(path.join(dir, storedName), bytes);
  return storedName;
}

/**
 * Resolves a stored file to an absolute path, refusing anything that would
 * escape the project's own directory.
 */
export function resolveProjectFile(projectId: string, storedName: string): string | null {
  const dir = projectDir(projectId);
  const absolute = path.join(dir, path.basename(storedName));
  if (!absolute.startsWith(dir + path.sep)) return null;
  return absolute;
}

export async function readProjectFile(projectId: string, storedName: string): Promise<Buffer | null> {
  const absolute = resolveProjectFile(projectId, storedName);
  if (!absolute) return null;
  try {
    return await fs.readFile(absolute);
  } catch {
    return null;
  }
}

export async function deleteProjectFile(projectId: string, storedName: string): Promise<void> {
  const absolute = resolveProjectFile(projectId, storedName);
  if (!absolute) return;
  // A missing file is not an error — the metadata row is the source of truth.
  await fs.rm(absolute, { force: true });
}
