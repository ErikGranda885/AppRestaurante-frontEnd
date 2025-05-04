"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ModalInactividad } from "@/components/shared/varios/modalInactivar";
import { useInactividadLogOut } from "@/hooks/auth/InactividadLogOut";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import React, { useEffect } from "react";

export default function Dashboard() {
  useProtectedRoute();

  /*  const { mostrarAlerta, contador, cancelarAlerta } = useInactividadLogOut({
    minutosInactividad: 1,
    minutosAdvertencia: 1,
  }); */

  useEffect(() => {
    const showToast = localStorage.getItem("showWelcomeToast");
    const userName = localStorage.getItem("user_name");

    if (showToast === "true" && userName) {
      ToastSuccess({
        message: `Bienvenido de nuevo ${userName}`,
      });
      localStorage.removeItem("showWelcomeToast");
    }
  }, []);

  return (
    <>
      <ModulePageLayout
        breadcrumbLinkTitle="Dashboard"
        breadcrumbPageTitle=""
        submenu={false}
        isLoading={false}
      >
        <div>
          <h1>Nueva Venta</h1>
        </div>
      </ModulePageLayout>

      {/* <ModalInactividad
        open={mostrarAlerta}
        contador={contador}
        onCancelar={cancelarAlerta}
      /> */}
    </>
  );
}
