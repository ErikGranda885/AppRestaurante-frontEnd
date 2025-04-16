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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator aria-orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink>{breadcrumbLinkTitle}</BreadcrumbLink>
              </BreadcrumbItem>
              {submenu && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbPageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="py-6 pt-0 ">
        <div className="w-full px-4">
          {isLoading ? <SkeletonCard /> : children}
        </div>
      </div>
    </>
  );
}
