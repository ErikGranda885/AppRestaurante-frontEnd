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
import { CheckCircle, Download, Edit2, Trash2, X } from "lucide-react";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";
import { DropzoneFile } from "../../varios/dropzoneFile";
import { DEFAULT_PROVEEDOR_IMAGE_URL } from "@/lib/constants";
import { SERVICIOS_PROVEEDORES } from "@/services/proveedores.service";

interface BulkUploadProveedoresDialogProps {
  onSuccess: (newProveedores: any[]) => void;
  onClose: () => void;
}

const requiredColumns = [
  "nom_prov",
  "email_prov",
  "cont_prov",
  "tel_prov",
  "ruc_prov",
  "direc_prov",
];

export function BulkUploadProveedoresDialog({
  onSuccess,
  onClose,
}: BulkUploadProveedoresDialogProps) {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [editandoFilaIndex, setEditandoFilaIndex] = useState<number | null>(
    null,
  );
  const [editarFila, seteditarFila] = useState<any>({});

  const [loading, setLoading] = useState(false);

  const validateHeaders = (headers: string[]) =>
    requiredColumns.every((col) =>
      headers.map((h) => h.toLowerCase().trim()).includes(col),
    );

  const validateRows = (rows: any[]) =>
    rows.every((row) =>
      requiredColumns.every(
        (col) => row[col] && String(row[col]).trim() !== "",
      ),
    );

  const sanitizeRow = (row: any) => {
    const newRow: any = { ...row };
    Object.keys(newRow).forEach((key) => {
      newRow[key] =
        typeof newRow[key] === "object" && newRow[key]?.text
          ? newRow[key].text
          : String(newRow[key] ?? "");
    });
    return newRow;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields ?? [];
          if (!validateHeaders(headers))
            return ToastError({ message: "CSV con columnas incorrectas." });

          if (!validateRows(results.data))
            return ToastError({ message: "Campos requeridos vacíos." });

          const data = results.data.map((row) => ({
            ...sanitizeRow(row),
            img_prov: DEFAULT_PROVEEDOR_IMAGE_URL, // ✅ cambio aquí
          }));
          setPreviewData(data);
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

        if (!validateHeaders(headers))
          return ToastError({ message: "XLSX con columnas incorrectas." });

        const data: any[] = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
          if (rowNum === 1) return;
          const rowValues = row.values as any[];
          const rowData: any = {};
          headers.forEach((header: string, idx: number) => {
            const val = rowValues[idx + 1];
            rowData[header] =
              typeof val === "object" && val?.text
                ? val.text
                : String(val ?? "");
          });

          if (
            rowData.nom_prov?.toLowerCase().startsWith("ej") ||
            rowData.nom_prov?.toLowerCase().includes("ejemplo")
          )
            return;

          rowData.img_prov = DEFAULT_PROVEEDOR_IMAGE_URL; // ✅ cambio aquí
          data.push(rowData);
        });

        if (!validateRows(data))
          return ToastError({ message: "Campos requeridos vacíos." });

        setPreviewData(data);
      } catch {
        ToastError({ message: "Error al procesar XLSX." });
      }
    } else {
      ToastError({ message: "Solo se permiten archivos CSV o XLSX." });
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0)
      return ToastError({ message: "No hay datos para cargar." });

    const startTime = performance.now(); // ⏱️ Inicio
    setLoading(true);

    try {
      const res = await fetch(SERVICIOS_PROVEEDORES.cargarMasivoProv, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en la carga");

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      onSuccess(data.proveedores);
      ToastSuccess({
        message: `Se cargaron ${data.proveedores.length} proveedores en ${duration} segundos.`,
      });

      onClose();
    } catch (err: any) {
      ToastError({ message: err.message || "Error al cargar proveedores." });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarFila = (idx: number) => {
    setEditandoFilaIndex(idx);
    seteditarFila({ ...previewData[idx] });
  };

  const handleGuardarFila = (idx: number) => {
    setPreviewData((prev) =>
      prev.map((row, i) => (i === idx ? editarFila : row)),
    );
    setEditandoFilaIndex(null);
    ToastSuccess({ message: "Fila actualizada correctamente." });
  };

  const handleEliminarFila = (idx: number) => {
    setPreviewData((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="border-border sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Proveedores</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4 dark:bg-[#1E1E1E]">
            <h2 className="mb-2">Pasos:</h2>
            <ol className="list-inside list-decimal text-sm">
              <li>Descargar plantilla (Excel).</li>
              <li>
                Completar: nom_prov, email_prov, cont_prov, tel_prov, ruc_prov,
                direc_prov.
              </li>
              <li>Seleccionar archivo o arrastrarlo.</li>
              <li>Verificar datos.</li>
              <li>Guardar Proveedores.</li>
            </ol>
            <Button
              className="mt-3 flex items-center gap-2"
              onClick={() =>
                window.open(
                  SERVICIOS_PROVEEDORES.generarPlantillaProv,
                  "_blank",
                )
              }
            >
              <Download className="h-4 w-4" /> Descargar plantilla
            </Button>
          </div>

          <DropzoneFile
            onFileSelect={handleFileSelect}
            accept=".csv,.xlsx"
            text="Arrastra o haz clic para cargar CSV/XLSX"
          />

          {previewData.length > 0 && (
            <div className="max-h-[35vh] overflow-x-auto overflow-y-auto rounded border border-border bg-background">
              <div className="w-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {Object.keys(previewData[0])
                        .filter((h) => h !== "img_prov")
                        .map((header) => (
                          <th
                            key={header}
                            className="border border-border bg-muted px-2 py-1"
                          >
                            {header}
                          </th>
                        ))}
                      <th className="border border-border bg-muted px-2 py-1">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(row)
                          .filter((key) => key !== "img_prov")
                          .map((key) => (
                            <td
                              key={key}
                              className="border border-border px-2 py-1"
                            >
                              {editandoFilaIndex === idx ? (
                                <input
                                  type="text"
                                  value={editarFila[key]}
                                  onChange={(e) =>
                                    seteditarFila({
                                      ...editarFila,
                                      [key]: e.target.value,
                                    })
                                  }
                                  className="w-full"
                                />
                              ) : (
                                row[key]
                              )}
                            </td>
                          ))}
                        <td className="border border-border px-2 py-1 text-center">
                          {editandoFilaIndex === idx ? (
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGuardarFila(idx)}
                              >
                                <CheckCircle className="success-text h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditandoFilaIndex(null)}
                              >
                                <X className="error-text h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditarFila(idx)}
                              >
                                <Edit2 className="edt-text h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEliminarFila(idx)}
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
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? "Cargando..." : "Guardar Proveedores"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
