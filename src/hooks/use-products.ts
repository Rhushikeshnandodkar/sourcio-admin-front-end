"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiGet } from "@/lib/api-client";
import { transformApiProductToProduct } from "@/lib/catalogue.utils";
import { CATALOGUE_CONSTANTS } from "@/lib/catalogue.constants";
import type {
  ApiProduct,
  Page,
  CatalogueProduct,
} from "@/types/catalogue.types";

interface UseProductsResult {
  products: CatalogueProduct[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  refetch: () => void;
}

/**
 * Custom hook for fetching and managing products
 */
export function useProducts(
  page: number = 1,
  pageSize: number = CATALOGUE_CONSTANTS.DEFAULT_PAGE_SIZE
): UseProductsResult {
  const [products, setProducts] = useState<CatalogueProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const paginatedData = await apiGet<Page<ApiProduct>>(
        getApiUrl(API_ENDPOINTS.products.list) +
          `?page=${page}&size=${pageSize}`
      );

      if (!paginatedData.items || !Array.isArray(paginatedData.items)) {
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }

      setTotal(paginatedData.total || 0);
      setTotalPages(paginatedData.pages || 1);

      // Transform API products to UI products
      const transformedProducts = paginatedData.items.map(
        transformApiProductToProduct
      );
      setProducts(transformedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    total,
    totalPages,
    refetch: fetchProducts,
  };
}
