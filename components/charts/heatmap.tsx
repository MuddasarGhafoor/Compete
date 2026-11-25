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
 * Calendar heatmap, one column per week (Monday on top).
 * `days` must start on a Monday and cover whole weeks.
 */
export function Heatmap({ days }: { days: HeatmapDay[] }) {
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div>
      <div className="no-scrollbar overflow-x-auto">
        <div className="inline-flex gap-2">
          <div className="grid grid-rows-7 gap-1 pt-5 text-[10px] text-muted-foreground">
            {WEEKDAY_SHORT.map((label, index) => (
              <span key={label} className={cn("h-3 leading-3", index % 2 === 1 && "invisible")}>
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => {
              const first = week[0];
              const showMonth =
                weekIndex === 0 || formatDay(first.date, { month: "short" }) !== formatDay(weeks[weekIndex - 1][0].date, { month: "short" });
              return (
                <div key={first.date} className="flex flex-col gap-1">
                  <span className="h-4 text-[10px] whitespace-nowrap text-muted-foreground">
                    {showMonth ? formatDay(first.date, { month: "short" }) : ""}
                  </span>
                  {week.map((day) => (
                    <span
                      key={day.date}
                      onMouseEnter={() => setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      className={cn(
                        "size-3 rounded-[3px] transition-transform hover:scale-125",
                        level(day),
                        !day.future && "ring-1 ring-foreground/5 ring-inset",
                      )}
                    />
                  ))}
                </div>
              );
            })}
          </div>
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
