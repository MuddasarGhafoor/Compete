import { NextResponse, type NextRequest } from "next/server";
import { DEV_USER, isDevAccount, isDevLoginEnabled, setDevLoginCookie } from "@/lib/dev-auth";
import { prisma } from "@/lib/prisma";

// dev-login: GET /dev-login[?as=<user id>] signs in as the Dev User or a seeded test user,
// then opens the Today page. Returns 404 unless dev login is enabled (never in production).
export async function GET(request: NextRequest) {
  if (!isDevLoginEnabled) {
    return new NextResponse("Not found", { status: 404 });
  }

  const requested = request.nextUrl.searchParams.get("as") ?? DEV_USER.id;

  try {
    if (requested === DEV_USER.id) {
      await prisma.user.upsert({
        where: { id: DEV_USER.id },
        create: { id: DEV_USER.id, name: DEV_USER.name, email: DEV_USER.email, username: "dev" },
        update: {},
      });
    } else {
      const user = await prisma.user.findUnique({ where: { id: requested }, select: { id: true, email: true } });
      if (!user || !isDevAccount(user)) {
        return new NextResponse("Only the Dev User and seeded test users can be used with dev login.", { status: 403 });
      }
    }
  } catch (error) {
    console.warn("[dev login] Database error.", error);
  }

  const response = NextResponse.redirect(new URL("/today", request.url));
  setDevLoginCookie(response, requested);
  return response;
}
