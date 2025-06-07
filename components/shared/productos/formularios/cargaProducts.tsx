"use client";
import { useEffect, useRef, useState } from "react";
import * as ExcelJS from "exceljs";
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
import { CheckCircle, Download, Edit2, Trash2, X } from "lucide-react";
import { DropzoneFile } from "../../varios/dropzoneFile";
import {
  DEFAULT_PRODUCT_IMAGE_URL,
  TIP_PROD_OPTIONS,
  UNIT_OPTIONS,
} from "@/lib/constants";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";

interface BulkUploadProductDialogProps {
  categoryOptions: { value: string; label: string }[];
  onSuccess: (newProducts: IProduct[]) => void;
  onClose: () => void;
}

const requiredColumns = ["cate_prod", "nom_prod", "tip_prod", "und_prod"];
const previewColumns = [
  ...requiredColumns,
  "stock_inicial",
  "precio_venta",
  "fecha_vencimiento",
];
export function BulkUploadProductDialog({
  categoryOptions,
  onSuccess,
  onClose,
}: BulkUploadProductDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [editandoFilaIndex, setEditandoFilaIndex] = useState<number | null>(
    null,
  );
  const [filaEditando, setFilaEditando] = useState<any>({});

  const [loading, setLoading] = useState(false);
  const categoriaMapRef = useRef<Record<string, number>>({});
  const tiposValidosRef = useRef<Set<string>>(new Set());
  const unidadesValidasRef = useRef<Set<string>>(new Set());
  const [categoriaOptions, setCategoriaOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const sanitize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();

  const validateRows = (rows: any[]): boolean =>
    rows.every((row) =>
      requiredColumns.every(
        (col) => row[col] !== undefined && String(row[col]).trim() !== "",
      ),
    );

  const handleFileSelect = async (selectedFile: File) => {
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

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await selectedFile.arrayBuffer());

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
          if (header === "fecha_vencimiento") {
            console.log("Valor original fecha:", value);
            if (value instanceof Date) {
              console.log("→ Es instancia Date");
              value = value.toISOString().split("T")[0]; // ✅ Aquí el cambio
              console.log("→ ISO:", value);
            } else if (typeof value === "number") {
              console.log("→ Es número serial Excel");
              const excelEpoch = new Date(1900, 0, 1);
              const actualDate = new Date(
                excelEpoch.getTime() + (value - 2) * 86400000,
              );
              value = actualDate.toISOString().split("T")[0]; // ✅ También aplica aquí
              console.log("→ Fecha desde serial (ISO):", value);
            }
          }

          rowData[header] = value || "";
        });
        if (rowNumber > 2) {
          console.log("Fila Excel cruda:", row.values);
          console.log("Fila procesada:", rowData);
        }

        formattedData.push(rowData);
      });

      processParsedData(formattedData);
    } catch {
      ToastError({
        message: "Error al procesar el archivo XLSX, el archivo no es válido.",
      });
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      ToastError({ message: "No hay datos para cargar." });
      return;
    }

    const startTime = performance.now(); // ⏱️ Inicio
    setLoading(true);

    try {
      const defaultImageUrl = DEFAULT_PRODUCT_IMAGE_URL;
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

        const stockInicial = Number(row["stock_inicial"] || 0);
        const precioVenta = Number(row["precio_venta"] || 0);
        const fechaVencimiento = row["fecha_vencimiento"]
          ? new Date(row["fecha_vencimiento"])
          : null;

        return {
          cate_prod: idCategoria,
          nom_prod: row["nom_prod"],
          tip_prod: row["tip_prod"],
          und_prod: row["und_prod"],
          est_prod: "Activo",
          img_prod: defaultImageUrl,
          stock_prod: isNaN(stockInicial) ? null : stockInicial,
          prec_vent_prod: isNaN(precioVenta) ? null : precioVenta,
          fecha_venc_lote: fechaVencimiento,
        };
      });

      console.log("Preview para enviar al backend:", processedData);

      if (errores.length > 0) {
        ToastError({ message: `Valores no válidos: ${errores.join(", ")}` });
        setLoading(false);
        return;
      }

      const res = await fetch(SERVICIOS_PRODUCTOS.guardarMasivoProductos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al registrar productos.");

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      onSuccess(data.productos);
      ToastSuccess({
        message: `Se cargaron ${data.productos.length} productos correctamente en ${duration} segundos.`,
      });

      onClose();
    } catch (error: any) {
      ToastError({ message: error.message || "Error al cargar productos." });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarFila = (idx: number) => {
    setEditandoFilaIndex(idx);
    setFilaEditando({ ...previewData[idx] });
  };

  const handleGuardarFila = (idx: number) => {
    setPreviewData((prev) =>
      prev.map((row, i) => (i === idx ? filaEditando : row)),
    );
    setEditandoFilaIndex(null);
    ToastSuccess({ message: "Fila actualizada correctamente." });
  };

  const handleEliminarFila = (idx: number) => {
    setPreviewData((prev) => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    fetch(SERVICIOS_PRODUCTOS.categorias)
      .then((res) => res.json())
      .then((data) => {
        const activas = data.categorias.filter(
          (cat: any) => cat.est_cate?.toLowerCase() === "activo",
        );
        const options = activas.map((cat: any) => ({
          value: cat.nom_cate,
          label: cat.nom_cate,
        }));
        setCategoriaOptions(options);
      })
      .catch(() => {
        ToastError({ message: "Error al cargar categorías activas." });
      });
  }, []);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="border-border dark:bg-[#09090b] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Productos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4 dark:bg-[#1E1E1E]">
            <h2 className="mb-2 font-mono dark:text-gray-100">Pasos:</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm dark:text-white">
              <li>Descarga la plantilla Excel.</li>
              <li>
                Llena: <b>cate_prod, nom_prod, tip_prod, und_prod</b>.
              </li>
              <li>Selecciona el archivo o arrástralo aquí.</li>
              <li>Verifica la vista previa.</li>
              <li>
                Haz clic en <b>Cargar</b>.
              </li>
            </ol>
            <Button
              className="mt-3 flex items-center gap-2"
              onClick={async () => {
                try {
                  const response = await fetch(
                    SERVICIOS_PRODUCTOS.descagarPlantillaProducto,
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
              <Download className="h-4 w-4" /> Descargar plantilla
            </Button>
          </div>

          <DropzoneFile
            onFileSelect={handleFileSelect}
            accept=".xlsx"
            text="Arrastra y suelta el archivo CSV/XLSX aquí o haz clic para
                seleccionarlo."
          />

          {previewData.length > 0 && (
            <div className="mt-4 max-h-[20vh] overflow-x-auto border border-border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {previewColumns.map((col) => (
                      <th key={col} className="border border-border px-2 py-1">
                        {col}
                      </th>
                    ))}
                    <th className="border border-border px-2 py-1">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {previewColumns.map((col) => (
                        <td
                          key={col}
                          className="border border-border px-2 py-1"
                        >
                          {editandoFilaIndex === idx ? (
                            col === "tip_prod" ? (
                              <select
                                className="w-full"
                                value={filaEditando[col]}
                                onChange={(e) =>
                                  setFilaEditando({
                                    ...filaEditando,
                                    [col]: e.target.value,
                                  })
                                }
                              >
                                {TIP_PROD_OPTIONS.map((op) => (
                                  <option key={op.value} value={op.value}>
                                    {op.label}
                                  </option>
                                ))}
                              </select>
                            ) : col === "und_prod" ? (
                              <select
                                className="w-full"
                                value={filaEditando[col]}
                                onChange={(e) =>
                                  setFilaEditando({
                                    ...filaEditando,
                                    [col]: e.target.value,
                                  })
                                }
                              >
                                {UNIT_OPTIONS.map((op) => (
                                  <option key={op.value} value={op.value}>
                                    {op.label}
                                  </option>
                                ))}
                              </select>
                            ) : col === "cate_prod" ? (
                              <select
                                className="w-full"
                                value={filaEditando[col]}
                                onChange={(e) =>
                                  setFilaEditando({
                                    ...filaEditando,
                                    [col]: e.target.value,
                                  })
                                }
                              >
                                {categoriaOptions.map((op) => (
                                  <option key={op.value} value={op.value}>
                                    {op.label}
                                  </option>
                                ))}
                              </select>
                            ) : col === "fecha_vencimiento" ? (
                              <input
                                type="date"
                                className="w-full"
                                value={filaEditando[col] || ""}
                                onChange={(e) =>
                                  setFilaEditando({
                                    ...filaEditando,
                                    [col]: e.target.value,
                                  })
                                }
                              />
                            ) : col === "stock_inicial" ? (
                              <input
                                type="text"
                                className="w-full"
                                value={filaEditando[col] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (/^\d*$/.test(val)) {
                                    setFilaEditando({
                                      ...filaEditando,
                                      [col]: val,
                                    });
                                  }
                                }}
                              />
                            ) : col === "precio_venta" ? (
                              <input
                                type="text"
                                className="w-full"
                                value={filaEditando[col] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (/^\d*\.?\d{0,2}$/.test(val)) {
                                    setFilaEditando({
                                      ...filaEditando,
                                      [col]: val,
                                    });
                                  }
                                }}
                              />
                            ) : (
                              <input
                                type="text"
                                className="w-full"
                                value={filaEditando[col] || ""}
                                onChange={(e) =>
                                  setFilaEditando({
                                    ...filaEditando,
                                    [col]: e.target.value,
                                  })
                                }
                              />
                            )
                          ) : (
                            row[col]
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
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading || previewData.length === 0}
          >
            {loading ? "Cargando..." : "Guardar Productos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
