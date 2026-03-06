"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUrlParams } from "./use-url-params";
import {
  calculateStartItem,
  calculateEndItem,
} from "../utils/pagination.utils";
import { DEFAULT_SIZE } from "../constants";

/**
 * Hook to handle pagination logic
 * Single responsibility: Pagination navigation and URL updates
 */
export function usePaginationHandler(
  total: number,
  pageSize: number = DEFAULT_SIZE
) {
  const router = useRouter();
  const { page: pageFromUrl } = useUrlParams();

  const startItem = calculateStartItem(pageFromUrl, pageSize);
  const endItem = calculateEndItem(pageFromUrl, pageSize, total);

  const handlePrevious = useCallback(() => {
    if (pageFromUrl > 1) {
      const newPage = pageFromUrl - 1;
      const params = new URLSearchParams(window.location.search);
      params.set("page", newPage.toString());
      router.replace(`/dashboard/customers?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pageFromUrl, router]);

  const handleNext = useCallback(
    (totalPages: number) => {
      if (pageFromUrl < totalPages) {
        const newPage = pageFromUrl + 1;
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        router.replace(`/dashboard/customers?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pageFromUrl, router]
  );

  return {
    currentPage: pageFromUrl,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
  };
}
