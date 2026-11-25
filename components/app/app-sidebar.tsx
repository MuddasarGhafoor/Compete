import { Suspense } from "react";
import { Wrench } from "lucide-react";
import { FaqLink } from "@/components/faq-link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";
import { SidebarNav } from "./app-nav";

/** Desktop sidebar: logo, main nav, and account + theme at the bottom. */
export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Logo />
      </div>

      <div className="mt-2 flex-1 overflow-y-auto">
        <SidebarNav />
      </div>

      <div className="shrink-0 space-y-1 border-t p-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted-foreground">Theme and help</span>
          <div className="flex items-center">
            <ThemeToggle />
            <FaqLink />
          </div>
        </div>
        {/* Reads the session, so it streams in behind a Suspense boundary. */}
        <Suspense fallback={<div className="h-14 animate-pulse rounded-lg bg-muted" />}>
          <SidebarAccount />
        </Suspense>
      </div>
    </aside>
  );
}

async function SidebarAccount() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-1">
      {user.isDevUser && (
        <p className="flex items-center gap-1.5 px-2 text-xs font-medium text-amber-700 dark:text-amber-400">
          <Wrench className="size-3.5" />
          Signed in with dev login
        </p>
      )}
      <UserMenu user={user} variant="sidebar" />
    </div>
  );
}
