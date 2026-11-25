"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = {
  score: { label: "Weekly score", color: "var(--chart-1)" },
} satisfies ChartConfig;

export type WeeklyPoint = { label: string; full: string; score: number | null };

/** Weekly score trend (flat fill, no gradient). */
export function WeeklyChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-60 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(value) => `${value}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => payload?.[0]?.payload?.full}
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="text-muted-foreground">Weekly score</span>
                  <span className="font-medium tabular-nums">{value === null ? "—" : `${value}%`}</span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="score"
          type="monotone"
          stroke="var(--color-score)"
          strokeWidth={2}
          fill="var(--color-score)"
          fillOpacity={0.12}
          connectNulls
          dot={{ r: 3, fill: "var(--color-score)" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
