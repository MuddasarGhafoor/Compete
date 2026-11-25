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
  // Pages that need a signed-in user.
  matcher: ["/today/:path*"],
};
