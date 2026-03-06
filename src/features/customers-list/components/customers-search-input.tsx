"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomersSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.Ref<HTMLInputElement>;
  isMac: boolean;
  loading: boolean;
}

/**
 * Customers Search Input Component
 * Single responsibility: Search input UI with keyboard shortcuts
 */
export function CustomersSearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  onKeyPress,
  inputRef,
  isMac,
  loading,
}: CustomersSearchInputProps) {
  if (loading) {
    return (
      <div className="relative flex items-center w-full max-w-sm">
        <Skeleton className="h-9 w-full rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search by email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        className="pl-9 pr-24 h-9 w-full"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <Button
            onClick={onClear}
            className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={onSearch}
          className="h-7 w-7 flex items-center justify-center text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-md"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {!value && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1">
          <KbdGroup>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      )}
    </div>
  );
}
