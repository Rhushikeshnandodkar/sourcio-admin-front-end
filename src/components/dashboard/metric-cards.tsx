"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Package, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewStats } from "@/types/dashboard.types";

interface MetricCardsProps {
  stats: OverviewStats | null;
  loading?: boolean;
}

export function MetricCards({ stats, loading = false }: MetricCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-5 mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const cards = [
    {
      title: "Total Users",
      icon: Users,
      primaryValue: stats.total_users.toLocaleString(),
      secondaryValue: `${stats.active_users.toLocaleString()} active`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/10",
    },
    {
      title: "Total Quotes",
      icon: FileText,
      primaryValue: stats.total_quotes.toLocaleString(),
      secondaryValue: `${stats.total_quotes.toLocaleString()} quotes`,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-500/10 dark:bg-violet-500/10",
    },
    {
      title: "Total Products",
      icon: Package,
      primaryValue: stats.total_products.toLocaleString(),
      secondaryValue: "In catalogue",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/10",
    },
    {
      title: "Total Revenue",
      icon: DollarSign,
      primaryValue: formatCurrency(stats.total_revenue),
      secondaryValue: formatCurrency(stats.total_revenue),
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="group relative overflow-hidden border-border bg-card hover:shadow transition-all duration-300 hover:-translate-y-0.5 py-0 shadow-none gap-0 bg-linear-to-br from-secondary/10 via-transparent to-primary/5"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-0">
                  <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <div className="space-y-0">
                    <p className="text-2xl xl:text-3xl font-bold tracking-tight">
                      {card.primaryValue}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {card.secondaryValue}
                    </p>
                  </div>
                </div>
                <div
                  className={`${card.bgColor} rounded-md p-2 shrink-0 ring-1 ring-black/5 dark:ring-white/5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
