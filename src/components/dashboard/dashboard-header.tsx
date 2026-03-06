"use client";

import { Logo } from "@/components/sidebar/logo";
import { format } from "date-fns";
import { ModeToggle } from "../common/mode-toggle";
import {
  DashboardFilters,
  type GroupByOption,
  type DateRangePreset,
} from "./dashboard-filters";
import { Users } from "lucide-react";

interface DashboardHeaderProps {
  totalUsers: number;
  onRefresh?: () => void;
  isLoading?: boolean;
  groupBy: GroupByOption;
  onGroupByChange: (value: GroupByOption) => void;
  dateRange?: DateRangePreset;
  onDateRangeChange?: (value: DateRangePreset) => void;
}

export function DashboardHeader({
  totalUsers,
  groupBy,
  onGroupByChange,
  dateRange,
  onDateRangeChange,
}: DashboardHeaderProps) {
  const currentTime = new Date();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/50 backdrop-blur-sm p-2 border border-border rounded-lg mr-2">
      {/* Left Section - Logo & Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative">
          <div className="absolute inset-0 blur-xl rounded-full" />
          <Logo className="relative h-9 w-9 sm:h-10 sm:w-10" />
        </div>
        <div className="space-y-0">
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight">
            Sorucio Dashboard
          </h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{totalUsers.toLocaleString()}</span>
              <span className="hidden sm:inline">
                {totalUsers === 1 ? "member" : "members"}
              </span>
            </div>
            <span className="hidden sm:inline text-muted-foreground/50">•</span>
            <time
              className="hidden sm:inline text-xs"
              dateTime={currentTime.toISOString()}
            >
              {format(currentTime, "MMM dd, yyyy HH:mm")}
            </time>
          </div>
        </div>
      </div>

      {/* Right Section - Filters & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none">
          <DashboardFilters
            groupBy={groupBy}
            onGroupByChange={onGroupByChange}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
        </div>
        <ModeToggle />
      </div>
    </div>
  );
}
