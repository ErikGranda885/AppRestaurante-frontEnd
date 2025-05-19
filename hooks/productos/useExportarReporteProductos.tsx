import { ToastError } from "@/components/shared/toast/toastError";

export const useExportarReporteProductos = () => {
  const exportar = async () => {
    try {
      const response = await fetch("/api/productos/reportes/equivalencias/excel");
      if (!response.ok) throw new Error("No se pudo generar el reporte");

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "reporte_productos_equivalencias.xlsx";
      link.click();
    } catch (error) {
      console.error("Error al exportar el reporte:", error);
      ToastError({ message: "Error al exportar el reporte de productos." });
    }
  };

  return exportar;
};