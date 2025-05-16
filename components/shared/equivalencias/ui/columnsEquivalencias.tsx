import { ColumnDef } from "@tanstack/react-table";
import { IEquivalencia } from "@/lib/types";
import Image from "next/image";

export const columnsEquivalencias: ColumnDef<IEquivalencia>[] = [
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
          colorTexto = "";
          break;
        case "inactivo":
          colorCirculo = "bg-[#f31260]";
          colorTexto = "";
          break;
        default:
          colorCirculo = "bg-gray-500";
          colorTexto = "text-gray-600";
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
];
