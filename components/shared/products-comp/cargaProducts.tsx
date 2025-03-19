"use client";

import * as React from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
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

// Suponiendo que tu tipo de categoría es algo como:
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Actualizamos las columnas requeridas a solo 2
  const requiredColumns = ["nom_cate", "desc_cate"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    // Función para validar encabezados
    const validateHeaders = (headers: string[]): boolean => {
      const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
      return requiredColumns.every((col) => lowerHeaders.includes(col));
    };

    if (
      selectedFile.type === "text/csv" ||
      selectedFile.name.toLowerCase().endsWith(".csv")
    ) {
      // Parsear CSV con Papa Parse
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
      // Parsear XLSX usando SheetJS
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        try {
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Convertir la hoja a un array de arrays, usando defval para celdas vacías
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          if (jsonData.length === 0) {
            toast.error("El archivo XLSX está vacío");
            return;
          }
          const headers = jsonData[0].map((h: any) =>
            String(h).toLowerCase().trim(),
          );
          if (!validateHeaders(headers)) {
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
            setPreviewData([]);
            return;
          }
          const rows = jsonData.slice(1);
          const formattedData = rows.map((row) => {
            let obj: any = {};
            headers.forEach((header: string, index: number) => {
              obj[header] = row[index];
            });
            return obj;
          });
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
      reader.readAsBinaryString(selectedFile);
    } else {
      toast.error("Solo se admite archivo CSV o XLSX en este ejemplo");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Función para descargar la plantilla generada en el backend
  const handleDownloadTemplate = () => {
    window.open("http://localhost:5000/categorias/plantilla", "_blank");
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      toast.error("No hay datos para cargar");
      return;
    }
    setLoading(true);
    try {
      // Transformar cada fila para que tenga la forma de DataCategories.
      // Se asigna un estado por defecto, por ejemplo "Activo".
      const processedData = previewData.map((row) => ({
        nom_cate: row["nom_cate"],
        desc_cate: row["desc_cate"],
        est_cate: "Activo", // si tu backend espera "est_cate" para el estado
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
      <DialogContent className="dark:border dark:border-default-700 dark:bg-[#09090b] sm:max-w-3xl">
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
                Guarda el archivo y selecciónalo haciendo clic en{" "}
                <span className="font-semibold dark:text-primary">
                  Seleccionar archivo
                </span>
                .
              </li>
              <li>Verifica la vista previa de los datos en la tabla.</li>
              <li>
                Si todo es correcto, haz clic en{" "}
                <span className="font-semibold dark:text-primary">Cargar</span>{" "}
                para subir la información.
              </li>
            </ol>
            <Button
              variant="primary"
              className="mt-2 bg-default-500"
              onClick={handleDownloadTemplate}
            >
              Descargar plantilla
            </Button>
          </div>
          {/* Selector de archivo */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".csv, .xlsx"
            />
            <Button onClick={handleUploadClick}>
              {file ? "Cambiar archivo" : "Seleccionar archivo CSV/XLSX"}
            </Button>
            {file && (
              <p className="mt-2 text-sm">Archivo seleccionado: {file.name}</p>
            )}
          </div>
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
            <Button
              variant="primary"
              className="bg-default-500"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={loading || previewData.length === 0}
            >
              {loading ? "Cargando..." : "Cargar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
