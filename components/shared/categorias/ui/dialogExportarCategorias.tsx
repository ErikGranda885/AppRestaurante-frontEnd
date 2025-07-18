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
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { SERVICIOS } from "@/services/categorias.service"; // Asegúrate que estén allí las rutas
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ToastError } from "@/components/shared/toast/toastError";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialogExportarCategorias({ open, onOpenChange }: Props) {
  const [formato, setFormato] = useState<"excel" | "pdf">("excel");
  const [loading, setLoading] = useState(false);

  const handleExportar = async () => {
    setLoading(true);
    try {
      const url =
        formato === "excel"
          ? SERVICIOS.exportarCategoriasExcel
          : SERVICIOS.exportarCategoriasPDF;

      const response = await fetch(url);
      if (!response.ok) {
        ToastError({ message: "Error al generar el reporte de categorías." });
        return;
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_categorias.${formato === "excel" ? "xlsx" : "pdf"}`;
      link.click();

      onOpenChange(false);
    } catch (error) {
      console.error("Error al exportar:", error);
      ToastError({ message: "Ocurrió un error al exportar el reporte." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle>Exportar reporte de categorías</DialogTitle>
        </DialogHeader>

        <TooltipProvider>
          <div className="space-y-2">
            <div className="text-sm font-medium">Formato de exportación:</div>
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
              ).map((item) => (
                <Tooltip key={item.value}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={formato === item.value ? "primary" : "outline"}
                      className="px-3 py-2 text-xs"
                      onClick={() => setFormato(item.value)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Exportar como {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </TooltipProvider>

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
