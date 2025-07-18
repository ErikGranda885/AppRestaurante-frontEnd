"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Search, AlertTriangle } from "lucide-react";
import { useVentasDashboard } from "@/hooks/dashboard/useVentasDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ValidarPagoDialog } from "./validarPagoDialog";
import { SERVICIOS_VENTAS } from "@/services/ventas.service";
import { ToastSuccess } from "../../toast/toastSuccess";
import { Button } from "@/components/ui/button";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { safePrice } from "@/utils/format";

interface Props {
  onRefreshDashboard?: () => void;
}

export default function OrdenesEnProceso({ onRefreshDashboard }: Props) {
  const { ventasConfig } = useConfiguracionesVentas();

  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("En progreso");
  const { ultimasVentas, ventasPendientes, loading, error, refresh } =
    useVentasDashboard();

  const [ventaSeleccionada, setVentaSeleccionada] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const ordenesFiltradas = (
    filtro === "En progreso" ? ultimasVentas : ventasPendientes
  )?.filter((orden: any) =>
    orden.usuario.toLowerCase().includes(search.toLowerCase()),
  );

  const aceptarPago = async (id_vent: number) => {
    const startTime = performance.now(); // ⏱️ Inicio

    try {
      const response = await fetch(SERVICIOS_VENTAS.actualizarEstado(id_vent), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ est_vent: "Cerrada" }),
      });

      if (!response.ok) throw new Error("Error al actualizar estado");

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      ToastSuccess({
        message: `Pago validado exitosamente en ${duration} segundos`,
      });

      setOpenDialog(false);
      setVentaSeleccionada(null);
      await refresh(); // recarga las órdenes
      onRefreshDashboard?.(); // ✅ recarga las métricas del dashboard
    } catch (err) {
      console.error("Error al aceptar pago:", err);
    }
  };

  if (loading || error) {
    return (
      <Skeleton className="h-full w-full rounded-xl border border-border p-4 dark:bg-[#1e1e1e]" />
    );
  }

  if (error) {
    return (
      <Card className="h-full w-full border border-border p-6 text-center dark:bg-[#1e1e1e] dark:text-white">
        <p className="mb-2 text-sm text-muted-foreground">
          Ocurrió un error al cargar las órdenes.
        </p>
        <p className="text-xs text-muted-foreground">
          Por favor, intenta más tarde.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full w-full border border-border px-1 dark:bg-[#1e1e1e] dark:text-white">
        <CardHeader className="space-y-2 py-5">
          <ToggleGroup
            type="single"
            value={filtro}
            onValueChange={(val) => val && setFiltro(val)}
            className="w-full rounded-md border border-border"
          >
            <ToggleGroupItem
              value="En progreso"
              className="h-14 w-1/2 rounded-l-lg text-sm data-[state=on]:bg-muted data-[state=on]:text-black dark:data-[state=on]:text-white"
            >
              En progreso
            </ToggleGroupItem>

            <ToggleGroupItem
              value="Pendiente"
              className="relative flex h-14 w-1/2 items-center justify-center rounded-r-lg text-sm data-[state=on]:bg-muted data-[state=on]:text-black dark:data-[state=on]:text-white"
            >
              <span>Pagos pendientes</span>

              {ventasPendientes.length > 0 && (
                <div
                  className="group relative ml-2 cursor-pointer transition-transform duration-300 hover:scale-110"
                  title={`Tienes ${ventasPendientes.length} pago(s) pendiente(s) de validar`}
                >
                  <AlertTriangle className="h-5 w-5 animate-pulse text-yellow-500" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    !
                  </span>
                </div>
              )}
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar orden..."
              className="w-full border border-border pl-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="h-[520px] p-0">
          <ScrollArea className="h-[509px] space-y-3 px-3 pr-4">
            {ordenesFiltradas?.length === 0 ? (
              <p className="px-3 text-sm text-muted-foreground">
                Sin resultados
              </p>
            ) : (
              ordenesFiltradas.map((orden: any) => (
                <div
                  key={orden.id_vent}
                  className="mt-1 flex items-center justify-between rounded-lg bg-muted px-3 py-2 transition hover:bg-muted/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] rounded-md bg-black px-3 py-2 text-center text-sm font-bold text-white shadow dark:bg-white dark:text-black">
                      {orden.id_vent}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {orden.usuario}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {safePrice(
                          Number(orden.total ?? 0),
                          ventasConfig.moneda,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-xs">
                    {filtro === "Pendiente" ? (
                      <>
                        <Button
                          variant="primary"
                          className="h-1 w-auto p-3 text-[11px] font-semibold transition-colors duration-200"
                          onClick={() => {
                            setVentaSeleccionada({
                              id_vent: orden.id_vent,
                              comprobante: orden.comprobante,
                              imagen: orden.imagen,
                            });
                            setOpenDialog(true);
                          }}
                        >
                          Validar pago <ArrowRight className="h-4 w-4" />
                        </Button>

                        <span className="mt-1 text-muted-foreground">
                          Pendiente
                        </span>
                      </>
                    ) : (
                      <>
                        <Badge className="bg-gray-600 text-xs text-white hover:bg-gray-700">
                          {orden.metodo_pago}
                        </Badge>
                        <span className="mt-1 text-muted-foreground">
                          {new Date(orden.fecha).toLocaleTimeString("es-EC", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {ventaSeleccionada && (
        <ValidarPagoDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          venta={ventaSeleccionada}
          onConfirm={aceptarPago}
        />
      )}
    </>
  );
}
