"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangeFilter } from "./dateRangeFilter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, FileJson2, FileSpreadsheet, FileText } from "lucide-react";
import { SERVICIOS_REPORTES } from "@/services/reportes.service";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ToastError } from "../../toast/toastError";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRange: DateRange;
}

export function DialogExportarVentas({
  open,
  onOpenChange,
  defaultRange,
}: Props) {
  const [tipo, setTipo] = useState<string>("diario");
  const [formato, setFormato] = useState<"json" | "excel" | "pdf">("json");
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [loading, setLoading] = useState(false);

  const handleExportar = async () => {
    if (
      !range.from ||
      !range.to ||
      !["diario", "semanal", "mensual"].includes(tipo)
    )
      return;

    setLoading(true);
    try {
      const desde = range.from.toISOString();
      const hasta = range.to.toISOString();
      let url = "";

      switch (formato) {
        case "json":
          url = SERVICIOS_REPORTES.ventasPorPeriodo(tipo as any, desde, hasta);
          break;
        case "excel":
          url = SERVICIOS_REPORTES.ventasPorPeriodoExcel(
            tipo as any,
            desde,
            hasta,
          );
          break;
        case "pdf":
          url = SERVICIOS_REPORTES.ventasPorPeriodoPDF(
            tipo as any,
            desde,
            hasta,
          );
          break;
      }

      const response = await fetch(url);

      if (!response.ok) {
        // Si el backend devuelve 404, asumimos que no hay resultados
        if (response.status === 404) {
          ToastError({
            message:
              "No se encontraron resultados para el periodo seleccionado.",
          });
          return;
        }

        throw new Error("Error al generar el reporte");
      }

      if (formato === "json") {
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          ToastError({
            message: "No se encontraron resultados para el rango seleccionado.",
          });
          return;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_ventas_${tipo}.json`;
        link.click();
      } else {
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_ventas_${tipo}.${formato === "excel" ? "xlsx" : "pdf"}`;
        link.click();
      }
    } catch (err) {
      console.error("Error al exportar:", err);
      ToastError({
        message: "Ocurrió un error al exportar el reporte.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar reporte de ventas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agrupar por */}
          <div>
            <Label className="text-sm">Agrupar por:</Label>
            <RadioGroup value={tipo} onValueChange={setTipo} className="mt-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="diario" id="r1" />
                <Label htmlFor="r1">Diario</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="semanal" id="r2" />
                <Label htmlFor="r2">Semanal</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="mensual" id="r3" />
                <Label htmlFor="r3">Mensual</Label>
              </div>
            </RadioGroup>
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
                      value: "json",
                      label: "JSON",
                      icon: <FileJson2 className="h-4 w-4" />,
                    },
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
