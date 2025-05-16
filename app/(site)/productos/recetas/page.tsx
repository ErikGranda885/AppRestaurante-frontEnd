"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { CloudDownload, Plus, Search, Upload } from "lucide-react";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";

import { useRecetas } from "@/hooks/recetas/useRecetas";
import { useDetalleReceta } from "@/hooks/det_recetas/useDetalleReceta";
import { FormCrearReceta } from "@/components/shared/recetas/formularios/createRecetaForm";

export default function RecetasPage() {
  useProtectedRoute();

  const [selectedRecetaId, setSelectedRecetaId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [abrirCrear, setAbrirCrear] = useState(false);

  const { recetas } = useRecetas();
  const { ingredientes, isLoading, error } = useDetalleReceta(selectedRecetaId);

  const filteredRecetas = recetas.filter((receta) =>
    receta.nom_rec.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedReceta = recetas.find((r) => r.id_rec === selectedRecetaId);

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Productos"
      breadcrumbPageTitle="Recetas"
      submenu={true}
      isLoading={false}
    >
      <div className="px-6 pt-2">
        <h1 className="text-xl font-bold">Recetas</h1>
        <p className="text-sm text-muted-foreground">
          Aquí puedes gestionar las recetas de tu negocio. Puedes añadir, editar
          o eliminar recetas según sea necesario.
        </p>
        <div className="pt-4" />
        <div className="mb-5 flex items-center justify-between">
          <GeneralDialog
            open={abrirCrear}
            onOpenChange={setAbrirCrear}
            triggerText={
              <>
                <Plus className="h-4 w-4 font-light" /> Añade nueva receta
              </>
            }
            title="Crear Nueva Receta"
            description="Ingresa la información para crear una nueva receta."
            submitText="Crear Receta"
          >
            <FormCrearReceta
              onSuccess={() => {
                setAbrirCrear(false); // Cerrar el diálogo al guardar
                // Aquí puedes recargar recetas si ya usas SWR o un hook con mutate()
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
                placeholder="Buscar recetas..."
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
      </div>
      <div className="flex flex-col gap-4 px-6 pt-2">
        {filteredRecetas.length === 0 ? (
          <div className="flex h-[530px] items-center justify-center rounded-md border text-sm text-muted-foreground">
            No se encontraron recetas.
          </div>
        ) : (
          <div className="grid grid-cols-[65%_35%] gap-4">
            <ScrollArea className="h-[530px]">
              <div className="mr-4 space-y-4 p-1">
                {filteredRecetas.map((receta) => (
                  <Card
                    key={receta.id_rec}
                    onClick={() => setSelectedRecetaId(receta.id_rec)}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-6 py-4 shadow-sm transition hover:shadow-md dark:bg-[#262626] ${
                      selectedRecetaId === receta.id_rec
                        ? "border-primary ring-2 ring-primary"
                        : "border-muted"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold">
                        {receta.nom_rec}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {receta.desc_rec}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm font-medium">
                        <span>
                          $
                          {receta.prod_rec?.prec_vent_prod?.toFixed(2) ??
                            "0.00"}
                        </span>
                        <span>{receta.prod_rec?.stock_prod ?? 0} g</span>
                        <span>{receta.prod_rec?.prec_comp_prod ?? 0} kcal</span>
                      </div>
                    </div>
                    <div>
                      <Image
                        src={receta.prod_rec.img_prod || "/default.png"}
                        alt="Imagen"
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-xl object-cover shadow"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="h-[530px] px-4">
              {selectedReceta ? (
                <Card className="flex h-full flex-col border-border px-2 py-5 dark:bg-[#1a1a1a]">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {selectedReceta.nom_rec}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 overflow-auto">
                    <div>
                      <h3 className="font-semibold">Descripción</h3>
                      <p className="text-sm">{selectedReceta.desc_rec}</p>
                    </div>

                    <div>
                      <h3 className="text-center font-semibold">
                        Ingredientes
                      </h3>
                      {isLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Cargando ingredientes...
                        </p>
                      ) : error ? (
                        <p className="text-sm text-red-500">Error: {error}</p>
                      ) : (
                        <ScrollArea className="h-[220px] rounded-md py-2">
                          <div className="grid grid-cols-2 gap-y-1 text-start">
                            {ingredientes.map((ing: any) => (
                              <div
                                key={ing.id_det_rec}
                                className="flex justify-start gap-2"
                              >
                                <Image
                                  src={ing.prod_rec.img_prod || "/default.png"}
                                  alt={ing.prod_rec.nom_prod}
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover"
                                />
                                <span>
                                  {ing.prod_rec.nom_prod} - {ing.cant_rec}{" "}
                                  {ing.und_prod_rec}
                                </span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold">Producto final</h3>
                      <div className="flex justify-between text-sm">
                        <span>Nombre: {selectedReceta.prod_rec.nom_prod}</span>
                        <span>
                          Precio: $
                          {selectedReceta.prod_rec?.prec_vent_prod != null
                            ? selectedReceta.prod_rec.prec_vent_prod.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full border-border">
                  <CardContent className="flex h-full items-center justify-center text-muted-foreground">
                    <span>Selecciona una receta para ver su detalle</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </ModulePageLayout>
  );
}
