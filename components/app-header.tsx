import { Suspense } from "react";
import { Wrench } from "lucide-react";
import { Container } from "@/components/container";
import { FaqLink } from "@/components/faq-link";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

/** Top bar for signed-in pages. Same height and width as the public header. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        {/* Reads the session, so it streams in behind a Suspense boundary. */}
        <Suspense fallback={<div className="size-8 animate-pulse rounded-full bg-muted" />}>
          <HeaderAccount />
        </Suspense>
      </Container>
    </header>
  );
}

async function HeaderAccount() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="flex items-center gap-1.5">
      <FaqLink />
      {user.isDevUser && (
        <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-400">
          <Wrench />
          Dev login
        </Badge>
      )}
      <UserMenu user={user} />
    </div>
  );
}
