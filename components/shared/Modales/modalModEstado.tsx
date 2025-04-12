"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type TipoAccion = "activar" | "inactivar";

interface ModalModEstadoProps {
  /** Indica si el diálogo se muestra */
  abierto: boolean;
  /** Función para cambiar el estado del diálogo */
  onCambioAbierto: (estado: boolean) => void;
  /** Tipo de acción: activar o inactivar */
  tipoAccion: TipoAccion;
  /** Nombre del producto a mostrar (opcional) */
  nombreElemento?: string;
  /** Función a ejecutar al confirmar la acción */
  onConfirmar: () => void;
  /** Título opcional para sobrescribir el predeterminado */
  tituloPersonalizado?: string;
  /** Descripción opcional para sobrescribir la predeterminada */
  descripcionPersonalizada?: string;
  /** Texto del botón de confirmar (opcional) */
  textoConfirmar?: string;
  /** Texto del botón de cancelar (opcional) */
  textoCancelar?: string;
}

export const ModalModEstado: React.FC<ModalModEstadoProps> = ({
  abierto,
  onCambioAbierto,
  tipoAccion,
  nombreElemento,
  onConfirmar,
  tituloPersonalizado,
  descripcionPersonalizada,
  textoConfirmar,
  textoCancelar,
}) => {
  // Títulos y descripciones por defecto dependiendo de la acción
  const titulos = {
    activar: "Confirmar Activación",
    inactivar: "Confirmar Inactivación",
  };

  const descripciones = {
    activar: "¿Está seguro de activar el producto",
    inactivar: "¿Está seguro de inactivar el producto",
  };

  return (
    <Dialog
      open={abierto}
      onOpenChange={(estado) => {
        if (!estado) {
          onCambioAbierto(false);
        }
      }}
    >
      <DialogContent className="border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {tituloPersonalizado || titulos[tipoAccion]}
          </DialogTitle>
          <DialogDescription>
            {descripcionPersonalizada ||
              `${descripciones[tipoAccion]} ${
                nombreElemento ? `"${nombreElemento}"` : ""
              }?`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onCambioAbierto(false)}>
            {textoCancelar || "No"}
          </Button>
          <Button onClick={onConfirmar}>{textoConfirmar || "Sí"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
