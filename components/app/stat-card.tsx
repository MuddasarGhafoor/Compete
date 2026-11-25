import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** Colors the icon with the warm accent (streaks, first place). */
  tone?: "default" | "warm" | "primary";
};

/**
 * A small stat tile. Compact on phones (so three fit in a row), roomier from `sm` up.
 * Put tiles in a grid like `grid grid-cols-3 gap-2 sm:gap-4`.
 */
export function StatCard({ icon: Icon, label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <Card size="sm" className="min-w-0">
      <CardContent className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
          <Icon
            className={cn(
              "hidden size-4 shrink-0 sm:block",
              tone === "warm" && "text-warm",
              tone === "primary" && "text-primary",
              tone === "default" && "text-muted-foreground",
            )}
          />
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</p>
          {hint && <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-xs">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
