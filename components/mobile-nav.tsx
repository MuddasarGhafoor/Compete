"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

/** Section links for small screens, in a custom dropdown. */
export function MobileNav({ links }: { links: NavLink[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open menu"
        className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }), "md:hidden")}
      >
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
            {link.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
