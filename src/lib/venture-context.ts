import { cookies } from "next/headers";
import { prisma } from "./db";

export const VENTURE_COOKIE = "pushlabs.venture";

export type ActiveVenture = { id: string; name: string; slug: string; accent: string | null } | null;

/**
 * The venture the user is currently scoped to, or null for the holding view
 * ("All ventures"). Stored in a cookie so server components can read it
 * without prop-drilling.
 */
export async function getActiveVenture(): Promise<ActiveVenture> {
  const store = await cookies();
  const slug = store.get(VENTURE_COOKIE)?.value;
  if (!slug || slug === "all") return null;
  const venture = await prisma.venture.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, accent: true },
  });
  return venture ?? null;
}

/**
 * Prisma `where` fragment for venture-scoped records. Returns `{}` in holding
 * view so queries stay unfiltered.
 */
export function ventureScope(active: ActiveVenture): { ventureId?: string } {
  return active ? { ventureId: active.id } : {};
}

/** Clients relate n:m, so they need a nested filter instead of a plain field. */
export function clientVentureScope(active: ActiveVenture) {
  return active ? { ventures: { some: { ventureId: active.id } } } : {};
}

export async function listVentures() {
  return prisma.venture.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, accent: true, status: true },
  });
}
