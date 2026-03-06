"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { RecentQuote } from "@/types/dashboard.types";

interface TopQuotesProps {
  quotes: RecentQuote[];
  loading?: boolean;
}

export function TopQuotes({ quotes, loading = false }: TopQuotesProps) {
  if (loading) {
    return (
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-violet-500/10 dark:bg-violet-500/10 rounded-lg p-2">
              <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <CardTitle className="text-base font-semibold">
              Top Quotes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-violet-500/10 dark:bg-violet-500/10 rounded-lg p-2">
            <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle className="text-base font-semibold">Top Quotes</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
          <Link href="/dashboard/quotes">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No quotes available
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.slice(0, 5).map((quote) => (
              <Link
                key={quote.id}
                href={`/dashboard/quotes/${quote.id}`}
                className="block"
              >
                <div className="flex items-center gap-3 rounded-lg border border-border/30 p-3 transition-all hover:bg-accent/30 hover:border-border/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 dark:bg-violet-500/10 shrink-0">
                    <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {quote.quote_number}
                    </p>
                    <p className="text-xs text-muted-foreground/80 truncate">
                      {quote.user_email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatCurrency(quote.total)}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {quote.item_count}{" "}
                      {quote.item_count === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
