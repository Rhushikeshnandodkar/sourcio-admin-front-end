"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import ReusableHeader from "@/components/common/reusable-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useShipping } from "@/hooks/use-shipping";
import type { ShippingAddress } from "@/types/shipping.types";

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(7, "Phone must have 7-15 digits").max(15),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address1: z.string().min(1, "Address line 1 is required"),
  address2: z.string().optional(),
  postalCode: z.string().min(4, "Postal code is required").max(10),
  company: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const defaultValues: AddressFormValues = {
  name: "",
  phone: "",
  country: "India",
  state: "",
  city: "",
  address1: "",
  address2: "",
  postalCode: "",
  company: "",
  instructions: "",
  isDefault: false,
};

export default function ShippingPage() {
  const {
    addresses,
    loading,
    error,
    refetch,
    createAddress,
    updateAddress,
    deleteAddress,
  } = useShipping();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<ShippingAddress | null>(null);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        phone: editing.phone,
        country: editing.country,
        state: editing.state,
        city: editing.city,
        address1: editing.address1,
        address2: editing.address2 || "",
        postalCode: editing.postal_code,
        company: editing.company || "",
        instructions: editing.instructions || "",
        isDefault: editing.is_default,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editing, form]);

  const handleOpenCreate = () => {
    setEditing(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: ShippingAddress) => {
    setEditing(address);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: AddressFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        phone: values.phone,
        country: values.country,
        state: values.state,
        city: values.city,
        address1: values.address1,
        address2: values.address2 || null,
        postal_code: values.postalCode,
        company: values.company || null,
        instructions: values.instructions || null,
        is_default: values.isDefault,
      };

      if (editing) {
        await updateAddress(editing.id, payload);
        toast.success("Shipping address updated");
      } else {
        await createAddress(payload);
        toast.success("Shipping address created");
      }

      setIsDialogOpen(false);
      setEditing(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save address";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteAddress(id);
      toast.success("Shipping address deleted");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete address";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (address: ShippingAddress) => {
    try {
      await updateAddress(address.id, { is_default: true });
      toast.success("Default address updated");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set default address";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex-shrink-0 py-6 px-2">
        <ReusableHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Shipping Addresses", isCurrent: true },
          ]}
        >
          <Button onClick={handleOpenCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </ReusableHeader>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-6">
        <div className="w-[95%] mx-auto">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">
                  Shipping Addresses
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage saved shipping addresses and defaults.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading addresses...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-between rounded-md border border-destructive/50 bg-destructive/10 p-4">
                  <div className="text-destructive">{error}</div>
                  <Button variant="outline" size="sm" onClick={refetch}>
                    Retry
                  </Button>
                </div>
              ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MapPin className="h-10 w-10 mb-3 text-muted-foreground" />
                  <p className="mb-2">No shipping addresses yet.</p>
                  <Button
                    onClick={handleOpenCreate}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first address
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/60">
                        <TableHead className="min-w-[180px]">
                          Recipient
                        </TableHead>
                        <TableHead className="min-w-[260px]">Address</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="w-[120px] text-center">
                          Default
                        </TableHead>
                        <TableHead className="w-[180px] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addresses.map((address) => (
                        <TableRow key={address.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="font-semibold">
                                {address.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {address.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm leading-6">
                              <div>{address.address1}</div>
                              {address.address2 ? (
                                <div>{address.address2}</div>
                              ) : null}
                              <div>
                                {address.city}, {address.state},{" "}
                                {address.country} {address.postal_code}
                              </div>
                              {address.instructions ? (
                                <div className="text-muted-foreground italic">
                                  {address.instructions}
                                </div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {address.company || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {address.is_default ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-700">
                                <Check className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefault(address)}
                                disabled={submitting}
                              >
                                Set default
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(address)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(address.id)}
                              disabled={isDeleting === address.id}
                            >
                              {isDeleting === address.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Shipping Address" : "Add Shipping Address"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Recipient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal / ZIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address line 1</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street, building, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address line 2 (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default</FormLabel>
                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          Set as default
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Delivery instructions (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Notes for delivery"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {editing ? "Save changes" : "Create address"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
