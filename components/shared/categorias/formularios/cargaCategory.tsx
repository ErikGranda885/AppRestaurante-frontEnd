"use client";
import React, { useState, useRef } from "react";
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
import { ICategory } from "@/lib/types";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";

interface BulkUploadCategoryDialogProps {
  onSuccess: (newCategories: ICategory[]) => void;
  onClose: () => void;
}

const requiredColumns = ["nom_cate", "desc_cate"];

export function BulkUploadCategoryDialog({
  onSuccess,
  onClose,
}: BulkUploadCategoryDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para edición inline
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});

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
            ToastError({
              message: "El archivo CSV contiene encabezados incorrectos.",
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
          setPreviewData(results.data);
        },
        error: (error) => {
          ToastError({
            message: "Error al leer el archivo CSV",
          });
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
            ToastError({
              message: "El archivo XLSX no se pudo leer.",
            });
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
              message: "El archivo XLSX contiene encabezados incorrectos.",
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

            // Excluir fila de ejemplo
            if (
              rowData["nom_cate"]?.toLowerCase().includes("ej:") ||
              rowData["nom_cate"]?.toLowerCase().includes("bebidas frías")
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
          setPreviewData(formattedData);
        } catch (err) {
          console.error("Error al parsear el archivo XLSX:", err);
          ToastError({
            message: "Error al leer el archivo XLSX",
          });
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading XLSX file:", error);
        ToastError({
          message: "Error al leer el archivo XLSX",
        });
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setPreviewData([]);
      ToastError({
        message: "Formato de archivo no soportado. Seleccione un CSV o XLSX.",
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    window.open("http://localhost:5000/categorias/plantilla", "_blank");
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

  // Función para eliminar una fila de la vista previa
  const handleRemoveRow = (rowIndex: number) => {
    setPreviewData((prev) => prev.filter((_, index) => index !== rowIndex));
  };

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

  const handleUpload = async () => {
    if (previewData.length === 0) {
      ToastError({
        message: "No hay datos para cargar. Seleccione un archivo primero.",
      });
      return;
    }
    setLoading(true);
    try {
      const processedData = previewData
        .filter(
          (row) =>
            !row["nom_cate"]?.toLowerCase().includes("ej: bebidas frías"),
        )
        .map((row) => ({
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
        ToastSuccess({
          message: `Se cargaron ${data.categorias.length} categorías`,
        });
      }
      if (data.errors && data.errors.length > 0) {
        const errorList = data.errors
          .map((err: any) => err.error || JSON.stringify(err))
          .join(", ");
        ToastError({
          message: `Se encontraron errores en la carga: ${errorList}`,
        });
      }
      onClose();
    } catch (error: any) {
      ToastError({
        message:
          error.message ||
          "Ocurrió un error inesperado al cargar las categorías.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="dark:border dark:border-border dark:bg-[#09090b] sm:max-w-3xl">
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
