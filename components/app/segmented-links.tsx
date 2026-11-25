import Link from "next/link";
import { cn } from "@/lib/utils";

type SegmentedLinksProps = {
  items: { href: string; label: string; active: boolean }[];
  className?: string;
};

/** A small segmented control made of links (keeps the choice in the URL). */
export function SegmentedLinks({ items, className }: SegmentedLinksProps) {
  return (
    <div className={cn("inline-flex rounded-lg bg-muted p-1", className)} role="tablist">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          role="tab"
          aria-selected={item.active}
          scroll={false}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            item.active ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
