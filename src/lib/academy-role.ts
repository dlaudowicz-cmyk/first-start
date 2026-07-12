import { cookies } from "next/headers";

// Click-dummy stand-in for auth: no login exists yet (see docs/ACADEMY-PLAN.md §9),
// so the "current view" is just a cookie-backed role switcher instead of a session.
export type AcademyRole = "teilnehmer" | "dozent" | "admin";

export const ACADEMY_ROLE_COOKIE = "academy_role";

export async function getAcademyRole(): Promise<AcademyRole> {
  const store = await cookies();
  const value = store.get(ACADEMY_ROLE_COOKIE)?.value;
  if (value === "dozent" || value === "admin") return value;
  return "teilnehmer";
}
