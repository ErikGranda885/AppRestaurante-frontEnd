"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { Input } from "@/components/ui/input";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/varios/dataTable";

import { useEquivalencias } from "@/hooks/equivalencias/useEquivalencias";
import { FormEquivalencia } from "@/components/shared/equivalencias/formularios/createEquivalencia";
import { EditEquivalenciaForm } from "@/components/shared/equivalencias/formularios/editEquivalenciaForm";
import { IEquivalencia } from "@/lib/types";
import { columnsEquivalencias } from "@/components/shared/equivalencias/ui/columnsEquivalencias";
import { mutate } from "swr";
import { SERVICIOS_EQUIVALENCIAS } from "@/services/equivalencias.service";
import { Toaster } from "react-hot-toast";
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import Preloader from "@/components/shared/varios/preloader";

export default function Page() {
  useProtectedRoute();
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [equivalenciaEditar, setEquivalenciaEditar] =
    useState<IEquivalencia | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { equivalencias, loading } = useEquivalencias();

  const filtradas = equivalencias?.filter((e: IEquivalencia) =>
    e.prod_equiv.nom_prod.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400); // puedes ajustar este valor si deseas

    return () => clearTimeout(timer);
  }, []);
  if (showLoader) return <Preloader />;
  return (
    <>
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
          <div className="mb-5 flex gap-4 md:flex-row md:items-center md:justify-between">
            {/* Botón: Añadir equivalencia */}
            <div className="w-full md:w-auto">
              <GeneralDialog
                open={abrirCrear}
                onOpenChange={setAbrirCrear}
                triggerText={
                  <>
                    <Plus className="h-4 w-4 font-light" />
                    <span className="ml-1">Añade nueva equivalencia</span>
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
            </div>

            {/* Buscador */}
            <div className="w-full md:w-auto">
              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar equivalencia"
                  className="w-full border border-border bg-white/10 pl-10 text-[12px] md:w-[250px]"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columnsEquivalencias({
              onEdit: (eq) => {
                setEquivalenciaEditar(eq);
                setAbrirEditar(true);
              },
              onDelete: async (eq) => {
                const startTime = performance.now(); // ⏱️ Inicio

                try {
                  const res = await fetch(
                    SERVICIOS_EQUIVALENCIAS.eliminar(eq.id_equiv),
                    {
                      method: "DELETE",
                    },
                  );

                  const data = await res.json();

                  if (!res.ok) throw new Error(data.message);

                  const endTime = performance.now(); // ⏱️ Fin
                  const duration = ((endTime - startTime) / 1000).toFixed(2);

                  ToastSuccess({
                    message: `${data.message} en ${duration} segundos.`,
                  });

                  await mutate(SERVICIOS_EQUIVALENCIAS.listar);
                } catch (err: any) {
                  ToastError({ message: err.message });
                }
              },
            })}
            data={filtradas}
          />
        </div>

        {/* Modal de edición */}
        {equivalenciaEditar && (
          <GeneralDialog
            open={abrirEditar}
            onOpenChange={(open) => {
              setAbrirEditar(open);
              if (!open) setEquivalenciaEditar(null);
            }}
            title="Editar Equivalencia"
            description="Modifica los datos de la equivalencia seleccionada."
            submitText="Guardar cambios"
          >
            <EditEquivalenciaForm
              equivalencia={equivalenciaEditar}
              onSuccess={() => {
                setAbrirEditar(false);
                setEquivalenciaEditar(null);
              }}
              onClose={() => {
                setAbrirEditar(false);
                setEquivalenciaEditar(null);
              }}
            />
          </GeneralDialog>
        )}
      </ModulePageLayout>
      <Toaster position="top-right" />
    </>
  );
}
