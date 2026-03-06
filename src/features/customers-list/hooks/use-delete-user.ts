"use client";

import { useState, useCallback } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiDelete } from "@/lib/api-client";

interface UseDeleteUserResult {
  deleteUser: (userId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for deleting a user
 * Handles API call, loading state, and error management
 */
export function useDeleteUser(): UseDeleteUserResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiDelete<{
        status: string;
        message?: string;
        data?: unknown;
      }>(getApiUrl(API_ENDPOINTS.customers.delete(userId)));

      if (!response || response.status !== "success") {
        const errorMessage =
          response?.message || "Failed to delete user. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      let errorMessage =
        "An error occurred while deleting the user. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        // Try to extract error message from API error response
        const errorObj = err as {
          detail?: {
            error?: { message?: string; code?: string };
            message?: string;
          };
          message?: string;
        };

        // Handle specific error codes
        if (errorObj.detail?.error?.code === "USER_HAS_QUOTES") {
          errorMessage =
            errorObj.detail.error.message ||
            "Cannot delete user. User has quotes associated. Quotes must be preserved.";
        } else if (errorObj.detail?.error?.code === "CANNOT_DELETE_SELF") {
          errorMessage =
            errorObj.detail.error.message ||
            "You cannot delete your own account.";
        } else if (errorObj.detail?.error?.code === "USER_NOT_FOUND") {
          errorMessage = errorObj.detail.error.message || "User not found.";
        } else if (errorObj.detail?.error?.code === "FOREIGN_KEY_CONSTRAINT") {
          errorMessage =
            errorObj.detail.error.message ||
            "Cannot delete user due to database constraints.";
        } else {
          errorMessage =
            errorObj.detail?.error?.message ||
            errorObj.detail?.message ||
            errorObj.message ||
            errorMessage;
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteUser,
    loading,
    error,
  };
}
