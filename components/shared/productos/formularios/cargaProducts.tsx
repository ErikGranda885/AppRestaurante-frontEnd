"use client";

import * as React from "react";
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
import { IProduct } from "@/lib/types";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";

interface BulkUploadProductDialogProps {
  categoryOptions: { value: string; label: string }[];
  onSuccess: (newProducts: IProduct[]) => void;
  onClose: () => void;
}

const requiredColumns = ["cate_prod", "nom_prod", "tip_prod", "und_prod"];

export function BulkUploadProductDialog({
  categoryOptions,
  onSuccess,
  onClose,
}: BulkUploadProductDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categoriaMapRef = React.useRef<Record<string, number>>({});
  const tiposValidosRef = React.useRef<Set<string>>(new Set());
  const unidadesValidasRef = React.useRef<Set<string>>(new Set());

  const sanitize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();

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

    const validateHeaders = (headers: string[]): boolean => {
      const normalized = headers.map(sanitize);
      return requiredColumns.every((col) => normalized.includes(col));
    };

    const processParsedData = (data: any[]) => {
      const cleanData = data.filter((row) =>
        Object.values(row).some((v) => v !== null && v !== ""),
      );
      if (!validateRows(cleanData)) {
        ToastError({
          message: "El archivo contiene celdas vacías en campos requeridos.",
        });
        setPreviewData([]);
        return;
      }
      setPreviewData(cleanData);
    };

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target?.result as ArrayBuffer);

        const worksheet = workbook.getWorksheet("Productos");
        const categoriasSheet = workbook.getWorksheet("Categorias");
        const tiposSheet = workbook.getWorksheet("Tipos");
        const unidadesSheet = workbook.getWorksheet("Unidades");

        // Mapear categorías
        const categoriaMap: Record<string, number> = {};
        categoriasSheet?.eachRow({ includeEmpty: false }, (row, index) => {
          if (index === 1) return;
          const id = row.getCell(1).value;
          const nombre = sanitize(String(row.getCell(2).value));
          categoriaMap[nombre] = Number(id);
        });
        categoriaMapRef.current = categoriaMap;

        // Tipos válidos
        const tipos = new Set<string>();
        tiposSheet?.eachRow({ includeEmpty: false }, (row, index) => {
          if (index === 1) return;
          tipos.add(sanitize(String(row.getCell(1).value)));
        });
        tiposValidosRef.current = tipos;

        // Unidades válidas
        const unidades = new Set<string>();
        unidadesSheet?.eachRow({ includeEmpty: false }, (row, index) => {
          if (index === 1) return;
          unidades.add(sanitize(String(row.getCell(1).value)));
        });
        unidadesValidasRef.current = unidades;

        let headers = worksheet?.getRow(1).values as any[];
        if (headers[0] === undefined) headers = headers.slice(1);
        headers = headers.map((h: any) => sanitize(String(h)));

        if (!validateHeaders(headers)) {
          ToastError({
            message:
              "El archivo XLSX contiene columnas incorrectas o incompletas.",
          });
          setPreviewData([]);
          return;
        }

        const formattedData: any[] = [];
        worksheet?.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber <= 2) return;
          const rowValues = row.values as any[];
          const rowData: any = {};
          headers.forEach((header: string, index: number) => {
            let value = rowValues[index + 1];
            if (value instanceof Date) {
              value = value.toLocaleDateString("es-ES");
            }
            rowData[header] = value || "";
          });
          formattedData.push(rowData);
        });

        processParsedData(formattedData);
      } catch {
        ToastError({ message: "Error al procesar el archivo XLSX." });
        setPreviewData([]);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      ToastError({ message: "No hay datos para cargar." });
      return;
    }

    setLoading(true);
    try {
      const defaultImageUrl =
        "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/productos%2Fproduct-default.jpg?alt=media";

      const errores: string[] = [];

      const processedData = previewData.map((row) => {
        const categoriaNombre = sanitize(row["cate_prod"]);
        const tipo = sanitize(row["tip_prod"]);
        const unidad = sanitize(row["und_prod"]);

        const idCategoria = categoriaMapRef.current[categoriaNombre];
        const tipoValido = tiposValidosRef.current.has(tipo);
        const unidadValida = unidadesValidasRef.current.has(unidad);

        if (!idCategoria) errores.push(`Categoría: ${row["cate_prod"]}`);
        if (!tipoValido) errores.push(`Tipo: ${row["tip_prod"]}`);
        if (!unidadValida) errores.push(`Unidad: ${row["und_prod"]}`);

        return {
          cate_prod: idCategoria,
          nom_prod: row["nom_prod"],
          tip_prod: row["tip_prod"],
          und_prod: row["und_prod"],
          est_prod: "Activo",
          img_prod: defaultImageUrl,
        };
      });

      if (errores.length > 0) {
        ToastError({
          message: `Los siguientes valores no son válidos:\n${errores.join(", ")}`,
        });
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/productos/masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al registrar productos.");
      }

      onSuccess(data.productos);
      ToastSuccess({
        message: `Se cargaron ${data.productos.length} productos correctamente`,
      });
      onClose();
    } catch (error: any) {
      ToastError({ message: error.message || "Error al cargar productos." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="border-border dark:bg-[#09090b] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Productos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4 dark:border-none dark:bg-[#1E1E1E] dark:text-white">
            <h2 className="mb-2 font-mono dark:text-gray-100">
              Pasos para la carga masiva:
            </h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700 dark:text-white">
              <li>Descarga la plantilla Excel.</li>
              <li>
                Llena las columnas:{" "}
                <b>cate_prod, nom_prod, tip_prod, und_prod</b>.
              </li>
              <li>Guarda el archivo y selecciónalo.</li>
              <li>Verifica la vista previa.</li>
              <li>
                Haz clic en <b>Cargar</b> para guardar los productos.
              </li>
            </ol>
            <Button
              className="mt-2"
              onClick={async () => {
                try {
                  const response = await fetch(
                    "http://localhost:5000/productos/plantilla",
                  );
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "plantilla-productos.xlsx";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                } catch {
                  ToastError({ message: "Error al descargar la plantilla." });
                }
              }}
            >
              Descargar plantilla
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".xlsx"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center hover:border-gray-400 dark:border-gray-600 dark:text-white"
          >
            <p>Haz clic o arrastra un archivo .xlsx aquí</p>
            {file && (
              <p className="mt-2 text-sm text-gray-700 dark:text-white">
                Archivo: {file.name}
              </p>
            )}
          </div>

          {previewData.length > 0 && (
            <div className="mt-4 max-h-64 overflow-x-auto rounded border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {requiredColumns.map((col) => (
                      <th key={col} className="border px-2 py-1 text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {requiredColumns.map((col) => (
                        <td key={col} className="border px-2 py-1">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading || previewData.length === 0}
            className="bg-yellow-500 text-black"
          >
            {loading ? "Cargando..." : "Guardar Productos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
