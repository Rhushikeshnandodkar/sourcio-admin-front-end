"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerTableRow } from "@/features/customers-list/components/customer-table-row";
import type { Customer } from "@/types/customers.types";

interface CustomersTableProps {
  customers: Customer[];
  onDeleteSuccess?: () => void;
}

/**
 * Customers Table Component
 * Single responsibility: Display customer data in table format
 */
export function CustomersTable({
  customers,
  onDeleteSuccess,
}: CustomersTableProps) {
  return (
    <div className="flex justify-center pb-4">
      <div className="w-full rounded-lg border bg-card max-h-[calc(100vh-180px)] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted">
              <TableHead className="h-12 px-4 font-medium w-[80px]">
                ID
              </TableHead>
              <TableHead className="h-12 px-4 font-medium">Email</TableHead>
              <TableHead className="h-12 px-4 font-medium w-[120px]">
                Role
              </TableHead>
              <TableHead className="h-12 px-4 font-medium w-[120px]">
                Status
              </TableHead>
              <TableHead className="h-12 px-4 font-medium w-[140px] text-center">
                Total Quotes
              </TableHead>
              <TableHead className="h-12 px-4 font-medium">Created</TableHead>
              <TableHead className="h-12 px-4 font-medium">
                Last Login
              </TableHead>
              <TableHead className="h-12 px-4 font-medium w-[100px] text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer, index) => (
                <CustomerTableRow
                  key={customer.id}
                  customer={customer}
                  index={index + 1}
                  onDeleteSuccess={onDeleteSuccess}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
