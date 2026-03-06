/**
 * Dashboard types matching backend API response structure
 */

export interface OverviewStats {
  total_users: number;
  active_users: number;
  total_quotes: number;
  total_products: number;
  total_revenue: number | null;
}

export interface QuoteStats {
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  total_value: number | null;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number | string;
}

export interface QuoteTrendDataPoint {
  date: string;
  count: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
}

export interface UserGrowthDataPoint {
  date: string;
  total_users: number;
  new_users: number;
}

export interface RecentQuote {
  id: number;
  quote_number: string;
  user_id: number;
  user_email: string;
  status: "draft" | "pending" | "approved" | "rejected" | "expired";
  expires_at: string | null;
  subtotal: number | string | null;
  total_tax?: number | string | null;
  total: number | string | null;
  tax_breakdown?: Record<string, number | string> | null;
  has_custom_pricing?: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecentUser {
  id: number;
  email: string;
  role: "user" | "owner" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  total_quotes?: number | null;
}

export interface DashboardStats {
  overview: OverviewStats;
  quotes: QuoteStats;
  revenue_trend: RevenueDataPoint[];
  quote_trend: QuoteTrendDataPoint[];
  user_growth: UserGrowthDataPoint[];
  recent_quotes: RecentQuote[];
  recent_users: RecentUser[];
}

export interface DashboardStatsResponse {
  status: string;
  message: string;
  data: DashboardStats;
}
