"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  MoreHorizontal,
  Eye,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface BlobCV {
  url: string;
  pathname: string;
  filename: string;
  uploadedAt: string;
  size: number;
}

export function NavUploadedCVs() {
  const { isMobile } = useSidebar();

  const { data, isLoading, error } = useQuery<{ success: boolean; data: BlobCV[] }>({
    queryKey: ["blob-cvs"],
    queryFn: async () => {
      const response = await fetch("/api/blob/list");
      if (!response.ok) {
        throw new Error("Failed to fetch CVs");
      }
      return response.json();
    },
  });

  const cvs = data?.data || [];

  if (isLoading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Uploaded CVs</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="text-sm text-muted-foreground">Loading...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  if (error || cvs.length === 0) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Uploaded CVs</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="text-sm text-muted-foreground">
                {error ? "Error loading CVs" : "No CVs uploaded"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Uploaded CVs</SidebarGroupLabel>
      <SidebarMenu>
        {cvs.map((cv) => {
          // Split pathname into segments for Next.js catch-all route
          const pathSegments = cv.pathname.split("/").filter(Boolean);
          const blobPath = `/dashboard/curriculum-vitae/blob/${pathSegments.join("/")}`;
          
          return (
            <SidebarMenuItem key={cv.pathname}>
              <SidebarMenuButton asChild>
                <Link href={blobPath}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{cv.filename}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem asChild>
                    <Link href={blobPath}>
                      <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>View CV</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/curriculum-vitae/new/ai-extract?blobUrl=${encodeURIComponent(cv.url)}`}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>AI Extract</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

