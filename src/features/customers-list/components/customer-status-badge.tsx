"use client";

import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/types/customers.types";

interface CustomerStatusBadgeProps {
  isActive: Customer["is_active"];
}

/**
 * Customer Status Badge Component
 * Displays a colored badge based on the customer's active status
 */
export function CustomerStatusBadge({ isActive }: CustomerStatusBadgeProps) {
  if (isActive) {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
      >
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border-0"
    >
      Inactive
    </Badge>
  );
}
