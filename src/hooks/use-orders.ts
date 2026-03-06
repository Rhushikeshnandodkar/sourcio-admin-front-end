import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api-client";
import { getApiUrl, API_ENDPOINTS } from "@/lib/config";
import { Order, OrdersResponse } from "@/types/orders.types";

interface UseOrdersParams {
  skip?: number;
  limit?: number;
  min_price?: number;
  max_price?: number;
  status?: string;
  created_from?: string;
  created_to?: string;
  order_number?: string;
  user_email?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => void;
}

const DEFAULT_LIMIT = 50;

/**
 * Custom hook for fetching and managing orders
 */
export function useOrders(params: UseOrdersParams = {}): UseOrdersResult {
  const {
    skip = 0,
    limit = DEFAULT_LIMIT,
    min_price,
    max_price,
    status,
    created_from,
    created_to,
    order_number,
    user_email,
    sort_by,
    sort_order = "desc",
  } = params;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
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
      if (order_number) queryParams.append("order_number", order_number);
      if (user_email) queryParams.append("user_email", user_email);
      if (sort_by) queryParams.append("sort_by", sort_by);
      if (sort_order) queryParams.append("sort_order", sort_order);

      const data = await apiGet<OrdersResponse>(
        getApiUrl(API_ENDPOINTS.orders.list) + `?${queryParams.toString()}`
      );

      if (data.status === "success" && data.data) {
        setOrders(data.data.orders);
        setTotal(data.data.total);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);
      setOrders([]);
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
    order_number,
    user_email,
    sort_by,
    sort_order,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    total,
    refetch: fetchOrders,
  };
}
