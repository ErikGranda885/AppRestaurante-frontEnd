"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import React from "react";

export default function PaginaCombos() {
  useProtectedRoute();

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Productos"
      breadcrumbPageTitle="Gestión de Combos"
      submenu={true}
      isLoading={false} //
    ></ModulePageLayout>
  );
}
