"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Package,
  User,
  Edit,
  FileText,
} from "lucide-react";
import ReusableHeader from "@/components/common/reusable-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { OrderDetail, OrderDetailResponse } from "@/types/orders.types";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const numericId = parseInt(orderId, 10);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [updateNotes, setUpdateNotes] = useState<string>("");
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (isNaN(numericId)) {
        setError("Invalid order ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await apiGet<OrderDetailResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.orders.detail(numericId)}`
        );

        if (data.status === "success" && data.data) {
          setOrder(data.data);
          setUpdateStatus(data.data.status);
          setUpdateNotes(data.data.notes || "");
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
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

  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) {
      return "N/A";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleUpdate = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const data = await apiPut<OrderDetailResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.orders.update(numericId)}`,
        {
          status: updateStatus !== order.status ? updateStatus : undefined,
          notes: updateNotes !== (order.notes || "") ? updateNotes : undefined,
        }
      );

      if (data.status === "success" && data.data) {
        setOrder(data.data);
        setIsUpdateDialogOpen(false);
        toast.success("Order updated successfully");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      toast.error("Failed to update order", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    setIsDownloadingInvoice(true);
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.orders.invoice(numericId, true)}`;
      const blob = await apiGet<Blob>(url);

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `invoice-${order.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Invoice downloaded successfully");
    } catch (err) {
      toast.error("Failed to download invoice", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden">
        <div className="flex-shrink-0 py-6 px-2">
          <ReusableHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Orders", href: "/dashboard/orders" },
              { label: "Loading...", isCurrent: true },
            ]}
          />
        </div>
        <div className="flex-1 overflow-auto px-2">
          <div className="mt-8 flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col overflow-hidden">
        <div className="flex-shrink-0 py-6 px-2">
          <ReusableHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Orders", href: "/dashboard/orders" },
              { label: "Error", isCurrent: true },
            ]}
          />
        </div>
        <div className="flex-1 overflow-auto px-2">
          <div className="mt-8 flex justify-center">
            <div className="w-[95%] rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-destructive">
                Error: {error || "Order not found"}
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/orders")}
                className="mt-4"
              >
                Back to Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex-shrink-0 py-6 px-2">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Orders", href: "/dashboard/orders" },
            { label: order.order_number, isCurrent: true },
          ]}
        />
      </div>

      <div className="flex-1 overflow-auto px-2">
        <div className="mt-8 max-w-7xl mx-auto pb-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/orders")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{order.order_number}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Created on {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
                className="gap-2"
              >
                {isDownloadingInvoice ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Download Invoice
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUpdateDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Update Status
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => {
                      const itemPrice =
                        typeof item.price === "string"
                          ? parseFloat(item.price)
                          : item.price || 0;
                      const itemTotal = item.item_total
                        ? typeof item.item_total === "string"
                          ? parseFloat(item.item_total)
                          : item.item_total
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
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {item.product_name}
                              </h3>
                              {item.variant_name && (
                                <p className="text-sm text-muted-foreground">
                                  {item.variant_name}
                                </p>
                              )}
                            </div>
                            {item.gst_rate && (
                              <Badge variant="outline" className="text-xs">
                                GST {item.gst_rate}%
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t">
                            <div>
                              <span className="text-muted-foreground">
                                Quantity:
                              </span>
                              <span className="ml-2 font-medium">
                                {item.quantity}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Unit Price:
                              </span>
                              <span className="ml-2 font-medium">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Subtotal:
                              </span>
                              <span className="ml-2 font-medium">
                                {formatPrice(itemTotal)}
                              </span>
                            </div>
                            {taxAmount !== null && (
                              <div>
                                <span className="text-muted-foreground">
                                  Tax:
                                </span>
                                <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                                  {formatPrice(taxAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t flex justify-between items-center">
                            <span className="font-semibold">Item Total</span>
                            <span className="font-bold text-lg">
                              {itemTotalWithTax !== null
                                ? formatPrice(itemTotalWithTax)
                                : formatPrice(itemTotal)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-2 pb-4 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Customer</span>
                    </div>
                    <div className="pl-6 space-y-1">
                      <p className="text-sm">{order.user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        User ID: {order.user_id}
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-2 pb-4 border-b">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Order Number
                      </span>
                      <span className="font-medium font-mono text-xs">
                        {order.order_number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quote ID</span>
                      <span className="font-medium">#{order.quote_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{order.items.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 pb-4 border-b">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    {order.total_tax !== null &&
                      order.total_tax !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Tax (GST)
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {formatPrice(order.total_tax)}
                          </span>
                        </div>
                      )}
                    {order.tax_breakdown &&
                      Object.keys(order.tax_breakdown).length > 0 && (
                        <div className="rounded-lg border bg-muted/30 p-2 space-y-1 mt-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Tax Breakdown
                          </p>
                          <div className="space-y-1">
                            {Object.entries(order.tax_breakdown).map(
                              ([rate, amount]) => (
                                <div
                                  key={rate}
                                  className="flex justify-between text-[10px]"
                                >
                                  <span className="text-muted-foreground">
                                    GST {rate}%
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice(amount)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Total */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">
                        Grand Total
                      </span>
                      <span className="text-xl font-bold">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="pt-4 border-t">
                      <h3 className="text-xs font-semibold mb-2">Notes</h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-4 border-t space-y-1 text-xs text-muted-foreground">
                    <div>Created: {formatDate(order.created_at)}</div>
                    <div>Updated: {formatDate(order.updated_at)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
            <DialogDescription>
              Update the order status and notes for {order.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add order notes..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
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
                "Update Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
