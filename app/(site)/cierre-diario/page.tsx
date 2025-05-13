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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Upload,
  CloudDownload,
  TrendingUpIcon,
  ReceiptText,
  AlertTriangle,
  MoreHorizontal,
  CheckCircle,
  Clock,
} from "lucide-react";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useFechaLocal } from "@/hooks/cierresDiarios/useFechaLocal";
import { useResumenPendiente } from "@/hooks/cierresDiarios/useResumenPendiente";
import { ICierreDiario } from "@/lib/types";
import { useCargarCierres } from "@/hooks/cierresDiarios/useCargarCierres";
import { useListaCierres } from "@/hooks/cierresDiarios/useListaCierres";
import { useResumenCierres } from "@/hooks/cierresDiarios/useResumenCierres";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ToastError } from "@/components/shared/toast/toastError";
import { DateRangeFilter } from "@/components/shared/ventas/ui/dateRangeFilter";
import { DateRange } from "react-day-picker";
import {
  endOfDay,
  endOfMonth,
  endOfToday,
  endOfYear,
  endOfYesterday,
  startOfDay,
  startOfMonth,
  startOfToday,
  startOfYear,
  startOfYesterday,
  subDays,
} from "date-fns";
import { safePrice } from "@/utils/format";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";

function hayCierresAnterioresPendientes(
  lista: ICierreDiario[],
  seleccionado: ICierreDiario,
): boolean {
  return lista.some(
    (cierre) =>
      cierre.esta_cier?.toLowerCase() === "pendiente" &&
      new Date(cierre.fech_cier) < new Date(seleccionado.fech_cier),
  );
}

