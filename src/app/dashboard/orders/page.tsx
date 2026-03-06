"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReusableHeader from "@/components/common/reusable-header";
import { OrderTableRow } from "@/components/orders/order-table-row";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_LIMIT = 50;

/**
 * Orders Page Component
 * Main page for displaying and managing orders
 */
export default function OrdersPage() {
  const [skip, setSkip] = useState(0);
  const { orders, loading, error, total } = useOrders({
    skip,
    limit: DEFAULT_LIMIT,
  });

  const currentPage = Math.floor(skip / DEFAULT_LIMIT) + 1;
  const totalPages = Math.ceil(total / DEFAULT_LIMIT);
  const startItem = skip + 1;
  const endItem = Math.min(skip + DEFAULT_LIMIT, total);

  const handlePrevious = () => {
    if (skip > 0) {
      setSkip(Math.max(0, skip - DEFAULT_LIMIT));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (skip + DEFAULT_LIMIT < total) {
      setSkip(skip + DEFAULT_LIMIT);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex-shrink-0 py-6 px-2">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Orders", isCurrent: true },
          ]}
        />
      </div>

      <div className="flex-1 overflow-auto px-2">
        {loading && (
          <div className="mt-16 flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="mt-16 flex justify-center">
            <div className="w-[95%] rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-destructive">Error: {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 flex justify-center pb-4">
            <div className="w-[95%] mx-auto rounded-lg border bg-card max-h-[calc(100vh-180px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted">
                    <TableHead className="h-12 px-4 font-medium">
                      Order Number
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Items
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      User Email
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium w-[120px]">
                      Status
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Created
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <OrderTableRow key={order.id} order={order} />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && total > 0 && (
        <div className="flex-shrink-0 w-[95%] mx-auto px-2 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-1 bg-card/50 backdrop-blur-sm border rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Showing</span>
              <span className="font-semibold text-foreground">{startItem}</span>
              <span className="text-muted-foreground">to</span>
              <span className="font-semibold text-foreground">{endItem}</span>
              <span className="text-muted-foreground">of</span>
              <span className="font-semibold text-foreground">
                {total.toLocaleString()}
              </span>
              <span className="text-muted-foreground">orders</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={skip === 0}
                  className="h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-2 text-sm px-3">
                  <span className="text-muted-foreground">Page</span>
                  <span className="font-semibold text-foreground">
                    {currentPage}
                  </span>
                  <span className="text-muted-foreground">of</span>
                  <span className="font-semibold text-foreground">
                    {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={skip + DEFAULT_LIMIT >= total}
                  className="h-9 px-3"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
