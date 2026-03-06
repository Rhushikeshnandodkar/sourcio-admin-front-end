"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReusableHeader from "@/components/common/reusable-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  X,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { apiGet, apiPut } from "@/lib/api-client";
import type { Product } from "@/types/catalogue.types";

// Category type
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

// API Response types
interface CategoriesResponse {
  items?: Category[];
  data?: Category[];
}

// Schema definition
const specificationSchema = z.record(z.string(), z.string());

// Helper to validate URL or base64 data URL
const imageUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true; // Allow empty strings
      // Check if it's a valid URL
      try {
        new URL(val);
        return true;
      } catch {
        // Check if it's a base64 data URL
        return val.startsWith("data:image/");
      }
    },
    { message: "Must be a valid URL or base64 data URL" }
  )
  .optional()
  .or(z.literal(""));

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be positive").optional(),
  originalPrice: z
    .number()
    .min(0, "Original price must be positive")
    .optional(),
  specifications: specificationSchema.optional(),
  images: z.array(imageUrlSchema).optional(),
  inStock: z.boolean(),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  image: imageUrlSchema,
  images: z.array(imageUrlSchema).optional(),
  category_id: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive").optional(),
  variants: z.array(variantSchema).optional(),
  specifications: specificationSchema.optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const numericId = parseInt(productId, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [mainImageType, setMainImageType] = useState<"upload" | "url">("url");
  const [imageTypes, setImageTypes] = useState<
    Record<number, "upload" | "url">
  >({});
  const [variantImageTypes, setVariantImageTypes] = useState<
    Record<string, Record<number, "upload" | "url">>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      sku: "",
      image: "",
      images: [],
      category_id: "",
      price: undefined,
      variants: [],
      specifications: {},
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const [specEntries, setSpecEntries] = useState<
    Array<{ key: string; value: string }>
  >([]);

  const watchedVariants = form.watch("variants");
  const hasVariants = Boolean(watchedVariants && watchedVariants.length > 0);

  // Watch all form values for live preview
  const formValues = form.watch();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await apiGet<CategoriesResponse | Category[]>(
          `${API_BASE_URL}${API_ENDPOINTS.categories.list}?size=100`
        );
        // Handle paginated response - extract items from the response
        const categoryItems = Array.isArray(data)
          ? data
          : data.items || data.data || [];
        // Filter only active categories
        const activeCategories = Array.isArray(categoryItems)
          ? categoryItems.filter((cat: Category) => cat.is_active !== false)
          : [];

        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories", {
          description: "Please refresh the page to try again.",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (isNaN(numericId)) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      // Wait for categories to load before fetching product
      if (isLoadingCategories) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await apiGet<Product>(
          `${API_BASE_URL}${API_ENDPOINTS.products.detail(numericId)}`
        );
        setProduct(data);

        // Transform product data to form values
        let categoryId = "";
        if (data.category) {
          if (typeof data.category === "string") {
            const foundCategory = categories.find(
              (cat) => cat.name === data.category
            );
            categoryId = foundCategory?.id.toString() || "";
          } else {
            const categoryObj = data.category as { id?: number; name?: string };
            if (categoryObj.id) {
              categoryId = categoryObj.id.toString();
            } else if (categoryObj.name) {
              const foundCategory = categories.find(
                (cat) => cat.name === categoryObj.name
              );
              categoryId = foundCategory?.id.toString() || "";
            }
          }
        }

        // Determine image type (URL vs base64)
        const mainImg = data.image || "";
        const isMainImageUrl = mainImg && !mainImg.startsWith("data:image/");
        setMainImageType(isMainImageUrl ? "url" : "upload");

        // Set image types for additional images
        const imageTypesMap: Record<number, "upload" | "url"> = {};
        (data.images || []).forEach((img, idx) => {
          imageTypesMap[idx] =
            img && !img.startsWith("data:image/") ? "url" : "upload";
        });
        setImageTypes(imageTypesMap);

        // Set variant image types
        const variantImageTypesMap: Record<
          string,
          Record<number, "upload" | "url">
        > = {};
        (data.variants || []).forEach((variant, vIdx) => {
          variantImageTypesMap[vIdx] = {};
          (variant.images || []).forEach((img, imgIdx) => {
            variantImageTypesMap[vIdx][imgIdx] =
              img && !img.startsWith("data:image/") ? "url" : "upload";
          });
        });
        setVariantImageTypes(variantImageTypesMap);

        // Transform variants
        const transformedVariants = (data.variants || []).map((variant) => ({
          id: variant.id?.toString(),
          name: variant.name,
          price:
            typeof variant.price === "number"
              ? variant.price
              : variant.price
                ? parseFloat(String(variant.price))
                : undefined,
          originalPrice:
            typeof variant.originalPrice === "number"
              ? variant.originalPrice
              : variant.originalPrice
                ? parseFloat(String(variant.originalPrice))
                : undefined,
          specifications: variant.specifications || {},
          images: variant.images || [],
          inStock: variant.inStock ?? true,
        }));

        // Transform specifications
        const specEntriesArray = Object.entries(data.specifications || {}).map(
          ([key, value]) => ({
            key,
            value: String(value),
          })
        );

        // Set form values
        form.reset({
          name: data.name || "",
          description: data.description || "",
          brand: data.brand || "",
          sku: data.sku || "",
          image: mainImg,
          images: data.images || [],
          category_id: categoryId,
          price:
            typeof data.price === "number"
              ? data.price
              : data.price
                ? parseFloat(String(data.price))
                : undefined,
          variants: transformedVariants,
          specifications: data.specifications || {},
        });

        setSpecEntries(specEntriesArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching product:", err);
        toast.error("Failed to load product", {
          description:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [numericId, categories, isLoadingCategories]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      // Transform form data to match backend API structure
      const payload = {
        name: data.name,
        description: data.description || undefined,
        brand: data.brand || undefined,
        sku: data.sku || undefined,
        image: data.image || undefined,
        images: data.images?.filter((img) => img && img.trim() !== "") || [],
        category_id: data.category_id
          ? parseInt(data.category_id, 10)
          : undefined,
        price: data.price ?? null,
        variants:
          data.variants?.map((variant) => ({
            id: variant.id ? parseInt(variant.id, 10) : undefined,
            name: variant.name,
            price: variant.price ?? null,
            originalPrice: variant.originalPrice || undefined,
            specifications: variant.specifications || {},
            images:
              variant.images?.filter((img) => img && img.trim() !== "") || [],
            inStock: variant.inStock,
          })) || [],
        specifications: data.specifications || {},
      };

      const updatedProduct = await apiPut<Product>(
        `${API_BASE_URL}${API_ENDPOINTS.products.update(numericId)}`,
        payload
      );

      toast.success("Product updated successfully!", {
        description: `${updatedProduct.name} has been updated in your catalog.`,
      });

      setTimeout(() => {
        router.push(`/dashboard/products/${productId}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImageUrl = () => {
    const newImages = form.getValues("images") || [];
    const newIndex = newImages.length;
    form.setValue("images", [...newImages, ""]);
    setImageTypes({ ...imageTypes, [newIndex]: "url" });
  };

  const removeImageUrl = (index: number) => {
    const images = form.getValues("images") || [];
    form.setValue(
      "images",
      images.filter((_, i) => i !== index)
    );
    // Clean up image type state
    const newTypes = { ...imageTypes };
    delete newTypes[index];
    // Shift indices for remaining items
    const updatedTypes: Record<number, "upload" | "url"> = {};
    Object.keys(newTypes).forEach((key) => {
      const numKey = Number(key);
      if (numKey > index) {
        updatedTypes[numKey - 1] = newTypes[numKey];
      } else if (numKey < index) {
        updatedTypes[numKey] = newTypes[numKey];
      }
    });
    setImageTypes(updatedTypes);
  };

  const addSpecification = () => {
    setSpecEntries([...specEntries, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    const newEntries = specEntries.filter((_, i) => i !== index);
    setSpecEntries(newEntries);
    const specs = form.getValues("specifications") || {};
    const removedKey = specEntries[index]?.key;
    if (removedKey) {
      const newSpecs = { ...specs };
      delete newSpecs[removedKey];
      form.setValue("specifications", newSpecs);
    }
  };

  const updateSpecification = (index: number, key: string, value: string) => {
    const newEntries = [...specEntries];
    const oldKey = newEntries[index]?.key;

    // Remove old key from form if it exists
    if (oldKey && oldKey !== key) {
      const specs = form.getValues("specifications") || {};
      const newSpecs = { ...specs };
      delete newSpecs[oldKey];
      if (key) {
        newSpecs[key] = value;
      }
      form.setValue("specifications", newSpecs);
    } else if (key) {
      // Update or add new key
      const specs = form.getValues("specifications") || {};
      form.setValue("specifications", { ...specs, [key]: value });
    }

    newEntries[index] = { key, value };
    setSpecEntries(newEntries);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileUpload(file);
      form.setValue("image", base64);
      setMainImageType("upload");
    }
  };

  const handleImageFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileUpload(file);
      const images = form.getValues("images") || [];
      const newImages = [...images];
      newImages[index] = base64;
      form.setValue("images", newImages);
      setImageTypes({ ...imageTypes, [index]: "upload" });
    }
  };

  const handleVariantImageFileChange = async (
    variantIndex: number,
    imageIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileUpload(file);
      const variants = form.getValues("variants") || [];
      const variant = variants[variantIndex];
      if (variant) {
        const images = variant.images || [];
        const newImages = [...images];
        newImages[imageIndex] = base64;
        const newVariants = [...variants];
        newVariants[variantIndex] = { ...variant, images: newImages };
        form.setValue("variants", newVariants);
        setVariantImageTypes({
          ...variantImageTypes,
          [variantIndex]: {
            ...variantImageTypes[variantIndex],
            [imageIndex]: "upload",
          },
        });
      }
    }
  };

  // Loading state
  if (loading || isLoadingCategories) {
    return (
      <div className="text-base min-h-[calc(100vh-1.1rem)]">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Products", href: "/dashboard/catalogue" },
            { label: "Edit Product", isCurrent: true },
          ]}
        />
        <div className="pt-20 px-6 pb-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading product data...</p>
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
            { label: "Edit Product", isCurrent: true },
          ]}
        />
        <div className="pt-20 px-6 pb-6">
          <div className="max-w-[1600px] mx-auto">
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

  return (
    <div className="text-base min-h-[calc(100vh-1.1rem)]">
      <ReusableHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/dashboard/catalogue" },
          { label: product.name, href: `/dashboard/products/${productId}` },
          { label: "Edit", isCurrent: true },
        ]}
      />
      <div className="pt-20 px-6 pb-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-2 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
            <h1 className="text-base font-semibold">Edit Product</h1>
            <p className="text-muted-foreground text-xs">
              Update the product details below
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_600px] gap-6">
            {/* Form Section - Takes most of the grid */}
            <div className="min-w-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                      <TabsTrigger value="variants">
                        Variants & Pricing
                      </TabsTrigger>
                      <TabsTrigger value="specifications">
                        Specifications
                      </TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Product Name */}
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product Name *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter product name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Brand */}
                            <FormField
                              control={form.control}
                              name="brand"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Brand</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter brand name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* SKU */}
                            <FormField
                              control={form.control}
                              name="sku"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>SKU</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter SKU" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Category */}
                            <FormField
                              control={form.control}
                              name="category_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category *</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isLoadingCategories}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={
                                            isLoadingCategories
                                              ? "Loading categories..."
                                              : "Select a category"
                                          }
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.length === 0 &&
                                      !isLoadingCategories ? (
                                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                          No categories available
                                        </div>
                                      ) : (
                                        categories.map((category) => (
                                          <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                          >
                                            {category.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Price (only show if no variants) */}
                            {!hasVariants && (
                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem className="lg:col-span-2">
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value
                                              ? parseFloat(e.target.value)
                                              : undefined
                                          )
                                        }
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Leave empty if product requires custom
                                      pricing
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            {/* Description */}
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem className="lg:col-span-2">
                                  <FormLabel>Description *</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter product description"
                                      className="min-h-[120px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Images Tab */}
                    <TabsContent value="images" className="mt-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Product Images</CardTitle>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addImageUrl}
                            >
                              <Plus className="size-4 mr-2" />
                              Add Image
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* Main Image */}
                            <div>
                              <Label className="text-sm font-medium mb-3 block">
                                Main Image *
                              </Label>
                              <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="space-y-3">
                                      <RadioGroup
                                        value={mainImageType}
                                        onValueChange={(value) =>
                                          setMainImageType(
                                            value as "upload" | "url"
                                          )
                                        }
                                        className="flex gap-4"
                                      >
                                        <div className="flex items-center gap-2">
                                          <RadioGroupItem
                                            value="url"
                                            id="main-url"
                                          />
                                          <Label
                                            htmlFor="main-url"
                                            className="cursor-pointer flex items-center gap-2"
                                          >
                                            <LinkIcon className="size-4" />
                                            URL
                                          </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <RadioGroupItem
                                            value="upload"
                                            id="main-upload"
                                          />
                                          <Label
                                            htmlFor="main-upload"
                                            className="cursor-pointer flex items-center gap-2"
                                          >
                                            <Upload className="size-4" />
                                            Upload
                                          </Label>
                                        </div>
                                      </RadioGroup>

                                      {mainImageType === "url" ? (
                                        <Input
                                          placeholder="https://example.com/image.jpg"
                                          {...field}
                                        />
                                      ) : (
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleMainImageFileChange}
                                          className="cursor-pointer"
                                        />
                                      )}

                                      {field.value && (
                                        <div className="relative inline-block">
                                          <Image
                                            src={field.value}
                                            alt="Main preview"
                                            className="h-32 w-32 object-cover rounded-md border"
                                            width={128}
                                            height={128}
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                            onClick={() => {
                                              form.setValue("image", "");
                                              setMainImageType("url");
                                            }}
                                          >
                                            <X className="size-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                    <FormDescription>
                                      Primary product image displayed in
                                      listings
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Separator />

                            {/* Additional Images Grid */}
                            <div>
                              <Label className="text-sm font-medium mb-3 block">
                                Additional Images
                              </Label>
                              {(form.watch("images") || []).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                  {(form.watch("images") || []).map(
                                    (imageUrl, index) => (
                                      <FormField
                                        key={index}
                                        control={form.control}
                                        name={
                                          `images.${index}` as `images.${number}`
                                        }
                                        render={({ field }) => (
                                          <FormItem>
                                            <Card className="relative group">
                                              <CardContent className="p-3">
                                                <div className="space-y-2">
                                                  <RadioGroup
                                                    value={
                                                      imageTypes[index] || "url"
                                                    }
                                                    onValueChange={(value) =>
                                                      setImageTypes({
                                                        ...imageTypes,
                                                        [index]: value as
                                                          | "upload"
                                                          | "url",
                                                      })
                                                    }
                                                    className="flex gap-2 text-xs"
                                                  >
                                                    <div className="flex items-center gap-1">
                                                      <RadioGroupItem
                                                        value="url"
                                                        id={`img-url-${index}`}
                                                        className="size-3"
                                                      />
                                                      <Label
                                                        htmlFor={`img-url-${index}`}
                                                        className="cursor-pointer flex items-center gap-1 text-xs"
                                                      >
                                                        <LinkIcon className="size-3" />
                                                        URL
                                                      </Label>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <RadioGroupItem
                                                        value="upload"
                                                        id={`img-upload-${index}`}
                                                        className="size-3"
                                                      />
                                                      <Label
                                                        htmlFor={`img-upload-${index}`}
                                                        className="cursor-pointer flex items-center gap-1 text-xs"
                                                      >
                                                        <Upload className="size-3" />
                                                        Upload
                                                      </Label>
                                                    </div>
                                                  </RadioGroup>

                                                  {imageTypes[index] ===
                                                  "url" ? (
                                                    <Input
                                                      placeholder="Image URL"
                                                      {...field}
                                                      className="h-8 text-xs"
                                                    />
                                                  ) : (
                                                    <Input
                                                      type="file"
                                                      accept="image/*"
                                                      onChange={(e) =>
                                                        handleImageFileChange(
                                                          index,
                                                          e
                                                        )
                                                      }
                                                      className="cursor-pointer h-8 text-xs"
                                                    />
                                                  )}

                                                  {field.value && (
                                                    <div className="relative aspect-square w-full">
                                                      <Image
                                                        src={field.value}
                                                        alt={`Preview ${index + 1}`}
                                                        className="h-full w-full object-cover rounded-md border"
                                                        width={128}
                                                        height={128}
                                                      />
                                                      <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() =>
                                                          removeImageUrl(index)
                                                        }
                                                      >
                                                        <X className="size-3" />
                                                      </Button>
                                                    </div>
                                                  )}
                                                </div>
                                              </CardContent>
                                            </Card>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                  <p className="text-sm">
                                    No additional images added yet
                                  </p>
                                  <p className="text-xs mt-1">
                                    Click &quot;Add Image&quot; to get started
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Variants Tab */}
                    <TabsContent value="variants" className="mt-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Product Variants</CardTitle>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                appendVariant({
                                  name: "",
                                  price: undefined,
                                  originalPrice: undefined,
                                  specifications: {},
                                  images: [],
                                  inStock: true,
                                })
                              }
                            >
                              <Plus className="size-4 mr-2" />
                              Add Variant
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {variantFields.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No variants added yet.</p>
                              <p className="text-sm mt-2">
                                Add variants if your product comes in different
                                options (sizes, colors, etc.)
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {variantFields.map((field, index) => (
                                <Card key={field.id} className="border-2">
                                  <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-lg">
                                        Variant {index + 1}
                                      </CardTitle>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeVariant(index)}
                                      >
                                        <Trash2 className="size-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`variants.${index}.name`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>
                                              Variant Name *
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="e.g., Standard, Premium"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name={`variants.${index}.inStock`}
                                        render={({ field }) => (
                                          <FormItem className="flex items-center gap-2 pt-8">
                                            <FormControl>
                                              <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="size-4 rounded border-input"
                                              />
                                            </FormControl>
                                            <FormLabel className="!mt-0">
                                              In Stock
                                            </FormLabel>
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name={`variants.${index}.price`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="Leave empty for custom pricing"
                                                {...field}
                                                onChange={(e) =>
                                                  field.onChange(
                                                    e.target.value
                                                      ? parseFloat(
                                                          e.target.value
                                                        )
                                                      : undefined
                                                  )
                                                }
                                                value={field.value ?? ""}
                                              />
                                            </FormControl>
                                            <FormDescription>
                                              Leave empty if price requires
                                              custom quote
                                            </FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name={`variants.${index}.originalPrice`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>
                                              Original Price
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) =>
                                                  field.onChange(
                                                    e.target.value
                                                      ? parseFloat(
                                                          e.target.value
                                                        )
                                                      : undefined
                                                  )
                                                }
                                                value={field.value || ""}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>

                                    <Separator className="my-4" />

                                    <div>
                                      <div className="flex items-center justify-between mb-3">
                                        <Label className="text-sm font-medium">
                                          Variant Images
                                        </Label>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const currentImages =
                                              form.getValues(
                                                `variants.${index}.images`
                                              ) || [];
                                            const newIndex =
                                              currentImages.length;
                                            form.setValue(
                                              `variants.${index}.images`,
                                              [...currentImages, ""]
                                            );
                                            setVariantImageTypes({
                                              ...variantImageTypes,
                                              [index]: {
                                                ...variantImageTypes[index],
                                                [newIndex]: "url",
                                              },
                                            });
                                          }}
                                        >
                                          <Plus className="size-4 mr-2" />
                                          Add Image
                                        </Button>
                                      </div>

                                      {(
                                        form.watch(
                                          `variants.${index}.images`
                                        ) || []
                                      ).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {(
                                            form.watch(
                                              `variants.${index}.images`
                                            ) || []
                                          ).map(
                                            (
                                              imageUrl: string | undefined,
                                              imgIndex: number
                                            ) => {
                                              const variantKey = `${index}-${imgIndex}`;
                                              const imageType =
                                                variantImageTypes[index]?.[
                                                  imgIndex
                                                ] || "url";
                                              return (
                                                <FormField
                                                  key={imgIndex}
                                                  control={form.control}
                                                  name={
                                                    `variants.${index}.images.${imgIndex}` as `variants.${number}.images.${number}`
                                                  }
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <Card className="relative group">
                                                        <CardContent className="p-3">
                                                          <div className="space-y-2">
                                                            <RadioGroup
                                                              value={imageType}
                                                              onValueChange={(
                                                                value
                                                              ) => {
                                                                setVariantImageTypes(
                                                                  {
                                                                    ...variantImageTypes,
                                                                    [index]: {
                                                                      ...variantImageTypes[
                                                                        index
                                                                      ],
                                                                      [imgIndex]:
                                                                        value as
                                                                          | "upload"
                                                                          | "url",
                                                                    },
                                                                  }
                                                                );
                                                              }}
                                                              className="flex gap-2 text-xs"
                                                            >
                                                              <div className="flex items-center gap-1">
                                                                <RadioGroupItem
                                                                  value="url"
                                                                  id={`variant-img-url-${variantKey}`}
                                                                  className="size-3"
                                                                />
                                                                <Label
                                                                  htmlFor={`variant-img-url-${variantKey}`}
                                                                  className="cursor-pointer flex items-center gap-1 text-xs"
                                                                >
                                                                  <LinkIcon className="size-3" />
                                                                  URL
                                                                </Label>
                                                              </div>
                                                              <div className="flex items-center gap-1">
                                                                <RadioGroupItem
                                                                  value="upload"
                                                                  id={`variant-img-upload-${variantKey}`}
                                                                  className="size-3"
                                                                />
                                                                <Label
                                                                  htmlFor={`variant-img-upload-${variantKey}`}
                                                                  className="cursor-pointer flex items-center gap-1 text-xs"
                                                                >
                                                                  <Upload className="size-3" />
                                                                  Upload
                                                                </Label>
                                                              </div>
                                                            </RadioGroup>

                                                            {imageType ===
                                                            "url" ? (
                                                              <Input
                                                                placeholder="Image URL"
                                                                {...field}
                                                                className="h-8 text-xs"
                                                              />
                                                            ) : (
                                                              <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                  handleVariantImageFileChange(
                                                                    index,
                                                                    imgIndex,
                                                                    e
                                                                  )
                                                                }
                                                                className="cursor-pointer h-8 text-xs"
                                                              />
                                                            )}

                                                            {field.value && (
                                                              <div className="relative aspect-square w-full">
                                                                <Image
                                                                  src={
                                                                    field.value
                                                                  }
                                                                  alt={`Variant preview ${imgIndex + 1}`}
                                                                  className="h-full w-full object-cover rounded-md border"
                                                                  width={128}
                                                                  height={128}
                                                                />
                                                                <Button
                                                                  type="button"
                                                                  variant="destructive"
                                                                  size="icon"
                                                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                  onClick={() => {
                                                                    const currentImages =
                                                                      form.getValues(
                                                                        `variants.${index}.images`
                                                                      ) || [];
                                                                    form.setValue(
                                                                      `variants.${index}.images`,
                                                                      currentImages.filter(
                                                                        (
                                                                          _:
                                                                            | string
                                                                            | undefined,
                                                                          i: number
                                                                        ) =>
                                                                          i !==
                                                                          imgIndex
                                                                      )
                                                                    );
                                                                    // Clean up image type state
                                                                    const newTypes =
                                                                      {
                                                                        ...variantImageTypes,
                                                                      };
                                                                    if (
                                                                      newTypes[
                                                                        index
                                                                      ]
                                                                    ) {
                                                                      delete newTypes[
                                                                        index
                                                                      ][
                                                                        imgIndex
                                                                      ];
                                                                    }
                                                                    setVariantImageTypes(
                                                                      newTypes
                                                                    );
                                                                  }}
                                                                >
                                                                  <X className="size-3" />
                                                                </Button>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </CardContent>
                                                      </Card>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                              );
                                            }
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                          <p className="text-xs">
                                            No variant images added yet
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Specifications Tab */}
                    <TabsContent value="specifications" className="mt-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Product Specifications</CardTitle>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addSpecification}
                            >
                              <Plus className="size-4 mr-2" />
                              Add Specification
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {specEntries.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No specifications added yet.</p>
                              <p className="text-sm mt-2">
                                Add key-value pairs for product specifications
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {specEntries.map((entry, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_auto] gap-4 items-end"
                                >
                                  <FormItem>
                                    <FormLabel>Key</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Material"
                                        value={entry.key}
                                        onChange={(e) =>
                                          updateSpecification(
                                            index,
                                            e.target.value,
                                            entry.value
                                          )
                                        }
                                      />
                                    </FormControl>
                                  </FormItem>

                                  <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Stainless Steel"
                                        value={entry.value}
                                        onChange={(e) =>
                                          updateSpecification(
                                            index,
                                            entry.key,
                                            e.target.value
                                          )
                                        }
                                      />
                                    </FormControl>
                                  </FormItem>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeSpecification(index)}
                                  >
                                    <Trash2 className="size-4 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating Product...
                        </>
                      ) : (
                        "Update Product"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Live Preview Section */}
            <div className="hidden xl:block">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
                        {formValues.image ? (
                          <Image
                            src={formValues.image}
                            alt={formValues.name || "Product preview"}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        {formValues.category_id &&
                          (() => {
                            const selectedCategory = categories.find(
                              (cat) =>
                                cat.id.toString() === formValues.category_id
                            );
                            return (
                              selectedCategory && (
                                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                  {selectedCategory.name}
                                </div>
                              )
                            );
                          })()}

                        <h2 className="text-lg font-semibold line-clamp-2">
                          {formValues.name || "Product Name"}
                        </h2>

                        {formValues.brand && (
                          <p className="text-sm text-muted-foreground">
                            Brand: {formValues.brand}
                          </p>
                        )}

                        {formValues.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {formValues.description}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      {hasVariants ? (
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-muted-foreground">
                            Variants:
                          </div>
                          <div className="space-y-3">
                            {formValues.variants?.map((variant, idx) => {
                              const variantPrice =
                                variant.price !== undefined &&
                                variant.price !== null
                                  ? typeof variant.price === "number"
                                    ? variant.price
                                    : parseFloat(String(variant.price)) || 0
                                  : null;
                              const variantOriginalPrice = variant.originalPrice
                                ? typeof variant.originalPrice === "number"
                                  ? variant.originalPrice
                                  : parseFloat(String(variant.originalPrice)) ||
                                    0
                                : 0;
                              const discountPercent =
                                variantPrice !== null &&
                                variantOriginalPrice &&
                                variantOriginalPrice > variantPrice
                                  ? Math.round(
                                      ((variantOriginalPrice - variantPrice) /
                                        variantOriginalPrice) *
                                        100
                                    )
                                  : 0;

                              return (
                                <div
                                  key={idx}
                                  className="group relative p-4 border rounded-lg bg-card hover:border-primary/50 transition-all duration-200 hover:shadow-sm"
                                >
                                  {/* Header with name and stock status */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-semibold text-foreground truncate">
                                        {variant.name || `Variant ${idx + 1}`}
                                      </h3>
                                    </div>
                                    <Badge
                                      variant={
                                        variant.inStock
                                          ? "default"
                                          : "destructive"
                                      }
                                      className="ml-2 shrink-0 flex items-center gap-1"
                                    >
                                      {variant.inStock ? (
                                        <>
                                          <CheckCircle2 className="size-3" />
                                          <span>In Stock</span>
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="size-3" />
                                          <span>Out of Stock</span>
                                        </>
                                      )}
                                    </Badge>
                                  </div>

                                  {/* Price section */}
                                  <div className="flex items-baseline gap-2">
                                    {variantPrice !== null ? (
                                      <>
                                        <span className="text-lg font-bold text-foreground">
                                          ₹{variantPrice.toFixed(2)}
                                        </span>
                                        {variantOriginalPrice &&
                                          variantOriginalPrice >
                                            variantPrice && (
                                            <>
                                              <span className="text-sm text-muted-foreground line-through">
                                                ₹
                                                {variantOriginalPrice.toFixed(
                                                  2
                                                )}
                                              </span>
                                              {discountPercent > 0 && (
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {discountPercent}% OFF
                                                </Badge>
                                              )}
                                            </>
                                          )}
                                      </>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        Request for Quote
                                      </span>
                                    )}
                                  </div>

                                  {/* Variant images gallery */}
                                  {variant.images &&
                                    variant.images.length > 0 && (
                                      <div className="mt-3 pt-3 border-t">
                                        <div className="grid grid-cols-3 gap-2">
                                          {variant.images.slice(0, 3).map(
                                            (img, imgIdx) =>
                                              img && (
                                                <div
                                                  key={imgIdx}
                                                  className="aspect-square rounded-md overflow-hidden bg-muted border hover:border-primary/50 transition-colors"
                                                >
                                                  <Image
                                                    src={img}
                                                    width={100}
                                                    height={100}
                                                    alt={`${variant.name} ${imgIdx + 1}`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                                  />
                                                </div>
                                              )
                                          )}
                                        </div>
                                        {variant.images.length > 3 && (
                                          <p className="text-xs text-muted-foreground mt-2 text-center">
                                            +{variant.images.length - 3} more
                                            image
                                            {variant.images.length - 3 !== 1
                                              ? "s"
                                              : ""}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : formValues.price !== undefined &&
                        formValues.price !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            ₹
                            {(typeof formValues.price === "number"
                              ? formValues.price
                              : parseFloat(String(formValues.price)) || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Price on request
                          </span>
                        </div>
                      )}

                      {/* Additional Images */}
                      {formValues.images && formValues.images.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            ProductGallery:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formValues.images.slice(0, 4).map(
                              (img, idx) =>
                                img && (
                                  <div
                                    key={idx}
                                    className="h-20 w-20 rounded overflow-hidden bg-muted border"
                                  >
                                    <Image
                                      src={img}
                                      alt={`Gallery ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      width={80}
                                      height={80}
                                    />
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Specifications */}
                      {formValues.specifications &&
                        Object.keys(formValues.specifications).length > 0 && (
                          <div className="space-y-2 pt-4 border-t">
                            <div className="text-sm font-medium">
                              Specifications:
                            </div>
                            <div className="space-y-1.5">
                              {Object.entries(formValues.specifications).map(
                                ([key, value]) =>
                                  key &&
                                  value && (
                                    <div
                                      key={key}
                                      className="flex justify-between text-sm"
                                    >
                                      <span className="text-muted-foreground">
                                        {key}:
                                      </span>
                                      <span className="font-medium">
                                        {value}
                                      </span>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Empty State */}
                      {!formValues.name && !formValues.image && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <p>Start filling the form to see live preview</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
