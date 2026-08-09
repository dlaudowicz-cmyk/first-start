"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { VENTURE_COOKIE } from "@/lib/venture-context";

/** Switch the active venture scope. Pass "all" for the holding view. */
export async function setActiveVenture(slug: string) {
  const store = await cookies();
  store.set(VENTURE_COOKIE, slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
