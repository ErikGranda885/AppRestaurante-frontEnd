import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columnsTransformaciones: ColumnDef<any>[] = [
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },

  {
    accessorKey: "rece_trans.prod_rec.nom_prod",
    header: "Producto Final",
    cell: ({ row }) => row.original.rece_trans.prod_rec.nom_prod,
  },
  {
    accessorKey: "cant_prod_trans",
    header: "Cantidad Producida",
  },
  {
    accessorKey: "fecha_trans",
    header: "Fecha",
    cell: ({ row }) => format(new Date(row.original.fecha_trans), "dd/MM/yyyy"),
  },
  {
    accessorKey: "usu_trans.nom_usu",
    header: "Usuario",
    cell: ({ row }) => row.original.usu_trans?.nom_usu || "-",
  },

  {
    accessorKey: "obse_trans",
    header: "Observaciones",
    cell: ({ row }) => row.original.rece_trans.obse_trans,
  },
];
