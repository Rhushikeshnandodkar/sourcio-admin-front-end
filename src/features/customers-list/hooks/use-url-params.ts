"use client";

import { useSearchParams } from "next/navigation";

/**
 * Hook to read and parse URL parameters for customers list
 * Single responsibility: URL parameter management
 */
export function useUrlParams() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  return {
    search,
    page,
  };
}
