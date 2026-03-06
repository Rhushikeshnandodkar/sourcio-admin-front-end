"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Shield,
  Clock,
  FileText,
  TrendingUp,
  Building2,
  MapPin,
  Edit,
  Save,
} from "lucide-react";
import ReusableHeader from "@/components/common/reusable-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CustomerStatusBadge } from "@/features/customers-list/components/customer-status-badge";
import { CustomerRoleBadge } from "@/features/customers-list/components/customer-role-badge";
import { API_BASE_URL, API_ENDPOINTS, getApiUrl } from "@/lib/config";
import { apiGet, apiPut } from "@/lib/api-client";
import type {
  CustomerDetail,
  CustomerDetailResponse,
} from "@/types/customers.types";
import { useQuotes } from "@/hooks/use-quotes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";

const profileUpdateSchema = z
  .object({
    category: z.enum(["personal", "organization"], {
      message: "Please select a category",
    }),
    gstNumber: z.string().optional(),
    shippingAddress1: z.string().min(1, "Address line 1 is required"),
    shippingAddress2: z.string().optional(),
    shippingPin: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
    shippingCity: z.string().min(1, "City is required"),
    shippingState: z.string().min(1, "State is required"),
    shippingCountry: z.string().min(1, "Country is required"),
  })
  .refine(
    (data) => {
      if (data.category === "organization") {
        return data.gstNumber && data.gstNumber.length === 15;
      }
      return true;
    },
    {
      message:
        "GST number is required and must be 15 characters for organizations",
      path: ["gstNumber"],
    }
  );

