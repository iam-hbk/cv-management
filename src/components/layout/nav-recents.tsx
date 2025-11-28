"use client";

import {
  BookOpenText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface RecentCV {
  id: string;
  jobTitle: string;
  createdAt: Date;
  createdBy: {
    name: string;
    email: string;
  };
  status: string;
}

export function NavRecents() {
  const { isMobile } = useSidebar();

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data: RecentCV[];
  }>({
    queryKey: ["recent-cvs"],
    queryFn: async () => {
      const response = await fetch("/api/cv/list");
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
        <SidebarGroupLabel>Recents</SidebarGroupLabel>
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
        <SidebarGroupLabel>Recents</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="text-sm text-muted-foreground">
                {error ? "Error loading CVs" : "No recent CVs"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recents</SidebarGroupLabel>
      <SidebarMenu>
        {cvs.map((cv) => (
          <SidebarMenuItem key={cv.id}>
            <SidebarMenuButton asChild>
              <Link href={`/dashboard/curriculum-vitae/view/${cv.id}`}>
                <BookOpenText className="mr-2 h-4 w-4" />
                <span className="truncate">{cv.jobTitle}</span>
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
                  <Link href={`/dashboard/curriculum-vitae/view/${cv.id}`}>
                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>View CV</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/curriculum-vitae/edit/${cv.id}`}>
                    <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Edit CV</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Delete CV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

