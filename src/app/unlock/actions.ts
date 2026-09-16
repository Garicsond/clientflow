"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  passwordsMatch,
  SITE_UNLOCK_COOKIE,
  siteUnlockToken,
} from "@/lib/site-auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function unlockSite(formData: FormData) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    redirect("/");
  }

  const password = String(formData.get("password") ?? "");
  if (!passwordsMatch(password, expected)) {
    redirect("/unlock?error=1");
  }

  const jar = await cookies();
  jar.set(SITE_UNLOCK_COOKIE, siteUnlockToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/");
}

export async function lockSite() {
  const jar = await cookies();
  jar.delete(SITE_UNLOCK_COOKIE);
  redirect("/unlock");
}
