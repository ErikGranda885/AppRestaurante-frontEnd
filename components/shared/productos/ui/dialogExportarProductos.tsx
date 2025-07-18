"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { DateRangeFilter } from "../../ventas/ui/dateRangeFilter";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ToastSuccess } from "../../toast/toastSuccess";

function formatDateToYMD(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialogExportarProductos({ open, onOpenChange }: Props) {
  const [tipoReporte, setTipoReporte] = useState("insumos");
  const [formato, setFormato] = useState<"json" | "excel" | "pdf">("excel");
  const [range, setRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);

  const handleExportar = async () => {
    setLoading(true);
    const startTime = performance.now(); // ⏱️ Inicio del cronómetro
    try {
      const desde = range.from ? formatDateToYMD(range.from) : undefined;
      const hasta = range.to ? formatDateToYMD(range.to) : undefined;

      console.log("DateRange original:", range);
      console.log("Fechas enviadas al backend:", {
        desde,
        hasta,
        tipoReporte,
        formato,
      });

      let url = "";
      if (formato === "excel") {
        url =
          tipoReporte === "insumos"
            ? SERVICIOS_PRODUCTOS.exportarReporteInsumos(desde, hasta)
            : SERVICIOS_PRODUCTOS.exportarReporteDirectosTransformados(
                desde,
                hasta,
              );
      } else if (formato === "pdf") {
        url =
          tipoReporte === "insumos"
            ? SERVICIOS_PRODUCTOS.exportarReporteInsumosPDF(desde, hasta)
            : SERVICIOS_PRODUCTOS.exportarReporteDirectosTransformadosPDF(
                desde,
                hasta,
              );
      } else {
        url = SERVICIOS_PRODUCTOS.exportarProductosJson(tipoReporte);
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          ToastError({
            message: errorData.message || "No se encontraron datos.",
          });
        } else {
          ToastError({ message: "Error al generar el reporte." });
        }
        return;
      }

      const blob =
        formato === "json"
          ? new Blob([JSON.stringify(await response.json(), null, 2)], {
              type: "application/json",
            })
          : await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const nombreArchivo = `reporte_${tipoReporte}_$${desde || "inicio"}_$${hasta || "hoy"}.${
        formato === "excel" ? "xlsx" : formato
      }`;
      link.download = nombreArchivo;
      link.click();

      const endTime = performance.now(); // ⏱️ Fin del cronómetro
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      ToastSuccess({
        message: `📥 Reporte generado exitosamente en ${duration} segundos.`,
      });

      onOpenChange(false);
    } catch (err) {
      console.error("Error al exportar:", err);
      ToastError({ message: "Ocurrió un error al exportar el reporte." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar reporte de productos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de reporte */}
          <div className="space-y-1">
            <Label className="text-sm">Tipo de reporte:</Label>
            <Select value={tipoReporte} onValueChange={setTipoReporte}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insumos">Inventario de Insumos</SelectItem>
                <SelectItem value="transformados">
                  Inventario de Directos y Transformados
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas */}
          <div className="space-y-1">
            <Label className="text-sm">Rango de fechas:</Label>
            <DateRangeFilter value={range} onChange={setRange} />
          </div>

          {/* Formato de exportación */}
          <TooltipProvider>
            <div className="space-y-1">
              <Label className="text-sm">Formato de exportación:</Label>
              <div className="flex gap-2 pt-1">
                {(
                  [
                    {
                      value: "excel",
                      label: "Excel",
                      icon: <FileSpreadsheet className="h-4 w-4" />,
                    },
                    {
                      value: "pdf",
                      label: "PDF",
                      icon: <FileText className="h-4 w-4" />,
                    },
                  ] as const
                ).map((formatoItem) => (
                  <Tooltip key={formatoItem.value}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          formato === formatoItem.value ? "primary" : "outline"
                        }
                        className="px-3 py-2 text-xs"
                        onClick={() => setFormato(formatoItem.value)}
                        type="button"
                      >
                        {formatoItem.icon}
                        <span className="ml-2">{formatoItem.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Exportar como {formatoItem.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </TooltipProvider>
        </div>

        <DialogFooter>
          <Button
            onClick={handleExportar}
            disabled={loading}
            className="text-xs"
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Generando..." : "Exportar reporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
