import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Icon-only link to the FAQ page, for the headers. */
export function FaqLink() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Link href="/faq" />}
        aria-label="FAQ"
        className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
      >
        <CircleHelp />
      </TooltipTrigger>
      <TooltipContent>FAQ</TooltipContent>
    </Tooltip>
  );
}
