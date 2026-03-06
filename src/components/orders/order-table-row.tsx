"use client";

import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "./order-status-badge";
import type { Order } from "@/types/orders.types";

interface OrderTableRowProps {
  order: Order;
}

/**
 * Order Table Row Component
 * Displays a single order row in the orders table
 */
export function OrderTableRow({ order }: OrderTableRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) {
      return "N/A";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <TableRow
      className="hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={handleRowClick}
    >
      <TableCell className="h-10 px-4 font-medium text-xs font-mono">
        {order.order_number}
      </TableCell>
      <TableCell className="h-10 px-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs">
            {order.item_count} item{order.item_count !== 1 ? "s" : ""}
          </span>
        </div>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {order.user_email}
      </TableCell>
      <TableCell className="h-10 px-4">
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {formatDate(order.created_at)}
      </TableCell>
      <TableCell className="h-10 px-4 text-right font-semibold text-xs">
        {order.total === null ? (
          <span className="text-muted-foreground italic">N/A</span>
        ) : (
          formatPrice(order.total)
        )}
      </TableCell>
    </TableRow>
  );
}
