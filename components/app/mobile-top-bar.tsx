import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { AppAccountMenu } from "@/components/user-menu";
import { getCurrentUser, getDevAccounts } from "@/lib/session";

/** Slim top bar for phones and tablets (the sidebar takes over on desktop). */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm lg:hidden">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/today" />
        {/* Reads the session, so it streams in behind a Suspense boundary. */}
        <Suspense fallback={<div className="size-9 animate-pulse rounded-full bg-muted" />}>
          <TopBarAccount />
        </Suspense>
      </div>
    </header>
  );
}

async function TopBarAccount() {
  const user = await getCurrentUser();
  if (!user) return null;
  const devAccounts = user.isDevUser ? await getDevAccounts() : []; // dev-login
  return <AppAccountMenu user={user} variant="compact" devAccounts={devAccounts} />;
}
