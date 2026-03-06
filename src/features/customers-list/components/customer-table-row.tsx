"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerStatusBadge } from "./customer-status-badge";
import { CustomerRoleBadge } from "./customer-role-badge";
import { useDeleteUser } from "../hooks/use-delete-user";
import type { Customer } from "@/types/customers.types";

interface CustomerTableRowProps {
  customer: Customer;
  index: number;
  onDeleteSuccess?: () => void;
}

/**
 * Customer Table Row Component
 * Displays a single customer row in the customers table
 */
export function CustomerTableRow({
  customer,
  index,
  onDeleteSuccess,
}: CustomerTableRowProps) {
  const router = useRouter();
  const { deleteUser, loading: deleteLoading } = useDeleteUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRowClick = () => {
    router.push(`/dashboard/customers/${customer.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(customer.id);
      toast.success("User deleted successfully", {
        description: `User ${customer.email} has been deleted.`,
      });
      setShowDeleteDialog(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      toast.error("Failed to delete user", {
        description: errorMessage,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <TableRow
        className="hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={handleRowClick}
      >
        <TableCell className="h-10 px-4 text-xs text-muted-foreground font-medium">
          {index}
        </TableCell>
        <TableCell className="h-10 px-4 font-medium text-xs">
          {customer.email}
        </TableCell>
        <TableCell className="h-10 px-4">
          <CustomerRoleBadge role={customer.role} />
        </TableCell>
        <TableCell className="h-10 px-4">
          <CustomerStatusBadge isActive={customer.is_active} />
        </TableCell>
        <TableCell className="h-10 px-4 text-xs text-muted-foreground text-center">
          <span className="font-medium">{customer.total_quotes ?? 0}</span>
        </TableCell>
        <TableCell className="h-10 px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(customer.created_at)}
          </div>
        </TableCell>
        <TableCell className="h-10 px-4 text-xs text-muted-foreground">
          {customer.last_login ? (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {formatDateTime(customer.last_login)}
            </div>
          ) : (
            <span className="text-muted-foreground/50">Never</span>
          )}
        </TableCell>
        <TableCell
          className="h-10 px-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive"
            onClick={handleDeleteClick}
            disabled={deleteLoading}
            aria-label={`Delete user ${customer.email}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{customer.email}</strong>?
              This action cannot be undone. Cart items will be deleted, but
              quotes will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
