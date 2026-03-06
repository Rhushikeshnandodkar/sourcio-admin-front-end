// Authentication utilities and helpers
import Cookies from "js-cookie";

export const TOKEN_COOKIE_NAME = "auth_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

/**
 * Get the authentication token from cookies (client-side)
 * Note: This is a helper for client-side checks, but the actual token
 * is stored in HTTP-only cookies accessible only server-side
 */
export const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  return Cookies.get(TOKEN_COOKIE_NAME) || null;
};

/**
 * Set the authentication token in cookies (client-side)
 */
export const setTokenCookie = (
  token: string,
  expiresInDays: number = 7
): void => {
  if (typeof document === "undefined") return;
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: expiresInDays,
    path: "/",
    sameSite: "lax",
  });
};

/**
 * Check if user is authenticated (client-side check)
 * This is a basic check - actual validation happens server-side
 */
export const isAuthenticated = (): boolean => {
  return getTokenFromCookie() !== null;
};

/**
 * Clear authentication token (client-side)
 * Note: Actual cookie clearing happens server-side via API route
 */
export const clearAuthToken = (): void => {
  if (typeof document === "undefined") return;
  Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
};
