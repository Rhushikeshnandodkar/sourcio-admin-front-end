"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomersPaginationProps {
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Customers Pagination Component
 * Single responsibility: Pagination controls UI
 */
export function CustomersPagination({
  currentPage,
  totalPages,
  startItem,
  endItem,
  total,
  onPrevious,
  onNext,
}: CustomersPaginationProps) {
  return (
    <div className="shrink-0 w-full px-2 pb-4">
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
          <span className="text-muted-foreground">customers</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={currentPage === 1}
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
              onClick={onNext}
              disabled={currentPage >= totalPages}
              className="h-9 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
