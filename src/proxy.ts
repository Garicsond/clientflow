import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidUnlockToken, SITE_UNLOCK_COOKIE } from "@/lib/site-auth";

export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  const isProd = process.env.NODE_ENV === "production";
  const { pathname } = request.nextUrl;
  const isUnlock = pathname === "/unlock" || pathname.startsWith("/unlock/");

  if (isUnlock) {
    return NextResponse.next();
  }

  if (!password) {
    if (!isProd) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/unlock";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(SITE_UNLOCK_COOKIE)?.value;
  if (isValidUnlockToken(token)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
