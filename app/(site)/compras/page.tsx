"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function Page() {
  useProtectedRoute();
  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Compras"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false} //
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full w-full flex-col p-4">
          <h1 className="text-xl font-bold">Compras</h1>
          <div className="p-6">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
              
              {/* Metriccards */}
            </div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
