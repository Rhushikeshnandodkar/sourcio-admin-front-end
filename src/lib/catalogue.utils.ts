/**
 * Catalogue utility functions for transforming API data to UI data
 */
import type {
  ApiProduct,
  CatalogueProduct,
  CatalogueProductVariant,
} from "@/types/catalogue.types";

/**
 * Transform API product to UI product
 */
export function transformApiProductToProduct(
  apiProduct: ApiProduct
): CatalogueProduct {
  // Handle variants if they exist
  const variants: CatalogueProductVariant[] | undefined =
    apiProduct.variants?.map((variant, index: number) => ({
      id: `${apiProduct.id}-${index + 1}`,
      name: variant.name,
      price:
        typeof variant.price === "string"
          ? parseFloat(variant.price)
          : typeof variant.price === "number"
            ? variant.price
            : 0,
      inStock: variant.inStock ?? variant.in_stock ?? false,
    }));

  // Map API status to UI status
  // API has: status: "published" and is_active: boolean
  let status: CatalogueProduct["status"] = "active";
  if (apiProduct.status === "published" && apiProduct.is_active === false) {
    status = "inactive";
  } else if (apiProduct.status === "draft") {
    status = "draft";
  } else if (apiProduct.status === "archived") {
    status = "archived";
  } else if (
    apiProduct.status === "published" &&
    apiProduct.is_active === true
  ) {
    status = "active";
  }

  // Handle category - can be string, object with name property, or null
  const categoryName = apiProduct.category
    ? typeof apiProduct.category === "string"
      ? apiProduct.category
      : typeof apiProduct.category === "object" &&
          apiProduct.category !== null &&
          "name" in apiProduct.category
        ? apiProduct.category.name
        : "Uncategorized"
    : "Uncategorized";

  // Convert price from string to number
  const price =
    typeof apiProduct.price === "string"
      ? parseFloat(apiProduct.price)
      : typeof apiProduct.price === "number"
        ? apiProduct.price
        : 0;

  // Convert rating_average from string to number
  const ratingAverage =
    typeof apiProduct.rating_average === "string"
      ? parseFloat(apiProduct.rating_average)
      : typeof apiProduct.rating_average === "number"
        ? apiProduct.rating_average
        : 0;

  return {
    id: `PROD-${apiProduct.id}`,
    name: apiProduct.name,
    description: apiProduct.description,
    image: apiProduct.image,
    sku: apiProduct.sku ?? null,
    slug: apiProduct.slug ?? null,
    category: categoryName,
    price,
    status,
    isFeatured: apiProduct.is_featured ?? false,
    stockQuantity: apiProduct.stock_quantity ?? 0,
    ratingAverage,
    variants: variants && variants.length > 0 ? variants : undefined,
    // Stock status from backend (no frontend logic)
    hasVariants: apiProduct.has_variants ?? false,
    hasStock: apiProduct.has_stock ?? false,
    inStockVariantsCount: apiProduct.in_stock_variants_count ?? 0,
  };
}
