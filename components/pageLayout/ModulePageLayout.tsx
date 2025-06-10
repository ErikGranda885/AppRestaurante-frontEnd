"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SkeletonCard } from "../shared/varios/skeletonCard";

interface ModulePageLayoutProps {
  breadcrumbLinkTitle: string;
  breadcrumbPageTitle: string;
  isLoading?: boolean;
  submenu?: boolean;
  children?: React.ReactNode;
}

export default function ModulePageLayout({
  breadcrumbLinkTitle,
  breadcrumbPageTitle,
  isLoading = false,
  submenu = false,
  children,
}: ModulePageLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="dark:bg-[#09090b]">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink>{breadcrumbLinkTitle}</BreadcrumbLink>
                </BreadcrumbItem>
                {submenu && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbPageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="py-6 pt-0">
          <div className="w-full px-4">
            {isLoading ? <SkeletonCard /> : children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
