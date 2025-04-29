"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { DataTable } from "@/components/shared/varios/dataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ICierreDiario } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Search,
  Upload,
  CloudDownload,
  TrendingUpIcon,
  ReceiptText,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFechaLocal } from "@/hooks/cierresDiarios/useFechaLocal";
import { useFiltroCierres } from "@/hooks/cierresDiarios/useFiltroCierres";
import { useResumenPendiente } from "@/hooks/cierresDiarios/useResumenPendiente";
import { useRouter } from "next/navigation";

export default function Page() {
  useProtectedRoute();
  const router = useRouter();
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState<string>("pendientes");
  const [cierres, setCierres] = useState<ICierreDiario[]>([]);

  const fechaActual = useFechaLocal();
  const { resumenPendiente, isLoading, isError, refetchResumen } =
    useResumenPendiente(fechaActual, estadoSeleccionado);

  const lista: (ICierreDiario & { pendiente?: boolean })[] = useMemo(() => {
    const base = [...cierres];

    if (resumenPendiente !== null) {
      base.unshift({
        id_cier: 0,
        fech_cier: fechaActual,
        tot_vent_cier: resumenPendiente.totalVentas || 0,
        tot_gas_cier: resumenPendiente.totalGastos || 0,
        tot_compras_pag_cier: resumenPendiente.totalComprasPagadas || 0,
        tot_dep_cier: 0,
        dif_cier:
          (resumenPendiente.totalVentas || 0) -
          (resumenPendiente.totalGastos || 0) -
          (resumenPendiente.totalComprasPagadas || 0),
        comp_dep_cier: "",
        fech_reg_cier: fechaActual,
        usu_cier: {
          id_usu: "0",
          nom_usu: "",
          email_usu: "",
          img_usu: "",
          rol_usu: { id_rol: 0, nom_rol: "", desc_rol: "" },
        },
        esta_cier: "pendiente",
      });
    }

    return base;
  }, [cierres, resumenPendiente, fechaActual]);

  const cierresFiltrados = useFiltroCierres({
    cierres: lista,
    estadoSeleccionado,
  });

  const { totalDisponible, totalDepositado, diferenciaTotal, numeroCierres } =
    useMemo(() => {
      let disponible = 0;
      let depositado = 0;
      let diferencia = 0;
      let cantidad = 0;

      for (const cierre of cierresFiltrados) {
        disponible +=
          cierre.tot_vent_cier -
          cierre.tot_gas_cier -
          cierre.tot_compras_pag_cier;
        depositado += cierre.tot_dep_cier;
        diferencia += cierre.dif_cier;
        cantidad += 1;
      }

      return {
        totalDisponible: disponible,
        totalDepositado: depositado,
        diferenciaTotal: diferencia,
        numeroCierres: cantidad,
      };
    }, [cierresFiltrados]);

  const cierresColumnas: ColumnDef<ICierreDiario>[] = [
    {
      accessorKey: "fech_cier",
      header: "Fecha de Cierre",
      cell: ({ getValue }) => {
        const fechaCierre = (getValue() as string).split("T")[0];
        const esHoy = fechaCierre === fechaActual;
        return esHoy
          ? "Hoy"
          : new Date(getValue() as string).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
      },
    },
    {
      accessorKey: "tot_vent_cier",
      header: "Total Ventas",
      cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
    },
    {
      accessorKey: "tot_gas_cier",
      header: "Total Gastos",
      cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
    },
    {
      accessorKey: "tot_compras_pag_cier",
      header: "Compras Pagadas",
      cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
    },
    {
      accessorKey: "tot_dep_cier",
      header: "Depositado",
      cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
    },
    {
      accessorKey: "dif_cier",
      header: "Diferencia",
      cell: ({ getValue }) => {
        const value = Number(getValue());
        return (
          <span className={value === 0 ? "" : "error-text"}>
            ${value.toFixed(2)}
          </span>
        );
      },
    },
    {
      id: "estado_cierre",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.esta_cier?.toLowerCase();
        return (
          <div className="flex items-center">
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                estado === "pendiente"
                  ? "bg-yellow-200 text-yellow-700"
                  : "bg-green-200 text-green-700"
              }`}
            >
              {estado === "pendiente" ? "Pendiente" : "Cerrado"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Cierre Diario"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false}
    >
      <div className="px-6 pt-2">
        <h1 className="text-xl font-bold">Cierres Diarios</h1>
        <p className="text-sm text-muted-foreground">
          Aquí puedes gestionar los cierres diarios de tu negocio.
        </p>

        <div className="pt-4" />
        <div className="mb-5 flex items-center justify-between">
          <GeneralDialog
            open={abrirCrear}
            onOpenChange={setAbrirCrear}
            triggerText={
              <>
                <Plus className="h-4 w-4 font-light" /> Registrar nuevo cierre
              </>
            }
            title="Registrar Nuevo Cierre Diario"
            description="Completa la información para registrar el cierre diario."
            submitText="Guardar"
          >
            {/* Aquí irá tu formulario de registrar cierre */}
          </GeneralDialog>

          <div className="flex items-center gap-3">
            {/* Buscar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Buscar cierre diario"
                className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
              />
            </div>

            {/* Botones Importar y Exportar */}
            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <Upload className="h-4 w-4" /> Importar
            </Button>
            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <CloudDownload className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjetas métricas */}
      <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
        <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
          {/* NUEVA TARJETA: Resumen Pendiente */}
          <Card
            className={`bg-blanco relative flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
              ["pendientes", "cerrados"].includes(estadoSeleccionado)
                ? "ring-2 ring-secondary"
                : ""
            } group`}
          >
            {/* Botón Dropdown arriba derecha */}
            <div className="absolute right-4 top-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border">
                  <DropdownMenuItem
                    onClick={() => {
                      setEstadoSeleccionado("pendientes");
                    }}
                  >
                    Pendientes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setEstadoSeleccionado("cerrados");
                    }}
                  >
                    Cerrados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Resumen Pendiente
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  {resumenPendiente ? (
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      ${resumenPendiente.totalVentas?.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      No cargado
                    </span>
                  )}
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  {estadoSeleccionado === "pendientes"
                    ? "Pendiente de cierre"
                    : estadoSeleccionado === "cerrados"
                      ? "Cierres completados"
                      : "Estado no seleccionado"}
                </CardDescription>
              </div>
              <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
                <AlertTriangle className="h-7 w-7 text-yellow-500 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </CardHeader>
          </Card>

          {/* TARJETAS ANTERIORES */}
          <MetricCard
            label="Total Depositado"
            value={totalDepositado}
            selected={estadoSeleccionado === "depositado"}
            onClick={() => setEstadoSeleccionado("depositado")}
            icon={<Upload />}
            clickable={false}
          />
          <MetricCard
            label="Diferencia Total"
            value={diferenciaTotal}
            selected={estadoSeleccionado === "diferencia"}
            onClick={() => setEstadoSeleccionado("diferencia")}
            icon={<TrendingUpIcon />}
            difference
          />
          <MetricCard
            label="Número de Cierres"
            value={numeroCierres}
            selected={estadoSeleccionado === "cierres"}
            onClick={() => setEstadoSeleccionado("cierres")}
            icon={<ReceiptText />}
            isNumber
          />
        </div>

        {/* Tabla de cierres */}
        <div className="px-6 pb-4">
          <DataTable<ICierreDiario>
            data={cierresFiltrados}
            columns={cierresColumnas}
            onRowClick={(row) => {
              localStorage.setItem("cierreSeleccionado", JSON.stringify(row));
              router.push(`/cierre-diario/${row.id_cier}`);
            }}
          />
        </div>
      </div>
    </ModulePageLayout>
  );
}

// COMPONENTE DE MÉTRICAS
function MetricCard({
  label,
  value,
  selected,
  onClick,
  icon,
  difference = false,
  isNumber = false,
  clickable = true,
}: {
  label: string;
  value: number;
  selected: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  difference?: boolean;
  isNumber?: boolean;
  clickable?: boolean;
}) {
  return (
    <Card
      onClick={clickable && onClick ? onClick : undefined}
      className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
        selected ? "ring-2 ring-secondary" : ""
      } group`}
    >
      <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CardTitle className="text-sm font-light text-secondary-foreground">
            {label}
          </CardTitle>
          <div className="mt-2 flex items-center gap-5">
            <span
              className={`text-3xl font-extrabold ${
                difference
                  ? value >= 0
                    ? ""
                    : "text-red-600"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              {isNumber ? value : `$${value.toFixed(2)}`}
            </span>
          </div>
          <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Según cierres
          </CardDescription>
        </div>
        <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
          {icon}
        </div>
      </CardHeader>
    </Card>
  );
}
