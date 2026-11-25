"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CalendarCheck, ChevronDown, Loader2, LogOut } from "lucide-react";
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
import type { CurrentUser } from "@/lib/session";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

export function UserMenu({ user }: { user: CurrentUser }) {
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate font-medium sm:inline">{user.name}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
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
