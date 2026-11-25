import { Suspense } from "react";
import { Wrench } from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

/** Top bar for signed-in pages. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        {/* Reads the session, so it streams in behind a Suspense boundary. */}
        <Suspense fallback={<div className="size-8 animate-pulse rounded-full bg-muted" />}>
          <HeaderAccount />
        </Suspense>
      </div>
    </header>
  );
}

async function HeaderAccount() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {user.isDevUser && (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400"
        >
          <Wrench />
          Dev login
        </Badge>
      )}
      <UserMenu user={user} />
    </div>
  );
}
