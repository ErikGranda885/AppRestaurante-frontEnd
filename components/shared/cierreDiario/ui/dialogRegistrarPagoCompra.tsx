"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { GeneralDialog } from "../../varios/dialogGen";
import { SERVICIOS_COMPRAS } from "@/services/compras.service";
import Image from "next/image";
import { uploadImage } from "@/firebase/subirImage";

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

  const handleCancelar = () => {
    setNumeroComprobante("");
    setObservacion("");
    setImagen(null);
    setPreview(null);
    onOpenChange(false);
  };

  const subirComprobante = async (
    file: File,
    idCompra: number,
  ): Promise<string> => {
    const fecha = new Date().toISOString().split("T")[0];
    const nombreArchivo = `compra_${idCompra}_${fecha}`;
    const url = await uploadImage(file, "pagos-compras", nombreArchivo);
    return url;
  };

  const handleRegistrarPago = async () => {
    try {
      setLoading(true);

      let urlComprobante = null;
      if (formaPago === "transferencia" && imagen) {
        urlComprobante = await subirComprobante(imagen, idCompra);
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
              <Image
                src={preview}
                width={60}
                height={60}
                alt="Comprobante"
                className="mt-2 h-[200px] w-full rounded border-border object-contain"
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
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={handleCancelar}>
            Cancelar
          </Button>

          <Button
            type="button"
            className="text-sm"
            disabled={
              loading ||
              (formaPago === "transferencia" && (!numeroComprobante || !imagen))
            }
            onClick={handleRegistrarPago}
          >
            {loading ? "Guardando..." : "Confirmar Pago"}
          </Button>
        </div>
      </div>
    </GeneralDialog>
  );
};
