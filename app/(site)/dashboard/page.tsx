"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import React, { useEffect } from "react";

export default function Dashboard() {
  useProtectedRoute();
  useEffect(() => {
    const showToast = localStorage.getItem("showWelcomeToast");
    if (showToast) {
      ToastSuccess({
        message: `Bienvido de nuevo ${localStorage.getItem("userName")}`,
      });
      localStorage.removeItem("showWelcomeToast");
    }
  }, []);

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Dahsboard"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false} //
    >
      {/* Aquí va el contenido específico de la página */}
      <div>
        <h1>Nueva Venta</h1>
        {/* Resto de la información y componentes */}
      </div>
    </ModulePageLayout>
  );
}
