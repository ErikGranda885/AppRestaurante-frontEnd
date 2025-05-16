"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudDownload, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

import { DataTable } from "@/components/shared/varios/dataTable";
import { useTransformaciones } from "@/hooks/transformaciones/useTransformaciones";
import { columnsTransformaciones } from "@/components/shared/transformaciones/ui/columnsTransformaciones";
import { FormTransformacion } from "@/components/shared/transformaciones/fomularios/create-transformacion";

export default function Page() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const [abrirCrear, setAbrirCrear] = useState(false);
  const { data: transformaciones, isLoading } = useTransformaciones();

  const filtradas = transformaciones?.filter((t: any) =>
    t.rece_trans.nom_rec.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

        <div className="mb-5 flex items-center justify-between pt-4">
          <GeneralDialog
            open={abrirCrear}
            onOpenChange={setAbrirCrear}
            triggerText={
              <>
                <Plus className="h-4 w-4 font-light" /> Nueva transformación
              </>
            }
            title="Registrar transformación"
            description="Ingresa la cantidad de productos transformados."
            submitText={null}
          >
            <FormTransformacion
              onSuccess={() => {
                setAbrirCrear(false);
              }}
              onClose={() => {
                setAbrirCrear(false);
              }}
            />
          </GeneralDialog>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Buscar transformación"
                className="w-[250px] border pl-10 text-[12px]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="text-xs font-semibold">
              <Upload className="h-4 w-4" /> Importar
            </Button>
            <Button variant="secondary" className="text-xs font-semibold">
              <CloudDownload className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>

        <DataTable columns={columnsTransformaciones} data={filtradas || []} />
      </div>
    </ModulePageLayout>
  );
}
