"use client";

import { Edit } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface EditButtonProps {
  href: string;
  title: string;
}

/**
 * Edit Button Component
 * Small client component for edit button with navigation
 */
export function EditButton({ href, title }: EditButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="h-7 w-7 flex-shrink-0 cursor-pointer"
      title={title}
      asChild
    >
      <Link href={href}>
        <Edit className="h-3.5 w-3.5" />
      </Link>
    </Button>
  );
}
