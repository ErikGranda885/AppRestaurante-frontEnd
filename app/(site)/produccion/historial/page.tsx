"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudDownload, Plus, Search, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

import { DataTable } from "@/components/shared/varios/dataTable";
import { useTransformaciones } from "@/hooks/transformaciones/useTransformaciones";
import { columnsTransformaciones } from "@/components/shared/transformaciones/ui/columnsTransformaciones";
import { FormTransformacion } from "@/components/shared/transformaciones/fomularios/create-transformacion";
import { mutate } from "swr";
import { SERVICIOS_TRANSFORMACIONES } from "@/services/transformaciones.service";
import Preloader from "@/components/shared/varios/preloader";

export default function Page() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const { data: transformaciones, isLoading } = useTransformaciones();

  const filtradas = transformaciones?.filter((t: any) =>
    t.rece_trans.nom_rec.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400); // puedes ajustar este valor si deseas

    return () => clearTimeout(timer);
  }, []);

  const handleSuccess = async () => {
    await mutate(SERVICIOS_TRANSFORMACIONES.listar);
    setAbrirCrear(false);
  };

  if (showLoader) return <Preloader />;
  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Producción"
      breadcrumbPageTitle="Historial"
      submenu
      isLoading={isLoading}
    >
      <div className="px-6 pt-2">
        <h1 className="text-xl font-bold">Historial de transformaciones</h1>
        <p className="text-sm text-muted-foreground">
          Aquí puedes gestionar el listado de transformaciones realizadas.
        </p>

        <div className="mb-5 flex gap-2 pt-4 md:flex-row md:items-center md:justify-between">
          {/* Botón: Nueva transformación */}
          <div className="w-full md:w-auto">
            <GeneralDialog
              open={abrirCrear}
              onOpenChange={setAbrirCrear}
              triggerText={
                <>
                  <Plus className="h-4 w-4 font-light" />
                  <span className="ml-1">Nueva transformación</span>
                </>
              }
              title="Registrar transformación"
              description="Ingresa la cantidad de productos transformados."
              submitText={null}
            >
              <FormTransformacion
                onSuccess={handleSuccess}
                onClose={() => setAbrirCrear(false)}
              />
            </GeneralDialog>
          </div>

          {/* Buscador */}
          <div className="w-full md:w-auto">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Buscar transformación"
                className="w-full border border-border bg-white/10 pl-10 text-[12px] md:w-[250px]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DataTable columns={columnsTransformaciones} data={filtradas || []} />
      </div>
    </ModulePageLayout>
  );
}
