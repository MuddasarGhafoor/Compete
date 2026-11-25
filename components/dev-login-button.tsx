import { Wrench } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isDevLoginEnabled } from "@/lib/dev-auth";
import { cn } from "@/lib/utils";

/** dev-login: navbar icon that opens the app as the Dev User. Renders nothing unless enabled. */
export function DevLoginButton() {
  if (!isDevLoginEnabled) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        // Plain <a> (not next/link) so the page never prefetches it.
        render={<a href="/dev-login" />}
        aria-label="Open the app as Dev User"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-lg" }),
          "text-amber-700 dark:text-amber-400",
        )}
      >
        <Wrench />
      </TooltipTrigger>
      <TooltipContent>Dev login: open the app without signing in</TooltipContent>
    </Tooltip>
  );
}
