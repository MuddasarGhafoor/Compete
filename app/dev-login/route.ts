import { NextResponse, type NextRequest } from "next/server";
import { isDevLoginEnabled, setDevLoginCookie } from "@/lib/dev-auth";

// dev-login: GET /dev-login signs in as the Dev User and opens the Today page.
// Returns 404 unless dev login is enabled (never in production).
export function GET(request: NextRequest) {
  if (!isDevLoginEnabled) {
    return new NextResponse("Not found", { status: 404 });
  }

  const response = NextResponse.redirect(new URL("/today", request.url));
  setDevLoginCookie(response);
  return response;
}
