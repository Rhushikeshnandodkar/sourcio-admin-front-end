"use client";

import React from "react";

import { ModeToggle } from "@/components/common/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbItemType = {
  href?: string;
  label: string;
  isCurrent?: boolean;
};

interface ReusableHeaderProps {
  breadcrumbs: BreadcrumbItemType[];
  children?: React.ReactNode;
}

const ReusableHeader: React.FC<ReusableHeaderProps> = ({
  breadcrumbs,
  children,
}) => {
  return (
    <header className="fixed left-5 right-5 top-2 z-10 flex h-14 shrink-0 items-center justify-center gap-2 rounded-lg border bg-background/50 px-2 backdrop-blur transition-all duration-200 ease-linear sm:left-[calc(var(--sidebar-width)+0.1rem)] sm:right-[1rem] sm:top-2.5 sm:group-has-[[data-collapsible=icon]]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1rem)] sm:group-has-[[data-collapsible=offcanvas]]/sidebar-wrapper:left-10">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem
                    className={item.isCurrent ? "" : "hidden md:block"}
                  >
                    {item.isCurrent ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <div className="shrink-0">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ReusableHeader;
