"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { STATS_CARD_CONFIGS } from "../constants";

/**
 * Customers Loading Skeleton Component
 * Single responsibility: Display loading state with shimmer effects
 */
export function CustomersLoadingSkeleton() {
  return (
    <>
      {/* Stats Cards Shimmer */}
      <div className="mt-8 flex justify-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {STATS_CARD_CONFIGS.map((cardStyle, i) => (
            <Card
              key={i}
              className={`relative overflow-hidden border-0 gap-0 py-3 bg-linear-to-br ${cardStyle.bg}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-muted/20 rounded-bl-full"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-3 py-0">
                <Skeleton className="h-3.5 w-24 bg-muted animate-pulse" />
                <Skeleton className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
              </CardHeader>
              <CardContent className="px-3 space-y-2 mt-1">
                <Skeleton className="h-7 w-12 bg-muted animate-pulse" />
                <Skeleton className="h-3 w-28 bg-muted/80 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Table Shimmer */}
      <div className="flex justify-center pb-4">
        <div className="w-full rounded-lg border bg-card max-h-[calc(100vh-180px)] overflow-hidden">
          <div className="border-b bg-muted">
            <div className="grid grid-cols-5 gap-4 h-12 px-4 items-center">
              <Skeleton className="h-4 w-16 bg-muted-foreground/20 animate-pulse" />
              <Skeleton className="h-4 w-12 bg-muted-foreground/20 animate-pulse" />
              <Skeleton className="h-4 w-16 bg-muted-foreground/20 animate-pulse" />
              <Skeleton className="h-4 w-20 bg-muted-foreground/20 animate-pulse" />
              <Skeleton className="h-4 w-24 bg-muted-foreground/20 animate-pulse" />
            </div>
          </div>
          <div className="divide-y">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-5 gap-4 h-10 px-4 items-center"
              >
                <Skeleton className="h-4 w-full max-w-[220px] bg-muted animate-pulse" />
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-20 rounded-full bg-muted animate-pulse" />
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-20 rounded-full bg-muted animate-pulse" />
                </div>
                <Skeleton className="h-4 w-28 bg-muted animate-pulse" />
                <Skeleton className="h-4 w-36 bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Shimmer */}
      <div className="shrink-0 w-full px-2 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-1 bg-card/50 backdrop-blur-sm border rounded-lg">
          <Skeleton className="h-4 w-52 bg-muted animate-pulse" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md bg-muted animate-pulse" />
            <Skeleton className="h-4 w-28 bg-muted animate-pulse" />
            <Skeleton className="h-9 w-16 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}
