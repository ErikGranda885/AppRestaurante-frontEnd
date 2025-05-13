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
import { Download } from "lucide-react";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";
import { DropzoneFile } from "../../varios/dropzoneFile";

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

const DEFAULT_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/proveedores%2Fproveedor-defecto.png?alt=media&token=f24083c3-a545-4c7b-8ea9-fb8b1fb684cb";

export function BulkUploadProveedoresDialog({
  onSuccess,
  onClose,
}: BulkUploadProveedoresDialogProps) {
  const [previewData, setPreviewData] = useState<any[]>([]);
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
            img_prov: DEFAULT_IMAGE,
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

          rowData.img_prov = DEFAULT_IMAGE;
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

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/proveedores/masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en la carga");

      onSuccess(data.proveedores);
      ToastSuccess({
        message: `Se cargaron ${data.proveedores.length} proveedores.`,
      });
      onClose();
    } catch (err: any) {
      ToastError({ message: err.message || "Error al cargar proveedores." });
    } finally {
      setLoading(false);
    }
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
                  "http://localhost:5000/proveedores/plantilla",
                  "_blank",
                )
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
            <div className="max-h-[300px] overflow-auto border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {Object.keys(previewData[0])
                      .filter((h) => h !== "img_prov")
                      .map((header) => (
                        <th key={header} className="border px-2 py-1">
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row)
                        .filter((key) => key !== "img_prov")
                        .map((key) => (
                          <td key={key} className="border px-2 py-1">
                            {row[key]}
                          </td>
                        ))}
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
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? "Cargando..." : "Guardar Proveedores"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
