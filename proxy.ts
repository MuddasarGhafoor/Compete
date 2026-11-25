import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth";

// Quick check for a session cookie only. Pages still verify the session on the server.
export function proxy(request: NextRequest) {
  if (!isDevAuthBypassEnabled && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Pages that need a signed-in user.
  matcher: ["/today/:path*"],
};
