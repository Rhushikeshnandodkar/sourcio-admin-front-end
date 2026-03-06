"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Package,
  User,
  DollarSign,
  Edit,
  XCircle,
  IndianRupee,
  Download,
  Eye,
} from "lucide-react";
import ReusableHeader from "@/components/common/reusable-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { apiGet, apiPut } from "@/lib/api-client";
import type {
  QuoteDetail,
  QuoteDetailResponse,
  PriceHistoryResponse,
  QuoteItemPriceUpdate,
  QuoteItemGstUpdate,
} from "@/types/quotes.types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  const numericId = parseInt(quoteId, 10);

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [updateAdminNotes, setUpdateAdminNotes] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [priceHistory, setPriceHistory] = useState<
    PriceHistoryResponse["data"] | null
  >(null);
  const [isLoadingPriceHistory, setIsLoadingPriceHistory] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [editingGstItemId, setEditingGstItemId] = useState<number | null>(null);
  const [editGstRate, setEditGstRate] = useState<string>("");
  const [isUpdatingGst, setIsUpdatingGst] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      if (isNaN(numericId)) {
        setError("Invalid quote ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await apiGet<QuoteDetailResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.quotes.detail(numericId)}`
        );

        if (data.status === "success" && data.data) {
          // Log the response to debug
          console.log("Quote detail response:", data.data);
          setQuote(data.data);
          setUpdateStatus(data.data.status);
          setUpdateAdminNotes(data.data.admin_notes || "");
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching quote:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [numericId]);

  const handleUpdate = async () => {
    if (!quote) return;

    setIsUpdating(true);
    try {
      const data = await apiPut<QuoteDetailResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.quotes.update(numericId)}`,
        {
          status: updateStatus !== quote.status ? updateStatus : undefined,
          admin_notes:
            updateAdminNotes !== (quote.admin_notes || "")
              ? updateAdminNotes
              : undefined,
        }
      );

      if (data.status === "success" && data.data) {
        setQuote(data.data);
        setIsUpdateDialogOpen(false);
        toast.success("Quote updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      toast.error("Failed to update quote", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
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

  const handleViewPdf = async () => {
    if (!quote) return;

    setIsGeneratingPdf(true);
    try {
      const blob = await apiGet<Blob>(
        `${API_BASE_URL}${API_ENDPOINTS.quotes.pdf(numericId, false)}`
      );
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");
      // Clean up the blob URL after the window is opened (give it more time)
      if (newWindow) {
        newWindow.addEventListener("load", () => {
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        });
      } else {
        // Fallback: clean up after a longer delay if window.open was blocked
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      }
    } catch (err) {
      toast.error("Failed to open PDF", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!quote) return;

    setIsGeneratingPdf(true);
    try {
      const blob = await apiGet<Blob>(
        `${API_BASE_URL}${API_ENDPOINTS.quotes.pdf(numericId, true)}`
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quote-${quote.quote_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download PDF", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEditPriceClick = async (item: QuoteDetail["items"][0]) => {
    setEditingItemId(item.id);
    setEditPrice(
      item.price && !item.requires_custom_price ? String(item.price) : ""
    );
    setIsLoadingPriceHistory(true);

    try {
      const historyUrl = API_ENDPOINTS.products.priceHistory(
        item.product_id,
        item.variant_id || undefined
      );
      const data = await apiGet<PriceHistoryResponse>(
        `${API_BASE_URL}${historyUrl}`
      );
      if (data.status === "success" && data.data) {
        setPriceHistory(data.data);
      }
    } catch (err) {
      console.error("Failed to load price history:", err);
      setPriceHistory(null);
    } finally {
      setIsLoadingPriceHistory(false);
    }
  };

  const handleSavePrice = async () => {
    if (!quote || editingItemId === null) return;

    const priceValue = parseFloat(editPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Invalid price", {
        description: "Price must be a number greater than 0",
      });
      return;
    }

    setIsUpdatingPrice(true);
    try {
      const updateData: QuoteItemPriceUpdate = { price: priceValue };
      const data = await apiPut<QuoteDetailResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.quotes.updateItemPrice(numericId, editingItemId)}`,
        updateData
      );

      if (data.status === "success" && data.data) {
        setQuote(data.data);
        setEditingItemId(null);
        setEditPrice("");
        setPriceHistory(null);
        toast.success("Price updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      toast.error("Failed to update price", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleCancelEditPrice = () => {
    setEditingItemId(null);
    setEditPrice("");
    setPriceHistory(null);
  };

  const handleSelectHistoryPrice = (price: string | number) => {
    setEditPrice(String(price));
  };

  const handleEditGstClick = (item: QuoteDetail["items"][0]) => {
    setEditingGstItemId(item.id);
    setEditGstRate(item.gst_rate ? String(item.gst_rate) : "none");
  };

  const handleSaveGst = async () => {
    if (!quote || editingGstItemId === null) return;

    const gstRateValue =
      editGstRate === "none" ? null : parseFloat(editGstRate);
    if (
      gstRateValue !== null &&
      (isNaN(gstRateValue) || ![5, 12, 18, 28].includes(gstRateValue))
    ) {
      toast.error("Invalid GST rate", {
        description: "GST rate must be 5%, 12%, 18%, or 28%",
      });
      return;
    }

    setIsUpdatingGst(true);
    try {
      const updateData: QuoteItemGstUpdate = { gst_rate: gstRateValue };
      const data = await apiPut<QuoteDetailResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.quotes.updateItemGst(numericId, editingGstItemId)}`,
        updateData
      );

      if (data.status === "success" && data.data) {
        setQuote(data.data);
        setEditingGstItemId(null);
        setEditGstRate("none");
        toast.success("GST rate updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      toast.error("Failed to update GST rate", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsUpdatingGst(false);
    }
  };

  const handleCancelEditGst = () => {
    setEditingGstItemId(null);
    setEditGstRate("none");
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="text-base min-h-[calc(100vh-1.1rem)]">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Quotes", href: "/dashboard/quotes" },
            { label: "Loading...", isCurrent: true },
          ]}
        />
        <div className="pt-20 px-4 sm:px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <div className="text-base min-h-[calc(100vh-1.1rem)]">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Quotes", href: "/dashboard/quotes" },
            { label: "Quote Details", isCurrent: true },
          ]}
        />
        <div className="pt-20 px-4 sm:px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <XCircle className="h-12 w-12 text-destructive mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Error Loading Quote
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {error || "Quote not found"}
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                    <Button onClick={() => router.push("/dashboard/quotes")}>
                      View Quotes
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
    <div className="text-base min-h-[calc(100vh-1.1rem)] bg-background">
      <ReusableHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Quotes", href: "/dashboard/quotes" },
          { label: quote.quote_number, isCurrent: true },
        ]}
      />
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-[95%] mx-auto space-y-2">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleViewPdf}
                disabled={isGeneratingPdf}
                className="gap-2"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    View PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="gap-2"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
              <Dialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Edit className="h-4 w-4" />
                    Update Quote
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Update Quote</DialogTitle>
                    <DialogDescription>
                      Update quote status and admin notes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={updateStatus}
                        onValueChange={setUpdateStatus}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_notes">Admin Notes</Label>
                      <Textarea
                        id="admin_notes"
                        placeholder="Add admin notes..."
                        value={updateAdminNotes}
                        onChange={(e) => setUpdateAdminNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUpdateDialogOpen(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Quote"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quote Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quote Header */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold mb-2">
                        {quote.quote_number}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <QuoteStatusBadge status={quote.status} />
                        {quote.has_custom_pricing && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-300"
                          >
                            Custom Pricing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Created
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(quote.created_at)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Updated
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(quote.updated_at)}
                      </p>
                    </div>
                    {quote.expires_at && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(quote.expires_at)}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Items
                      </p>
                      <p className="text-sm font-medium">
                        {quote.items.length} item
                        {quote.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {quote.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Customer Notes
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {quote.notes}
                      </p>
                    </div>
                  )}
                  {quote.admin_notes && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Admin Notes
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {quote.admin_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quote Items */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Quote Items ({quote.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="w-16">Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-center">
                            Quantity
                          </TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-center">
                            GST Rate
                          </TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quote.items.map((item) => {
                          const itemPrice =
                            typeof item.price === "string"
                              ? parseFloat(item.price)
                              : item.price || 0;
                          const itemTotal = item.item_total
                            ? typeof item.item_total === "string"
                              ? parseFloat(item.item_total)
                              : item.item_total
                            : item.requires_custom_price
                              ? null
                              : itemPrice * item.quantity;
                          const taxAmount = item.tax_amount
                            ? typeof item.tax_amount === "string"
                              ? parseFloat(item.tax_amount)
                              : item.tax_amount
                            : null;
                          const itemTotalWithTax = item.item_total_with_tax
                            ? typeof item.item_total_with_tax === "string"
                              ? parseFloat(item.item_total_with_tax)
                              : item.item_total_with_tax
                            : null;
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.image ? (
                                  <div className="h-12 w-12 rounded-md overflow-hidden border bg-muted">
                                    <Image
                                      src={item.image}
                                      alt={item.product_name}
                                      className="h-full w-full object-cover"
                                      width={100}
                                      height={100}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">
                                    {item.product_name}
                                  </p>
                                  {item.variant_name && (
                                    <p className="text-xs text-muted-foreground">
                                      {item.variant_name}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {item.requires_custom_price ? (
                                  <span className="text-muted-foreground italic">
                                    Price on Request
                                  </span>
                                ) : (
                                  formatPrice(item.price)
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.requires_custom_price ? (
                                  <span className="text-muted-foreground italic">
                                    -
                                  </span>
                                ) : (
                                  formatPrice(itemTotal)
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.gst_rate ? (
                                  <Badge variant="outline" className="text-xs">
                                    {item.gst_rate}%
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {taxAmount !== null ? (
                                  formatPrice(taxAmount)
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {item.requires_custom_price ? (
                                  <span className="text-muted-foreground italic">
                                    Custom
                                  </span>
                                ) : itemTotalWithTax !== null ? (
                                  formatPrice(itemTotalWithTax)
                                ) : (
                                  formatPrice(itemTotal)
                                )}
                              </TableCell>
                              <TableCell>
                                {item.requires_custom_price && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs"
                                  >
                                    Custom
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPriceClick(item)}
                                    className="h-8 w-8 p-0"
                                    title="Edit Price"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {!item.requires_custom_price && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditGstClick(item)}
                                      className="h-8 w-8 p-0"
                                      title="Edit GST"
                                    >
                                      <DollarSign className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Price Dialog */}
              <Dialog
                open={editingItemId !== null}
                onOpenChange={(open) => !open && handleCancelEditPrice()}
              >
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Price</DialogTitle>
                    <DialogDescription>
                      Update the price for this quote item. Previously given
                      prices are shown below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {editingItemId !== null &&
                      quote &&
                      (() => {
                        const item = quote.items.find(
                          (i) => i.id === editingItemId
                        );
                        if (!item) return null;
                        return (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="product-name">Product</Label>
                              <p className="text-sm font-medium">
                                {item.product_name}
                                {item.variant_name && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    - {item.variant_name}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price">Price (₹)</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Enter price"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                disabled={isUpdatingPrice}
                              />
                            </div>
                            {isLoadingPriceHistory ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">
                                  Loading price history...
                                </span>
                              </div>
                            ) : priceHistory &&
                              priceHistory.prices.length > 0 ? (
                              <div className="space-y-2">
                                <Label>Previously Given Prices</Label>
                                <div className="rounded-md border p-3 max-h-48 overflow-y-auto">
                                  <div className="space-y-2">
                                    {priceHistory.prices.map((historyItem) => (
                                      <button
                                        key={historyItem.id}
                                        type="button"
                                        onClick={() =>
                                          handleSelectHistoryPrice(
                                            historyItem.price
                                          )
                                        }
                                        className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">
                                            ₹
                                            {typeof historyItem.price ===
                                            "string"
                                              ? parseFloat(
                                                  historyItem.price
                                                ).toLocaleString("en-IN", {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })
                                              : historyItem.price.toLocaleString(
                                                  "en-IN",
                                                  {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                )}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(
                                              historyItem.created_at
                                            ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Click on a price above to use it, or enter a
                                  new price manually.
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-md border p-3 bg-muted/50">
                                <p className="text-sm text-muted-foreground text-center">
                                  No previous prices found for this product.
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleCancelEditPrice}
                      disabled={isUpdatingPrice}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePrice}
                      disabled={isUpdatingPrice}
                    >
                      {isUpdatingPrice ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Price"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit GST Dialog */}
              <Dialog
                open={editingGstItemId !== null}
                onOpenChange={(open) => !open && handleCancelEditGst()}
              >
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit GST Rate</DialogTitle>
                    <DialogDescription>
                      Update the GST rate for this quote item. Tax will be
                      calculated automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {editingGstItemId !== null &&
                      quote &&
                      (() => {
                        const item = quote.items.find(
                          (i) => i.id === editingGstItemId
                        );
                        if (!item) return null;
                        const itemPrice =
                          typeof item.price === "string"
                            ? parseFloat(item.price)
                            : item.price || 0;
                        const itemSubtotal = itemPrice * item.quantity;
                        const previewGstRate =
                          editGstRate === "none"
                            ? null
                            : parseFloat(editGstRate);
                        const previewTax =
                          previewGstRate && previewGstRate > 0
                            ? itemSubtotal * (previewGstRate / 100)
                            : 0;
                        const previewTotal = itemSubtotal + previewTax;
                        return (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="product-name">Product</Label>
                              <p className="text-sm font-medium">
                                {item.product_name}
                                {item.variant_name && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    - {item.variant_name}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gst-rate">GST Rate (%)</Label>
                              <Select
                                value={editGstRate}
                                onValueChange={setEditGstRate}
                                disabled={isUpdatingGst}
                              >
                                <SelectTrigger id="gst-rate">
                                  <SelectValue placeholder="Select GST rate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No GST</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="12">12%</SelectItem>
                                  <SelectItem value="18">18%</SelectItem>
                                  <SelectItem value="28">28%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {!item.requires_custom_price && (
                              <div className="rounded-md border p-4 bg-muted/50 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Subtotal:
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice(itemSubtotal)}
                                  </span>
                                </div>
                                {previewGstRate && previewGstRate > 0 && (
                                  <>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        GST ({previewGstRate}%):
                                      </span>
                                      <span className="font-medium">
                                        {formatPrice(previewTax)}
                                      </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between">
                                      <span className="font-semibold">
                                        Total:
                                      </span>
                                      <span className="font-bold">
                                        {formatPrice(previewTotal)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleCancelEditGst}
                      disabled={isUpdatingGst}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveGst} disabled={isUpdatingGst}>
                      {isUpdatingGst ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save GST Rate"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="border shadow-sm sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quote.has_custom_pricing && (
                    <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 mb-4">
                      <p className="text-xs text-yellow-800 font-medium">
                        ⚠️ This quote includes items requiring custom pricing
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {quote.subtotal === null ? (
                          <span className="text-muted-foreground italic">
                            Price on Request
                          </span>
                        ) : (
                          <>
                            {formatPrice(quote.subtotal)}
                            {quote.has_custom_pricing && (
                              <span className="text-xs text-muted-foreground ml-1">
                                (partial)
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                    {quote.total_tax !== null &&
                      quote.total_tax !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Tax (GST)
                          </span>
                          <span className="font-medium">
                            {formatPrice(quote.total_tax)}
                          </span>
                        </div>
                      )}
                    {quote.tax_breakdown &&
                      Object.keys(quote.tax_breakdown).length > 0 && (
                        <div className="rounded-md border p-2 bg-muted/50 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Tax Breakdown
                          </p>
                          {Object.entries(quote.tax_breakdown).map(
                            ([rate, amount]) => (
                              <div
                                key={rate}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-muted-foreground">
                                  GST {rate}%:
                                </span>
                                <span className="font-medium">
                                  {formatPrice(amount)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">
                          Grand Total
                        </span>
                        <span className="text-2xl font-bold">
                          {quote.total === null ? (
                            <span className="text-muted-foreground italic text-lg">
                              Price on Request
                            </span>
                          ) : (
                            <>
                              {formatPrice(quote.total)}
                              {quote.has_custom_pricing && (
                                <span className="text-xs text-muted-foreground ml-1 font-normal">
                                  (partial)
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      </div>
                      {quote.has_custom_pricing && quote.total !== null && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Partial total - custom pricing required for some items
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Information */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quote.user ? (
                    <div className="space-y-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Email
                        </p>
                        <p className="text-sm font-medium">
                          {quote.user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          User ID
                        </p>
                        <p className="text-sm font-medium">{quote.user.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Role
                        </p>
                        <Badge variant="outline" className="capitalize">
                          {quote.user.role}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Status
                        </p>
                        <Badge
                          variant={
                            quote.user.is_active ? "default" : "destructive"
                          }
                        >
                          {quote.user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Member Since
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(quote.user.created_at)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          User ID
                        </p>
                        <p className="text-sm font-medium">{quote.user_id}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        User details not available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
