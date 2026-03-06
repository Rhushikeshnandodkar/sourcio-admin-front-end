"use client";

import { useState, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiPost } from "@/lib/api-client";
import type { CustomerDetailResponse } from "@/types/customers.types";

interface CreateUserRequest {
  email: string;
  password: string;
  category?: string;
  gstNumber?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingPin?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
}

interface UseCreateUserResult {
  createUser: (data: CreateUserRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for creating a new user
 * Handles API call, loading state, and error management
 */
export function useCreateUser(): UseCreateUserResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (data: CreateUserRequest) => {
    try {
      setLoading(true);
      setError(null);

      const body: {
        email: string;
        password: string;
        category?: string;
        gst_number?: string;
        shipping_address1?: string;
        shipping_address2?: string | null;
        shipping_pin?: string;
        shipping_city?: string;
        shipping_state?: string;
        shipping_country?: string;
      } = {
        email: data.email,
        password: data.password,
      };

      if (data.category) {
        body.category = data.category;
      }

      if (data.gstNumber) {
        body.gst_number = data.gstNumber;
      }

      if (data.shippingAddress1) {
        body.shipping_address1 = data.shippingAddress1;
        body.shipping_address2 = data.shippingAddress2 || null;
        body.shipping_pin = data.shippingPin;
        body.shipping_city = data.shippingCity;
        body.shipping_state = data.shippingState;
        body.shipping_country = data.shippingCountry || "India";
      }

      const response = await apiPost<CustomerDetailResponse>(
        getApiUrl(API_ENDPOINTS.customers.create),
        body
      );

      if (!response || response.status !== "success") {
        const errorMessage =
          response?.message || "Failed to create user. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      let errorMessage =
        "An error occurred while creating the user. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        // Try to extract error message from API error response
        const errorObj = err as {
          detail?: { error?: { message?: string }; message?: string };
        };
        errorMessage =
          errorObj.detail?.error?.message ||
          errorObj.detail?.message ||
          errorMessage;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createUser,
    loading,
    error,
  };
}
