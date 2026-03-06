"use client";

import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserStats } from "@/types/customers.types";

interface CustomersStatsCardsProps {
  stats: UserStats;
}

/**
 * Customers Stats Cards Component
 * Single responsibility: Display user statistics in card format
 */
export function CustomersStatsCards({ stats }: CustomersStatsCardsProps) {
  return (
    <div className="mt-8 flex justify-center">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Total Users Card */}
        <Card className="relative overflow-hidden border-0 transition-all duration-300 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 gap-0 py-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-slate-200/50 to-transparent dark:from-slate-700/30 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-3 py-0">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Total Users
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 flex items-center justify-center shadow-md">
              <Users className="size-4 text-slate-700 dark:text-slate-300" />
            </div>
          </CardHeader>
          <CardContent className="px-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {stats.total_users.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All registered users
            </p>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card className="relative overflow-hidden border-0 transition-all duration-300 bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 gap-0 py-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-200/40 to-transparent dark:from-emerald-800/20 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-3 py-0">
            <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Active Users
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center shadow-md backdrop-blur-sm">
              <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="px-3">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
              {stats.active_users.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              Currently active
            </p>
          </CardContent>
        </Card>

        {/* Inactive Users Card */}
        <Card className="relative overflow-hidden border-0 transition-all duration-300 bg-linear-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 gap-0 py-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-rose-200/40 to-transparent dark:from-rose-800/20 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-3 py-0">
            <CardTitle className="text-sm font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
              Inactive Users
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-500/20 dark:bg-rose-500/30 flex items-center justify-center shadow-md backdrop-blur-sm">
              <UserX className="size-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="px-3">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
              {stats.inactive_users.toLocaleString()}
            </div>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/70">
              Currently inactive
            </p>
          </CardContent>
        </Card>

        {/* This Month Card */}
        <Card className="relative overflow-hidden border-0 transition-all duration-300 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 gap-0 py-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-200/40 to-transparent dark:from-blue-800/20 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 px-3 py-0">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              This Month
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center shadow-md backdrop-blur-sm">
              <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="px-3">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
              {stats.users_created_this_month.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
              New users this month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
