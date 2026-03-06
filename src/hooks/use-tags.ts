"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiGet } from "@/lib/api-client";
import type { Tag, Page } from "@/types/tags.types";

interface UseTagsResult {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  refetch: () => void;
}

const DEFAULT_PAGE_SIZE = 50;

/**
 * Custom hook for fetching and managing tags
 */
export function useTags(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): UseTagsResult {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const paginatedData = await apiGet<Page<Tag>>(
        getApiUrl(API_ENDPOINTS.tags.list) + `?page=${page}&size=${pageSize}`
      );

      if (!paginatedData.items || !Array.isArray(paginatedData.items)) {
        setTags([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }

      setTotal(paginatedData.total || 0);
      setTotalPages(paginatedData.pages || 1);
      setTags(paginatedData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching tags:", err);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    total,
    totalPages,
    refetch: fetchTags,
  };
}
