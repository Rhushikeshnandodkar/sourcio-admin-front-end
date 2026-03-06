"use client";

import { Badge } from "@/components/ui/badge";
import type { Quote } from "@/types/quotes.types";

interface QuoteStatusBadgeProps {
  status: Quote["status"];
}

/**
 * Quote Status Badge Component
 * Displays a colored badge based on the quote status
 */
export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  switch (status) {
    case "draft":
      return (
        <Badge
          variant="outline"
          className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20 border-0"
        >
          Draft
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-400 dark:hover:bg-yellow-500/20 border-0"
        >
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
        >
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border-0"
        >
          Rejected
        </Badge>
      );
    case "expired":
      return (
        <Badge
          variant="outline"
          className="bg-gray-400/15 text-gray-600 hover:bg-gray-400/25 dark:bg-gray-400/10 dark:text-gray-500 dark:hover:bg-gray-400/20 border-0"
        >
          Expired
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
