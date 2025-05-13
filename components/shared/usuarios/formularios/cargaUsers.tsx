"use client";
import React, { useState, useCallback } from "react";
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
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";
import { IRol } from "@/lib/types";
import { DropzoneFile } from "../../varios/dropzoneFile";

interface BulkUploadUsersDialogProps {
  roleOptions: IRol[];
  onSuccess: (newUsers: any[]) => void;
  onClose: () => void;
}

const requiredColumns = ["nom_usu", "email_usu", "clave_usu", "rol_usu"];

export function BulkUploadUsersDialog({
  roleOptions,
  onSuccess,
  onClose,
}: BulkUploadUsersDialogProps) {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});

  const mappedRoleOptionsMemo = useCallback(() => {
    return roleOptions.map((role: IRol) => ({
      value: role.id_rol.toString(),
      label: role.nom_rol,
    }));
  }, [roleOptions]);

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
    for (const key in newRow) {
      if (
        newRow[key] &&
        typeof newRow[key] === "object" &&
        "text" in newRow[key]
      )
        newRow[key] = newRow[key].text;
    }
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
          if (!validateHeaders(headers)) {
            setPreviewData([]);
            return ToastError({
              message: "El CSV tiene encabezados incorrectos.",
            });
          }
          if (!validateRows(results.data)) {
            setPreviewData([]);
            return ToastError({ message: "Hay celdas vacías en los datos." });
          }
          setPreviewData(results.data.map(sanitizeRow));
        },
        error: () => ToastError({ message: "Error al leer el archivo CSV." }),
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
        if (!worksheet)
          return ToastError({ message: "El XLSX no tiene hojas." });

        let headers = worksheet.getRow(1).values as any[];
        if (headers[0] === undefined) headers = headers.slice(1);
        headers = headers.map((h: any) => String(h).toLowerCase().trim());

        if (!validateHeaders(headers)) {
          setPreviewData([]);
          return ToastError({
            message: "El XLSX tiene encabezados incorrectos.",
          });
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
            rowData.nom_usu?.toLowerCase().startsWith("ej") ||
            rowData.nom_usu?.toLowerCase().includes("ejemplo")
          )
            return;
          data.push(rowData);
        });

        if (!validateRows(data)) {
          setPreviewData([]);
          return ToastError({ message: "Hay celdas vacías en los datos." });
        }

        setPreviewData(data.map(sanitizeRow));
      } catch {
        ToastError({ message: "Error al procesar el XLSX." });
      }
    } else {
      ToastError({ message: "Formato no soportado. Usa CSV o XLSX." });
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

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch("http://localhost:5000/usuarios/plantilla");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-usuarios.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      ToastError({ message: "No se pudo descargar la plantilla." });
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0)
      return ToastError({ message: "No hay datos para enviar." });

    setLoading(true);
    try {
      const defaultImageUrl =
        "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/usuarios%2Fuser-default.webp?alt=media&token=14f267c3-c208-4f2a-88cd-e828147b5f94";
      const roles = mappedRoleOptionsMemo();
      const processed = previewData.map((row) => {
        let rol = row["rol_usu"];
        const byValue = roles.find(
          (r) => r.value.toLowerCase() === String(rol).toLowerCase(),
        );
        if (byValue) rol = byValue.value;
        else {
          const byLabel = roles.find(
            (r) => r.label.toLowerCase() === String(rol).toLowerCase(),
          );
          if (byLabel) rol = byLabel.value;
          else throw new Error(`Rol ${rol} no encontrado`);
        }
        return { ...row, rol_usu: rol, img_usu: defaultImageUrl };
      });

      const res = await fetch("http://localhost:5000/usuarios/masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error de carga.");

      onSuccess(data.usuarios);
      ToastSuccess({
        message: `Se cargaron ${data.usuarios.length} usuarios.`,
      });
      onClose();
    } catch (err: any) {
      ToastError({ message: err.message || "Error al cargar usuarios." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="border-border sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Usuarios</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4 dark:bg-[#1E1E1E]">
            <h2 className="mb-2">Pasos:</h2>
            <ol className="list-inside list-decimal text-sm">
              <li>Descargar plantilla (Excel).</li>
              <li>Completar: nom_usu, email_usu, clave_usu, rol_usu.</li>
              <li>Seleccionar archivo o arrastrarlo.</li>
              <li>Verificar datos.</li>
              <li>Guardar Usuarios.</li>
            </ol>
            <Button
              className="mt-3 flex items-center gap-2"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4" /> Descargar plantilla
            </Button>
          </div>

          {/* ✅ Reemplazamos drag/drop antiguo */}
          <DropzoneFile
            onFileSelect={handleFileSelect}
            accept=".csv,.xlsx"
            text="Arrastra o haz clic para cargar CSV/XLSX"
          />

          {previewData.length > 0 && (
            <div className="mt-4 max-h-[40vh] overflow-y-auto border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="border px-2 py-1">
                        {header}
                      </th>
                    ))}
                    <th className="border px-2 py-1">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row).map((header) => (
                        <td key={header} className="border px-2 py-1">
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
                          ) : header === "rol_usu" ? (
                            (mappedRoleOptionsMemo().find(
                              (opt) =>
                                opt.value.toLowerCase() ===
                                String(row[header]).toLowerCase(),
                            )?.label ?? row[header])
                          ) : (
                            row[header]
                          )}
                        </td>
                      ))}
                      <td className="border px-2 py-1">
                        {editingRowIndex === idx ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveRow(idx)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingRowIndex(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRow(idx)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveRow(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
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
            {loading ? "Cargando..." : "Guardar Usuarios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
