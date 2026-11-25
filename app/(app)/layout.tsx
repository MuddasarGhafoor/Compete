import { AppSidebar } from "@/components/app/app-sidebar";
import { MobileTabBar } from "@/components/app/app-nav";
import { MobileTopBar } from "@/components/app/mobile-top-bar";
import { Container } from "@/components/container";

/*
 * Shell for every signed-in page:
 *   desktop = sidebar on the left, page on the right
 *   phones  = top bar, page, bottom tab bar
 * Auth is checked in each page (requireUser) and in proxy.ts, not here.
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
        <MobileTabBar />
      </div>
    </div>
  );
}