export default function Page() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfToday(),
    to: endOfToday(),
  });
  const [labelQuickRange, setLabelQuickRange] = useState("Hoy");

  const handleQuickRange = (option: "hoy" | "ayer" | "mes" | "año") => {
    let newRange: DateRange | null = null;

    if (option === "hoy") {
      newRange = {
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      };
      setLabelQuickRange("Hoy");
    } else if (option === "ayer") {
      const ayer = subDays(new Date(), 1);
      newRange = {
        from: startOfDay(ayer),
        to: endOfDay(ayer),
      };
      setLabelQuickRange("Ayer");
    } else if (option === "mes") {
      newRange = {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      };
      setLabelQuickRange("Este mes");
    } else if (option === "año") {
      newRange = {
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      };
      setLabelQuickRange("Este año");
    } else {
      // Si la opción no es válida, no hace nada
      return;
    }

    setDateRange(newRange);
  };
  useProtectedRoute();
  const { ventasConfig } = useConfiguracionesVentas();
  const router = useRouter();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("");
  const [cierres, setCierres] = React.useState<ICierreDiario[]>([]);
  const fechaActual = new Date();
  fechaActual.setMinutes(
    fechaActual.getMinutes() - fechaActual.getTimezoneOffset(),
  );
  const fechaActualStr = fechaActual.toISOString().split("T")[0]; // YYYY-MM-DD real

  const cierreActual = cierres.find((c) => c.fech_cier === fechaActualStr);
  const hayPendientesAnteriores = cierres.some(
    (c) =>
      c.esta_cier.toLowerCase() === "pendiente" &&
      new Date(c.fech_cier) < new Date(fechaActual),
  );
  const estadoActual = hayPendientesAnteriores
    ? "pendiente"
    : (cierreActual?.esta_cier?.toLowerCase() ?? "sin datos");

  const primerCierrePendiente = cierres
    .filter((c) => c.esta_cier.toLowerCase() === "pendiente")
    .sort(
      (a, b) =>
        new Date(a.fech_cier).getTime() - new Date(b.fech_cier).getTime(),
    )[0];

  const { resumenPendiente } = useResumenPendiente(
    fechaActualStr,
    estadoSeleccionado,
    cierres,
  );

  const lista = useListaCierres(
    cierres,
    resumenPendiente,
    fechaActualStr,
    estadoSeleccionado,
  );
  const { totalDisponible, totalDepositado, diferenciaTotal, numeroCierres } =
    useResumenCierres(lista);
  const cierresColumnas: ColumnDef<ICierreDiario>[] = [
    {
      accessorKey: "fech_cier",
      header: "Fecha de Cierre",
      cell: ({ getValue }) => {
        const fechaCierre = new Date(getValue() as string)
          .toISOString()
          .split("T")[0];
        const esHoy = fechaCierre === fechaActualStr;
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
      cell: ({ getValue }) =>
        safePrice(Number(getValue()), ventasConfig.moneda),
    },
    {
      accessorKey: "tot_gas_cier",
      header: "Total Gastos",
      cell: ({ getValue }) =>
        safePrice(Number(getValue()), ventasConfig.moneda),
    },
    {
      accessorKey: "tot_compras_pag_cier",
      header: "Compras Pagadas",
      cell: ({ getValue }) =>
        safePrice(Number(getValue()), ventasConfig.moneda),
    },
    {
      accessorKey: "tot_dep_cier",
      header: "Depositado",
      cell: ({ getValue }) =>
        safePrice(Number(getValue()), ventasConfig.moneda),
    },
    {
      accessorKey: "dif_cier",
      header: "Diferencia",
      cell: ({ getValue }) => {
        const value = Number(getValue());
        return (
          <span className={value === 0 ? "" : "error-text"}>
            {safePrice(value, ventasConfig.moneda)}
          </span>
        );
      },
    },
    {
      id: "esta_cier",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.esta_cier?.toLowerCase();
        return (
          <div className="flex items-center">
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                estado === "pendiente"
                  ? "bg-yellow-200 text-yellow-700"
                  : estado === "por cerrar"
                    ? "bg-blue-200 text-blue-700"
                    : "bg-green-200 text-green-700"
              }`}
            >
              {estado === "pendiente"
                ? "Pendiente"
                : estado === "por cerrar"
                  ? "Por cerrar"
                  : "Cerrado"}
            </span>
          </div>
        );
      },
    },
  ];

  useCargarCierres({
    estadoSeleccionado,
    setCierres,
    dateRange: estadoSeleccionado === "Cerrado" ? dateRange : undefined,
  });

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
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Filtros de fechas y rangos rápidos */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por rango de fechas */}
            {estadoSeleccionado === "cerrado" && (
              <>
                {/* Filtro por rango de fechas */}
                <DateRangeFilter value={dateRange} onChange={setDateRange} />

                {/* Dropdown de fechas rápidas */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-[12px] dark:bg-[#222224]"
                    >
                      {labelQuickRange}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-border">
                    <DropdownMenuItem onClick={() => handleQuickRange("hoy")}>
                      Hoy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickRange("ayer")}>
                      Ayer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickRange("mes")}>
                      Este mes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickRange("año")}>
                      Este año
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Separador visual */}
                <div className="hidden h-6 w-px bg-border md:block" />
              </>
            )}
          </div>

          {/* Barra de búsqueda y botones */}
          <div className="flex flex-wrap items-center gap-3">
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
            {/* <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <Upload className="h-4 w-4" /> Importar
            </Button> */}
            <Button
              className="border-border text-[12px] font-semibold"
              variant="secondary"
            >
              <CloudDownload className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
        <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
          <Card
            className={`bg-blanco relative flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${["pendientes", "cerrado"].includes(estadoSeleccionado) ? "ring-2 ring-secondary" : ""} group`}
          >
            <div className="absolute right-4 top-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-border">
                  <DropdownMenuItem
                    onClick={() => setEstadoSeleccionado("por cerrar")}
                  >
                    Por cerrar
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setEstadoSeleccionado("pendientes")}
                  >
                    Pendientes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setEstadoSeleccionado("cerrado")}
                  >
                    Cerrado
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Total Registrado
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  {resumenPendiente ? (
                    <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                      ${Number(cierreActual?.tot_vent_cier ?? 0).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      No cargado
                    </span>
                  )}
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  {estadoActual === "cerrado" && "Cierre completado"}
                  {estadoActual === "pendiente" && "Pendiente de validación"}
                  {estadoActual === "por cerrar" &&
                    (hayPendientesAnteriores
                      ? "No se puede cerrar hasta validar pendientes anteriores"
                      : "Día listo para cerrar")}
                  {estadoActual === "sin datos" &&
                    "No hay cierre registrado para hoy"}
                </CardDescription>
              </div>
              <div
                className="mt-4 flex flex-shrink-0 items-center justify-center transition-all duration-300 sm:mt-0"
                onClick={() => {
                  if (primerCierrePendiente) {
                    localStorage.setItem(
                      "cierreSeleccionado",
                      JSON.stringify(primerCierrePendiente),
                    );
                    setEstadoSeleccionado("pendientes");
                  }
                }}
              >
                {hayPendientesAnteriores ? (
                  <div
                    className="group relative cursor-pointer transition-transform duration-300 hover:scale-105"
                    title={`Tienes cierres pendientes desde el ${new Date(
                      primerCierrePendiente?.fech_cier || "",
                    ).toLocaleDateString("es-EC")}`}
                  >
                    <AlertTriangle className="h-7 w-7 animate-pulse text-yellow-500" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      !
                    </span>
                  </div>
                ) : (
                  <CheckCircle className="h-7 w-7 text-green-500 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                )}
              </div>
            </CardHeader>
          </Card>

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

        <div className="px-6 pb-4">
          {lista.length > 0 ? (
            <DataTable<ICierreDiario>
              data={lista}
              columns={cierresColumnas}
              onRowClick={(row) => {
                if (hayCierresAnterioresPendientes(cierres, row)) {
                  ToastError({
                    message:
                      "No puedes cerrar este día porque existen cierres anteriores pendientes.",
                  });
                  return;
                }

                localStorage.setItem("cierreSeleccionado", JSON.stringify(row));
                router.push(`/cierre-diario/${row.id_cier}`);
              }}
              enableRowPointer={true}
            />
          ) : (
            <div className="mt-10 flex h-10 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
              No existen registros{" "}
              <span className="mx-1 font-semibold">{estadoSeleccionado}</span> .
            </div>
          )}
        </div>
      </div>
    </ModulePageLayout>
  );
}

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
  const { ventasConfig } = useConfiguracionesVentas();

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
                  ? Number(value) >= 0
                    ? ""
                    : "error-text"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              {isNumber
                ? Number(value ?? 0)
                : safePrice(Number(value ?? 0), ventasConfig.moneda)}
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
