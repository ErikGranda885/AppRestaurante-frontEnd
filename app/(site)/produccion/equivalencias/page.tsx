"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { CloudDownload, Plus, Search, Upload } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/shared/varios/dataTable";
import { columnsEquivalencias } from "@/components/shared/equivalencias/ui/columnsEquivalencias";
import { useEquivalencias } from "@/hooks/equivalencias/useEquivalencias";
import { FormEquivalencia } from "@/components/shared/equivalencias/formularios/createEquivalencia";

export default function Page() {
  useProtectedRoute();
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { equivalencias, loading } = useEquivalencias();

  const filtradas = equivalencias?.filter((e: any) =>
    e.prod_equiv.nom_prod.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Producción"
      breadcrumbPageTitle="Gestión de equivalencias"
      submenu={true}
      isLoading={loading}
    >
      <div className="px-6 pt-2">
        <h1 className="text-xl font-bold">Equivalencias</h1>
        <p className="text-sm text-muted-foreground">
          Aquí puedes gestionar las equivalencias de tus insumos.
        </p>
        <div className="pt-4" />
        <div className="mb-5 flex items-center justify-between">
          <GeneralDialog
            open={abrirCrear}
            onOpenChange={setAbrirCrear}
            triggerText={
              <>
                <Plus className="h-4 w-4 font-light" /> Añade nueva equivalencia
              </>
            }
            title="Crear Nueva Equivalencia"
            description="Ingresa la información para crear una nueva equivalencia."
            submitText="Crear Equivalencia"
          >
            <FormEquivalencia
              onClose={() => setAbrirCrear(false)}
              onSuccess={() => setAbrirCrear(false)}
            />
          </GeneralDialog>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Buscar equivalencia"
                className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <Upload className="h-4 w-4" /> Importar
            </Button>
            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <CloudDownload className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <DataTable columns={columnsEquivalencias} data={filtradas || []} />
      </div>
    </ModulePageLayout>
  );
}
