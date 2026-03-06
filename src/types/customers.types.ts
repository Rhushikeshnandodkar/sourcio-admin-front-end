/**
 * Customer types for admin panel
 */

export type UserRole = "user" | "owner";

export interface Customer {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  category?: string | null;
  gst_number?: string | null;
  shipping_address1?: string | null;
  shipping_address2?: string | null;
  shipping_pin?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_country?: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  total_quotes?: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_created_this_month: number;
}

export interface CustomersResponse {
  items: Customer[];
  total: number;
  page: number;
  size: number;
  pages: number;
  stats: UserStats;
}

export interface CustomersApiResponse {
  status: string;
  message: string;
  data: CustomersResponse;
}

export interface CustomerDetail {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  category?: string | null;
  gst_number?: string | null;
  shipping_address1?: string | null;
  shipping_address2?: string | null;
  shipping_pin?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_country?: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  total_quotes?: number;
}

export interface CustomerDetailResponse {
  status: string;
  message: string;
  data: {
    user: CustomerDetail;
  };
}
