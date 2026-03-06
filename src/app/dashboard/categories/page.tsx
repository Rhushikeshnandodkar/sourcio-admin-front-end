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
import { CategoryTableRow } from "@/components/categories/category-table-row";
import { CategoryPagination } from "@/components/categories/category-pagination";
import { useCategories } from "@/hooks/use-categories";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Categories Page Component
 * Main page for displaying and managing categories
 */
export default function CategoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { categories, loading, error, total, totalPages } = useCategories(
    currentPage,
    DEFAULT_PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex-shrink-0 py-6 px-2">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Categories", isCurrent: true },
          ]}
        />
      </div>

      <div className="flex-1 overflow-auto px-2">
        {loading && (
          <div className="mt-16 flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading categories...</p>
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
                    <TableHead className="h-12 px-4 font-medium">ID</TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Category
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Slug
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium w-[120px]">
                      Status
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Products
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Sort Order
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <CategoryTableRow key={category.id} category={category} />
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
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * DEFAULT_PAGE_SIZE + 1}
              </span>
              <span className="text-muted-foreground">to</span>
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * DEFAULT_PAGE_SIZE, total)}
              </span>
              <span className="text-muted-foreground">of</span>
              <span className="font-semibold text-foreground">
                {total.toLocaleString()}
              </span>
              <span className="text-muted-foreground">categories</span>
            </div>
            <div className="flex items-center gap-4">
              {totalPages > 1 ? (
                <CategoryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Page</span>
                  <span className="font-semibold text-foreground">
                    {currentPage}
                  </span>
                  <span className="text-muted-foreground">of</span>
                  <span className="font-semibold text-foreground">
                    {totalPages}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
