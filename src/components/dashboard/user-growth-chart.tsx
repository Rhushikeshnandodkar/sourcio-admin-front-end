"use client";

import { TrendingUp, Users } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface UserGrowthDataPoint {
  date: string;
  total_users: number;
  new_users: number;
}

interface UserGrowthChartProps {
  data: UserGrowthDataPoint[];
  loading?: boolean;
  subtitle?: string;
}

const chartConfig = {
  total: {
    label: "Total Users",
    theme: {
      light: "oklch(0.55 0.22 264.376)", // Modern blue for light mode
      dark: "oklch(0.65 0.22 264.376)", // Lighter blue for dark mode
    },
  },
  new: {
    label: "New Users",
    theme: {
      light: "oklch(0.646 0.222 147.116)", // Modern emerald for light mode
      dark: "oklch(0.55 0.222 147.116)", // Emerald for dark mode
    },
  },
} satisfies ChartConfig;

export function UserGrowthChart({
  data,
  loading = false,
  subtitle,
}: UserGrowthChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      date: new Date(point.date),
      total: point.total_users,
      new: point.new_users,
      formattedDate: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    }));
  }, [data]);

  const growthPercentage = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstValue = chartData[0].total;
    const lastValue = chartData[chartData.length - 1].total;
    if (firstValue === 0) return 0;
    return (((lastValue - firstValue) / firstValue) * 100).toFixed(1);
  }, [chartData]);

  if (loading) {
    return (
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">User Growth</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative border-border bg-card hover:shadow transition-all duration-300 shadow-none gap-0">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/2 via-transparent to-emerald-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />

      <CardHeader className="relative pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 dark:bg-blue-500/10 rounded-xl p-2.5 ring-1 ring-blue-500/10">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              User Growth
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0 pb-2">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 0,
                right: 10,
                top: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.2}
                vertical={false}
              />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="text-xs font-medium"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="text-xs font-medium"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                  return value.toString();
                }}
              />
              <ChartTooltip
                cursor={{
                  stroke: "hsl(var(--border))",
                  strokeWidth: 1.5,
                  strokeDasharray: "4 4",
                }}
                content={
                  <ChartTooltipContent
                    className="rounded-xl border bg-card shadow-xl"
                    formatter={(value, name) => {
                      const label =
                        name === "total" ? "Total Users" : "New Users";
                      return [`${value} users`, label];
                    }}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                }
              />
              <Line
                dataKey="total"
                type="monotone"
                stroke="var(--color-total)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-total)",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                  fill: "var(--color-total)",
                  style: {
                    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                  },
                }}
                style={{
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.1))",
                }}
              />
              <Line
                dataKey="new"
                type="monotone"
                stroke="var(--color-new)"
                strokeWidth={2.5}
                dot={{
                  fill: "var(--color-new)",
                  r: 3,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                  fill: "var(--color-new)",
                  style: {
                    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                  },
                }}
                style={{
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.1))",
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="relative flex-col items-start gap-1.5 text-xs pt-4 pb-5 border-t border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
          {Number(growthPercentage || 0) >= 0 ? (
            <>
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Trending up by {growthPercentage}%</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-3.5 w-3.5 rotate-180" />
              <span>
                Trending down by {Math.abs(Number(growthPercentage))}%
              </span>
            </>
          )}
        </div>
        <div className="text-muted-foreground/70">
          User growth over selected period
        </div>
      </CardFooter>
    </Card>
  );
}
