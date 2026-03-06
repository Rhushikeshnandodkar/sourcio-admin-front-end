"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiGet } from "@/lib/api-client";
import type { Quote, QuotesResponse } from "@/types/quotes.types";

interface UseQuotesParams {
  skip?: number;
  limit?: number;
  min_price?: number;
  max_price?: number;
  status?: string;
  created_from?: string;
  created_to?: string;
  expires_from?: string;
  expires_to?: string;
  quote_number?: string;
  user_email?: string;
  sort_by?: string;
  sort_order?: string;
}

interface UseQuotesResult {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => void;
}

const DEFAULT_LIMIT = 50;

/**
 * Custom hook for fetching and managing quotes
 */
export function useQuotes(params: UseQuotesParams = {}): UseQuotesResult {
  const {
    skip = 0,
    limit = DEFAULT_LIMIT,
    min_price,
    max_price,
    status,
    created_from,
    created_to,
    expires_from,
    expires_to,
    quote_number,
    user_email,
    sort_by,
    sort_order = "desc",
  } = params;

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("skip", skip.toString());
      queryParams.append("limit", limit.toString());

      if (min_price !== undefined)
        queryParams.append("min_price", min_price.toString());
      if (max_price !== undefined)
        queryParams.append("max_price", max_price.toString());
      if (status) queryParams.append("status", status);
      if (created_from) queryParams.append("created_from", created_from);
      if (created_to) queryParams.append("created_to", created_to);
      if (expires_from) queryParams.append("expires_from", expires_from);
      if (expires_to) queryParams.append("expires_to", expires_to);
      if (quote_number) queryParams.append("quote_number", quote_number);
      if (user_email) queryParams.append("user_email", user_email);
      if (sort_by) queryParams.append("sort_by", sort_by);
      if (sort_order) queryParams.append("sort_order", sort_order);

      const data = await apiGet<QuotesResponse>(
        getApiUrl(API_ENDPOINTS.quotes.list) + `?${queryParams.toString()}`
      );

      if (data.status === "success" && data.data) {
        setQuotes(data.data.quotes || []);
        setTotal(data.data.total || 0);
      } else {
        setQuotes([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching quotes:", err);
      setQuotes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    skip,
    limit,
    min_price,
    max_price,
    status,
    created_from,
    created_to,
    expires_from,
    expires_to,
    quote_number,
    user_email,
    sort_by,
    sort_order,
  ]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return {
    quotes,
    loading,
    error,
    total,
    refetch: fetchQuotes,
  };
}
