"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = {
  percent: { label: "Completed", color: "var(--chart-1)" },
} satisfies ChartConfig;

export type DailyPoint = {
  /** Short axis label, e.g. "Mon" or "Nov 3" */
  label: string;
  /** Long label for the tooltip, e.g. "Monday, Nov 3" */
  full: string;
  percent: number | null;
};

/** Daily completion % as bars (0–100). */
export function DailyChart({ data }: { data: DailyPoint[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-60 w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={12}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value) => `${value}%`}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => payload?.[0]?.payload?.full}
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium tabular-nums">{value === null ? "—" : `${value}%`}</span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="percent" fill="var(--color-percent)" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ChartContainer>
  );
}
