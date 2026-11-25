import { NextResponse, type NextRequest } from "next/server";
import { DEV_USER, isDevLoginEnabled, setDevLoginCookie } from "@/lib/dev-auth";
import { prisma } from "@/lib/prisma";

// dev-login: GET /dev-login signs in as the Dev User and opens the Today page.
// It also makes sure the Dev User exists in the database, so habits etc. can be saved.
// Returns 404 unless dev login is enabled (never in production).
export async function GET(request: NextRequest) {
  if (!isDevLoginEnabled) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    await prisma.user.upsert({
      where: { id: DEV_USER.id },
      create: { id: DEV_USER.id, name: DEV_USER.name, email: DEV_USER.email, username: "dev" },
      update: {},
    });
  } catch (error) {
    console.warn("[dev login] Could not create the Dev User in the database.", error);
  }

  const response = NextResponse.redirect(new URL("/today", request.url));
  setDevLoginCookie(response);
  return response;
}
