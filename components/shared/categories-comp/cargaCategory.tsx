"use client";

import * as React from "react";
import Papa from "papaparse";
import * as ExcelJS from "exceljs";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface BulkUploadCategoryDialogProps {
  onSuccess: (newCategories: any[]) => void;
  onClose: () => void;
}

// Tipo de categoría (opcional)
export type DataCategories = {
  id?: string;
  nombre: string;
  descripcion?: string;
  estado: string;
};

export function BulkUploadCategoryDialog({
  onSuccess,
  onClose,
}: BulkUploadCategoryDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Se esperan estas dos columnas: nom_cate y desc_cate
  const requiredColumns = ["nom_cate", "desc_cate"];

  // Función para validar que cada fila tenga datos en las columnas requeridas
  const validateRows = (rows: any[]): boolean => {
    return rows.every((row) =>
      requiredColumns.every((col) => {
        const value = row[col];
        return (
          value !== undefined && value !== null && String(value).trim() !== ""
        );
      }),
    );
  };

  // Validar encabezados
  const validateHeaders = (headers: string[]): boolean => {
    const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
    return requiredColumns.every((col) => lowerHeaders.includes(col));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    if (
      selectedFile.type === "text/csv" ||
      selectedFile.name.toLowerCase().endsWith(".csv")
    ) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          if (!validateHeaders(headers)) {
            setPreviewData([]);
            toast.error("El archivo CSV contiene encabezados incorrectos.");
            return;
          }
          if (!validateRows(results.data)) {
            setPreviewData([]);
            toast.error(
              "El archivo contiene celdas vacías en campos requeridos.",
            );
            return;
          }
          setPreviewData(results.data);
        },
        error: (error) => {
          console.error("Error al parsear el archivo CSV:", error);
          toast.error("Error al leer el archivo CSV");
        },
      });
    } else if (
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      selectedFile.name.toLowerCase().endsWith(".xlsx")
    ) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result;
        try {
          if (!arrayBuffer) {
            toast.error("No se pudo leer el archivo XLSX");
            return;
          }
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(arrayBuffer as ArrayBuffer);
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            toast.error("El archivo XLSX está vacío");
            return;
          }
          // Obtener encabezados de la primera fila
          let headers = worksheet.getRow(1).values as any[];
          if (headers[0] === undefined) {
            headers = headers.slice(1);
          }
          headers = headers.map((h: any) => String(h).toLowerCase().trim());
          if (!validateHeaders(headers)) {
            setPreviewData([]);
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? "animate-enter" : "animate-leave"
                  } relative flex w-96 items-start gap-3 rounded-lg border border-red-400 bg-red-50 p-4 shadow-lg`}
                  style={{ animationDuration: "3s" }}
                >
                  <CheckCircle className="mt-1 h-6 w-6 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-500">Error</p>
                    <p className="text-sm text-red-500/80">
                      El archivo XLSX contiene columnas incompletas o con
                      encabezados incorrectos.
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-400/20">
                    <div className="progress-bar h-full bg-red-400" />
                  </div>
                </div>
              ),
              { duration: 3000, position: "top-right" },
            );
            return;
          }
          const formattedData: any[] = [];
          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // omitir fila de encabezados
            const rowValues = row.values as any[];
            const rowData: any = {};
            headers.forEach((header: string, index: number) => {
              let value = rowValues[index + 1]; // ExcelJS usa índice 1-based
              if (value instanceof Date) {
                value = value.toLocaleDateString("es-ES");
              }
              rowData[header] = value || "";
            });
            formattedData.push(rowData);
          });
          if (!validateRows(formattedData)) {
            setPreviewData([]);
            toast.error(
              "El archivo contiene celdas vacías en campos requeridos.",
            );
            return;
          }
          setPreviewData(formattedData);
        } catch (err) {
          console.error("Error al parsear el archivo XLSX:", err);
          toast.error("Error al leer el archivo XLSX");
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading XLSX file:", error);
        toast.error("Error al leer el archivo XLSX");
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      toast.error("Solo se admite archivo CSV o XLSX en este ejemplo");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    window.open("http://localhost:5000/categorias/plantilla", "_blank");
  };

  // Manejo de drag & drop
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const event = {
        target: { files: droppedFiles },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
      e.dataTransfer.clearData();
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      toast.error("No hay datos para cargar");
      return;
    }
    setLoading(true);
    try {
      // Transformamos cada fila para ajustarla a lo que espera el backend.
      const processedData = previewData.map((row) => ({
        nom_cate: row["nom_cate"],
        desc_cate: row["desc_cate"],
        est_cate: "Activo",
      }));

      const res = await fetch("http://localhost:5000/categorias/masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg =
          data.message ||
          (data.errors &&
            data.errors.map((err: any) => err.error).join(", ")) ||
          "Error en la carga masiva";
        throw new Error(errorMsg);
      }
      if (data.categorias && data.categorias.length > 0) {
        onSuccess(data.categorias);
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 rounded-lg border border-[#4ADE80] bg-[#F0FFF4] p-4 shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              <CheckCircle className="mt-1 h-6 w-6 text-[#166534]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#166534]">
                  Mensaje Informativo
                </p>
                <p className="text-sm text-[#166534]/80">
                  Categorías cargadas exitosamente.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" },
        );
      }
      if (data.errors && data.errors.length > 0) {
        const errorList = data.errors
          .map((err: any) => err.error || JSON.stringify(err))
          .join(", ");
        toast.error("Algunos registros no se cargaron: " + errorList);
      }
      onClose();
    } catch (error: any) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-red-400 bg-red-50 p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <CheckCircle className="mt-1 h-6 w-6 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-500">Error</p>
              <p className="text-sm text-red-500/80">
                Ha ocurrido un error: {error.message}.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-400/20">
              <div className="progress-bar h-full bg-red-400" />
            </div>
          </div>
        ),
        { duration: 3000, position: "top-right" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="dark:border-default-700 dark:border dark:bg-[#09090b] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Categorías</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Instrucciones */}
          <div className="rounded bg-gray-100 p-4 dark:border-none dark:bg-[#1E1E1E] dark:text-white">
            <h2 className="mb-2 text-lg font-bold dark:text-gray-100">
              Pasos para la carga masiva:
            </h2>
            <ol className="list-inside list-decimal text-sm text-gray-700 dark:text-white">
              <li>
                Descarga la plantilla Excel haciendo clic en el botón{" "}
                <span className="font-semibold dark:text-primary">
                  Descargar plantilla
                </span>
                .
              </li>
              <li>
                Llena la plantilla. Las columnas requeridas son:{" "}
                <strong className="dark:text-primary">
                  nom_cate y desc_cate
                </strong>
                .
              </li>
              <li>
                Guarda el archivo y selecciónalo arrastrándolo a la zona o
                haciendo clic.
              </li>
              <li>Verifica la vista previa de los datos en la tabla.</li>
              <li>
                Si todo es correcto, haz clic en{" "}
                <span className="font-semibold dark:text-primary">
                  Guardar Categorías
                </span>{" "}
                para subir la información.
              </li>
            </ol>
            <Button className="mt-2" onClick={handleDownloadTemplate}>
              Descargar plantilla
            </Button>
          </div>
          {/* Zona de arrastre para seleccionar archivo */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".csv, .xlsx"
            />
            <div
              onClick={handleUploadClick}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="dark:border-default-700 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 dark:text-white dark:hover:border-gray-500"
            >
              <p className="text-gray-500">
                Arrastra y suelta el archivo CSV/XLSX aquí o haz clic para
                seleccionarlo.
              </p>
              {file && (
                <p className="mt-2 text-sm text-gray-700 dark:text-white">
                  Archivo seleccionado: {file.name}
                </p>
              )}
            </div>
          </div>
          {/* Vista previa de los datos */}
          {previewData.length > 0 ? (
            <div className="mt-4 max-h-[20vh] overflow-y-auto border">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-100">
                  <tr>
                    {Object.keys(previewData[0]).map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-200 px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:border-white dark:text-black"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border border-gray-200">
                      {Object.keys(row).map((header, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-200 px-4 py-2 text-sm text-gray-700 dark:text-white"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay datos para mostrar. Seleccione un archivo CSV/XLSX.
            </p>
          )}
        </div>
        <DialogFooter>
          <div className="flex justify-end space-x-2">
            <Button variant={"secondary"} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              className="bg-[#f6b100] text-black"
              disabled={loading || previewData.length === 0}
            >
              {loading ? "Cargando..." : "Guardar Categorías"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
