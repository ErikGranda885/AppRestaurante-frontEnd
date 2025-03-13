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

interface BulkUploadDialogProps {
  roleOptions: { value: string; label: string }[];
  onSuccess: (newUsers: any[]) => void;
  onClose: () => void;
}

export function BulkUploadDialog({
  roleOptions,
  onSuccess,
  onClose,
}: BulkUploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const requiredColumns = ["nom_usu", "email_usu", "clave_usu", "rol_usu"];

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
            String(h).toLowerCase().trim()
          );
          if (!validateHeaders(headers)) {
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? "animate-enter" : "animate-leave"
                  } relative flex w-96 items-start gap-3 p-4 bg-red-50 border border-red-400 rounded-lg shadow-lg`}
                  style={{ animationDuration: "3s" }}
                >
                  <CheckCircle className="w-6 h-6 text-red-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-red-500 text-sm font-semibold">Error</p>
                    <p className="text-sm text-red-500/80">
                      El archivo XLSX contiene columnas incompletas o con
                      encabezados incorrectos.
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-400/20">
                    <div className="progress-bar h-full bg-red-400" />
                  </div>
                </div>
              ),
              { duration: 3000, position: "top-right" }
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

  // Función para descargar la plantilla generada dinámicamente en el backend
  const handleDownloadTemplate = () => {
    window.open("http://localhost:5000/usuarios/plantilla", "_blank");
  };

  // Actualizar el valor del rol en la fila previewData si se modifica desde el select
  const handleRoleChange = (rowIndex: number, newRole: string) => {
    setPreviewData((prev) => {
      const newData = [...prev];
      newData[rowIndex] = { ...newData[rowIndex], rol: newRole };
      return newData;
    });
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      toast.error("No hay datos para cargar");
      return;
    }
    setLoading(true);
    try {
      // Procesar previewData para asegurar que "rol_usu" sea el id numérico
      const processedData = previewData.map((row) => {
        let processedRow = { ...row };
        const roleValue = row["rol_usu"] || row["rol"];
        if (roleValue) {
          if (isNaN(Number(roleValue))) {
            const matching = roleOptions.find(
              (option) =>
                option.label.toLowerCase() === String(roleValue).toLowerCase()
            );
            if (matching) {
              processedRow["rol_usu"] = Number(matching.value);
            } else {
              processedRow["rol_usu"] = roleValue;
            }
          } else {
            processedRow["rol_usu"] = Number(roleValue);
          }
        }
        return processedRow;
      });

      const res = await fetch("http://localhost:5000/usuarios/masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });
      const data = await res.json();

      if (!res.ok) {
        // Si la API retorna errores, por ejemplo, en data.message o data.errors
        // Puedes mostrar un toast con el error.
        const errorMsg =
          data.message ||
          (data.errors &&
            data.errors.map((err: any) => err.error).join(", ")) ||
          "Error en la carga masiva";
        throw new Error(errorMsg);
      }

      // Si se procesaron usuarios, mostrar mensaje de éxito
      if (data.usuarios && data.usuarios.length > 0) {
        onSuccess(data.usuarios);
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 p-4 bg-[#F0FFF4] border border-[#4ADE80] rounded-lg shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              <CheckCircle className="w-6 h-6 text-[#166534] mt-1" />
              <div className="flex-1">
                <p className="text-[#166534] text-sm font-semibold">
                  Mensaje Informativo
                </p>
                <p className="text-sm text-[#166534]/80">
                  Usuarios cargados exitosamente.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" }
        );
      }

      // Si la API retornó errores, también los mostramos
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
            } relative flex w-96 items-start gap-3 p-4 bg-red-50 border border-red-400 rounded-lg shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <CheckCircle className="w-6 h-6 text-red-500 mt-1" />
            <div className="flex-1">
              <p className="text-red-500 text-sm font-semibold">Error</p>
              <p className="text-sm text-red-500/80">
                Ha ocurrido un error: {error.message}.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-400/20">
              <div className="progress-bar h-full bg-red-400" />
            </div>
          </div>
        ),
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Usuarios</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Instrucciones */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-bold mb-2 dark:text-black">
              Pasos para la carga masiva:
            </h2>
            <ol className="list-decimal list-inside text-sm text-gray-700">
              <li>
                Descarga la plantilla Excel haciendo clic en el botón{" "}
                <span className="font-semibold">Descargar plantilla</span>.
              </li>
              <li>
                Llena la plantilla. En la columna <strong>rol_usu</strong> se
                mostrará un menú desplegable con los roles disponibles (generado
                dinámicamente desde la base de datos).
              </li>
              <li>
                Guarda el archivo y selecciónalo haciendo clic en{" "}
                <span className="font-semibold">Seleccionar archivo</span>.
              </li>
              <li>Verifica la vista previa de los datos en la tabla.</li>
              <li>
                Si todo es correcto, haz clic en{" "}
                <span className="font-semibold">Cargar</span> para subir la
                información.
              </li>
            </ol>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="mt-2"
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
            <div className="overflow-auto border mt-4 max-h-96">
              <table className="min-w-full border-collapse ">
                <thead className="bg-gray-50 dark:bg-gray-100">
                  <tr>
                    {Object.keys(previewData[0]).map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200 dark:border-white dark:text-black"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border border-gray-200"
                    >
                      {Object.keys(row).map((header, cellIndex) => {
                        const key = header.toLowerCase();
                        if (key === "rol_usu") {
                          const rolValue = row[header];
                          return (
                            <td
                              key={cellIndex}
                              className="px-4 py-2 text-sm text-gray-700 border border-gray-200 dark:text-white"
                            >
                              {roleOptions.find(
                                (option) => option.value === String(rolValue)
                              )?.label || String(rolValue)}
                            </td>
                          );
                        } else {
                          return (
                            <td
                              key={cellIndex}
                              className="px-4 py-2 text-sm text-gray-700 border border-gray-200 dark:text-white"
                            >
                              {row[header]}
                            </td>
                          );
                        }
                      })}
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
              variant="outline"
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
