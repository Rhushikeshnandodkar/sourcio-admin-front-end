"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getApiUrl, API_ENDPOINTS } from "@/lib/config";
import { TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@/lib/auth";
import { apiRequest } from "@/lib/api-client";

interface User {
  id: number;
  email: string;
  name?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.auth.refresh), {
        method: "POST",
        credentials: "include", // Include refresh token cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data.status === "success" && data.data?.access_token) {
        // Update access token cookie
        Cookies.set(TOKEN_COOKIE_NAME, data.data.access_token, {
          expires: 7,
          path: "/",
          sameSite: "lax",
        });

        // Update user if provided
        if (data.data.user) {
          setUser(data.data.user);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiRequest<{ status: string; data?: { user?: User } }>(
        getApiUrl(API_ENDPOINTS.auth.me)
      );

      if (data.status === "success" && data.data?.user) {
        setIsAuthenticated(true);
        setUser(data.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // If error is due to expired token, try refresh
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (token) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry auth check after refresh
          try {
            const retryData = await apiRequest<{
              status: string;
              data?: { user?: User };
            }>(getApiUrl(API_ENDPOINTS.auth.me));
            if (retryData.status === "success" && retryData.data?.user) {
              setIsAuthenticated(true);
              setUser(retryData.data.user);
              return;
            }
          } catch (retryError) {
            console.error("Auth check retry error:", retryError);
          }
        }
      }
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken]);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; message?: string }> => {
      try {
        setIsLoading(true);
        const response = await fetch(getApiUrl(API_ENDPOINTS.auth.login), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.status === "success" && data.data) {
          // Store the access token in a cookie using js-cookie
          if (data.data.access_token) {
            // Set cookie with expiration (assuming token expires in 7 days, adjust as needed)
            Cookies.set(TOKEN_COOKIE_NAME, data.data.access_token, {
              expires: 7,
              path: "/",
              sameSite: "lax",
            });
          }

          setIsAuthenticated(true);
          setUser(data.data?.user || null);
          return { success: true };
        } else {
          setIsAuthenticated(false);
          setUser(null);
          return { success: false, message: data.message || "Login failed" };
        }
      } catch (error) {
        console.error("Login error:", error);
        setIsAuthenticated(false);
        setUser(null);
        return { success: false, message: "An error occurred during login" };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Try to call logout endpoint (may fail if token is expired, but that's ok)
      try {
        await apiRequest(getApiUrl(API_ENDPOINTS.auth.logout), {
          method: "POST",
        });
      } catch (error) {
        // Ignore logout endpoint errors - we'll clear cookies anyway
        console.warn("Logout endpoint error (ignored):", error);
      }

      // Clear both access and refresh token cookies
      Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
      Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: "/" });

      setIsAuthenticated(false);
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and cookies
      Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
      Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: "/" });
      setIsAuthenticated(false);
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
