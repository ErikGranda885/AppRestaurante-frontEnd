"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/shared/varios/dataTable";
import { SERVICIOS_GASTOS } from "@/services/gastos.service";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  CalendarDays,
  CloudDownload,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  TrendingUpIcon,
  Upload,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IGasto } from "@/lib/types";
import { CreateGastoForm } from "@/components/shared/gastos/formularios/createGastoForm";
import { EditGastoForm } from "@/components/shared/gastos/formularios/editGastoForm";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  parse,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import { ModalModEstado } from "@/components/shared/Modales/modalModEstado";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { Separator } from "@/components/ui/separator";
import { DateRangeFilter } from "@/components/shared/ventas/ui/dateRangeFilter";
import { DateRange } from "react-day-picker";
export type TipoAccion = "activar" | "inactivar" | "eliminar";

type AccionGasto = {
  id: number;
  descripcion: string;
  tipo: TipoAccion;
};

export default function Page() {
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [gastoEditar, setGastoEditar] = useState<IGasto | null>(null);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [accionGasto, setAccionGasto] = useState<AccionGasto | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("");
  const [gastos, setGastos] = useState<IGasto[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [labelQuickRange, setLabelQuickRange] = useState("Hoy");

  useProtectedRoute();

  // Cargar gastos
  useEffect(() => {
    listarGastos();
  }, []);

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

  async function listarGastos() {
    try {
      const res = await fetch(SERVICIOS_GASTOS.listar);
      const data = await res.json();

      const gastosArray = Array.isArray(data) ? data : data.gastos || [];

      setGastos(gastosArray);
    } catch (error) {
      console.error("Error al listar gastos", error);
    }
  }

  async function eliminarGasto(id: number) {
    try {
      const res = await fetch(SERVICIOS_GASTOS.eliminar(id), {
        method: "DELETE",
      });
      ToastSuccess({
        message: "Registro eliminado exitosamente",
      });
      if (res.ok) {
        setGastos((prev) => prev.filter((gasto) => gasto.id_gas !== id));
      } else {
        ToastError({
          message: "Error al eliminar gasto",
        });
      }
    } catch (error) {
      ToastError({
        message: "Error al eliminar gasto",
      });
    }
  }

  function manejarClickTarjeta(estado: string) {
    setEstadoSeleccionado(estado);
  }

  const gastosFiltrados = useMemo(() => {
    return gastos
      .filter((gasto) => {
        if (!gasto.fech_gas || !dateRange?.from || !dateRange?.to) return false;

        const fechaParseada = parse(
          gasto.fech_gas,
          "dd/MM/yyyy HH:mm:ss",
          new Date(),
        );

        return (
          fechaParseada >= startOfDay(dateRange.from) &&
          fechaParseada <= endOfDay(dateRange.to)
        );
      })
      .filter((gasto) =>
        gasto.desc_gas.toLowerCase().includes(busqueda.toLowerCase()),
      );
  }, [gastos, dateRange, busqueda]);

  const totalGastado = useMemo(() => {
    return gastosFiltrados
      .reduce((acc, gasto) => acc + Number(gasto.mont_gas || 0), 0)
      .toFixed(2);
  }, [gastosFiltrados]);

  const cantidadGastos = useMemo(() => {
    return gastosFiltrados.length;
  }, [gastosFiltrados]);
  const hoy = new Date();
  const fechaHoy = format(hoy, "dd/MM/yyyy");

  const gastosHoy = gastos
    .filter((gasto) => {
      if (!gasto.fech_gas) return false;
      const fechaGasto = gasto.fech_gas.split(" ")[0];
      return fechaGasto === fechaHoy;
    })
    .reduce((acc, gasto) => acc + gasto.mont_gas, 0);

  // Definimos las columnas
  const columnas: ColumnDef<IGasto>[] = [
    {
      accessorKey: "desc_gas",
      header: "Descripción",
    },
    {
      accessorKey: "mont_gas",
      header: "Monto",
      cell: (info) => (
        <span className="font-semibold">
          ${Number(info.getValue()).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "fech_gas",
      header: "Fecha",
    },
    {
      accessorKey: "obs_gas",
      header: "Observaciones",
      cell: (info) => info.getValue() || "-",
    },
    {
      id: "acciones",
      header: "Acciones",
      enableHiding: false,
      cell: ({ row }) => {
        const gasto = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>

              {/* Editar */}
              <DropdownMenuItem
                onClick={() => {
                  setGastoEditar(gasto);
                  setAbrirEditar(true);
                }}
                className="cursor-pointer"
              >
                Editar
              </DropdownMenuItem>

              {/* Eliminar */}
              <DropdownMenuItem
                onClick={() => {
                  setAccionGasto({
                    id: gasto.id_gas,
                    descripcion: gasto.desc_gas,
                    tipo: "eliminar",
                  });
                }}
                className="cursor-pointer text-red-500"
              >
                Eliminar
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Gastos"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false}
    >
      <div className="px-6 pt-2">
        <h1 className="text-xl font-bold">Gastos</h1>
        <p className="text-sm text-muted-foreground">
          Aquí puedes gestionar los gastos de tu negocio.
        </p>

        <div className="pt-4" />
        <div className="mb-5 flex items-center justify-between">
          <GeneralDialog
            open={abrirCrear}
            onOpenChange={setAbrirCrear}
            triggerText={
              <>
                <Plus className="h-4 w-4 font-light" /> Añadir nuevo gasto
              </>
            }
            title="Crear Nuevo Gasto"
            description="Ingresa la información para registrar un nuevo gasto."
            submitText="Registrar Gasto"
          >
            <CreateGastoForm
              onSuccess={() => {
                setAbrirCrear(false);
                listarGastos();
              }}
            />
          </GeneralDialog>

          <div className="flex items-center gap-3">
            {/* Filtro de fechas */}
            <DateRangeFilter value={dateRange} onChange={setDateRange} />

            {/* dropdown de fechas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-[12px] dark:bg-[#222224]">
                  {labelQuickRange}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border ">
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
                  Este Año
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Separador visual entre filtros y buscador */}
            <Separator orientation="vertical" className="h-6" />
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Buscar gastos"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
              />
            </div>

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
      <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
        {/* Tarjetas estadísticas */}
        <div className="flex flex-col gap-4 px-6 pt-6 md:flex-row md:justify-between">
          {/* Total Gastado */}
          <Card
            onClick={() => manejarClickTarjeta("")}
            className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
              estadoSeleccionado === "" ? "ring-2 ring-secondary" : ""
            } group`}
          >
            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Total Gastado
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                    $
                    {gastosFiltrados
                      .reduce(
                        (acc, gasto) => acc + Number(gasto.mont_gas || 0),
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  {estadoSeleccionado === "hoy"
                    ? "Gastos de Hoy"
                    : estadoSeleccionado === "ayer"
                      ? "Gastos de Ayer"
                      : estadoSeleccionado === "esteMes"
                        ? "Gastos de Este Mes"
                        : estadoSeleccionado === "mesAnterior"
                          ? "Gastos de Mes Anterior"
                          : "Total General"}
                </CardDescription>
              </div>
              <TrendingUpIcon className="h-7 w-7" />
            </CardHeader>
          </Card>

          {/* Gastos de Hoy */}
          <Card
            className={`bg-blanco relative flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
              ["hoy", "ayer", "esteMes", "mesAnterior"].includes(
                estadoSeleccionado,
              )
                ? "ring-2 ring-secondary"
                : ""
            } group`}
          >
            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Total Filtrado
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                    $
                    {gastosFiltrados
                      .reduce(
                        (acc, gasto) => acc + Number(gasto.mont_gas || 0),
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  {estadoSeleccionado
                    ? `Filtrando: ${estadoSeleccionado}`
                    : "Todos los gastos"}
                </CardDescription>
              </div>
              <CalendarDays className="h-7 w-7" />
            </CardHeader>
          </Card>

          {/* Número de Gastos */}
          <Card
            onClick={() => manejarClickTarjeta("numero")}
            className={`bg-blanco flex-1 cursor-pointer rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-border dark:bg-[#1a1a1a] ${
              estadoSeleccionado === "numero" ? "ring-2 ring-secondary" : ""
            } group`}
          >
            <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
              <div className="flex-1">
                <CardTitle className="text-sm font-light text-secondary-foreground">
                  Número de Gastos
                </CardTitle>
                <div className="mt-2 flex items-center gap-5">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                    {gastosFiltrados.length}
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  Registrados
                </CardDescription>
              </div>
              <ReceiptText className="h-7 w-7" />
            </CardHeader>
          </Card>
        </div>

        {/* Tabla */}
        <div className="px-6">
          <DataTable
            data={gastosFiltrados}
            columns={columnas}
            onRowClick={(row) => console.log("Ver gasto:", row)}
          />
        </div>
      </div>

      {gastoEditar && (
        <GeneralDialog
          open={abrirEditar}
          onOpenChange={(open) => {
            setAbrirEditar(open);
            if (!open) setGastoEditar(null);
          }}
          title="Editar Gasto"
          description="Modifica la información del gasto."
          submitText="Guardar Cambios"
        >
          <EditGastoForm
            gasto={gastoEditar}
            onSuccess={(gastoActualizado) => {
              setGastos((prev) =>
                prev.map((g) =>
                  g.id_gas === gastoActualizado.id_gas
                    ? {
                        ...g,
                        desc_gas: gastoActualizado.desc_gas,
                        mont_gas: gastoActualizado.mont_gas,
                        obs_gas: gastoActualizado.obs_gas ?? "",
                        fech_gas: g.fech_gas,
                      }
                    : g,
                ),
              );
              setGastoEditar(null);
              setAbrirEditar(false);
            }}
          />
        </GeneralDialog>
      )}
      {/* Accion para el gasto */}
      {accionGasto && (
        <ModalModEstado
          abierto={true}
          descripcionPersonalizada={`¿Estás seguro de eliminar el gasto "${accionGasto.descripcion}"?`}
          tipoAccion="inactivar"
          nombreElemento={accionGasto.descripcion}
          onCambioAbierto={(abierto) => {
            if (!abierto) setAccionGasto(null);
          }}
          onConfirmar={async () => {
            await eliminarGasto(accionGasto.id);
            setAccionGasto(null);
          }}
        />
      )}
    </ModulePageLayout>
  );
}
