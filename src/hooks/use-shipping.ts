"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import type {
  ShippingAddress,
  ShippingAddressCreateRequest,
  ShippingAddressUpdateRequest,
} from "@/types/shipping.types";

interface UseShippingResult {
  addresses: ShippingAddress[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createAddress: (payload: ShippingAddressCreateRequest) => Promise<void>;
  updateAddress: (
    id: number,
    payload: ShippingAddressUpdateRequest
  ) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
}

type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export function useShipping(): UseShippingResult {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet<ApiResponse<ShippingAddress[]>>(
        getApiUrl(API_ENDPOINTS.shipping.list)
      );
      if (
        response &&
        response.status === "success" &&
        Array.isArray(response.data)
      ) {
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load shipping addresses";
      setError(message);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(
    async (payload: ShippingAddressCreateRequest) => {
      await apiPost<ApiResponse<ShippingAddress>>(
        getApiUrl(API_ENDPOINTS.shipping.create),
        payload
      );
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const updateAddress = useCallback(
    async (id: number, payload: ShippingAddressUpdateRequest) => {
      await apiPut<ApiResponse<ShippingAddress>>(
        getApiUrl(API_ENDPOINTS.shipping.update(id)),
        payload
      );
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const deleteAddress = useCallback(
    async (id: number) => {
      await apiDelete<ApiResponse<unknown>>(
        getApiUrl(API_ENDPOINTS.shipping.delete(id))
      );
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  };
}
