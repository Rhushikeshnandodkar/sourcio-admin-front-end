"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_PAGINATION_PAGES_TO_SHOW = 7;

/**
 * Category Pagination Component
 * Handles pagination display and navigation for the categories list
 */
export function CategoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CategoryPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const showEllipsis = totalPages > MAX_PAGINATION_PAGES_TO_SHOW;

  if (!showEllipsis) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage <= 4) {
      // Show first 5 pages, then ellipsis, then last page
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Show first page, ellipsis, then last 5 pages
      pages.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
      pages.push("ellipsis");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  const handlePageClick = (page: number, e: React.MouseEvent) => {
    e.preventDefault();
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Pagination>
      <PaginationContent className="gap-1.5">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={cn(
              "h-9 px-3 text-sm font-medium transition-colors",
              currentPage === 1
                ? "pointer-events-none opacity-40 cursor-not-allowed"
                : "hover:bg-muted text-foreground"
            )}
          />
        </PaginationItem>

        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className="h-9 w-9 text-foreground" />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => handlePageClick(page, e)}
                isActive={currentPage === page}
                className={cn(
                  "h-9 min-w-[36px] flex items-center justify-center text-sm font-medium transition-all rounded-md",
                  currentPage === page
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "hover:bg-muted text-foreground"
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={cn(
              "h-9 px-3 text-sm font-medium transition-colors",
              currentPage === totalPages
                ? "pointer-events-none opacity-40 cursor-not-allowed text-foreground"
                : "hover:bg-muted text-foreground"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
