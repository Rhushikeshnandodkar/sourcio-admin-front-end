"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUrlParams } from "./use-url-params";

/**
 * Hook to manage search functionality
 * Single responsibility: Search input and URL synchronization
 */
export function useSearchHandler() {
  const router = useRouter();
  const { search: searchFromUrl } = useUrlParams();
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [isMac, setIsMac] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(
      typeof window !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0
    );
  }, []);

  // Sync search input with URL when URL changes externally (browser back/forward)
  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  // Keyboard shortcut handler (Cmd+K / Ctrl+K to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update URL with search query
  const handleSearch = useCallback(
    (searchValue: string) => {
      const params = new URLSearchParams(window.location.search);

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }

      // Reset to page 1 when search changes
      params.set("page", "1");

      router.replace(`/dashboard/customers?${params.toString()}`);
    },
    [router]
  );

  const handleSearchClick = useCallback(() => {
    handleSearch(searchInput);
  }, [searchInput, handleSearch]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(searchInput);
      }
    },
    [searchInput, handleSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    handleSearch("");
  }, [handleSearch]);

  return {
    searchInput,
    setSearchInput,
    searchInputRef,
    isMac,
    handleSearchClick,
    handleKeyPress,
    handleClearSearch,
  };
}
