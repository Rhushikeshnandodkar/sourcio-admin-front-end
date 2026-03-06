"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  FileText,
  FolderTree,
  Home,
  Package2,
  Plus,
  Tag,
  Users,
  ShoppingCart,
  MapPin,
} from "lucide-react";
import { Logo } from "@/components/sidebar/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/sidebar/nav-main";
import { NotificationsPopover } from "@/components/sidebar/nav-notifications";
import { LogoutButton } from "@/components/common/logout-button";

const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "JL",
    text: "Server upgrade completed.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "HH",
    text: "New user signed up.",
    time: "2h ago",
  },
];

const dashboardRoutes: Route[] = [
  {
    id: "home",
    title: "Home",
    icon: <Home className="size-4" />,
    link: "/dashboard",
  },
  {
    id: "products",
    title: "Products",
    icon: <Package2 className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Catalogue",
        link: "/dashboard/catalogue",
        icon: <Package2 className="size-4" />,
      },
      {
        title: "Add Product",
        link: "/dashboard/products/add",
        icon: <Plus className="size-4" />,
      },
    ],
  },
  {
    id: "content",
    title: "Content",
    icon: <FolderTree className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Tags",
        link: "/dashboard/tags",
        icon: <Tag className="size-4" />,
      },
      {
        title: "Categories",
        link: "/dashboard/categories",
        icon: <FolderTree className="size-4" />,
      },
      {
        title: "Create Tag",
        link: "/dashboard/tags/create",
        icon: <Tag className="size-4" />,
      },
      {
        title: "Create Category",
        link: "/dashboard/categories/create",
        icon: <FolderTree className="size-4" />,
      },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    icon: <Users className="size-4" />,
    link: "/dashboard/customers",
  },
  {
    id: "quotes",
    title: "Quotes",
    icon: <FileText className="size-4" />,
    link: "/dashboard/quotes",
  },
  {
    id: "orders",
    title: "Orders",
    icon: <ShoppingCart className="size-4" />,
    link: "/dashboard/orders",
  },
  {
    id: "shipping",
    title: "Shipping",
    icon: <MapPin className="size-4" />,
    link: "/dashboard/shipping",
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href="#" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              Sourcio
            </span>
          )}
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <NotificationsPopover notifications={sampleNotifications} />
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2 space-y-2">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
