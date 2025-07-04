"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import * as ExcelJS from "exceljs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, X, Edit2, Download } from "lucide-react";
import { ICategory } from "@/lib/types";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";
import { DropzoneFile } from "../../varios/dropzoneFile";
import { SERVICIOS } from "@/services/categorias.service";

interface BulkUploadCategoryDialogProps {
  onSuccess: (newCategories: ICategory[]) => void;
  onClose: () => void;
}

const requiredColumns = ["nom_cate", "desc_cate"];

export function BulkUploadCategoryDialog({
  onSuccess,
  onClose,
}: BulkUploadCategoryDialogProps) {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});

  const validateRows = (rows: any[]) =>
    rows.every((row) =>
      requiredColumns.every(
        (col) => row[col] && String(row[col]).trim() !== "",
      ),
    );

  const validateHeaders = (headers: string[]) =>
    requiredColumns.every((col) =>
      headers.map((h) => h.toLowerCase().trim()).includes(col),
    );

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields ?? [];
          if (!validateHeaders(headers)) {
            setPreviewData([]);
            return ToastError({ message: "CSV con encabezados incorrectos." });
          }
          if (!validateRows(results.data)) {
            setPreviewData([]);
            return ToastError({ message: "Hay campos requeridos vacíos." });
          }
          setPreviewData(results.data);
        },
        error: () => ToastError({ message: "Error al leer CSV." }),
      });
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.name.toLowerCase().endsWith(".xlsx")
    ) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const worksheet = workbook.worksheets[0];
        if (!worksheet) return ToastError({ message: "XLSX sin hojas." });

        let headers = worksheet.getRow(1).values as any[];
        if (headers[0] === undefined) headers = headers.slice(1);
        headers = headers.map((h: any) => String(h).toLowerCase().trim());

        if (!validateHeaders(headers)) {
          setPreviewData([]);
          return ToastError({ message: "XLSX con encabezados incorrectos." });
        }

        const data: any[] = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
          if (rowNum === 1) return;
          const rowValues = row.values as any[];
          const rowData: any = {};
          headers.forEach((header: string, idx: number) => {
            let value = rowValues[idx + 1];
            if (value instanceof Date)
              value = value.toLocaleDateString("es-ES");
            rowData[header] = value ?? "";
          });

          if (
            rowData["nom_cate"]?.toLowerCase().includes("ej:") ||
            rowData["nom_cate"]?.toLowerCase().includes("bebidas frías")
          )
            return;

          data.push(rowData);
        });

        if (!validateRows(data)) {
          setPreviewData([]);
          return ToastError({ message: "Hay campos requeridos vacíos." });
        }

        setPreviewData(data);
      } catch {
        ToastError({ message: "Error al procesar XLSX." });
      }
    } else {
      ToastError({ message: "Solo se permiten archivos CSV o XLSX." });
    }
  };

  const handleEditRow = (idx: number) => {
    setEditingRowIndex(idx);
    setEditedRow({ ...previewData[idx] });
  };

  const handleSaveRow = (idx: number) => {
    setPreviewData((prev) =>
      prev.map((row, i) => (i === idx ? editedRow : row)),
    );
    setEditingRowIndex(null);
    ToastSuccess({ message: "Fila actualizada." });
  };

  const handleRemoveRow = (idx: number) => {
    setPreviewData((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (previewData.length === 0)
      return ToastError({ message: "No hay datos para cargar." });

    const startTime = performance.now(); // ⏱️ Inicio
    setLoading(true);

    try {
      const processed = previewData.map((row) => ({
        nom_cate: row["nom_cate"],
        desc_cate: row["desc_cate"],
        est_cate: "Activo",
      }));

      const res = await fetch(SERVICIOS.cargarMasivo, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processed),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al cargar.");

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      onSuccess(data.categorias);

      ToastSuccess({
        message: `Se cargaron ${data.categorias.length} categorías en ${duration} segundos.`,
      });

      onClose();
    } catch (err: any) {
      ToastError({ message: err.message || "Error al cargar categorías." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-border">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Categorías</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4 dark:bg-[#1E1E1E]">
            <h2 className="mb-2">Pasos:</h2>
            <ol className="list-inside list-decimal text-sm">
              <li>Descargar plantilla (Excel).</li>
              <li>Completar: nom_cate, desc_cate.</li>
              <li>Seleccionar archivo o arrastrarlo.</li>
              <li>Verificar datos.</li>
              <li>Guardar Categorías.</li>
            </ol>
            <Button
              className="mt-3 flex items-center gap-2"
              onClick={() =>
                window.open(SERVICIOS.generarPlantillaCategoria, "_blank")
              }
            >
              <Download className="h-4 w-4" /> Descargar plantilla
            </Button>
          </div>

          {/* ✅ Nuevo Dropzone universal */}
          <DropzoneFile
            onFileSelect={handleFileSelect}
            accept=".csv,.xlsx"
            text="Arrastra o haz clic para cargar CSV/XLSX"
          />

          {previewData.length > 0 && (
            <div className="mt-4 max-h-[20vh] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {Object.keys(previewData[0]).map((header) => (
                      <th
                        key={header}
                        className="border border-border px-2 py-1"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="border border-border px-2 py-1">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row).map((header) => (
                        <td
                          key={header}
                          className="border border-border px-2 py-1"
                        >
                          {editingRowIndex === idx ? (
                            <input
                              type="text"
                              value={editedRow[header]}
                              onChange={(e) =>
                                setEditedRow({
                                  ...editedRow,
                                  [header]: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                          ) : (
                            row[header]
                          )}
                        </td>
                      ))}
                      <td className="border border-border px-2 py-1">
                        {editingRowIndex === idx ? (
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveRow(idx)}
                            >
                              <CheckCircle className="success-text h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingRowIndex(null)}
                            >
                              <X className="error-text h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRow(idx)}
                            >
                              <Edit2 className="edt-text h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveRow(idx)}
                            >
                              <Trash2 className="error-text h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading || previewData.length === 0}
          >
            {loading ? "Cargando..." : "Guardar Categorías"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
