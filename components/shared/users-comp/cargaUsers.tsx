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
import { ToastError } from "../toast/toastError";
import { ToastSuccess } from "../toast/toastSuccess";
import { IRol } from "@/lib/types";

interface BulkUploadDialogProps {
  roleOptions: IRol[];
  onSuccess: (newUsers: any[]) => void;
  onClose: () => void;
}

// Definir las columnas requeridas para usuarios
const requiredColumns = ["nom_usu", "email_usu", "clave_usu", "rol_usu"];

// Función auxiliar para sanitizar (convertir a string) un valor de celda
const renderCell = (value: any): string => {
  if (value && typeof value === "object" && "text" in value) {
    return value.text;
  }
  return value;
};

// Valida que cada fila tenga datos (después de sanitizar) en los campos requeridos
const validateRows = (rows: any[]): boolean => {
  return rows.every((row) =>
    requiredColumns.every((col) => {
      const sanitized = renderCell(row[col]);
      return (
        sanitized !== undefined &&
        sanitized !== null &&
        String(sanitized).trim() !== ""
      );
    }),
  );
};

// Transforma (sanitiza) cada fila para obtener valores planos
const sanitizeRow = (row: any): any => {
  const newRow: any = { ...row };
  for (const key in newRow) {
    newRow[key] = renderCell(newRow[key]);
  }
  return newRow;
};

