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
import { CheckCircle, Trash2, X, Edit2, Download } from "lucide-react";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";

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

const renderCell = (value: any): string => {
  if (value && typeof value === "object" && "text" in value) {
    return value.text;
  }
  return String(value ?? "");
};

const sanitizeRow = (row: any): any => {
  const newRow: any = { ...row };
  for (const key in newRow) {
    newRow[key] = renderCell(newRow[key]);
  }
  return newRow;
};

export function BulkUploadProveedoresDialog({
  onSuccess,
  onClose,
}: BulkUploadProveedoresDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const parseCSV = () => {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          if (!validateHeaders(headers)) {
            setPreviewData([]);
            ToastError({
              message:
                "El archivo CSV contiene columnas incompletas o incorrectas.",
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
          const dataConImagen = results.data.map((row) => ({
            ...sanitizeRow(row),
            img_prov: DEFAULT_IMAGE,
          }));
          setPreviewData(dataConImagen);
        },
        error: (error) => {
          ToastError({ message: "Error al leer el archivo CSV" });
        },
      });
    };

    const parseXLSX = () => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) return;

        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(arrayBuffer as ArrayBuffer);
          const worksheet = workbook.worksheets[0];
          let headers = worksheet.getRow(1).values as any[];
          if (headers[0] === undefined) headers = headers.slice(1);
          headers = headers.map((h: any) => String(h).toLowerCase().trim());

          if (!validateHeaders(headers)) {
            setPreviewData([]);
            ToastError({
              message: "El archivo XLSX tiene columnas incorrectas.",
            });
            return;
          }

          const formattedData: any[] = [];
          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;

            const rowValues = row.values as any[];
            const rowData: any = {};
            headers.forEach((header: string, index: number) => {
              const rawValue = rowValues[index + 1];
              rowData[header] = renderCell(rawValue).trim();
            });

            if (
              rowData.nom_prov?.toLowerCase().startsWith("ej") ||
              rowData.nom_prov?.toLowerCase().includes("ejemplo")
            ) {
              return;
            }

            rowData.img_prov = DEFAULT_IMAGE;
            formattedData.push(rowData);
          });

          if (!validateRows(formattedData)) {
            setPreviewData([]);
            ToastError({
              message: "El archivo contiene celdas vacías requeridas.",
            });
            return;
          }

          setPreviewData(formattedData);
        } catch (error) {
          ToastError({ message: "Error al leer el archivo XLSX" });
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    };

    if (selectedFile.name.endsWith(".csv")) {
      parseCSV();
    } else if (selectedFile.name.endsWith(".xlsx")) {
      parseXLSX();
    } else {
      ToastError({ message: "Formato de archivo no soportado." });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/proveedores/plantilla",
        {
          method: "GET",
        },
      );
      if (!response.ok) {
        ToastError({ message: "No se pudo descargar la plantilla." });
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-proveedores.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      ToastError({ message: "Error al descargar la plantilla." });
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      ToastError({ message: "No hay datos para cargar." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/proveedores/masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en la carga");

      ToastSuccess({
        message: `Se han cargado ${data.proveedores.length} proveedores.`,
      });
      onSuccess(data.proveedores);
      onClose();
    } catch (error: any) {
      ToastError({ message: `Error al cargar proveedores: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="dark:border dark:border-border dark:bg-[#09090b] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Proveedores</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4 dark:border-none dark:bg-[#1E1E1E] dark:text-white">
            <h2 className="mb-2 font-mono dark:text-gray-100">
              Pasos para la carga masiva:
            </h2>
            <ol className="list-inside list-decimal text-sm text-gray-700 dark:text-white">
              <li>
                Descarga y llena la plantilla con los datos de los proveedores.
              </li>
              <li>
                Campos requeridos:{" "}
                <strong className="dark:text-primary">
                  nom_prov, email_prov, cont_prov, tel_prov, ruc_prov,
                  direc_prov
                </strong>
              </li>
              <li>
                Selecciona o arrastra el archivo .CSV o .XLSX a continuación.
              </li>
            </ol>
            <Button
              className="mt-3 flex items-center gap-2"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4" /> Descargar plantilla
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".csv, .xlsx"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded border-2 border-dashed p-6 text-center dark:border-border dark:text-white"
          >
            <p className="text-gray-500">
              Haz clic o arrastra el archivo CSV/XLSX aquí
            </p>
            {file && (
              <p className="mt-2 text-sm text-gray-700 dark:text-white">
                Archivo: {file.name}
              </p>
            )}
          </div>

          {previewData.length > 0 && (
            <div className="max-h-[300px] max-w-[680px] overflow-auto border border-border">
              <table className="min-w-full border-collapse">
                <thead className="bg-muted">
                  <tr>
                    {Object.keys(previewData[0])
                      .filter((header) => header.toLowerCase() !== "img_prov")
                      .map((header, i) => (
                        <th
                          key={i}
                          className="border border-border px-2 py-1 text-xs font-semibold uppercase"
                        >
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border border-border text-sm">
                      {Object.keys(row)
                        .filter((key) => key.toLowerCase() !== "img_prov")
                        .map((key, i) => (
                          <td
                            key={i}
                            className="border border-border px-2 py-1"
                          >
                            {renderCell(row[key])}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
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
