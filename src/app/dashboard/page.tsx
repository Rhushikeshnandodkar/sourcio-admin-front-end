"use client";

import { useState, useMemo } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import {
  DashboardHeader,
  MetricCards,
  QuoteStatusGrid,
  PerformanceChart,
  UserGrowthChart,
} from "@/components/dashboard";
import {
  type GroupByOption,
  type DateRangePreset,
} from "@/components/dashboard/dashboard-filters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [groupBy, setGroupBy] = useState<GroupByOption>("month");
  const [dateRange, setDateRange] = useState<DateRangePreset>("180d");

  // Calculate date range based on preset
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setMonth(start.getMonth() - 3);
        break;
      case "180d":
        start.setMonth(start.getMonth() - 6);
        break;
      default:
        start.setMonth(start.getMonth() - 6);
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [dateRange]);

  const { data, loading, error } = useDashboardStats({
    start_date: startDate,
    end_date: endDate,
    group_by: groupBy,
  });

  console.log("Data: ", data);
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="sticky top-2 z-10">
        <DashboardHeader
          totalUsers={data?.overview.total_users || 0}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Main Content */}
      <div className="pr-2 py-6">
        <div className="space-y-2">
          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in-50 duration-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Metrics Overview */}
          <section className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <MetricCards stats={data?.overview || null} loading={loading} />
          </section>

          {/* Analytics Grid */}
          <section className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 gap-5 sm:gap-3 xl:grid-cols-3">
              {/* Quote Status - Spans 1 column */}
              <div className="xl:col-span-1">
                <QuoteStatusGrid
                  stats={data?.quotes || null}
                  loading={loading}
                />
              </div>

              {/* Revenue Performance - Spans 2 columns */}
              <div className="xl:col-span-2">
                <PerformanceChart
                  data={data?.revenue_trend || []}
                  loading={loading}
                  subtitle={`${dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : dateRange === "90d" ? "Last 3 months" : "Last 6 months"} revenue (${
                    groupBy === "day"
                      ? "daily"
                      : groupBy === "week"
                        ? "weekly"
                        : "monthly"
                  } view)`}
                />
              </div>
            </div>
          </section>

          {/* User Growth Section */}
          <section className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <UserGrowthChart
              data={data?.user_growth || []}
              loading={loading}
              subtitle={`${dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : dateRange === "90d" ? "Last 3 months" : "Last 6 months"} growth trend`}
            />
          </section>

          {/* Recent Activity Section - Commented out but ready to use */}
          {/* <section className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
              <TopQuotes quotes={data?.recent_quotes || []} loading={loading} />
              <RecentUsers users={data?.recent_users || []} loading={loading} />
            </div>
          </section> */}
        </div>
      </div>
    </div>
  );
}
