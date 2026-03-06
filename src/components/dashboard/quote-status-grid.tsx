"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { QuoteStats } from "@/types/dashboard.types";
import { useMemo } from "react";

interface QuoteStatusGridProps {
  stats: QuoteStats | null;
  loading?: boolean;
}

const statusColors = {
  draft: "hsl(215 16% 47%)", // slate
  pending: "hsl(38 92% 50%)", // amber
  approved: "hsl(142 71% 45%)", // emerald
  rejected: "hsl(350 89% 60%)", // rose
  expired: "hsl(25 95% 53%)", // orange
};

export function QuoteStatusGrid({
  stats,
  loading = false,
}: QuoteStatusGridProps) {
  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { status: "Draft", value: stats.draft, fill: statusColors.draft },
      { status: "Pending", value: stats.pending, fill: statusColors.pending },
      {
        status: "Approved",
        value: stats.approved,
        fill: statusColors.approved,
      },
      {
        status: "Rejected",
        value: stats.rejected,
        fill: statusColors.rejected,
      },
      { status: "Expired", value: stats.expired, fill: statusColors.expired },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const total = useMemo(() => {
    if (!stats) return 0;
    return (
      stats.draft +
      stats.pending +
      stats.approved +
      stats.rejected +
      stats.expired
    );
  }, [stats]);

  const chartConfig = {
    value: {
      label: "Quotes",
    },
    draft: {
      label: "Draft",
      color: statusColors.draft,
    },
    pending: {
      label: "Pending",
      color: statusColors.pending,
    },
    approved: {
      label: "Approved",
      color: statusColors.approved,
    },
    rejected: {
      label: "Rejected",
      color: statusColors.rejected,
    },
    expired: {
      label: "Expired",
      color: statusColors.expired,
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <Card className="border-border shadow-none flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-violet-500/10 dark:bg-violet-500/10 rounded-lg p-2">
              <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <CardTitle className="text-base font-semibold">
              Quote Status Distribution
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center pt-0 pb-0">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="group relative border-border bg-card hover:shadow transition-all duration-300 flex flex-col h-full shadow-none gap-0">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-500/2 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />

      <CardHeader className="relative flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/10 dark:bg-violet-500/10 rounded-xl p-2.5 ring-1 ring-violet-500/10">
            <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle className="text-base font-semibold">
            Quote Status
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs hover:bg-violet-500/10"
          asChild
        >
          <Link href="/dashboard/quotes">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="relative flex-1 flex items-center justify-center pt-0 pb-2">
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No quotes available
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[220px] w-full"
          >
            <PieChart width={280} height={280}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="rounded-xl border bg-card shadow-xl"
                    formatter={(value, name) => [`${value} quotes`, name]}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                label={({ payload, ...props }) => {
                  return (
                    <text
                      cx={props.cx}
                      cy={props.cy}
                      x={props.x}
                      y={props.y}
                      textAnchor={props.textAnchor}
                      dominantBaseline={props.dominantBaseline}
                      fill="hsl(var(--foreground))"
                      className="text-xs font-semibold"
                    >
                      {payload.value}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="relative flex-col items-start gap-1.5 text-xs pt-4 pb-5 border-t border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 font-semibold text-violet-600 dark:text-violet-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Total: {total.toLocaleString()} Quotes</span>
        </div>
        <div className="text-muted-foreground/70">Distribution by status</div>
      </CardFooter>
    </Card>
  );
}
