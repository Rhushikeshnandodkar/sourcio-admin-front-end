/**
 * API Product type - matches the exact structure returned from the backend API
 */
export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  price: string; // Decimal as string from API
  sku: string | null;
  slug: string | null;
  status: "published" | "draft" | "archived";
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  rating_average: string; // Decimal as string from API
  category?: string | { name: string } | null; // Can be string, object, or null
  variants?: ApiProductVariant[];
  // Stock status fields (calculated by backend)
  has_variants?: boolean;
  has_stock?: boolean;
  in_stock_variants_count?: number;
}

/**
 * API Product Variant type - matches variant structure from API
 */
export interface ApiProductVariant {
  id?: number;
  name: string;
  price: string | number; // Can be string or number
  originalPrice?: string | number;
  specifications?: Record<string, string>;
  images?: string[];
  inStock?: boolean;
  in_stock?: boolean; // API might use snake_case
}

/**
 * UI Product type - transformed version for frontend use
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  brand?: string;
  sku?: string;
  image?: string;
  images?: string[];
  category?: string;
  price: number;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
}

/**
 * UI Product Variant type - transformed version for frontend use
 */
export interface ProductVariant {
  id?: number | string; // Optional ID for existing variants
  name: string;
  price: number;
  originalPrice?: number;
  specifications?: Record<string, string>;
  images?: string[];
  inStock: boolean;
}

export interface TableRowData {
  id: string;
  name: string;
  category: string;
  value: number;
  date: string;
  children?: TableRowData[];
}

export interface AccordionRowProps {
  row: TableRowData;
  defaultOpen?: boolean;
}

// fastapi-pagination Page response structure
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * Catalogue Product type - UI representation of a product in the catalogue
 */
export interface CatalogueProduct {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  sku: string | null;
  slug: string | null;
  category: string;
  price: number;
  status: "active" | "inactive" | "draft" | "archived";
  isFeatured: boolean;
  stockQuantity: number;
  ratingAverage: number;
  variants?: CatalogueProductVariant[];
  // Stock status fields (from backend)
  hasVariants: boolean;
  hasStock: boolean;
  inStockVariantsCount: number;
}

/**
 * Catalogue Product Variant type - UI representation of a product variant
 */
export interface CatalogueProductVariant {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}
