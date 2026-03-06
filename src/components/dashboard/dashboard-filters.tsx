"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, BarChart3 } from "lucide-react";
import { useMemo } from "react";

export type GroupByOption = "day" | "week" | "month";
export type DateRangePreset = "7d" | "30d" | "90d" | "180d" | "custom";

interface DashboardFiltersProps {
  groupBy: GroupByOption;
  onGroupByChange: (value: GroupByOption) => void;
  dateRange?: DateRangePreset;
  onDateRangeChange?: (value: DateRangePreset) => void;
}

export function DashboardFilters({
  groupBy,
  onGroupByChange,
  dateRange = "180d",
  onDateRangeChange,
}: DashboardFiltersProps) {
  const groupByLabel = useMemo(() => {
    switch (groupBy) {
      case "day":
        return "Daily";
      case "week":
        return "Weekly";
      case "month":
        return "Monthly";
      default:
        return "Monthly";
    }
  }, [groupBy]);

  const dateRangeLabel = useMemo(() => {
    switch (dateRange) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 3 months";
      case "180d":
        return "Last 6 months";
      case "custom":
        return "Custom range";
      default:
        return "Last 6 months";
    }
  }, [dateRange]);

  return (
    <div className="flex items-center gap-2 flex-wrap bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
      {onDateRangeChange && (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger
              className="h-8 w-[140px] text-xs border-border/50 bg-background/50"
              size="sm"
            >
              <SelectValue>{dateRangeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="180d">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="h-4 w-px bg-border/50" />

      <div className="flex items-center gap-2">
        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/70" />
        <Select value={groupBy} onValueChange={onGroupByChange}>
          <SelectTrigger
            className="h-8 w-[120px] text-xs border-border/50 bg-background/50"
            size="sm"
          >
            <SelectValue>{groupByLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
