"use client";

import { Badge } from "@/components/ui/badge";
import type { CatalogueProduct } from "@/types/catalogue.types";

interface ProductStatusBadgeProps {
  status: CatalogueProduct["status"];
}

/**
 * Product Status Badge Component
 * Displays a colored badge based on the product status
 */
export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
        >
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20 border-0"
        >
          Inactive
        </Badge>
      );
    case "draft":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border-0"
        >
          Draft
        </Badge>
      );
    case "archived":
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 border-0"
        >
          Archived
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
