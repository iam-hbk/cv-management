"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

export function BreadcrumbHeader() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <header className="m-2 flex h-16 flex-row items-center gap-2 rounded-lg border px-2 print:hidden">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {paths.map((path, index) => {
              const isLast = index === paths.length - 1;
              const href = `/${paths.slice(0, index + 1).join("/")}`;

              return (
                <div key={path} className="flex flex-row items-center">
                  <BreadcrumbItem key={path} className="hidden md:block">
                    {isLast ? (
                      <BreadcrumbPage className="capitalize">
                        {path.replace(/-/g, " ")}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="capitalize">
                        {path.replace(/-/g, " ")}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <NavUser />
    </header>
  );
}
