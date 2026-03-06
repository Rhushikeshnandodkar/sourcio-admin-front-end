"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { apiPost } from "@/lib/api-client";

// Schema definition
const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0),
});

type TagFormValues = z.infer<typeof tagSchema>;

export default function CreateTagPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
      icon: "",
      is_active: true,
      sort_order: 0,
    },
  });

  const onSubmit = async (data: TagFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        color: data.color || undefined,
        icon: data.icon || undefined,
        is_active: data.is_active,
        sort_order: data.sort_order,
      };

      const createdTag = await apiPost<{ name: string; id: number }>(
        `${API_BASE_URL}${API_ENDPOINTS.tags.create}`,
        payload
      );

      toast.success("Tag created successfully!", {
        description: `${createdTag.name || data.name} has been added.`,
      });

      // Reset form
      form.reset({
        name: "",
        description: "",
        color: "",
        icon: "",
        is_active: true,
        sort_order: 0,
      });

      setTimeout(() => {
        router.push("/dashboard/tags/create");
      }, 1500);
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag", {
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
          { label: "Tags", href: "/dashboard/tags/create" },
          {
            label: "Create Tag",
            href: "/dashboard/tags/create",
            isCurrent: true,
          },
        ]}
      />
      <div className="pt-20 px-6 pb-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-6">
            <h1 className="text-base font-semibold">Create New Tag</h1>
            <p className="text-muted-foreground text-xs">
              Fill in the details below to create a new tag
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tag Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="lg:col-span-2">
                          <FormLabel>Tag Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tag name" {...field} />
                          </FormControl>
                          <FormDescription>The name of the tag</FormDescription>
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
                              placeholder="Enter tag description"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional description for the tag
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                className="w-20 h-10 cursor-pointer"
                                {...field}
                              />
                              <Input placeholder="#000000" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Tag color (hex code)
                          </FormDescription>
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
                            <Input placeholder="Icon name or URL" {...field} />
                          </FormControl>
                          <FormDescription>
                            Icon identifier or URL
                          </FormDescription>
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
                          <FormDescription>
                            Display order (lower numbers appear first)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Active Status
                            </FormLabel>
                            <FormDescription>
                              Whether this tag is active and visible
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

                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={isSubmitting}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating Tag..." : "Create Tag"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
