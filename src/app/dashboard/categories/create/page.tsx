"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import ReusableHeader from "@/components/common/reusable-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { apiGet, apiPost } from "@/lib/api-client";

// Category type
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

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

// Schema definition
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  image: imageUrlSchema,
  icon: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CreateCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [imageType, setImageType] = useState<"upload" | "url">("url");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories from API for parent selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await apiGet<
          { items?: Category[]; data?: Category[] } | Category[]
        >(`${API_BASE_URL}${API_ENDPOINTS.categories.list}?size=100`);
        // Handle paginated response - extract items from the response
        const categoryItems = Array.isArray(data)
          ? data
          : (data as { items?: Category[]; data?: Category[] }).items ||
            (data as { items?: Category[]; data?: Category[] }).data ||
            [];
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

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: "none",
      image: "",
      icon: "",
      sort_order: 0,
      is_active: true,
      meta_title: "",
      meta_description: "",
    },
  });

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

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await handleFileUpload(file);
      form.setValue("image", base64);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        parent_id:
          data.parent_id && data.parent_id !== "none"
            ? parseInt(data.parent_id, 10)
            : undefined,
        image: data.image || undefined,
        icon: data.icon || undefined,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
        meta_title: data.meta_title || undefined,
        meta_description: data.meta_description || undefined,
      };

      const createdCategory = await apiPost<{ name: string }>(
        `${API_BASE_URL}${API_ENDPOINTS.categories.create}`,
        payload
      );

      toast.success("Category created successfully!", {
        description: `${createdCategory.name || data.name} has been added.`,
      });

      // Reset form
      form.reset({
        name: "",
        description: "",
        parent_id: "none",
        image: "",
        icon: "",
        sort_order: 0,
        is_active: true,
        meta_title: "",
        meta_description: "",
      });
      setImageType("url");

      setTimeout(() => {
        router.push("/dashboard/categories/create");
      }, 1500);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-base min-h-[calc(100vh-1.1rem)]">
      <ReusableHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Categories", href: "/dashboard/categories/create" },
          {
            label: "Create Category",
            href: "/dashboard/categories/create",
            isCurrent: true,
          },
        ]}
      />
      <div className="pt-20 px-6 pb-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-4">
            <h1 className="text-base font-semibold">Create New Category</h1>
            <p className="text-muted-foreground text-xs">
              Fill in the details below to create a new category
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>Category Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter category name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter category description"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="parent_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent Category</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isLoadingCategories}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        isLoadingCategories
                                          ? "Loading..."
                                          : "Select parent (optional)"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">
                                    None (Top-level)
                                  </SelectItem>
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

                        <FormField
                          control={form.control}
                          name="sort_order"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sort Order</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  value={field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="icon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Icon</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Icon name or URL"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">
                                  Active Status
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Category visibility
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Category Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-3">
                              <RadioGroup
                                value={imageType}
                                onValueChange={(value) =>
                                  setImageType(value as "upload" | "url")
                                }
                                className="flex gap-4"
                              >
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value="url" id="image-url" />
                                  <Label
                                    htmlFor="image-url"
                                    className="cursor-pointer flex items-center gap-2 text-sm"
                                  >
                                    <LinkIcon className="size-4" />
                                    URL
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem
                                    value="upload"
                                    id="image-upload"
                                  />
                                  <Label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex items-center gap-2 text-sm"
                                  >
                                    <Upload className="size-4" />
                                    Upload
                                  </Label>
                                </div>
                              </RadioGroup>

                              {imageType === "url" ? (
                                <Input
                                  placeholder="https://example.com/image.jpg"
                                  {...field}
                                />
                              ) : (
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageFileChange}
                                  className="cursor-pointer"
                                />
                              )}

                              {field.value && (
                                <div className="relative inline-block mt-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={field.value}
                                    alt="Category preview"
                                    className="h-32 w-32 object-cover rounded-md border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => {
                                      form.setValue("image", "");
                                      setImageType("url");
                                    }}
                                  >
                                    <X className="size-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="meta_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="SEO meta title"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="meta_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="SEO meta description"
                                  className="min-h-[80px]"
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
              </Tabs>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Category..." : "Create Category"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
