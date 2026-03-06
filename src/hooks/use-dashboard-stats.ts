"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiGet } from "@/lib/api-client";
import type {
  DashboardStats,
  DashboardStatsResponse,
} from "@/types/dashboard.types";

interface UseDashboardStatsParams {
  start_date?: string;
  end_date?: string;
  group_by?: "day" | "week" | "month";
}

interface UseDashboardStatsResult {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching dashboard statistics
 * Defaults to 6 months of data with monthly grouping
 */
export function useDashboardStats(
  params: UseDashboardStatsParams = {}
): UseDashboardStatsResult {
  const { start_date, end_date, group_by = "month" } = params;

  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      // Default to 6 months if no dates provided
      const queryParams = new URLSearchParams();

      if (start_date) {
        queryParams.append("start_date", start_date);
      } else {
        // Default to 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        queryParams.append(
          "start_date",
          sixMonthsAgo.toISOString().split("T")[0]
        );
      }

      if (end_date) {
        queryParams.append("end_date", end_date);
      } else {
        // Default to today
        const today = new Date();
        queryParams.append("end_date", today.toISOString().split("T")[0]);
      }

      // Add group_by parameter (defaults to month for 6 months view)
      queryParams.append("group_by", group_by);

      const url =
        getApiUrl(API_ENDPOINTS.dashboard.stats) + `?${queryParams.toString()}`;

      // Debug: Log the URL being called
      console.log("Dashboard API URL:", url);
      console.log("Dashboard params:", { start_date, end_date, group_by });

      const response = await apiGet<DashboardStatsResponse>(url);

      if (response.status === "success" && response.data) {
        setData(response.data);
      } else {
        setError("Failed to fetch dashboard statistics");
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching dashboard stats:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [start_date, end_date, group_by]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
}
