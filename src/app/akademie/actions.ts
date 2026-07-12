"use server";

import { cookies } from "next/headers";
import { ACADEMY_ROLE_COOKIE, type AcademyRole } from "@/lib/academy-role";

export async function setAcademyRole(role: AcademyRole) {
  const store = await cookies();
  store.set(ACADEMY_ROLE_COOKIE, role, { path: "/" });
}
