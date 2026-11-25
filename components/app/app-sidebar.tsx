import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { AppAccountMenu } from "@/components/user-menu";
import { getCurrentUser, getDevAccounts } from "@/lib/session";
import { SidebarNav, SidebarNavFallback } from "./app-nav";

/**
 * Desktop sidebar: logo (links to Today, not the home page), a divider, the main nav, and the
 * account button at the bottom (settings, theme, help, lock and sign out live in its menu).
 */
export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Logo href="/today" />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <Suspense fallback={<SidebarNavFallback />}>
          <SidebarNav />
        </Suspense>
      </div>

      <div className="shrink-0 border-t p-3">
        {/* Reads the session, so it streams in behind a Suspense boundary. */}
        <Suspense fallback={<div className="h-[52px] animate-pulse rounded-lg bg-muted" />}>
          <SidebarAccount />
        </Suspense>
      </div>
    </aside>
  );
}

async function SidebarAccount() {
  const user = await getCurrentUser();
  if (!user) return null;
  const devAccounts = user.isDevUser ? await getDevAccounts() : []; // dev-login
  return <AppAccountMenu user={user} variant="sidebar" devAccounts={devAccounts} />;
}
