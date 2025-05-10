"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralesConfiguracion } from "@/components/shared/configuraciones/ui/generalesConfiguracion";
import { VentasConfiguracion } from "@/components/shared/configuraciones/ui/ventasConfiguracion";
import { CierresDiariosConfiguracion } from "@/components/shared/configuraciones/ui/cierresDiariosConfiguracion";
import { SeguridadConfiguracion } from "@/components/shared/configuraciones/ui/seguridadConfiguracion";
import { AplicacionConfiguracion } from "@/components/shared/configuraciones/ui/aplicacionConfiguracion";

export default function Page() {
  useProtectedRoute();

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Configuraciones"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false}
    >
      <div className="px-6 pr-16 pt-2">
        <h1 className="text-xl font-bold">Configuraciones</h1>
        <p className="text-sm text-muted-foreground">
          Administra los parámetros generales y específicos del sistema desde
          esta sección.
        </p>

        <div className="pt-6" />

        <Tabs defaultValue="generales" className="w-full">
          {/* ✅ TabsList SOLO con TabsTrigger */}
          <TabsList className="grid grid-cols-4 gap-2 rounded-lg bg-background p-1 dark:bg-[#121212] md:grid-cols-5">
            <TabsTrigger value="generales">Generales</TabsTrigger>
            {/* <TabsTrigger value="asistente">Asistente Voz</TabsTrigger> */}
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="cierres">Cierres Diarios</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>

          {/* ✅ Ahora sí los TabsContent debajo */}
          <TabsContent value="generales">
            <h2 className="mt-4 text-lg font-semibold">Generales</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Configura los datos generales del restaurante.
            </p>
            <GeneralesConfiguracion />
          </TabsContent>

          <TabsContent value="asistente">
            <h2 className="mt-4 text-lg font-semibold">Asistente de Voz</h2>
            <p className="text-sm text-muted-foreground">
              Ajusta los parámetros del asistente virtual.
            </p>
          </TabsContent>

          <TabsContent value="ventas">
            <h2 className="mt-4 text-lg font-semibold">Ventas</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Configura los parámetros generales de ventas y facturación del
              restaurante.
            </p>
            <VentasConfiguracion />
          </TabsContent>

          <TabsContent value="cierres">
            <h2 className="mt-4 text-lg font-semibold">Cierres Diarios</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Establece las reglas y horarios para los cierres automáticos.
            </p>
            <CierresDiariosConfiguracion />
          </TabsContent>

          <TabsContent value="seguridad">
            <h2 className="mt-4 text-lg font-semibold">Seguridad</h2>
            <p className="text-sm text-muted-foreground">
              Administra la seguridad y autenticación del sistema.
            </p>
            <SeguridadConfiguracion />
          </TabsContent>

          <TabsContent value="sistema">
            <h2 className="mt-4 text-lg font-semibold">Sistema</h2>
            <p className="text-sm text-muted-foreground">
              Opciones generales del sistema y mantenimiento.
            </p>
            <AplicacionConfiguracion />
          </TabsContent>
        </Tabs>
      </div>
    </ModulePageLayout>
  );
}
