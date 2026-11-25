"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CalendarCheck, ChevronDown, ChevronsUpDown, Loader2, LogOut, Settings, Swords } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/format";
import type { CurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  user: CurrentUser;
  /** "compact" = avatar pill for top bars; "sidebar" = full-width row for the sidebar footer. */
  variant?: "compact" | "sidebar";
};

export function UserMenu({ user, variant = "compact" }: UserMenuProps) {
  const [pending, startTransition] = useTransition();
  const sidebar = variant === "sidebar";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={cn(
          "flex items-center gap-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted",
          sidebar ? "w-full rounded-lg p-2 text-left" : "rounded-full py-1 pr-2 pl-1",
        )}
      >
        <Avatar size={sidebar ? "default" : "sm"}>
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        {sidebar ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </>
        ) : (
          <>
            <span className="hidden max-w-32 truncate font-medium sm:inline">{user.name}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={sidebar ? "top" : "bottom"}
        align={sidebar ? "start" : "end"}
        className="w-60"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-0.5 px-2 py-1.5">
            <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="block truncate text-xs font-normal">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/today" />}>
          <CalendarCheck />
          Today
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/challenges" />}>
          <Swords />
          Challenges
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={() => startTransition(() => signOut())}
        >
          {pending ? <Loader2 className="animate-spin" /> : <LogOut />}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
