"use client";

import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/types/customers.types";

interface CustomerRoleBadgeProps {
  role: Customer["role"];
}

/**
 * Customer Role Badge Component
 * Displays a colored badge based on the customer's role
 */
export function CustomerRoleBadge({ role }: CustomerRoleBadgeProps) {
  if (role === "owner") {
    return (
      <Badge
        variant="outline"
        className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 border-0"
      >
        Owner
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border-0"
    >
      Customer
    </Badge>
  );
}
