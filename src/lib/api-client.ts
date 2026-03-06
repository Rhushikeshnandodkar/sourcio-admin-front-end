/**
 * Centralized API client with automatic token refresh
 */
import Cookies from "js-cookie";
import { getApiUrl, API_ENDPOINTS } from "./config";
import { TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "./auth";

// Track if a refresh is in progress to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Track if logout is in progress to prevent multiple simultaneous logouts
let isLoggingOut = false;

/**
 * Logout utility function - clears cookies and redirects to login
 * This is called automatically when token expires
 */
function handleTokenExpired(): void {
  // Prevent multiple simultaneous logout attempts
  if (isLoggingOut) {
    return;
  }

  isLoggingOut = true;

  // Clear all auth cookies
  Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: "/" });

  // Only redirect if we're in the browser and not already on login page
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.includes("/login")
  ) {
    window.location.href = "/login";
  }
}

/**
 * Refresh the access token using the refresh token cookie
 */
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.auth.refresh), {
        method: "POST",
        credentials: "include", // Include refresh token cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Refresh failed, token expired - logout user
        handleTokenExpired();
        return null;
      }

      const data = await response.json();

      if (data.status === "success" && data.data?.access_token) {
        // Update access token cookie
        Cookies.set(TOKEN_COOKIE_NAME, data.data.access_token, {
          expires: 7, // Match backend expiration
          path: "/",
          sameSite: "lax",
        });
        return data.data.access_token;
      }

      return null;
    } catch (error) {
      console.error("Token refresh error:", error);
      // Token refresh failed - logout user
      handleTokenExpired();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Get the current access token from cookie
 */
function getAccessToken(): string | null {
  return Cookies.get(TOKEN_COOKIE_NAME) || null;
}

/**
 * Make an authenticated API request with automatic token refresh
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Get current access token
  const token = getAccessToken();

  // Prepare headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    (headers as Record<string, string>)[`Authorization`] = `Bearer ${token}`;
  }

  // Make initial request
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Always include cookies
  });

  // If 401, try to refresh token and retry
  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry request with new token
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      // Refresh failed, token expired - logout user
      handleTokenExpired();
      throw new Error("Session expired. Please log in again.");
    }
  }

  // Handle non-OK responses
  if (!response.ok) {
    if (response.status === 401) {
      // Still unauthorized after refresh attempt - logout user
      handleTokenExpired();
      throw new Error("Unauthorized: Please log in again");
    }

    // Try to parse error message
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch {
      // If JSON parsing fails, use default message
    }

    throw new Error(errorMessage);
  }

  // Parse and return response
  // Check if response is a blob (for PDFs, images, etc.)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/pdf")) {
    return (await response.blob()) as unknown as T;
  }

  try {
    return await response.json();
  } catch {
    // If response is not JSON, return empty object
    return {} as T;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "GET",
  });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "DELETE",
  });
}