export function BulkUploadDialog({
  roleOptions,
  onSuccess,
  onClose,
}: BulkUploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mapea las opciones de roles de IRol a { value, label }
  const mappedRoleOptions = React.useMemo(
    () =>
      roleOptions.map((role: IRol) => ({
        value: role.id_rol.toString(),
        label: role.nom_rol,
      })),
    [roleOptions],
  );

  // Función para manejar el drag & drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const event = {
        target: { files: droppedFiles },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const validateHeaders = (headers: string[]): boolean => {
      const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
      return requiredColumns.every((col) => lowerHeaders.includes(col));
    };

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
            ToastError({
              message:
                "El archivo CSV contiene columnas incompletas o con encabezados incorrectos.",
            });
            setPreviewData([]);
            return;
          }
          if (!validateRows(results.data)) {
            ToastError({
              message:
                "El archivo contiene celdas vacías en campos requeridos.",
            });
            setPreviewData([]);
            return;
          }
          setPreviewData(results.data.map(sanitizeRow));
        },
        error: (error) => {
          console.error("Error al parsear el archivo CSV:", error);
          ToastError({ message: "Error al leer el archivo CSV" });
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
            ToastError({ message: "Error al leer el archivo XLSX" });
            return;
          }
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(arrayBuffer as ArrayBuffer);
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            ToastError({
              message: "El archivo XLSX no contiene hojas de cálculo.",
            });
            return;
          }
          let headers = worksheet.getRow(1).values as any[];
          if (headers[0] === undefined) {
            headers = headers.slice(1);
          }
          headers = headers.map((h: any) => String(h).toLowerCase().trim());
          if (!validateHeaders(headers)) {
            setPreviewData([]);
            ToastError({
              message:
                "El archivo XLSX contiene columnas incompletas o con encabezados incorrectos.",
            });
            return;
          }
          const formattedData: any[] = [];
          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // omitir fila de encabezados
            const rowValues = row.values as any[];
            const rowData: any = {};
            headers.forEach((header: string, index: number) => {
              let value = rowValues[index + 1]; // ExcelJS usa índices 1-based
              if (value instanceof Date) {
                value = value.toLocaleDateString("es-ES");
              }
              rowData[header] = value || "";
            });
            formattedData.push(rowData);
          });
          if (!validateRows(formattedData)) {
            ToastError({
              message:
                "El archivo contiene celdas vacías en campos requeridos.",
            });
            setPreviewData([]);
            return;
          }
          setPreviewData(formattedData.map(sanitizeRow));
        } catch (err) {
          console.error("Error al parsear el archivo XLSX:", err);
          ToastError({ message: "Error al leer el archivo XLSX" });
          setPreviewData([]);
          return;
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading XLSX file:", error);
        ToastError({ message: "Error al leer el archivo XLSX" });
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      ToastError({
        message: "Formato de archivo no soportado. Seleccione un CSV o XLSX.",
      });
      setPreviewData([]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("http://localhost:5000/usuarios/plantilla", {
        method: "GET",
      });
      if (!response.ok) {
        ToastError({
          message: "No se pudo descargar la plantilla de usuarios.",
        });
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-usuarios.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      ToastError({ message: "No se pudo descargar la plantilla de usuarios." });
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      ToastError({
        message: "No hay datos para cargar. Seleccione un archivo.",
      });
      return;
    }
    setLoading(true);
    try {
      // Mapear las opciones de roles para obtener el formato esperado: { value, label }
      const mappedRoleOptions = mappedRoleOptionsMemo();

      // Procesar cada fila y transformar el valor de rol textual a su value (cadena)
      const processedData = previewData.map((row) => {
        let roleValue = row["rol_usu"];
        // Primero, verificamos si ya coincide con un value en mappedRoleOptions
        const optionByValue = mappedRoleOptions.find(
          (option) =>
            option.value.toLowerCase() === String(roleValue).toLowerCase(),
        );
        if (optionByValue) {
          roleValue = optionByValue.value;
        } else {
          // Si no, buscamos por etiqueta (label)
          const optionByLabel = mappedRoleOptions.find(
            (option) =>
              option.label.toLowerCase() === String(roleValue).toLowerCase(),
          );
          if (optionByLabel) {
            roleValue = optionByLabel.value;
          } else {
            throw new Error(`El rol con id ${roleValue} no fue encontrado`);
          }
        }
        return {
          ...row,
          rol_usu: roleValue,
        };
      });

      const res = await fetch("http://localhost:5000/usuarios/masivo", {
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
        console.log(errorMsg);
        throw new Error(errorMsg);
      }
      onSuccess(data.usuarios);
      ToastSuccess({
        message: `Se han cargado ${data.usuarios.length} usuarios.`,
      });
      onClose();
    } catch (error: any) {
      ToastError({ message: `Error al cargar usuarios: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Creamos la variable mapeada mediante una función de utilidad para usar en handleUpload y en la vista previa.
  const mappedRoleOptionsMemo = React.useCallback(() => {
    return roleOptions.map((role: IRol) => ({
      value: role.id_rol.toString(),
      label: role.nom_rol,
    }));
  }, [roleOptions]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="border-border dark:bg-[#09090b] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Usuarios</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Instrucciones */}
          <div className="rounded bg-gray-100 p-4 dark:border-none dark:bg-[#1E1E1E] dark:text-white">
            <h2 className="mb-2 font-mono dark:text-gray-100">
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
                  nom_usu, email_usu, clave_usu y rol_usu
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
              onDragOver={handleDragOver}
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
                      {Object.keys(row).map((header, cellIndex) => {
                        const key = header.toLowerCase();
                        if (key === "rol_usu") {
                          const rolValue = row[header];
                          const label =
                            mappedRoleOptionsMemo().find(
                              (option) =>
                                option.value.toLowerCase() ===
                                String(rolValue).toLowerCase(),
                            )?.label || String(rolValue);
                          return (
                            <td
                              key={cellIndex}
                              className="border border-gray-200 px-4 py-2 text-sm text-gray-700 dark:text-white"
                            >
                              {label}
                            </td>
                          );
                        } else {
                          return (
                            <td
                              key={cellIndex}
                              className="border border-gray-200 px-4 py-2 text-sm text-gray-700 dark:text-white"
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
            <Button variant={"secondary"} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={loading || previewData.length === 0}
              className="bg-[#f6b100] text-black"
            >
              {loading ? "Cargando..." : "Guardar Usuarios"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
