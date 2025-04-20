"use client";
import React, { useState, useRef, useCallback } from "react";
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
import { CheckCircle, Trash2, X, Edit2 } from "lucide-react";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";
import { IRol } from "@/lib/types";

interface BulkUploadUsersDialogProps {
  roleOptions: IRol[];
  onSuccess: (newUsers: any[]) => void;
  onClose: () => void;
}

// Definir columnas requeridas
const requiredColumns = ["nom_usu", "email_usu", "clave_usu", "rol_usu"];

export function BulkUploadUsersDialog({
  roleOptions,
  onSuccess,
  onClose,
}: BulkUploadUsersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapea las opciones de roles para usarlas en la vista previa y en la conversión de datos.
  const mappedRoleOptionsMemo = useCallback(() => {
    return roleOptions.map((role: IRol) => ({
      value: role.id_rol.toString(),
      label: role.nom_rol,
    }));
  }, [roleOptions]);

  // Validación de encabezados y filas
  const validateHeaders = (headers: string[]): boolean => {
    const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
    return requiredColumns.every((col) => lowerHeaders.includes(col));
  };

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

  // Función para sanitizar y convertir valores
  const renderCell = (value: any): string => {
    if (value && typeof value === "object" && "text" in value) {
      return value.text;
    }
    return value;
  };

  const sanitizeRow = (row: any): any => {
    const newRow: any = { ...row };
    for (const key in newRow) {
      newRow[key] = renderCell(newRow[key]);
    }
    return newRow;
  };

  // Manejo del archivo, validación y lectura
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
            ToastError({
              message:
                "El archivo CSV contiene columnas incompletas o encabezados incorrectos.",
            });
            return;
          }
          if (!validateRows(results.data)) {
            setPreviewData([]);
            ToastError({
              message:
                "El archivo contiene celdas vacías en campos requeridos.",
            });
            return;
          }
          setPreviewData(results.data.map(sanitizeRow));
        },
        error: (error) => {
          console.error("Error al parsear CSV:", error);
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
            if (rowNumber === 1) return;

            const rowValues = row.values as any[];
            const rowData: any = {};
            headers.forEach((header: string, index: number) => {
              let value = rowValues[index + 1];
              if (value instanceof Date) {
                value = value.toLocaleDateString("es-ES");
              }
              rowData[header] = value || "";
            });

            // Ignorar fila de ejemplo si el nom_usu empieza con 'ej:' o contiene 'ejemplo'
            if (
              rowData.nom_usu?.toLowerCase().startsWith("ej") ||
              rowData.nom_usu?.toLowerCase().includes("ejemplo")
            ) {
              return;
            }

            formattedData.push(rowData);
          });
          if (!validateRows(formattedData)) {
            setPreviewData([]);
            ToastError({
              message:
                "El archivo contiene celdas vacías en campos requeridos.",
            });
            return;
          }
          setPreviewData(formattedData.map(sanitizeRow));
        } catch (err) {
          console.error("Error al parsear XLSX:", err);
          ToastError({ message: "Error al leer el archivo XLSX" });
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading XLSX file:", error);
        ToastError({ message: "Error al leer el archivo XLSX" });
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setPreviewData([]);
      ToastError({
        message: "Formato de archivo no soportado. Seleccione un CSV o XLSX.",
      });
    }
  };

  // Funciones para drag & drop y selección de archivo
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
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

  // Funciones para edición inline y eliminación de filas
  const handleEditRow = (rowIndex: number) => {
    setEditingRowIndex(rowIndex);
    setEditedRow({ ...previewData[rowIndex] });
  };

  const handleSaveRow = (rowIndex: number) => {
    setPreviewData((prev) =>
      prev.map((row, index) => (index === rowIndex ? editedRow : row)),
    );
    setEditingRowIndex(null);
    ToastSuccess({ message: "Fila actualizada correctamente." });
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditedRow({});
  };

  const handleRemoveRow = (rowIndex: number) => {
    setPreviewData((prev) => prev.filter((_, index) => index !== rowIndex));
  };

  // Función para descargar plantilla (URL de ejemplo, ajustar según corresponda)
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

  // Función para subir los datos al servidor
  const handleUpload = async () => {
    if (previewData.length === 0) {
      ToastError({
        message: "No hay datos para cargar. Seleccione un archivo.",
      });
      return;
    }
    setLoading(true);
    try {
      const defaultImageUrl =
        "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/usuarios%2Fuser-default.webp?alt=media&token=14f267c3-c208-4f2a-88cd-e828147b5f94";
      const mappedRoles = mappedRoleOptionsMemo();
      const processedData = previewData.map((row) => {
        let roleValue = row["rol_usu"];
        const optionByValue = mappedRoles.find(
          (option) =>
            option.value.toLowerCase() === String(roleValue).toLowerCase(),
        );
        if (optionByValue) {
          roleValue = optionByValue.value;
        } else {
          const optionByLabel = mappedRoles.find(
            (option) =>
              option.label.toLowerCase() === String(roleValue).toLowerCase(),
          );
          if (optionByLabel) {
            roleValue = optionByLabel.value;
          } else {
            throw new Error(`El rol ${roleValue} no fue encontrado`);
          }
        }
        return {
          ...row,
          rol_usu: roleValue,
          img_usu: defaultImageUrl,
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="dark:border dark:border-border dark:bg-[#09090b] sm:max-w-3xl">
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
                Guarda el archivo y selecciónalo arrastrándolo a la zona o
                haciendo clic.
              </li>
              <li>
                Verifica la vista previa de los datos en la tabla y edita o
                elimina filas si es necesario.
              </li>
              <li>
                Si todo es correcto, haz clic en{" "}
                <span className="font-semibold dark:text-primary">
                  Guardar Usuarios
                </span>{" "}
                para subir la información.
              </li>
            </ol>
            <Button className="mt-2" onClick={handleDownloadTemplate}>
              Descargar plantilla
            </Button>
          </div>
          {/* Zona para seleccionar archivo */}
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
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-6 ${
                isDragging
                  ? "border-blue-500"
                  : "border-gray-300 hover:border-gray-400"
              } dark:border-default-700 dark:text-white dark:hover:border-gray-500`}
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
          {/* Vista previa de los datos con edición inline */}
          {previewData.length > 0 ? (
            <div className="mt-4 max-h-[20vh] overflow-y-auto border border-border">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#f4f4f5] dark:bg-secondary">
                  <tr>
                    {Object.keys(previewData[0]).map((header, index) => (
                      <th
                        key={index}
                        className="border border-border px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:border-border dark:text-[#9999a1]"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="border border-border px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:border-border dark:text-[#9999a1]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border border-border">
                      {Object.keys(row).map((header, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-border px-4 py-2 text-sm text-gray-700 dark:text-white"
                        >
                          {editingRowIndex === rowIndex ? (
                            <input
                              type="text"
                              value={editedRow[header]}
                              onChange={(e) =>
                                setEditedRow({
                                  ...editedRow,
                                  [header]: e.target.value,
                                })
                              }
                              className="w-full rounded border px-2 py-1 text-sm"
                            />
                          ) : header === "rol_usu" ? (
                            // Mapeo del rol para mostrar la etiqueta en lugar del valor
                            mappedRoleOptionsMemo().find(
                              (option) =>
                                option.value.toLowerCase() ===
                                String(row[header]).toLowerCase(),
                            )?.label || row[header]
                          ) : (
                            row[header]
                          )}
                        </td>
                      ))}
                      <td className="w-2 border border-border px-2 py-2 text-sm">
                        {editingRowIndex === rowIndex ? (
                          <div className="flex space-x-2">
                            <Button
                              variant="link"
                              className="success-text rounded-full bg-green-100 p-2 dark:bg-green-200 dark:text-green-900"
                              size="sm"
                              onClick={() => handleSaveRow(rowIndex)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Guardar cambios</span>
                            </Button>
                            <Button
                              variant="link"
                              className="error-text rounded-full bg-red-100 p-2 dark:bg-red-200 dark:text-red-900"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancelar edición</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              variant="link"
                              className="rounded-full bg-blue-100 p-2 text-blue-500 dark:text-blue-600"
                              size="sm"
                              onClick={() => handleEditRow(rowIndex)}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Editar fila</span>
                            </Button>
                            <Button
                              variant="link"
                              className="error-text rounded-full bg-red-100 p-2 dark:bg-red-200 dark:text-red-900"
                              size="sm"
                              onClick={() => handleRemoveRow(rowIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar fila</span>
                            </Button>
                          </div>
                        )}
                      </td>
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
            <Button variant="secondary" onClick={onClose}>
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
