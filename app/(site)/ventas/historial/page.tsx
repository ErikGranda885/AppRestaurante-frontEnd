"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CloudDownload,
  Plus,
  Printer,
  Search,
  Upload,
  XCircle,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { GeneralDialog } from "@/components/shared/varios/dialogGen";
import { useVentasConDetalles } from "@/hooks/ventas/useVentasConDetalles";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DateRangeFilter } from "@/components/shared/ventas/ui/dateRangeFilter";
import { DateRange } from "react-day-picker";
import { Combobox } from "@/components/shared/varios/combobox";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";
import { ComboboxPago } from "@/components/shared/ventas/ui/comboboxPago";
import { ComboboxEstado } from "@/components/shared/ventas/ui/comboboxEstado";
import { TicketPreview } from "@/components/shared/ventas/ui/ticketPreview";
import { IVentaDetalle } from "@/lib/types";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Page() {
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [consultaBusqueda, setConsultaBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const [tipoPago, setTipoPago] = useState<string>("");
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<IVentaDetalle | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [mostrarContenidoComprobante, setMostrarContenidoComprobante] =
    useState(false);
  const { ventas, loading, error } = useVentasConDetalles(); // Hook que trae las ventas
  useProtectedRoute();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [imagenCargada, setImagenCargada] = useState(false);
  const [labelQuickRange, setLabelQuickRange] = useState("Hoy");

  const coloresUsuario = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-teal-500",
    "bg-yellow-500",
  ];
  const obtenerColorUsuario = (nombre: string) => {
    const hash = nombre
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return coloresUsuario[hash % coloresUsuario.length];
  };
  function formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    const esHoy = fecha.toDateString() === hoy.toDateString();
    const esAyer = fecha.toDateString() === ayer.toDateString();

    if (esHoy) return "Hoy";
    if (esAyer) return "Ayer";

    return fecha.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatearHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const limpiarFiltros = () => {
    setConsultaBusqueda("");
    setFiltroEstado("Todos");
    setTipoPago("");
    setDateRange({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    });
    setLabelQuickRange("Hoy");
  };

  /* Mostrar el comprobante de la transferencia */
  useEffect(() => {
    if (mostrarComprobante) {
      const timer = setTimeout(() => setMostrarContenidoComprobante(true), 300);
      return () => clearTimeout(timer);
    } else {
      // Oculta el contenido inmediatamente al cerrar
      setMostrarContenidoComprobante(false);
    }
  }, [mostrarComprobante]);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const matchEstado =
        filtroEstado === "Todos" ? true : venta.estado === filtroEstado;

      const matchNombre = venta.cliente.nom_usu
        .toLowerCase()
        .includes(consultaBusqueda.toLowerCase());

      const matchFecha =
        !dateRange?.from || !dateRange?.to
          ? true
          : isWithinInterval(new Date(venta.fecha), {
              start: startOfDay(dateRange.from),
              end: endOfDay(dateRange.to),
            });

      const matchTipoPago =
        tipoPago === "" ? true : venta.tipoPago === tipoPago;

      return matchEstado && matchNombre && matchFecha && matchTipoPago;
    });
  }, [ventas, filtroEstado, consultaBusqueda, dateRange, tipoPago]);

  if (loading) return <p className="px-6 py-4">Cargando ventas...</p>;
  if (error) return <p className="px-6 py-4 text-red-500">Error: {error}</p>;

  const handleQuickRange = (rango: "hoy" | "ayer" | "mes") => {
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    if (rango === "hoy") {
      setDateRange({ from: startOfDay(hoy), to: endOfDay(hoy) });
      setLabelQuickRange("Hoy");
    } else if (rango === "ayer") {
      setDateRange({ from: startOfDay(ayer), to: endOfDay(ayer) });
      setLabelQuickRange("Ayer");
    } else if (rango === "mes") {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      setDateRange({ from: startOfDay(inicioMes), to: endOfDay(hoy) });
      setLabelQuickRange("Este mes");
    }
  };
  return (
    <>
      <Toaster position="top-right" />
      <ModulePageLayout
        breadcrumbLinkTitle="Ventas"
        breadcrumbPageTitle="Historial de ventas"
        submenu
        isLoading={false}
      >
        <div className="px-6 pt-2">
          <h1 className="text-xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Aquí puedes revisar las ventas realizadas de tu negocio.
          </p>
          <div className="pt-4" />
          {/* Barra de búsqueda y botones */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Filtros (lado izquierdo) */}
            <div className="flex flex-wrap items-end gap-4">
              {/* Filtro por fecha */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Rango de fecha
                </label>
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
              </div>
              <div className="flex flex-col gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-[12px]">
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Separador visual */}
              <div className="hidden h-9 w-px bg-border md:block" />
            </div>
            {/* Limpiar Filtros */}

            {/* Botón Exportar (lado derecho) */}
            <div className="flex flex-wrap items-end gap-4">
              {/* Tipo de pago */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Tipo de pago
                </label>
                <ComboboxPago value={tipoPago} onChange={setTipoPago} />
              </div>

              {/* Estado de orden */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Estado de orden
                </label>
                <ComboboxEstado
                  value={filtroEstado}
                  onChange={setFiltroEstado}
                />
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar orden por usuario"
                  className="w-[250px] border border-border pl-10 text-[12px]"
                  value={consultaBusqueda}
                  onChange={(e) => setConsultaBusqueda(e.target.value)}
                />
              </div>

              {/* Limpiar filtros */}
              <Button
                variant="secondary"
                className="text-[12px] font-semibold"
                onClick={limpiarFiltros}
              >
                <XCircle className="h-4 w-4" />
                Limpiar filtros
              </Button>

              {/* Exportar */}
              <Button variant="secondary" className="text-[12px] font-semibold">
                <CloudDownload className="h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Cards con Scroll */}
        <div className="h-[540px] px-6 pt-6">
          <ScrollArea className="h-full pr-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {ventasFiltradas.length === 0 ? (
                <div className="col-span-full text-center text-sm text-muted-foreground">
                  No se encontraron resultados para los filtros aplicados.
                </div>
              ) : (
                ventasFiltradas.map((venta) => (
                  <Card
                    key={venta.id_venta}
                    className="flex h-[295px] flex-col justify-between overflow-hidden border border-border shadow dark:bg-[#1a1a1a]"
                  >
                    {/* HEADER */}
                    <CardHeader className="space-y-1 pb-2">
                      <div className="flex items-start justify-between">
                        {/* Avatar + nombre + orden */}
                        <div className="flex gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold text-white ${obtenerColorUsuario(venta.cliente.nom_usu)}`}
                          >
                            {venta.cliente.nom_usu.charAt(0).toUpperCase()}
                          </div>
                          <div className="bg">
                            <CardTitle className="text-sm font-bold leading-none">
                              {venta.cliente.nom_usu}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Orden #{venta.id_venta}
                            </p>
                          </div>
                        </div>

                        {/* Estado */}
                        <div className="flex flex-col items-end">
                          {/* Estado (ej. Sin cerrar) */}
                          <div className="rounded-md bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                            {venta.estado}
                          </div>

                          {/* Tipo de pago con punto indicador dinámico */}
                          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                venta.tipoPago === "efectivo"
                                  ? "bg-green-500"
                                  : venta.tipoPago === "transferencia"
                                    ? "bg-blue-500"
                                    : "bg-gray-400"
                              }`}
                            ></span>
                            {venta.tipoPago}
                          </div>
                        </div>
                      </div>

                      {/* Fecha y hora (segunda fila) */}
                      <div className="flex justify-between border-b border-dashed border-gray-300 pb-1 pt-1 text-xs font-bold text-muted-foreground">
                        <span>{formatearFecha(venta.fecha)}</span>
                        <span>{formatearHora(venta.fecha)}</span>
                      </div>
                    </CardHeader>

                    {/* CONTENIDO FIJO */}
                    <CardContent className="h-[100px] space-y-2 text-sm">
                      <div className="grid grid-cols-3 text-xs font-semibold text-gray-500">
                        <span>Producto</span>
                        <span className="text-center">Cant.</span>
                        <span className="text-right">Subtotal</span>
                      </div>

                      {/* 1 SOLO PRODUCTO Y "+N MÁS" CENTRADO */}
                      {venta.productos.slice(0, 3).map((prod, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-3 items-center text-xs"
                        >
                          <span className="truncate">{prod.nombre}</span>
                          <span className="text-center">{prod.cantidad}</span>
                          <span className="text-right">
                            ${Number(prod.subtotal ?? 0).toFixed(2)}
                          </span>
                        </div>
                      ))}

                      {venta.productos.length > 3 && (
                        <div className="flex justify-center text-xs font-medium text-muted-foreground">
                          +{venta.productos.length - 3} más
                        </div>
                      )}
                    </CardContent>

                    {/* TOTAL Y BOTONES */}
                    <div className="px-6">
                      <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-sm font-bold">
                        <span>Total</span>
                        <span>${Number(venta.total ?? 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <CardFooter className="flex justify-end px-6 pb-4 pt-2">
                      <Button
                        onClick={() => {
                          setVentaSeleccionada(venta);
                          setModalAbierto(true);
                        }}
                        variant="secondary"
                        className="text-[12px] font-semibold"
                      >
                        Ver Detalles
                      </Button>

                      {/* <Button
                        className="text-[12px] font-semibold"
                        variant="primary"
                      >
                        Pagar
                      </Button> */}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
          {ventaSeleccionada && (
            <GeneralDialog
              open={modalAbierto}
              onOpenChange={(open) => {
                setModalAbierto(open);
                if (!open) {
                  setVentaSeleccionada(null);
                  setMostrarComprobante(false);
                  setMostrarContenidoComprobante(false);
                  setImagenCargada(false);
                }
              }}
              title={"Previsualización recibo de compra"}
              contentClassName={`transition-all duration-500 ease-in-out max-w-none ${
                mostrarComprobante ? "w-[750px]" : "w-[350px]"
              }`}
            >
              <div className="flex">
                {/* Ticket */}
                <div ref={contentRef} className="w-1/2">
                  <TicketPreview venta={ventaSeleccionada} />
                </div>

                {/* Contenedor animado */}
                <motion.div
                  key="comprobante-box"
                  className="w-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: mostrarContenidoComprobante ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    pointerEvents: mostrarContenidoComprobante
                      ? "auto"
                      : "none",
                    visibility: mostrarContenidoComprobante
                      ? "visible"
                      : "hidden",
                  }}
                >
                  <motion.div
                    initial={{ filter: "blur(8px)", opacity: 0 }}
                    animate={
                      imagenCargada
                        ? { filter: "blur(0px)", opacity: 1 }
                        : { filter: "blur(8px)", opacity: 0.4 }
                    }
                    transition={{ duration: 0.6 }}
                    className="rounded-lg border border-border p-3 dark:bg-[#1a1a1a]"
                  >
                    <h4 className="mb-2 text-sm font-semibold dark:text-white">
                      Comprobante de transferencia
                    </h4>
                    <div className="relative aspect-[4/4] w-full overflow-hidden rounded-md">
                      {ventaSeleccionada?.comprobanteImg ? (
                        <Image
                          src={ventaSeleccionada.comprobanteImg}
                          alt="Comprobante de Transferencia"
                          fill
                          className="object-contain"
                          onLoadingComplete={() => setImagenCargada(true)}
                        />
                      ) : (
                        <div className="text-center text-sm text-muted-foreground">
                          No hay comprobante disponible para esta orden.
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Botones */}
              <div className="mt-4 flex flex-wrap items-center justify-start gap-2">
                <div>
                  {ventaSeleccionada?.tipoPago === "transferencia" && (
                    <Button
                      className="text-xs"
                      variant={mostrarComprobante ? "destructive" : "secondary"}
                      onClick={() => setMostrarComprobante((prev) => !prev)}
                    >
                      {mostrarComprobante
                        ? "Ocultar comprobante"
                        : "Ver comprobante"}
                    </Button>
                  )}
                </div>

                <Button
                  className="text-xs"
                  variant="primary"
                  onClick={() => reactToPrintFn()}
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </GeneralDialog>
          )}
        </div>
      </ModulePageLayout>
    </>
  );
}
