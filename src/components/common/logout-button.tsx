"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/components/ui/sidebar";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const { logout, isLoading } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogout = async () => {
    setIsDialogOpen(false);
    await logout();
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setIsDialogOpen(true)}
            disabled={isLoading}
            className="w-full bg-destructive/5 hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="size-4 text-destructive" />
            {!isCollapsed && (
              <span className="text-destructive">
                {isLoading ? "Logging out..." : "Logout"}
              </span>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to login again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
