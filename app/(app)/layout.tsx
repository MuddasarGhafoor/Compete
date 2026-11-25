import { Suspense } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { MobileTabBar, MobileTabBarFallback } from "@/components/app/app-nav";
import { MobileTopBar } from "@/components/app/mobile-top-bar";
import { TimezoneSync } from "@/components/app/timezone-sync";
import { Container } from "@/components/container";
import { getCurrentUser } from "@/lib/session";

/*
 * Shell for every signed-in page:
 *   desktop = sidebar on the left, page on the right
 *   phones  = top bar, page, bottom tab bar
 * Auth is checked in each page (requireUser / getViewer) and in proxy.ts, not here.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        {/* Bottom padding keeps content clear of the phone tab bar. */}
        <main className="flex-1 pb-24 lg:pb-0">
          <Container className="py-8 sm:py-10 lg:py-12">{children}</Container>
        </main>
        <Suspense fallback={<MobileTabBarFallback />}>
          <MobileTabBar />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <TimezoneSyncLoader />
      </Suspense>
    </div>
  );
}

/** Saves the browser's timezone on first visit (reads the session, so it's suspended). */
async function TimezoneSyncLoader() {
  const user = await getCurrentUser();
  return user ? <TimezoneSync current={user.timezone} /> : null;
}
