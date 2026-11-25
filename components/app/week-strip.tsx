import Link from "next/link";
import { WEEKDAY_SHORT, formatDay, weekdayIndex, type DateStr } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type WeekStripDay = {
  date: DateStr;
  percent: number | null;
  isToday: boolean;
  isFuture: boolean;
  isSelected?: boolean;
  /** Set to make the day clickable (only today and yesterday can be edited). */
  href?: string;
};

/** Monday–Sunday with a small bar showing how much of each day was completed. */
export function WeekStrip({ days }: { days: WeekStripDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.map((day) => {
        const content = (
          <>
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              {WEEKDAY_SHORT[weekdayIndex(day.date)]}
            </span>
            <span className={cn("text-sm font-semibold tabular-nums", day.isFuture && "text-muted-foreground")}>
              {formatDay(day.date, { day: "numeric" })}
            </span>
            <span className="relative mt-1 h-10 w-2 overflow-hidden rounded-full bg-muted">
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 rounded-full transition-[height] duration-500",
                  day.percent === 100 ? "bg-primary" : "bg-primary/60",
                )}
                style={{ height: `${day.percent ?? 0}%` }}
              />
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {day.isFuture || day.percent === null ? "–" : `${day.percent}%`}
            </span>
          </>
        );

        const className = cn(
          "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2.5 transition-colors",
          day.isSelected ? "border-primary/40 bg-accent" : "border-transparent",
          day.isToday && !day.isSelected && "border-border bg-card",
          day.href && "hover:bg-muted/60",
        );

        return day.href ? (
          <Link key={day.date} href={day.href} className={className} aria-current={day.isSelected ? "date" : undefined}>
            {content}
          </Link>
        ) : (
          <div key={day.date} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
