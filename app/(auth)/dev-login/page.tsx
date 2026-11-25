import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Wrench } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DEV_USER, isDevLoginEnabled } from "@/lib/dev-auth";
import { devLogin } from "./actions";

// Development-only page. Delete this folder to remove dev login (see lib/dev-auth.ts).

export const metadata: Metadata = {
  title: "Developer login",
};

export default function DevLoginPage() {
  if (!isDevLoginEnabled) notFound();

  return (
    <div className="w-full space-y-6">
      <div className="space-y-3">
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400"
        >
          <Wrench />
          Development only
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Developer login</h1>
        <p className="text-sm text-muted-foreground">
          Skip signing in while you build. The test user isn&apos;t saved in the database, so
          use a real account to test saving data.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
        <Avatar>
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">DU</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{DEV_USER.name}</p>
          <p className="truncate text-xs text-muted-foreground">{DEV_USER.email}</p>
        </div>
      </div>

      <form action={devLogin}>
        <SubmitButton pendingText="Signing in…">Continue as Dev User</SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Use a real account instead
        </Link>
      </p>
    </div>
  );
}
