import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { hasDevLoginCookie } from "@/lib/dev-auth"; // dev-login

// Quick check for a session cookie only. Pages still verify the session on the server.
export function proxy(request: NextRequest) {
  const hasSession =
    Boolean(getSessionCookie(request)) ||
    hasDevLoginCookie(request); // dev-login

  if (!hasSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Every signed-in page (the app/(app) route group). Must be a literal list for Next.js;
  // keep it in sync with components/app/nav-items.ts when adding pages.
  matcher: [
    "/today/:path*",
    "/habits/:path*",
    "/progress/:path*",
    "/leaderboard/:path*",
    "/friends/:path*",
    "/challenges/:path*",
    "/settings/:path*",
  ],
};
