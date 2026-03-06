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
import { ProductTableRow } from "@/components/catalogue/product-table-row";
import { ProductPagination } from "@/components/catalogue/product-pagination";
import { useProducts } from "@/hooks/use-products";
import { CATALOGUE_CONSTANTS } from "@/lib/catalogue.constants";

/**
 * Catalogue Page Component
 * Main page for displaying and managing the product catalogue
 */
export default function CataloguePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { products, loading, error, total, totalPages } = useProducts(
    currentPage,
    CATALOGUE_CONSTANTS.DEFAULT_PAGE_SIZE
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
            { label: "Catalogue", isCurrent: true },
          ]}
        />
      </div>

      <div className="flex-1 overflow-auto px-2">
        {loading && (
          <div className="mt-16 flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading products...</p>
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
                      Product
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">SKU</TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Category
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium w-[120px]">
                      Status
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Stock
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium">
                      Rating
                    </TableHead>
                    <TableHead className="h-12 px-4 font-medium text-right">
                      Price
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <ProductTableRow key={product.id} product={product} />
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
                {(currentPage - 1) * CATALOGUE_CONSTANTS.DEFAULT_PAGE_SIZE + 1}
              </span>
              <span className="text-muted-foreground">to</span>
              <span className="font-semibold text-foreground">
                {Math.min(
                  currentPage * CATALOGUE_CONSTANTS.DEFAULT_PAGE_SIZE,
                  total
                )}
              </span>
              <span className="text-muted-foreground">of</span>
              <span className="font-semibold text-foreground">
                {total.toLocaleString()}
              </span>
              <span className="text-muted-foreground">products</span>
            </div>
            <div className="flex items-center gap-4">
              {totalPages > 1 ? (
                <ProductPagination
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
