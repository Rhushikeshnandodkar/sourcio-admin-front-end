import { FolderTree } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Category } from "@/types/categories.types";
import Image from "next/image";

interface CategoryTableRowProps {
  category: Category;
}

/**
 * Category Table Row Component
 * Displays a single category row in the categories table
 */
export function CategoryTableRow({ category }: CategoryTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="h-10 px-4 font-medium text-xs">
        {category.id}
      </TableCell>
      <TableCell className="h-10 px-4">
        <div className="flex items-center gap-3">
          {category.image || category.icon ? (
            <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-xs">{category.icon}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-10 w-10 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex gap-1 items-center">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">{category.name}</span>
                {category.parent_id && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Level {category.level}
                  </Badge>
                )}
              </div>
              {category.description && (
                <span className="text-xs text-muted-foreground truncate">
                  {category.description.length > 50
                    ? `${category.description.substring(0, 50)}...`
                    : category.description}
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground font-mono">
        {category.slug}
      </TableCell>
      <TableCell className="h-10 px-4">
        <Badge
          variant={category.is_active ? "default" : "secondary"}
          className={
            category.is_active
              ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
              : ""
          }
        >
          {category.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {category.product_count}
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {category.sort_order}
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {new Date(category.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}
