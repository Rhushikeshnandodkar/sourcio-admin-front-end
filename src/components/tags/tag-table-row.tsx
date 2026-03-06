import { Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Tag } from "@/types/tags.types";
import { EditButton } from "@/components/common/edit-button";

interface TagTableRowProps {
  tag: Tag;
}

/**
 * Tag Table Row Component
 * Displays a single tag row in the tags table
 */
export function TagTableRow({ tag }: TagTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="h-10 px-4 font-medium text-xs">{tag.id}</TableCell>
      <TableCell className="h-10 px-4">
        <div className="flex items-center gap-3">
          {tag.color || tag.icon ? (
            <div
              className="h-8 w-8 flex-shrink-0 rounded-md flex items-center justify-center border"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : "transparent",
              }}
            >
              {tag.icon ? (
                <span className="text-xs">{tag.icon}</span>
              ) : (
                <TagIcon
                  className="h-4 w-4"
                  style={{ color: tag.color || undefined }}
                />
              )}
            </div>
          ) : (
            <div className="h-8 w-8 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex gap-1 items-center">
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-xs">{tag.name}</span>
              {tag.description && (
                <span className="text-xs text-muted-foreground truncate">
                  {tag.description.length > 50
                    ? `${tag.description.substring(0, 50)}...`
                    : tag.description}
                </span>
              )}
            </div>
            <div>
              <EditButton
                href={`/dashboard/tags/${tag.id}/edit`}
                title="Edit tag"
              />
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground font-mono">
        {tag.slug}
      </TableCell>
      <TableCell className="h-10 px-4">
        <Badge
          variant={tag.is_active ? "default" : "secondary"}
          className={
            tag.is_active
              ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border-0"
              : ""
          }
        >
          {tag.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {tag.usage_count}
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {tag.sort_order}
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {new Date(tag.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}
