"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { useState } from "react";
import { ToastError } from "@/components/shared/toast/toastError";
import { SERVICIOS_COMPRAS } from "@/services/compras.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialogExportarCompras({ open, onOpenChange }: Props) {
  const [formato, setFormato] = useState<"excel" | "pdf">("excel");
  const [loading, setLoading] = useState(false);

  const handleExportar = async () => {
    setLoading(true);
    try {
      const url =
        formato === "excel"
          ? SERVICIOS_COMPRAS.exportarComprasExcel
          : SERVICIOS_COMPRAS.exportarComprasPDF;

      const res = await fetch(url);
      if (!res.ok) {
        ToastError({ message: "Error al generar el reporte de compras." });
        return;
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_compras.${formato === "excel" ? "xlsx" : "pdf"}`;
      link.click();
      onOpenChange(false);
    } catch (error) {
      console.error("Error exportando:", error);
      ToastError({ message: "Ocurrió un error al exportar el reporte." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle>Exportar reporte de compras</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm font-medium">Selecciona el formato:</div>
          <div className="flex gap-2">
            <Button
              variant={formato === "excel" ? "primary" : "outline"}
              onClick={() => setFormato("excel")}
              className="flex items-center gap-2 text-xs"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              variant={formato === "pdf" ? "primary" : "outline"}
              onClick={() => setFormato("pdf")}
              className="flex items-center gap-2 text-xs"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleExportar}
            disabled={loading}
            className="text-xs"
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Generando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
