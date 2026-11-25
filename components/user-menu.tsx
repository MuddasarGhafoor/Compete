"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import {
  ChevronsUpDown,
  Loader2,
  Lock,
  LogOut,
  Moon,
  Settings,
  SquareArrowOutUpRight,
  Sun,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/app/actions/auth";
import { lockApp } from "@/app/actions/lock";
import { PinDialog } from "@/components/pin-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/lib/session";
import { getAppliedTheme, setTheme, subscribeToTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type DevAccount = { id: string; name: string; username: string | null };

/** Round avatar with the first letter of the name. */
export function AccountAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function MenuHeader({ user }: { user: CurrentUser }) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
        <AccountAvatar name={user.name} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
          <span className="block truncate text-xs font-normal">{user.email}</span>
        </span>
      </DropdownMenuLabel>
      {user.isDevUser && (
        <DropdownMenuLabel className="flex items-center gap-1.5 px-2 pt-0 pb-1.5 text-amber-700 dark:text-amber-400">
          <Wrench className="size-3.5" />
          Signed in with dev login
        </DropdownMenuLabel>
      )}
    </DropdownMenuGroup>
  );
}

function ThemeMenuItem() {
  const theme = useSyncExternalStore(subscribeToTheme, getAppliedTheme, () => "light" as Theme);
  const dark = theme === "dark";
  return (
    <DropdownMenuItem closeOnClick={false} onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Sun /> : <Moon />}
      {dark ? "Light mode" : "Dark mode"}
    </DropdownMenuItem>
  );
}

/** dev-login: switch between the Dev User and the seeded test users. */
function DevSwitchMenu({ accounts, currentId }: { accounts: DevAccount[]; currentId: string }) {
  if (accounts.length === 0) return null;
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Users />
          Switch test user
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-56">
          {accounts.map((account) => (
            // Plain <a>: /dev-login is a route handler that sets a cookie, so it must not be prefetched.
            <DropdownMenuItem key={account.id} render={<a href={`/dev-login?as=${account.id}`} />} disabled={account.id === currentId}>
              <span className="min-w-0 flex-1 truncate">{account.name}</span>
              {account.username && <span className="text-xs text-muted-foreground">@{account.username}</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  );
}

type AppAccountMenuProps = {
  user: CurrentUser;
  /** "sidebar" = full-width row; "compact" = avatar button for the phone top bar. */
  variant?: "sidebar" | "compact";
  devAccounts?: DevAccount[];
};

/** Account menu inside the app: settings, theme, help, lock and sign out. */
export function AppAccountMenu({ user, variant = "sidebar", devAccounts = [] }: AppAccountMenuProps) {
  const [locking, startLock] = useTransition();
  const [signingOut, startSignOut] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const sidebar = variant === "sidebar";

  function lock() {
    startLock(async () => {
      const result = await lockApp();
      // Success redirects home. No PIN yet: close the menu, create one, then lock.
      if (result?.needsPin) {
        setMenuOpen(false);
        setPinOpen(true);
      } else if (result && !result.ok) toast.error(result.error);
    });
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className={cn(
            "flex items-center gap-3 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted",
            sidebar ? "w-full rounded-lg p-2" : "rounded-full p-0.5",
          )}
        >
          <AccountAvatar name={user.name} className={sidebar ? "size-9" : undefined} />
          {sidebar && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={sidebar ? "top" : "bottom"}
          align={sidebar ? "start" : "end"}
          sideOffset={8}
          // Same width as the sidebar button; a fixed width on phones.
          className={sidebar ? "w-(--anchor-width) min-w-56" : "w-64"}
        >
          <MenuHeader user={user} />
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <ThemeMenuItem />
          {/* dev-login */}
          {user.isDevUser && <DevSwitchMenu accounts={devAccounts} currentId={user.id} />}
          <DropdownMenuSeparator />
          <DropdownMenuItem closeOnClick={false} disabled={locking} onClick={lock}>
            {locking ? <Loader2 className="animate-spin" /> : <Lock />}
            Lock
            <span className="ml-auto text-xs text-muted-foreground">PIN</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={signingOut}
            onClick={() => startSignOut(() => signOut())}
          >
            {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} mode="create" lockAfterCreate />
    </>
  );
}

/**
 * Home page account menu (signed-in visitors): avatar only. "Open app" asks for the PIN when the
 * app is locked; "Sign out" asks for confirmation.
 */
export function HomeAccountMenu({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [pinOpen, setPinOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className="rounded-full p-0.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
        >
          <AccountAvatar name={user.name} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-64">
          <MenuHeader user={user} />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => (user.locked ? setPinOpen(true) : router.push("/today"))}>
            <SquareArrowOutUpRight />
            Open app
            {user.locked && <Lock className="ml-auto size-3.5 text-muted-foreground" />}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PinDialog open={pinOpen} onOpenChange={setPinOpen} mode="unlock" />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need your email and password to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={signingOut} onClick={() => startSignOut(() => signOut())}>
              {signingOut && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Sign out
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** "Open app" button for the home page: asks for the PIN when the app is locked. */
export function OpenAppButton({ locked, label, className }: { locked: boolean; label: string; className?: string }) {
  const [pinOpen, setPinOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <Button size="lg" className={className} onClick={() => (locked ? setPinOpen(true) : router.push("/today"))}>
        {locked && <Lock data-icon="inline-start" />}
        {label}
      </Button>
      <PinDialog open={pinOpen} onOpenChange={setPinOpen} mode="unlock" />
    </>
  );
}
