"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function Page() {
  useProtectedRoute();
  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Ventas"
      breadcrumbPageTitle="Historial de ventas"
      submenu={true}
      isLoading={false} //
    >
      
    </ModulePageLayout>
  );
}
