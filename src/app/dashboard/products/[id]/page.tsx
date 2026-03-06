"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Tag,
  Info,
  Barcode,
  ImageIcon,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import ReusableHeader from "@/components/common/reusable-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { apiGet, apiDelete } from "@/lib/api-client";
import type { Product } from "@/types/catalogue.types";
import { toast } from "sonner";
import Image from "next/image";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const numericId = parseInt(productId, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (isNaN(numericId)) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await apiGet<Product>(
          `${API_BASE_URL}${API_ENDPOINTS.products.detail(numericId)}`
        );
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [numericId]);

  const handleDelete = async () => {
    if (!product) return;

    setIsDeleting(true);
    try {
      await apiDelete(
        `${API_BASE_URL}${API_ENDPOINTS.products.delete(numericId)}`
      );

      toast.success("Product deleted successfully", {
        description: `${product.name} has been removed from your catalog.`,
      });

      setTimeout(() => {
        router.push("/dashboard/catalogue");
      }, 1000);
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
      setIsDeleting(false);
    }
  };

  // Get all images (main image + additional images)
  const getAllImages = () => {
    if (!product) return [];
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.images)
      images.push(...product.images.filter((img) => img && img.trim() !== ""));
    return images;
  };

  const allImages = product ? getAllImages() : [];
  const mainImage = allImages[selectedImageIndex] || product?.image || "";
  const hasVariants = product?.variants && product.variants.length > 0;
  const hasSpecifications =
    product?.specifications && Object.keys(product.specifications).length > 0;

  // Loading skeleton
  if (loading) {
    return (
      <div className="text-base min-h-[calc(100vh-1.1rem)]">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Products", href: "/dashboard/catalogue" },
            { label: "Loading...", isCurrent: true },
          ]}
        />
        <div className="pt-20 px-4 sm:px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Image Gallery Skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              </div>
              {/* Product Info Skeleton */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="text-base min-h-[calc(100vh-1.1rem)]">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Products", href: "/dashboard/catalogue" },
            { label: "Product Details", isCurrent: true },
          ]}
        />
        <div className="pt-20 px-4 sm:px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <XCircle className="h-12 w-12 text-destructive mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Error Loading Product
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {error || "Product not found"}
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                    <Button onClick={() => router.push("/dashboard/catalogue")}>
                      View Catalogue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Calculate discount percentage
  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const formatPrice = (value: number | string | undefined) => {
    if (value === undefined || value === null) return "—";
    const numericValue =
      typeof value === "number" ? value : parseFloat(String(value)) || 0;
    return numericValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const summaryItems = [
    {
      label: "Category",
      value: product.category
        ? typeof product.category === "string"
          ? product.category
          : (product.category as { name?: string })?.name || "Uncategorized"
        : "Uncategorized",
      icon: Tag,
    },
    {
      label: "Brand",
      value: product.brand || "Not specified",
      icon: Info,
    },
    {
      label: "SKU",
      value: product.sku || "Not provided",
      icon: Barcode,
    },
    {
      label: "Media",
      value: `${allImages.length || 0} asset${allImages.length === 1 ? "" : "s"}`,
      icon: ImageIcon,
    },
    {
      label: "Variants",
      value: hasVariants
        ? `${product.variants?.length || 0} option${(product.variants?.length || 0) === 1 ? "" : "s"}`
        : "Single SKU",
      icon: Layers,
    },
  ];

  return (
    <div className="text-base min-h-[calc(100vh-1.1rem)] bg-background">
      <ReusableHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/dashboard/catalogue" },
          { label: product.name, isCurrent: true },
        ]}
      />
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 h-9 px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  router.push(`/dashboard/products/${productId}/edit`)
                }
                className="gap-2 h-9 px-3"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2 h-9 px-3">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the product &quot;{product.name}&quot; from your catalog.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Product overview
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold wrap-break-words leading-tight text-foreground">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {product.category && (
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                        <Tag className="h-3.5 w-3.5" />
                        {typeof product.category === "string"
                          ? product.category
                          : (product.category as { name?: string })?.name ||
                            "Uncategorized"}
                      </Badge>
                    )}
                    {product.brand && (
                      <Badge variant="outline" className="gap-1.5 px-3 py-1">
                        <Info className="h-3.5 w-3.5" />
                        {typeof product.brand === "string"
                          ? product.brand
                          : (product.brand as { name?: string })?.name || ""}
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1.5 px-3 py-1">
                      <Layers className="h-3.5 w-3.5" />
                      {hasVariants
                        ? `${product.variants?.length || 0} variants`
                        : "Single SKU"}
                    </Badge>
                  </div>
                </div>
                {!hasVariants && product.price !== undefined && (
                  <div className="min-w-[180px] rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-primary shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
                      Base price
                    </p>
                    <p className="text-2xl font-bold leading-tight">
                      ₹{formatPrice(product.price)}
                    </p>
                  </div>
                )}
              </div>

              {product.description && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground rounded-lg border border-border/60 bg-muted/30 p-3 line-clamp-4">
                  {product.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t">
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5 shadow-sm"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background border text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-linear-to-br from-muted/60 to-muted group">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        width={600}
                        height={300}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-16 w-16 opacity-20" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground border">
                      {selectedImageIndex + 1}/{allImages.length || 1}
                    </div>
                  </div>

                  {allImages.length > 1 && (
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index
                              ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.03]"
                              : "border-border hover:border-primary/50 hover:shadow-sm"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                            width={100}
                            height={100}
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute inset-0 bg-primary/5" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2.5">
                  <h3 className="text-base font-semibold text-foreground">
                    Key details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                      <span className="text-sm text-muted-foreground">
                        Category
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {product.category
                          ? typeof product.category === "string"
                            ? product.category
                            : (product.category as { name?: string })?.name ||
                              "Uncategorized"
                          : "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                      <span className="text-sm text-muted-foreground">
                        Brand
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {product.brand || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                      <span className="text-sm text-muted-foreground">SKU</span>
                      <span className="text-sm font-semibold text-foreground">
                        {product.sku || "Not provided"}
                      </span>
                    </div>
                    {!hasVariants && (
                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                        <span className="text-sm text-muted-foreground">
                          Price
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          ₹{formatPrice(product.price)}
                        </span>
                      </div>
                    )}
                    {hasVariants && (
                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                        <span className="text-sm text-muted-foreground">
                          Variants
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {product.variants?.length || 0} option
                          {(product.variants?.length || 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
                      <span className="text-sm text-muted-foreground">
                        Gallery assets
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {allImages.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Variants Section */}
          {hasVariants && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Product Variants ({product.variants?.length || 0})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs gap-1"
                  onClick={() => setShowVariants((prev) => !prev)}
                  aria-expanded={showVariants}
                >
                  {showVariants ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {showVariants ? "Collapse" : "Expand"}
                </Button>
              </CardHeader>
              {showVariants && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.variants?.map((variant, index) => {
                      const variantPrice =
                        variant.price !== undefined && variant.price !== null
                          ? typeof variant.price === "number"
                            ? variant.price
                            : parseFloat(String(variant.price)) || null
                          : null;
                      const variantOriginalPrice =
                        variant.originalPrice !== undefined &&
                        variant.originalPrice !== null
                          ? typeof variant.originalPrice === "number"
                            ? variant.originalPrice
                            : parseFloat(String(variant.originalPrice)) || 0
                          : undefined;
                      const discount =
                        variantPrice !== null
                          ? calculateDiscount(
                              variantPrice,
                              variantOriginalPrice
                            )
                          : 0;
                      const variantImages =
                        variant.images?.filter(
                          (img) => img && img.trim() !== ""
                        ) || [];

                      return (
                        <Card
                          key={index}
                          className="border hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Variant Header */}
                            <div className="flex items-start justify-between gap-3 pb-2 border-b">
                              <h3 className="font-semibold text-base flex-1 leading-tight text-foreground">
                                {variant.name}
                              </h3>
                              <Badge
                                variant={
                                  variant.inStock ? "default" : "destructive"
                                }
                                className="shrink-0 gap-1.5 px-2.5 py-1"
                              >
                                {variant.inStock ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span className="text-xs">In Stock</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" />
                                    <span className="text-xs">
                                      Out of Stock
                                    </span>
                                  </>
                                )}
                              </Badge>
                            </div>

                            {/* Variant Images */}
                            {variantImages.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {variantImages
                                  .slice(0, 3)
                                  .map((img, imgIndex) => (
                                    <div
                                      key={imgIndex}
                                      className="relative aspect-square rounded-lg overflow-hidden border bg-muted group-hover:border-primary/30 transition-colors"
                                    >
                                      <Image
                                        src={img}
                                        alt={`${variant.name} ${imgIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        width={100}
                                        height={100}
                                      />
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Variant Pricing */}
                            <div className="space-y-2 pt-1">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                {variantPrice !== null &&
                                variantPrice !== undefined ? (
                                  <>
                                    <span className="text-xl font-bold text-foreground">
                                      ₹{variantPrice.toFixed(2)}
                                    </span>
                                    {variantOriginalPrice &&
                                      variantOriginalPrice > variantPrice && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm text-muted-foreground line-through">
                                            ₹{variantOriginalPrice.toFixed(2)}
                                          </span>
                                          {discount > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs font-semibold"
                                            >
                                              {discount}% OFF
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Request for Quote
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Variant Specifications */}
                            {variant.specifications &&
                              Object.keys(variant.specifications).length >
                                0 && (
                                <div className="pt-2 border-t space-y-1.5">
                                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    Specifications
                                  </h4>
                                  <div className="space-y-1.5">
                                    {Object.entries(variant.specifications).map(
                                      ([key, value]) =>
                                        key &&
                                        value && (
                                          <div
                                            key={key}
                                            className="flex justify-between items-start gap-2 text-xs"
                                          >
                                            <span className="text-muted-foreground font-medium">
                                              {key}:
                                            </span>
                                            <span className="text-foreground font-semibold text-right">
                                              {value}
                                            </span>
                                          </div>
                                        )
                                    )}
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Specifications Section */}
          {hasSpecifications && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-lg">
                  <Info className="h-5 w-5 text-primary" />
                  Product Specifications
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs gap-1"
                  onClick={() => setShowSpecifications((prev) => !prev)}
                  aria-expanded={showSpecifications}
                >
                  {showSpecifications ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {showSpecifications ? "Collapse" : "Expand"}
                </Button>
              </CardHeader>
              {showSpecifications && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {Object.entries(product.specifications || {}).map(
                      ([key, value]) =>
                        key &&
                        value && (
                          <div
                            key={key}
                            className="flex items-start justify-between gap-3 py-2.5 px-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm font-medium text-muted-foreground min-w-[120px]">
                              {key}
                            </span>
                            <span className="text-sm font-semibold text-foreground text-right flex-1">
                              {value}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Additional Images Section */}
          {product.images && product.images.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Product Gallery</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs gap-1"
                  onClick={() => setShowGallery((prev) => !prev)}
                  aria-expanded={showGallery}
                >
                  {showGallery ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {showGallery ? "Collapse" : "Expand"}
                </Button>
              </CardHeader>
              {showGallery && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {product.images
                      .filter((img) => img && img.trim() !== "")
                      .map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-xl overflow-hidden border bg-linear-to-br from-muted/50 to-muted group cursor-pointer"
                        >
                          <Image
                            src={img}
                            alt={`${product.name} gallery ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            width={100}
                            height={100}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
