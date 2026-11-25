import { cn } from "@/lib/utils";

/**
 * The one page width used everywhere (headers, sections, app pages, auth pages, footer),
 * so margins and side padding always line up.
 */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
