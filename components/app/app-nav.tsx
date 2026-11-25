"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { MotionProvider } from "@/components/motion";
import { cn } from "@/lib/utils";
import { appNavItems, tabBarItems } from "./nav-items";

/*
 * usePathname() is request data on dynamic routes, so with Cache Components these navs must sit
 * inside <Suspense>. The parents render `pathname={null}` versions as the fallback (same layout,
 * no active highlight), then the live versions stream in.
 */

/** Spinner shown on a link while its page is loading (instant feedback on click). */
function PendingSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return pending ? <Loader2 aria-hidden className={cn("size-3.5 animate-spin text-muted-foreground", className)} /> : null;
}

function isActive(pathname: string | null, href: string) {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

function SidebarLinks({ pathname }: { pathname: string | null }) {
  return (
    <MotionProvider>
      <nav aria-label="Main" className="space-y-1 px-3">
        {appNavItems.map(({ href, label, icon: Icon, soon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? "text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg border bg-card shadow-xs"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <Icon className={cn("relative size-4.5 shrink-0", active && "text-primary")} />
              <span className="relative">{label}</span>
              {soon && (
                <span className="relative ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Soon
                </span>
              )}
              <PendingSpinner className="relative ml-auto" />
            </Link>
          );
        })}
      </nav>
    </MotionProvider>
  );
}

function TabBarLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {tabBarItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors outline-none focus-visible:bg-muted",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" />}
                <PendingSpinner className="absolute top-1.5 right-3" />
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Vertical nav for the desktop sidebar. The active highlight slides between items. */
export function SidebarNav() {
  return <SidebarLinks pathname={usePathname()} />;
}

export function SidebarNavFallback() {
  return <SidebarLinks pathname={null} />;
}

/** Bottom tab bar for phones and tablets. */
export function MobileTabBar() {
  return <TabBarLinks pathname={usePathname()} />;
}

export function MobileTabBarFallback() {
  return <TabBarLinks pathname={null} />;
}