type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const numericId = parseInt(customerId, 10);

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      category: "personal",
      gstNumber: "",
      shippingAddress1: "",
      shippingAddress2: "",
      shippingPin: "",
      shippingCity: "",
      shippingState: "",
      shippingCountry: "India",
    },
  });

  const selectedCategory = form.watch("category");

  useEffect(() => {
    if (customer) {
      form.reset({
        category:
          (customer.category as "personal" | "organization") || "personal",
        gstNumber: customer.gst_number || "",
        shippingAddress1: customer.shipping_address1 || "",
        shippingAddress2: customer.shipping_address2 || "",
        shippingPin: customer.shipping_pin || "",
        shippingCity: customer.shipping_city || "",
        shippingState: customer.shipping_state || "",
        shippingCountry: customer.shipping_country || "India",
      });
    }
  }, [customer, form]);

  // Fetch quotes for this customer (only when customer email is available)
  const { quotes, loading: quotesLoading } = useQuotes({
    skip: 0,
    limit: 10,
    user_email: customer?.email || undefined,
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (isNaN(numericId)) {
        setError("Invalid customer ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await apiGet<CustomerDetailResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.customers.detail(numericId)}`
        );

        if (data.status === "success" && data.data) {
          setCustomer(data.data.user);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching customer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [numericId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) {
      return "Price on Request";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = async (values: ProfileUpdateFormValues) => {
    if (!customer) return;

    setIsSaving(true);
    try {
      const body: {
        category: string;
        gst_number: string | null;
        shipping_address1: string;
        shipping_address2: string | null;
        shipping_pin: string;
        shipping_city: string;
        shipping_state: string;
        shipping_country: string;
      } = {
        category: values.category,
        gst_number: values.gstNumber || null,
        shipping_address1: values.shippingAddress1,
        shipping_address2: values.shippingAddress2 || null,
        shipping_pin: values.shippingPin,
        shipping_city: values.shippingCity,
        shipping_state: values.shippingState,
        shipping_country: values.shippingCountry,
      };

      const data = await apiPut<CustomerDetailResponse>(
        getApiUrl(API_ENDPOINTS.customers.update(numericId)),
        body
      );

      if (data.status === "success" && data.data) {
        setCustomer(data.data.user);
        setIsEditDialogOpen(false);
        toast.success("Profile updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error("Failed to update profile", {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden">
        <div className="shrink-0 py-6 px-2">
          <ReusableHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Customers", href: "/dashboard/customers" },
              { label: "Customer Details", isCurrent: true },
            ]}
          />
        </div>
        <div className="flex-1 overflow-auto px-2">
          <div className="mt-6 flex justify-center pb-12">
            <div className="w-[95%] max-w-6xl space-y-8">
              {/* Profile Header Skeleton */}
              <Card className="overflow-hidden border shadow-sm bg-linear-to-br from-background to-muted/20">
                <div className="h-28 bg-linear-to-br from-primary/15 via-primary/8 to-transparent" />
                <CardContent className="relative -mt-14 pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <div className="flex items-end gap-5">
                      <Skeleton className="h-28 w-28 rounded-full border-4 border-background shadow-md" />
                      <div className="space-y-3 pb-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="border shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="pt-6 pb-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              </div>

              {/* Info Cards Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border shadow-sm">
                  <CardHeader className="pb-5">
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardHeader className="pb-5">
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col overflow-hidden">
        <div className="shrink-0 py-6 px-2">
          <ReusableHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Customers", href: "/dashboard/customers" },
              { label: "Customer Details", isCurrent: true },
            ]}
          />
        </div>
        <div className="flex-1 overflow-auto px-2">
          <div className="mt-16 flex justify-center">
            <div className="w-[95%] max-w-4xl rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-destructive">
                Error: {error || "Customer not found"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/dashboard/customers")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="shrink-0 py-6 px-2">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Customers", href: "/dashboard/customers" },
            { label: customer.email, isCurrent: true },
          ]}
        />
      </div>

      <div className="flex-1 overflow-auto px-2">
        <div className="mt-6 flex justify-center pb-12">
          <div className="w-[95%] max-w-6xl space-y-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/customers")}
              className="mb-1 -ml-2 h-9 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>

            {/* Profile Header Card */}
            <Card className="overflow-hidden border shadow-sm bg-linear-to-br from-background to-muted/20 py-0">
              <div className="h-10 bg-linear-to-br from-primary/15 via-primary/8 to-transparent" />
              <CardContent className="relative -mt-14 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div className="flex items-end gap-5">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-md ring-2 ring-primary/5">
                      <AvatarFallback className="bg-linear-to-br from-primary/15 to-primary/5 text-primary text-2xl font-semibold">
                        {getInitials(customer.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-3 pb-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                          {customer.email.split("@")[0]}
                        </h1>
                        <div className="flex items-center gap-2">
                          <CustomerStatusBadge isActive={customer.is_active} />
                          <CustomerRoleBadge role={customer.role} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200 bg-linear-to-br from-background to-primary/5 py-0">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Total Quotes
                      </p>
                      <p className="text-3xl font-bold tracking-tight">
                        {quotes.length}
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200 bg-linear-to-br from-background to-green-500/5 py-0">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Account Status
                      </p>
                      <div className="mt-2">
                        <CustomerStatusBadge isActive={customer.is_active} />
                      </div>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center shadow-sm">
                      <TrendingUp className="h-7 w-7 text-green-600 dark:text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200 bg-linear-to-br from-background to-blue-500/5 py-0">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Last Login
                      </p>
                      <p className="text-sm font-semibold mt-2 leading-tight">
                        {formatDateTime(customer.last_login)}
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center shadow-sm">
                      <Clock className="h-7 w-7 text-blue-600 dark:text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Account Details */}
              <Card className="border shadow-sm bg-linear-to-br from-background to-muted/30 gap-0">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="space-y-0">
                    <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="font-medium">Email Address</span>
                      </div>
                      <p className="font-semibold text-sm text-right max-w-[60%] break-all">
                        {customer.email}
                      </p>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {customer.category === "organization" ? (
                          <Building2 className="h-4 w-4 shrink-0" />
                        ) : (
                          <User className="h-4 w-4 shrink-0" />
                        )}
                        <span className="font-medium">Account Type</span>
                      </div>
                      <p className="font-semibold text-sm capitalize">
                        {customer.category || "Not set"}
                      </p>
                    </div>
                    {customer.category === "organization" &&
                      customer.gst_number && (
                        <>
                          <Separator className="my-1" />
                          <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4 shrink-0" />
                              <span className="font-medium">GST Number</span>
                            </div>
                            <p className="font-semibold text-sm font-mono">
                              {customer.gst_number}
                            </p>
                          </div>
                        </>
                      )}
                    <Separator className="my-1" />
                    <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 shrink-0" />
                        <span className="font-medium">Role</span>
                      </div>
                      <CustomerRoleBadge role={customer.role} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Activity */}
              <Card className="border shadow-sm bg-linear-to-br from-background to-muted/30 gap-0">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Account Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="space-y-0">
                    <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="font-medium">Created At</span>
                      </div>
                      <p className="text-sm font-semibold text-right">
                        {formatDate(customer.created_at)}
                      </p>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="font-medium">Updated At</span>
                      </div>
                      <p className="text-sm font-semibold text-right">
                        {formatDate(customer.updated_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping Address Card */}
            {(customer.shipping_address1 || customer.shipping_city) && (
              <Card className="border shadow-sm bg-linear-to-br from-background to-muted/30 gap-0">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-1 text-sm">
                    {customer.shipping_address1 && (
                      <p className="text-foreground font-medium">
                        {customer.shipping_address1}
                      </p>
                    )}
                    {customer.shipping_address2 && (
                      <p className="text-muted-foreground">
                        {customer.shipping_address2}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      {[
                        customer.shipping_city,
                        customer.shipping_state,
                        customer.shipping_pin,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {customer.shipping_country && (
                      <p className="text-muted-foreground">
                        {customer.shipping_country}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Quotes Card */}
            <Card className="border shadow-sm bg-linear-to-br from-background to-muted/30 gap-0">
              <CardHeader className="pb-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    Related Quotes
                    {quotes.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({quotes.length})
                      </span>
                    )}
                  </CardTitle>
                  {quotes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() =>
                        router.push(
                          `/dashboard/quotes?user_email=${encodeURIComponent(customer.email)}`
                        )
                      }
                    >
                      View All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {quotesLoading ? (
                  <div className="flex items-center justify-center p-16">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="ml-3 text-sm text-muted-foreground">
                      Loading quotes...
                    </p>
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed rounded-lg">
                    <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-5 ring-1 ring-muted">
                      <FileText className="h-10 w-10 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      No quotes found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Quotes will appear here once created for this customer
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                          <TableHead className="h-11 px-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            Quote Number
                          </TableHead>
                          <TableHead className="h-11 px-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            Status
                          </TableHead>
                          <TableHead className="h-11 px-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            Items
                          </TableHead>
                          <TableHead className="h-11 px-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            Created
                          </TableHead>
                          <TableHead className="h-11 px-6 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotes.map((quote) => (
                          <TableRow
                            key={quote.id}
                            className="hover:bg-muted/40 cursor-pointer transition-all duration-150 border-b last:border-0"
                            onClick={() =>
                              router.push(`/dashboard/quotes/${quote.id}`)
                            }
                          >
                            <TableCell className="h-14 px-6 font-medium font-mono text-sm">
                              {quote.quote_number}
                            </TableCell>
                            <TableCell className="h-14 px-6">
                              <QuoteStatusBadge status={quote.status} />
                            </TableCell>
                            <TableCell className="h-14 px-6 text-sm text-muted-foreground">
                              {quote.item_count} item
                              {quote.item_count !== 1 ? "s" : ""}
                            </TableCell>
                            <TableCell className="h-14 px-6 text-sm text-muted-foreground">
                              {formatDate(quote.created_at)}
                            </TableCell>
                            <TableCell className="h-14 px-6 text-right font-semibold text-sm">
                              {quote.total === null ? (
                                <span className="text-muted-foreground italic">
                                  Price on Request
                                </span>
                              ) : (
                                <span className="text-foreground">
                                  {formatPrice(quote.total)}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Customer Profile</DialogTitle>
                  <DialogDescription>
                    Update customer category, GST number, and shipping address
                    information.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSaveProfile)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>Personal</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="organization">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>Organization</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedCategory === "organization" && (
                      <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter 15-digit GST number"
                                maxLength={15}
                                className="uppercase"
                                disabled={isSaving}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .replace(/[^A-Z0-9]/gi, "")
                                    .toUpperCase();
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <FormLabel className="text-base font-semibold">
                          Shipping Address
                        </FormLabel>
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Street address, building number"
                                  disabled={isSaving}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shippingAddress2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2 (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Apartment, suite, etc."
                                  disabled={isSaving}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="shippingPin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIN Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="6 digits"
                                    maxLength={6}
                                    disabled={isSaving}
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="shippingCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="City"
                                    disabled={isSaving}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="shippingState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="State"
                                    disabled={isSaving}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="shippingCountry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Country"
                                    disabled={isSaving}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
