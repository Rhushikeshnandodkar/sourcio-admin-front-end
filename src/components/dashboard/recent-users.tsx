"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";
import Link from "next/link";
import type { RecentUser } from "@/types/dashboard.types";

interface RecentUsersProps {
  users: RecentUser[];
  loading?: boolean;
}

const getInitials = (email: string) => {
  return email
    .split("@")[0]
    .split(".")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-rose-500/15 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400";
    case "owner":
      return "bg-blue-500/15 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    default:
      return "bg-slate-500/15 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400";
  }
};

export function RecentUsers({ users, loading = false }: RecentUsersProps) {
  if (loading) {
    return (
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 dark:bg-blue-500/10 rounded-lg p-2">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-base font-semibold">
              Recent Users
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/10 dark:bg-blue-500/10 rounded-lg p-2">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-base font-semibold">
            Recent Users
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
          <Link href="/dashboard/customers">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {users.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No users available
          </div>
        ) : (
          <div className="space-y-2">
            {users.slice(0, 5).map((user) => (
              <Link
                key={user.id}
                href={`/dashboard/customers/${user.id}`}
                className="block"
              >
                <div className="flex items-center gap-3 rounded-lg border border-border/30 p-3 transition-all hover:bg-accent/30 hover:border-border/50">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                      {user.total_quotes !== undefined &&
                        user.total_quotes !== null && (
                          <span className="text-xs text-muted-foreground/70">
                            {user.total_quotes}{" "}
                            {user.total_quotes === 1 ? "quote" : "quotes"}
                          </span>
                        )}
                    </div>
                  </div>
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
