"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import type { RevenueDataPoint } from "@/types/dashboard.types";
import { useMemo } from "react";

interface PerformanceChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
  subtitle?: string;
}

export function PerformanceChart({
  data,
  loading = false,
  subtitle,
}: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const mapped = data.map((point) => ({
      date: new Date(point.date),
      revenue: Number(point.revenue),
      formattedDate: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    }));
    // Sort by date to ensure proper line rendering
    return mapped.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      theme: {
        light: "hsl(45, 93%, 47%)", // Amber color for light mode
        dark: "hsl(45, 93%, 57%)", // Lighter amber for dark mode
      },
    },
  };

  if (loading) {
    return (
      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 dark:bg-amber-500/10 rounded-lg p-2">
              <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-base font-semibold">
              Revenue Performance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative border-border bg-card hover:shadow transition-all duration-300 h-full flex flex-col shadow-none gap-0">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-500/2 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />

      <CardHeader className="relative flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 dark:bg-amber-500/10 rounded-xl p-2.5 ring-1 ring-amber-500/10">
            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Revenue Performance
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs hover:bg-amber-500/10"
          asChild
        >
          <Link href="/dashboard/quotes">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="relative flex-1 pt-0 pb-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
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
                  if (value >= 1000000)
                    return `₹${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return `₹${value}`;
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
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}`,
                      "Revenue",
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                }
              />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={4}
                connectNulls={false}
                isAnimationActive={true}
                dot={{
                  fill: "var(--color-revenue)",
                  r: 5,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                  fill: "var(--color-revenue)",
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
    </Card>
  );
}
