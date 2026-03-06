"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddUserDialog } from "./add-user-dialog";

interface AddUserButtonProps {
  onSuccess?: () => void;
}

/**
 * Button component that opens the Add User dialog
 * Displays a button with Plus icon and "Add User" text
 */
export function AddUserButton({ onSuccess }: AddUserButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        size="sm"
        className="gap-2"
        variant="outline"
      >
        <UserPlus className="size-4" />
        Add User
      </Button>
      <AddUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
