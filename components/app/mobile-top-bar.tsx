import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

/** Slim top bar for phones and tablets (the sidebar takes over on desktop). */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm lg:hidden">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Reads the session, so it streams in behind a Suspense boundary. */}
          <Suspense fallback={<div className="size-8 animate-pulse rounded-full bg-muted" />}>
            <TopBarAccount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function TopBarAccount() {
  const user = await getCurrentUser();
  return user ? <UserMenu user={user} /> : null;
}
