"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiGet } from "@/lib/api-client";
import type { Category, Page } from "@/types/categories.types";

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  refetch: () => void;
}

const DEFAULT_PAGE_SIZE = 50;

/**
 * Custom hook for fetching and managing categories
 */
export function useCategories(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const paginatedData = await apiGet<Page<Category>>(
        getApiUrl(API_ENDPOINTS.categories.list) +
          `?page=${page}&size=${pageSize}`
      );

      if (!paginatedData.items || !Array.isArray(paginatedData.items)) {
        setCategories([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }

      setTotal(paginatedData.total || 0);
      setTotalPages(paginatedData.pages || 1);
      setCategories(paginatedData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    total,
    totalPages,
    refetch: fetchCategories,
  };
}
