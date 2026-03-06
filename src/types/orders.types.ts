/**
 * Order types for admin panel
 */

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  price: string | number;
  quantity: number;
  image: string | null;
  gst_rate?: number | null;
  item_total?: number | string | null;
  tax_amount?: number | string | null;
  item_total_with_tax?: number | string | null;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  quote_id: number;
  user_id: number;
  user_email: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: string | number | null;
  total_tax?: string | number | null;
  total: string | number | null;
  tax_breakdown?: Record<string, number | string> | null;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrdersResponse {
  status: string;
  message: string;
  data: {
    orders: Order[];
    total: number;
    skip: number;
    limit: number;
  };
}

export interface UserInfo {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderDetail {
  id: number;
  order_number: string;
  quote_id: number;
  user_id: number;
  user: UserInfo;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: string | number | null;
  total_tax?: string | number | null;
  total: string | number | null;
  tax_breakdown?: Record<string, number | string> | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderDetailResponse {
  status: string;
  message: string;
  data: OrderDetail;
}
