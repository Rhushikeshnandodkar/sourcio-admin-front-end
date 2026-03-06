/**
 * Quote types for admin panel
 */

export interface QuoteItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  price: string | number;
  requires_custom_price: boolean;
  quantity: number;
  image: string | null;
  gst_rate?: number | null;
  item_total?: number | string | null;
  tax_amount?: number | string | null;
  item_total_with_tax?: number | string | null;
  created_at: string;
}

export interface Quote {
  id: number;
  quote_number: string;
  user_id: number;
  user_email: string;
  status: "draft" | "pending" | "approved" | "rejected" | "expired";
  expires_at: string | null;
  subtotal: string | number | null;
  total_tax?: string | number | null;
  total: string | number | null;
  tax_breakdown?: Record<string, number | string> | null;
  has_custom_pricing?: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuotesResponse {
  status: string;
  message: string;
  data: {
    quotes: Quote[];
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

export interface QuoteDetail {
  id: number;
  quote_number: string;
  user_id: number;
  user: UserInfo;
  status: "draft" | "pending" | "approved" | "rejected" | "expired";
  expires_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  subtotal: string | number | null;
  total_tax?: string | number | null;
  total: string | number | null;
  tax_breakdown?: Record<string, number | string> | null;
  has_custom_pricing?: boolean;
  items: QuoteItem[];
  created_at: string;
  updated_at: string;
}

export interface QuoteDetailResponse {
  status: string;
  message: string;
  data: QuoteDetail;
}

export interface PriceHistoryEntry {
  id: number;
  product_id: number;
  variant_id: number | null;
  price: string | number;
  quote_id: number | null;
  quote_item_id: number | null;
  created_by: number;
  created_at: string;
}

export interface PriceHistoryResponse {
  status: string;
  message: string;
  data: {
    prices: PriceHistoryEntry[];
    product_id: number;
    variant_id: number | null;
  };
}

export interface QuoteItemPriceUpdate {
  price: number;
}

export interface QuoteItemGstUpdate {
  gst_rate: number | null;
}
