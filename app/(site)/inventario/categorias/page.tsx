// app/(site)/ventas/nueva/page.tsx
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";

export default function Page() {
  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Inventario"
      breadcrumbPageTitle="Gestión de Categorias"
      submenu={true}
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
