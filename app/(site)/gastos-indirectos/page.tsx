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
import { format, parse } from "date-fns";
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

  useProtectedRoute();

  // Cargar gastos
  useEffect(() => {
    listarGastos();
  }, []);

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

  // Agrega esta función debajo de tu listarGastos
  function filtrarGastosPorEstado(): IGasto[] {
    const hoy = new Date();
    const fechaHoy = format(hoy, "yyyy-MM-dd");

    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    const fechaAyer = format(ayer, "yyyy-MM-dd");

    const primerDiaEsteMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const primerDiaMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - 1,
      1,
    );
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0); // Día 0 del mes actual = último día del anterior

    return gastos.filter((gasto) => {
      if (!gasto.fech_gas) return false;
      const fechaGasto = gasto.fech_gas.split(" ")[0];

      if (estadoSeleccionado === "hoy") {
        return fechaGasto === format(hoy, "yyyy-MM-dd");
      } else if (estadoSeleccionado === "ayer") {
        return fechaGasto === format(ayer, "yyyy-MM-dd");
      } else if (estadoSeleccionado === "esteMes") {
        const fecha = new Date(gasto.fech_gas);
        return fecha >= primerDiaEsteMes && fecha <= hoy;
      } else if (estadoSeleccionado === "mesAnterior") {
        const fecha = new Date(gasto.fech_gas);
        return fecha >= primerDiaMesAnterior && fecha <= ultimoDiaMesAnterior;
      }
      return true; // Si no hay estado seleccionado, mostrar todos
    });
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
    const hoy = new Date();
    const fechaHoy = format(hoy, "yyyy-MM-dd");

    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    const fechaAyer = format(ayer, "yyyy-MM-dd");

    const primerDiaEsteMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const primerDiaMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - 1,
      1,
    );
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    const gastosFiltradosPorEstado = gastos.filter((gasto) => {
      if (!gasto.fech_gas) return false;

      // Convertir la fecha tipo "27/04/2025 17:06:16" en un objeto Date
      const fechaParseada = parse(
        gasto.fech_gas,
        "dd/MM/yyyy HH:mm:ss",
        new Date(),
      );
      const fechaFormateada = format(fechaParseada, "yyyy-MM-dd");

      if (estadoSeleccionado === "hoy") {
        return fechaFormateada === fechaHoy;
      } else if (estadoSeleccionado === "ayer") {
        return fechaFormateada === fechaAyer;
      } else if (estadoSeleccionado === "esteMes") {
        return fechaParseada >= primerDiaEsteMes && fechaParseada <= hoy;
      } else if (estadoSeleccionado === "mesAnterior") {
        return (
          fechaParseada >= primerDiaMesAnterior &&
          fechaParseada <= ultimoDiaMesAnterior
        );
      }
      return true;
    });

    return gastosFiltradosPorEstado.filter((gasto) =>
      gasto.desc_gas.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [estadoSeleccionado, gastos, busqueda]);

  const totalGastado = useMemo(() => {
    return gastosFiltrados.reduce((acc, gasto) => acc + gasto.mont_gas, 0);
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
                    .reduce((acc, gasto) => acc + gasto.mont_gas, 0)
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
          {/* Botón Dropdown */}
          <div className="absolute right-4 top-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border">
                <DropdownMenuItem onClick={() => manejarClickTarjeta("hoy")}>
                  Hoy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => manejarClickTarjeta("ayer")}>
                  Ayer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => manejarClickTarjeta("esteMes")}
                >
                  Este Mes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => manejarClickTarjeta("mesAnterior")}
                >
                  Mes Anterior
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
            <div className="flex-1">
              <CardTitle className="text-sm font-light text-secondary-foreground">
                Total Filtrado
              </CardTitle>
              <div className="mt-2 flex items-center gap-5">
                <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                  $
                  {gastosFiltrados
                    .reduce((acc, gasto) => acc + gasto.mont_gas, 0)
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
