"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IEquivalencia } from "@/lib/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ModalModEstado } from "../../Modales/modalModEstado";
import { useState } from "react";

export const columnsEquivalencias = ({
  onEdit,
  onDelete,
}: {
  onEdit: (equivalencia: IEquivalencia) => void;
  onDelete: (equivalencia: IEquivalencia) => Promise<void>;
}): ColumnDef<IEquivalencia>[] => {
  return [
    {
      accessorKey: "prod_equiv.nom_prod",
      header: "Producto",
      cell: ({ row }) => {
        const { img_prod, nom_prod } = row.original.prod_equiv;
        return (
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src={img_prod}
                alt={nom_prod}
                fill
                className="rounded object-cover"
              />
            </div>
            <span>{nom_prod}</span>
          </div>
        );
      },
    },
    {
      header: "Unidad base",
      accessorKey: "prod_equiv.und_prod",
      cell: ({ row }) => row.original.prod_equiv.und_prod,
    },
    {
      header: "Equivalencia",
      cell: ({ row }) =>
        `${row.original.cant_equiv} ${row.original.und_prod_equiv}`,
    },
    {
      accessorKey: "est_equiv",
      header: () => <div className="text-center">Estado</div>,
      cell: ({ row }) => {
        const estadoOriginal = row.original.est_equiv || "";
        const estado = estadoOriginal.toLowerCase();

        let colorCirculo = "bg-gray-500";
        let colorTexto = "text-gray-600";

        switch (estado) {
          case "activo":
            colorCirculo = "bg-[#17c964]";
            break;
          case "inactivo":
            colorCirculo = "bg-[#f31260]";
            break;
        }

        return (
          <div className="text-center">
            <div className="inline-flex items-center gap-1 p-1">
              <span className={`h-1 w-1 rounded-full ${colorCirculo}`} />
              <span className={`text-xs font-medium capitalize ${colorTexto}`}>
                {estadoOriginal}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableHiding: false,
      cell: ({ row }) => {
        const equivalencia = row.original;
        const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                <DropdownMenuItem onClick={() => onEdit(equivalencia)}>
                  Editar
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setMostrarConfirmacion(true)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {mostrarConfirmacion && (
              <ModalModEstado
                abierto={true}
                tipoAccion="inactivar"
                nombreElemento={equivalencia.prod_equiv.nom_prod}
                onCambioAbierto={(estado) => {
                  if (!estado) setMostrarConfirmacion(false);
                }}
                onConfirmar={async () => {
                  await onDelete(equivalencia);
                  setMostrarConfirmacion(false);
                }}
                tituloPersonalizado="Eliminar Equivalencia"
                descripcionPersonalizada={`¿Estás seguro de eliminar la equivalencia para el producto "${equivalencia.prod_equiv.nom_prod}"?`}
                textoConfirmar="Eliminar"
                textoCancelar="Cancelar"
              />
            )}
          </>
        );
      },
    },
  ];
};
