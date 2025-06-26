"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { DataTable } from "@/components/shared/varios/dataTable";
import { MetricCard } from "@/components/shared/varios/metricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { ICompra, IDetCompra } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle,
  CloudDownload,
  Plus,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ToastError } from "@/components/shared/toast/toastError";
import { DateRangeFilter } from "@/components/shared/ventas/ui/dateRangeFilter";
import { DateRange } from "react-day-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { safePrice } from "@/utils/format";
import { DialogExportarCompras } from "@/components/shared/compras/ui/dialogExportarCompras";
import { socket } from "@/lib/socket";
import Preloader from "@/components/shared/varios/preloader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Page() {
  const { ventasConfig } = useConfiguracionesVentas();
  const [abrirExportar, setAbrirExportar] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [consultaBusqueda, setConsultaBusqueda] = useState<string>("");
  const [compras, setCompras] = useState<ICompra[]>([]);
  const [detCompras, setDetCompras] = useState<IDetCompra[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [labelQuickRange, setLabelQuickRange] = useState("Hoy");
  const [filtroPendientesPago, setFiltroPendientesPago] = useState(false);
  const pendientesPago = compras.filter(
    (c) => c.estado_pag_comp.toLowerCase() === "pendiente",
  );
  const totalPendientesPago = pendientesPago.length;

  useProtectedRoute();
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400); // puedes ajustar este valor si deseas

    return () => clearTimeout(timer);
  }, []);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const resCompras = await fetch("http://localhost:5000/compras");
        const comprasData = await resCompras.json();
        const comprasArray = Array.isArray(comprasData)
          ? comprasData
          : comprasData.data;
        setCompras(comprasArray || []);

        const resDetCompras = await fetch("http://localhost:5000/dets-compras");
        const detComprasData = await resDetCompras.json();
        const detComprasArray = Array.isArray(detComprasData)
          ? detComprasData
          : detComprasData.data;
        setDetCompras(detComprasArray || []);
      } catch (error) {
        ToastError({
          message:
            "No se pudieron cargar las compras, comunicate con el administrador.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();

    // 👂 Escuchar evento de socket
    socket.on("compras-actualizadas", fetchData);

    // 🧹 Limpiar listener al desmontar
    return () => {
      socket.off("compras-actualizadas", fetchData);
    };
  }, []);

  const filtrarPorFecha = (compra: ICompra) => {
    // Si el filtro de pendientes está activo, ya se filtra por fecha en el onClick
    if (filtroPendientesPago) return true;

    const fechaCompra = new Date(compra.fech_comp);
    const desde = dateRange?.from ? startOfDay(dateRange.from) : null;
    const hasta = dateRange?.to ? endOfDay(dateRange.to) : null;

    if (!desde || !hasta) return true;

    return fechaCompra >= desde && fechaCompra <= hasta;
  };

  const handleQuickRange = (option: "hoy" | "ayer" | "mes" | "año") => {
    setFiltroPendientesPago(false);
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

  const comprasFiltradas = useMemo(() => {
    return compras.filter(
      (compra) =>
        (compra.fech_comp
          .toLowerCase()
          .includes(consultaBusqueda.toLowerCase()) ||
          compra.estado_comp
            .toLowerCase()
            .includes(consultaBusqueda.toLowerCase())) &&
        filtrarPorFecha(compra) &&
        (!filtroPendientesPago ||
          compra.estado_pag_comp.toLowerCase() === "pendiente"),
    );
  }, [compras, consultaBusqueda, dateRange, filtroPendientesPago]);

  const comprasColumnas = [
    {
      header: "ID",
      accessorKey: "id_comp",
      cell: ({ cell }: any) => `#${cell.getValue()}`,
    },
    {
      header: "Fecha de compra",
      accessorKey: "fech_comp",
      cell: ({ cell }: any) => {
        const dateVal = new Date(cell.getValue());
        const today = new Date();
        if (dateVal.toDateString() === today.toDateString()) {
          return `Hoy a las ${format(dateVal, "HH:mm")}`;
        } else {
          return format(dateVal, "dd/MM/yyyy HH:mm");
        }
      },
    },
    {
      header: "Días de vencimiento",
      accessorKey: "fech_venc_comp",
      cell: ({ row }: any) => {
        const formaPago = row.original.form_pag_comp?.toLowerCase();
        const fechaVenc = row.original.fech_venc_comp;

        if (formaPago !== "credito" || !fechaVenc) {
          return <span className="text-muted-foreground">—</span>;
        }

        const hoy = new Date();
        const venc = new Date(fechaVenc);
        venc.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        const diasRestantes = Math.ceil(
          (venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );

        let color = "bg-green-500";
        if (diasRestantes <= 3 && diasRestantes > 0) color = "bg-yellow-500";
        if (diasRestantes <= 0) color = "bg-red-500";

        return (
          <div className="flex items-center gap-2 leading-tight">
            <div className={`h-3 w-3 rounded-full ${color}`} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {new Date(fechaVenc).toLocaleDateString("es-EC")}
              </span>
              <span className="text-xs text-muted-foreground">
                {diasRestantes <= 0
                  ? `Vencido`
                  : `${diasRestantes} día${diasRestantes === 1 ? "" : "s"} restantes`}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      header: "Total",
      accessorKey: "tot_comp",
      cell: ({ cell }: any) => {
        return safePrice(Number(cell.getValue()), ventasConfig.moneda);
      },
    },
    {
      header: "Estado de pago",
      accessorKey: "estado_pag_comp",
      cell: ({ cell }: any) => {
        const estado = cell.getValue().toLowerCase();
        let colorClass = "";
        if (estado === "pagado") colorClass = "bg-green-100 text-green-700";
        else if (estado === "pendiente")
          colorClass = "bg-yellow-100 text-yellow-700";
        else colorClass = "bg-gray-100 text-gray-700";
        return (
          <span className={`rounded px-2 py-1 ${colorClass}`}>
            {cell.getValue()}
          </span>
        );
      },
    },
    {
      header: "Estado de compra",
      accessorKey: "estado_comp",
      cell: ({ cell }: any) => {
        const estado = cell.getValue().toLowerCase();
        let colorClass = "";
        if (estado === "completado") colorClass = "bg-green-100 text-green-700";
        else if (estado === "pendiente")
          colorClass = "bg-yellow-100 text-yellow-700";
        else colorClass = "bg-gray-100 text-gray-700";
        return (
          <span className={`rounded px-2 py-1 ${colorClass}`}>
            {cell.getValue()}
          </span>
        );
      },
    },
    {
      header: "Usuario",
      accessorKey: "usu_comp",
      cell: ({ row }: any) => {
        const usuario = row.original.usu_comp;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-border bg-white">
              <Image
                src={usuario.img_usu || "/default-usuario.png"}
                alt={usuario.nom_usu}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <p
                className="max-w-[150px] truncate text-sm font-semibold"
                title={usuario.nom_usu}
              >
                {usuario.nom_usu}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {usuario.rol_usu.nom_rol}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Proveedor",
      accessorKey: "prov_comp",
      cell: ({ row }: any) => {
        const prov = row.original.prov_comp;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex-shrink-0 rounded-md border border-border p-1">
              <Image
                src={prov.img_prov || "/default-proveedor.png"}
                alt={prov.nom_prov}
                fill
                className="rounded-full object-contain"
              />
            </div>
            <span
              className="max-w-[140px] truncate font-medium capitalize"
              title={prov.nom_prov}
            >
              {prov.nom_prov}
            </span>
          </div>
        );
      },
    },
  ];

  const volumenTotal = compras.reduce(
    (acc, compra) => acc + Number(compra.tot_comp ?? 0),
    0,
  );

  const numeroCompras = compras.length;
  const promedioItems =
    numeroCompras > 0 ? (detCompras.length / numeroCompras).toFixed(2) : "0";
  if (showLoader) return <Preloader />;
  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Compras"
      breadcrumbPageTitle="Historial de compras"
      submenu={true}
      isLoading={loadingData}
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full w-full flex-col px-4">
          <h1 className="text-xl font-bold">Compras</h1>
          <p className="max-w-full text-sm text-muted-foreground sm:max-w-[500px]">
            Aquí puedes gestionar todas las compras realizadas en tu negocio.
          </p>

          <div className="pt-2">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              {/* IZQUIERDA: Botón + Fecha + Hoy */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => router.push("/compras/nueva")}
                  className="flex-shrink-0 text-[12px] font-semibold"
                >
                  <Plus className="h-4 w-4 font-light" /> Añade una nueva compra
                </Button>
              </div>

              {/* DERECHA: Buscar + Exportar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-shrink-0">
                  <DateRangeFilter
                    value={dateRange}
                    onChange={(r) => {
                      setFiltroPendientesPago(false);
                      setDateRange(r);
                    }}
                    className="w-full sm:w-auto"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-shrink-0 text-[12px] dark:bg-[#222224]"
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

                <div className="relative min-w-[150px] flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar compras..."
                    value={consultaBusqueda}
                    onChange={(e) => setConsultaBusqueda(e.target.value)}
                    className="w-full pl-10 text-[12px]"
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setAbrirExportar(true)}
                  className="flex-shrink-0 text-[12px] font-semibold"
                >
                  <CloudDownload className="h-4 w-4" /> Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full w-full rounded-lg bg-[hsl(var(--card))] dark:bg-[#111315]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 px-6 pt-2 md:flex-row md:justify-between">
              {/* Volumen total de compras */}
              <div className="flex-1">
                <MetricCard
                  titulo="Total en Compras"
                  valor={safePrice(volumenTotal, ventasConfig.moneda)}
                  porcentaje=""
                  periodo="Total"
                  iconColor="text-green-400"
                  badgeColorClass="bg-green-100 dark:bg-green-800/30 text-green-500 dark:text-green-400"
                  onClick={() => {}}
                />
              </div>
              {/* Numero de compras */}
              <div className="flex-1">
                <MetricCard
                  titulo="Número de Compras"
                  valor={numeroCompras.toString()}
                  porcentaje=""
                  periodo="Total"
                  iconColor="text-blue-400"
                  badgeColorClass="bg-blue-100 dark:bg-blue-800/30 text-blue-500 dark:text-blue-400"
                  onClick={() => setFiltroPendientesPago(false)}
                />
              </div>
              {/* Facturas vencidas */}
              <div className="flex-1">
                <MetricCard
                  titulo="Facturas Vencidas"
                  valor={compras
                    .filter((c) => {
                      const venc = new Date(c.fech_venc_comp);
                      const hoy = new Date();
                      venc.setHours(0, 0, 0, 0);
                      hoy.setHours(0, 0, 0, 0);
                      return (
                        c.form_pag_comp?.toLowerCase() === "credito" &&
                        venc.getTime() < hoy.getTime()
                      );
                    })
                    .length.toString()}
                  porcentaje=""
                  periodo="Total vencidas"
                  iconColor="text-red-500"
                  badgeColorClass="bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400"
                  onClick={() => {
                    setFiltroPendientesPago(false); // puedes ajustar si necesitas otro filtro
                  }}
                />
              </div>

              <div className="flex-1">
                <MetricCard
                  titulo="Pendientes de pago"
                  valor={totalPendientesPago.toString()}
                  porcentaje=""
                  periodo="Total"
                  iconColor="text-yellow-500"
                  badgeColorClass={`${
                    filtroPendientesPago
                      ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10"
                      : "bg-blanco dark:border-border dark:bg-[#1a1a1a]"
                  }`}
                  onClick={() => {
                    setFiltroPendientesPago((prev) => {
                      const nuevoEstado = !prev;
                      if (nuevoEstado) {
                        const pendientes = compras.filter(
                          (c) =>
                            c.estado_pag_comp.toLowerCase() === "pendiente",
                        );
                        if (pendientes.length > 0) {
                          const fechas = pendientes.map(
                            (c) => new Date(c.fech_comp),
                          );
                          const fechaMax = new Date(
                            Math.max.apply(
                              null,
                              fechas.map((d) => d.getTime()),
                            ),
                          );
                          setDateRange({
                            from: startOfDay(fechaMax),
                            to: endOfDay(fechaMax),
                          });
                          setLabelQuickRange("Automático");
                        }
                      }
                      return nuevoEstado;
                    });
                  }}
                  customIcon={
                    totalPendientesPago > 0 ? (
                      <div
                        className="group relative cursor-pointer transition-transform duration-300 hover:scale-110"
                        title={`${totalPendientesPago} compras pendientes de pago`}
                      >
                        <AlertTriangle className="h-6 w-6 animate-pulse text-yellow-500" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                          {totalPendientesPago}
                        </span>
                      </div>
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-500 transition-transform group-hover:scale-110" />
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-4">
            <DataTable<ICompra>
              key={filtroPendientesPago ? "pendientes" : "todas"}
              data={comprasFiltradas}
              columns={comprasColumnas}
              onRowClick={(compra: ICompra) => {
                router.push(`/compras/${compra.id_comp}`);
              }}
              enableRowPointer={true}
            />
          </div>
        </div>
      </div>
      {abrirExportar && (
        <DialogExportarCompras
          open={abrirExportar}
          onOpenChange={setAbrirExportar}
        />
      )}
    </ModulePageLayout>
  );
}
