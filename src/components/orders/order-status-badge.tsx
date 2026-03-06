"use client";

import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/orders.types";

interface OrderStatusBadgeProps {
  status: Order["status"];
}

/**
 * Order Status Badge Component
 * Displays a colored badge based on the order status
 */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-400 dark:hover:bg-yellow-500/20 border-0"
        >
          Pending
        </Badge>
      );
    case "processing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border-0"
        >
          Processing
        </Badge>
      );
    case "shipped":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 border-0"
        >
          Shipped
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
        >
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border-0"
        >
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
