"use client";

import { CircleOff, Star, Edit } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ProductStatusBadge } from "@/components/catalogue/product-status-badge";
import type { CatalogueProduct } from "@/types/catalogue.types";
import Image from "next/image";

interface ProductTableRowProps {
  product: CatalogueProduct;
}

/**
 * Product Table Row Component
 * Displays a single product row in the catalogue table
 */
export function ProductTableRow({ product }: ProductTableRowProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const numericId = product.id.startsWith("PROD-")
    ? product.id.replace("PROD-", "")
    : product.id;

  const handleRowClick = () => {
    router.push(`/dashboard/products/${numericId}`);
  };

  const truncatedDescription = product.description
    ? product.description.length > 50
      ? `${product.description.substring(0, 50)}...`
      : product.description
    : "No description";

  return (
    <TableRow
      className="hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={handleRowClick}
    >
      <TableCell className="h-10 px-4 font-medium text-xs">
        {product.id}
      </TableCell>
      <TableCell className="h-10 px-4">
        <div className="flex items-center gap-3">
          {product.image && !imageError ? (
            <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                width={40}
                height={40}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="h-10 w-10 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
              <CircleOff className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex gap-1">
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-xs truncate">
                {product.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {truncatedDescription}
              </span>
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 flex-shrink-0 cursor-pointer"
                title="Edit product"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/products/${numericId}/edit`);
                }}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground font-mono">
        {product.sku ? (
          <span className="font-medium">{product.sku}</span>
        ) : (
          <span className="text-muted-foreground/50 italic">No SKU</span>
        )}
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {product.category}
      </TableCell>
      <TableCell className="h-10 px-4">
        <div className="flex flex-col gap-1">
          <ProductStatusBadge status={product.status} />
          {product.isFeatured && (
            <Badge
              variant="outline"
              className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 border-0 w-fit text-[10px] px-1.5 py-0"
            >
              Featured
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {product.hasStock ? (
          <span className="text-green-600 dark:text-green-400">
            {product.hasVariants
              ? `${product.inStockVariantsCount} variant${product.inStockVariantsCount !== 1 ? "s" : ""} in stock`
              : product.stockQuantity}
          </span>
        ) : (
          <span className="text-red-600 dark:text-red-400">Out of Stock</span>
        )}
      </TableCell>
      <TableCell className="h-10 px-4 text-xs">
        {product.ratingAverage > 0 ? (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {product.ratingAverage.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">No rating</span>
        )}
      </TableCell>
      <TableCell className="h-10 px-4 text-right font-semibold text-xs">
        ₹{(product.price ?? 0).toLocaleString()}
      </TableCell>
    </TableRow>
  );
}
