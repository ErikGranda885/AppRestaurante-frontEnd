"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CloudDownload, Plus, Search, Upload } from "lucide-react";
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

export default function Page() {
  const [abrirCrear, setAbrirCrear] = useState(false);
  const [consultaBusqueda, setConsultaBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const { ventas, loading, error } = useVentasConDetalles(); // Hook que trae las ventas
  useProtectedRoute();

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

  const ventasFiltradas = useMemo(() => {
    return ventas
      .filter((venta: any) =>
        filtroEstado === "Todos" ? true : venta.estado === filtroEstado,
      )
      .filter((venta: any) =>
        venta.cliente.nom_usu
          .toLowerCase()
          .includes(consultaBusqueda.toLowerCase()),
      );
  }, [ventas, filtroEstado, consultaBusqueda]);

  if (loading) return <p className="px-6 py-4">Cargando ventas...</p>;
  if (error) return <p className="px-6 py-4 text-red-500">Error: {error}</p>;

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
          <div className="mb-5 flex items-center justify-between">
            <div className="bg-blue-300">{/* Buscar por fecha */}</div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar ventas"
                  className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                  value={consultaBusqueda}
                  onChange={(e) => setConsultaBusqueda(e.target.value)}
                />
              </div>
              <Button variant="secondary" className="text-[12px] font-semibold">
                <Upload className="h-4 w-4" /> Importar
              </Button>
              <Button variant="secondary" className="text-[12px] font-semibold">
                <CloudDownload className="h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>
        </div>
        {/* Agrega el filtrado por estado de la venta */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {["Todos", "Sin cerrar", "Cerrada"].map((estado) => (
              <Button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                variant={filtroEstado === estado ? "primary" : "outline"}
                className="text-sm"
              >
                {estado}
              </Button>
            ))}
          </div>
        </div>

        {/* Cards con Scroll */}
        <div className="h-[500px] px-6 py-2">
          <ScrollArea className="h-full pr-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {ventasFiltradas.map((venta) => {
                return (
                  <Card
                    key={venta.id_venta}
                    className="flex h-[290px] flex-col justify-between overflow-hidden border border-border shadow dark:bg-[#1a1a1a]"
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
                          <div>
                            <CardTitle className="text-sm font-bold leading-none">
                              {venta.cliente.nom_usu}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Orden #{venta.id_venta}
                            </p>
                          </div>
                        </div>

                        {/* Estado */}
                        <div
                          className={`rounded-md bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700`}
                        >
                          {venta.estado}
                        </div>
                      </div>

                      {/* Fecha y hora (segunda fila) */}
                      <div className="flex justify-between pt-1 text-xs text-muted-foreground">
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
                            ${prod.subtotal.toFixed(2)}
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
                        <span>${venta.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <CardFooter className="flex justify-between px-6 pb-4 pt-2">
                      <Button
                        variant="secondary"
                        className="text-[12px] font-semibold"
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        className="text-[12px] font-semibold"
                        variant="primary"
                      >
                        Pagar
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </ModulePageLayout>
    </>
  );
}
