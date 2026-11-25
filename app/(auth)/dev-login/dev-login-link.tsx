import Link from "next/link";
import { Wrench } from "lucide-react";
import { isDevLoginEnabled } from "@/lib/dev-auth";

/** Small link to /dev-login. Renders nothing unless dev login is enabled. */
export function DevLoginLink() {
  if (!isDevLoginEnabled) return null;

  return (
    <Link
      href="/dev-login"
      className="mx-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
    >
      <Wrench className="size-3.5" />
      Developer login
    </Link>
  );
}
