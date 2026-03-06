/**
 * Tag types - matches the structure returned from the backend API
 */
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  usage_count: number;
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
