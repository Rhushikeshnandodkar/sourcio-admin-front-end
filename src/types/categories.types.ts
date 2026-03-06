/**
 * Category types - matches the structure returned from the backend API
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  level: number;
  path: string | null;
  image: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: string | null;
}

// fastapi-pagination Page response structure
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
