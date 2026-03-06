"use client";

import { useRouter } from "next/navigation";
import { Calendar, FileText } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { QuoteStatusBadge } from "./quote-status-badge";
import type { Quote } from "@/types/quotes.types";

interface QuoteTableRowProps {
  quote: Quote;
}

/**
 * Quote Table Row Component
 * Displays a single quote row in the quotes table
 */
export function QuoteTableRow({ quote }: QuoteTableRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/dashboard/quotes/${quote.id}`);
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
      return "Price on Request";
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
        {quote.quote_number}
      </TableCell>
      <TableCell className="h-10 px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs">
            {quote.item_count} item{quote.item_count !== 1 ? "s" : ""}
          </span>
        </div>
      </TableCell>
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {quote.user_email}
      </TableCell>
      <TableCell className="h-10 px-4">
        <QuoteStatusBadge status={quote.status} />
      </TableCell>
      {quote.expires_at && (
        <TableCell className="h-10 px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(quote.expires_at)}
          </div>
        </TableCell>
      )}
      {!quote.expires_at && (
        <TableCell className="h-10 px-4 text-xs text-muted-foreground">
          <span className="text-muted-foreground/50">No expiration</span>
        </TableCell>
      )}
      <TableCell className="h-10 px-4 text-xs text-muted-foreground">
        {formatDate(quote.created_at)}
      </TableCell>
      <TableCell className="h-10 px-4 text-right font-semibold text-xs">
        {quote.total === null ? (
          <span className="text-muted-foreground italic">Price on Request</span>
        ) : (
          formatPrice(quote.total)
        )}
      </TableCell>
    </TableRow>
  );
}
