"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiGet } from "@/lib/api-client";
import type {
  Customer,
  CustomersApiResponse,
  UserStats,
} from "@/types/customers.types";

interface UseCustomersParams {
  page?: number;
  size?: number;
  role?: "user" | "owner";
  is_active?: boolean;
  email?: string;
  search?: string;
}

interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
  pages: number;
  stats: UserStats | null;
  refetch: () => void;
}

const DEFAULT_SIZE = 50;

/**
 * Custom hook for fetching and managing customers
 * Note: Uses fastapi-pagination format which differs from quotes endpoint
 */
export function useCustomers(
  params: UseCustomersParams = {}
): UseCustomersResult {
  const {
    page = 1,
    size = DEFAULT_SIZE,
    role,
    is_active,
    email,
    search,
  } = params;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentSize, setCurrentSize] = useState(size);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("size", size.toString());

      if (role) queryParams.append("role", role);
      if (is_active !== undefined)
        queryParams.append("is_active", is_active.toString());
      if (email) queryParams.append("email", email);
      if (search && search.trim()) queryParams.append("search", search.trim());

      const response = await apiGet<CustomersApiResponse>(
        getApiUrl(API_ENDPOINTS.customers.list) + `?${queryParams.toString()}`
      );

      // Response is now wrapped in APIResponse format
      if (response && response.status === "success" && response.data) {
        const data = response.data;
        setCustomers(data.items || []);
        setTotal(data.total || 0);
        setCurrentPage(data.page || 1);
        setCurrentSize(data.size || DEFAULT_SIZE);
        setTotalPages(data.pages || 0);
        setStats(data.stats || null);
      } else {
        setCustomers([]);
        setTotal(0);
        setTotalPages(0);
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching customers:", err);
      setCustomers([]);
      setTotal(0);
      setTotalPages(0);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [page, size, role, is_active, email, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    total,
    page: currentPage,
    size: currentSize,
    pages: totalPages,
    stats,
    refetch: fetchCustomers,
  };
}
