"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type ComparisonSeries = { key: string; label: string; isYou: boolean };
export type ComparisonRow = { label: string; full: string } & Record<string, string | number | null>;

const otherColors = ["var(--chart-4)", "var(--chart-2)", "var(--chart-5)", "var(--chart-3)"];

/** Daily completion % for several people (you are always the primary color). */
export function ComparisonChart({ series, data }: { series: ComparisonSeries[]; data: ComparisonRow[] }) {
  let colorIndex = 0;
  const config: ChartConfig = Object.fromEntries(
    series.map((item) => [
      item.key,
      {
        label: item.label,
        color: item.isYou ? "var(--chart-1)" : otherColors[colorIndex++ % otherColors.length],
      },
    ]),
  );

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
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
              indicator="line"
              labelFormatter={(_, payload) => payload?.[0]?.payload?.full}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((item) => (
          <Line
            key={item.key}
            dataKey={item.key}
            type="monotone"
            stroke={`var(--color-${item.key})`}
            strokeWidth={item.isYou ? 2.5 : 2}
            dot={{ r: 3, fill: `var(--color-${item.key})` }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
