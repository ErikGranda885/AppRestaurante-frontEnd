"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudDownload, FileSpreadsheet, FileText } from "lucide-react";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const DialogExportarUsuariosRoles = ({ open, onOpenChange }: Props) => {
  const [tipoReporte, setTipoReporte] = useState<"usuarios" | "roles">(
    "usuarios",
  );
  const [formato, setFormato] = useState<"excel" | "pdf">("excel");
  const [loading, setLoading] = useState(false);

  const servicio =
    tipoReporte === "usuarios"
      ? {
          excel: SERVICIOS_USUARIOS.exportarExcel,
          pdf: SERVICIOS_USUARIOS.exportarPDF,
        }
      : {
          excel: SERVICIOS_USUARIOS.exportarRolesExcel,
          pdf: SERVICIOS_USUARIOS.exportarRolesPDF,
        };

  const handleExportar = async () => {
    setLoading(true);
    try {
      const url = formato === "excel" ? servicio.excel : servicio.pdf;
      const response = await fetch(url);

      if (!response.ok) {
        ToastError({ message: "Error al generar el reporte." });
        return;
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_${tipoReporte}.${formato === "excel" ? "xlsx" : "pdf"}`;
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
          <DialogTitle>Exportar reporte</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de reporte y el formato de exportación.
          </DialogDescription>
        </DialogHeader>

        {/* Tipo de reporte */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo de reporte:</Label>
          <Select
            value={tipoReporte}
            onValueChange={(value) =>
              setTipoReporte(value as "usuarios" | "roles")
            }
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Seleccione tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usuarios">Reporte de Usuarios</SelectItem>
              <SelectItem value="roles">Reporte de Roles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Formato de exportación */}
        <TooltipProvider>
          <div className="space-y-2 pt-4">
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

        <DialogFooter className="pt-4">
          <Button
            onClick={handleExportar}
            disabled={loading}
            className="text-xs"
          >
            <CloudDownload className="mr-2 h-4 w-4" />
            {loading ? "Generando..." : "Exportar reporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
