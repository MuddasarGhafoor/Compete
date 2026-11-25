"use client";

import { useState } from "react";
import { WEEKDAY_SHORT, formatDay, type DateStr } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type HeatmapDay = { date: DateStr; percent: number | null; future?: boolean };

function level(day: HeatmapDay) {
  if (day.future) return "bg-transparent";
  if (day.percent === null) return "bg-muted/50";
  if (day.percent === 0) return "bg-muted";
  if (day.percent < 50) return "bg-primary/30";
  if (day.percent < 100) return "bg-primary/60";
  return "bg-primary";
}

/**
 * Calendar heatmap, one column per week (Monday on top). The week columns stretch to fill the
 * available width (square cells); on narrow screens it keeps a minimum cell size and scrolls.
 * `days` must start on a Monday and cover whole weeks.
 */
export function Heatmap({ days }: { days: HeatmapDay[] }) {
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const monthOf = (date: DateStr) => formatDay(date, { month: "short" });

  return (
    <div>
      <div className="no-scrollbar overflow-x-auto">
        <div
          className="grid min-w-max gap-1 sm:min-w-0"
          style={{ gridTemplateColumns: `auto repeat(${weeks.length}, minmax(0.625rem, 1fr))` }}
        >
          {/* Month labels */}
          <span />
          {weeks.map((week, weekIndex) => (
            <span key={week[0].date} className="h-4 overflow-visible text-[10px] whitespace-nowrap text-muted-foreground">
              {weekIndex === 0 || monthOf(week[0].date) !== monthOf(weeks[weekIndex - 1][0].date) ? monthOf(week[0].date) : ""}
            </span>
          ))}

          {/* One row per weekday */}
          {WEEKDAY_SHORT.map((label, row) => (
            <div key={label} className="contents">
              <span
                className={cn(
                  "flex items-center pr-1 text-[10px] leading-none text-muted-foreground",
                  row % 2 === 1 && "invisible",
                )}
              >
                {label}
              </span>
              {weeks.map((week) => {
                const day = week[row];
                if (!day) return <span key={`${week[0].date}-${row}`} />;
                return (
                  <span
                    key={day.date}
                    onMouseEnter={() => setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      "aspect-square w-full rounded-[4px] transition-transform hover:scale-110",
                      level(day),
                      !day.future && "ring-1 ring-foreground/5 ring-inset",
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="tabular-nums" aria-live="polite">
          {hovered
            ? `${formatDay(hovered.date, { weekday: "short", month: "short", day: "numeric" })} · ${
                hovered.future ? "upcoming" : hovered.percent === null ? "nothing scheduled" : `${hovered.percent}% done`
              }`
            : "Hover a day for details"}
        </span>
        <span className="flex items-center gap-1">
          Less
          {["bg-muted", "bg-primary/30", "bg-primary/60", "bg-primary"].map((className) => (
            <span key={className} className={cn("size-3 rounded-[3px]", className)} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
