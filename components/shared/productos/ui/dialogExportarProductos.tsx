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
import { FileSpreadsheet, Download } from "lucide-react";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialogExportarProductos({ open, onOpenChange }: Props) {
  const [tipoReporte, setTipoReporte] = useState("insumos");
  const [range, setRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);

  const handleExportar = async () => {
    setLoading(true);
    try {
      let url = "";

      const desde = range.from?.toISOString().split("T")[0];
      const hasta = range.to?.toISOString().split("T")[0];
      console.log("Fechas enviadas al backend:");
      console.log("Desde:", desde);
      console.log("Hasta:", hasta);

      if (tipoReporte === "insumos") {
        url = SERVICIOS_PRODUCTOS.exportarReporteInsumos(desde, hasta);
      } else {
        url = SERVICIOS_PRODUCTOS.exportarReporteDirectosTransformados(
          desde,
          hasta,
        );
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

      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const nombreArchivo = `reporte_${tipoReporte}_${
        desde || "inicio"
      }_${hasta || "hoy"}.xlsx`;
      link.download = nombreArchivo;
      link.click();

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
      <DialogContent className="sm:max-w-md">
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

          {/* Rango visible para ambos tipos */}
          {["insumos", "transformados"].includes(tipoReporte) && (
            <div className="space-y-1">
              <Label className="text-sm">Rango de fechas:</Label>
              <DateRangeFilter value={range} onChange={setRange} />
            </div>
          )}
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