"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { GeneralDialog } from "../../varios/dialogGen";
import { SERVICIOS_COMPRAS } from "@/services/compras.service";

interface DialogRegistrarPagoProps {
  idCompra: number;
  formaPago: "efectivo" | "transferencia";
  triggerText?: string;
  onPagoExitoso?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DialogRegistrarPagoCompra: React.FC<DialogRegistrarPagoProps> = ({
  idCompra,
  formaPago,
  triggerText = "Registrar pago",
  onPagoExitoso,
  open,
  onOpenChange,
}) => {
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [observacion, setObservacion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegistrarPago = async () => {
    try {
      setLoading(true);

      let urlComprobante = null;
      if (formaPago === "transferencia" && imagen) {
        const fecha = new Date().toISOString().split("T")[0];
        const nombre = `${fecha}-${idCompra}`;
        urlComprobante = await subirComprobante(
          imagen,
          "pagos-compras",
          nombre,
        );
      }

      const response = await fetch(SERVICIOS_COMPRAS.registrarPago(idCompra), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numeroComprobante,
          observacion,
          urlComprobante,
        }),
      });

      if (!response.ok) throw new Error("Fallo al registrar el pago");

      ToastSuccess({ message: "Pago registrado correctamente" });
      if (onPagoExitoso) onPagoExitoso();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      ToastError({ message: "❌ No se pudo registrar el pago" });
    } finally {
      setLoading(false);
    }
  };

  const subirComprobante = async (
    file: File,
    carpeta: string,
    nombre: string,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("carpeta", carpeta);
    formData.append("nombre", nombre);

    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.url;
  };

  return (
    <GeneralDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar Pago de Compra"
      description="Confirma los datos del pago realizado."
      triggerText={triggerText}
      onSubmit={handleRegistrarPago}
    >
      <div className="space-y-3">
        {formaPago === "transferencia" && (
          <>
            <label className="text-xs font-semibold">
              Número de Comprobante
            </label>
            <Input
              type="text"
              placeholder="Ej: 1234567890"
              value={numeroComprobante}
              onChange={(e) => setNumeroComprobante(e.target.value)}
            />

            <label className="text-xs font-semibold">
              Imagen del Comprobante
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImagen(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
            {preview && (
              <img
                src={preview}
                alt="Comprobante"
                className="mt-2 h-[200px] w-full rounded border object-contain"
              />
            )}
          </>
        )}

        {formaPago === "efectivo" && (
          <>
            <label className="text-xs font-semibold">Observación</label>
            <Textarea
              rows={3}
              placeholder="Ej: Pago autorizado por el administrador"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </>
        )}

        <Button
          type="button"
          className="w-full text-sm"
          disabled={
            loading ||
            (formaPago === "transferencia" && (!numeroComprobante || !imagen))
          }
          onClick={handleRegistrarPago}
        >
          {loading ? "Guardando..." : "Confirmar Pago"}
        </Button>
      </div>
    </GeneralDialog>
  );
};
