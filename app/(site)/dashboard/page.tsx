"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Wallet,
  AlertTriangle,
  CircleDollarSign,
  ArrowUp,
  Check,
} from "lucide-react";
import { HoraActual } from "@/components/shared/dashboard/ui/horaActual";
import { GraficoVentasPorCategoria } from "@/components/shared/dashboard/ui/graficoVentasPorCategoria";
import { GraficoVentasPorPeriodo } from "@/components/shared/dashboard/ui/graficoVentasPorPeriodo";
import OrdenesEnProceso from "@/components/shared/dashboard/ui/ordenesProgreso";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useUserData } from "@/hooks/dashboard/useUserData";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { useProductosDashboard } from "@/hooks/dashboard/useProductosDashboard";
import Image from "next/image";
import { safePrice } from "@/utils/format";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { useEmpresa } from "@/hooks/configuraciones/generales/useEmpresa";
import { useEffect, useState } from "react";
import Preloader from "@/components/shared/varios/preloader";

export default function Dashboard() {
  useProtectedRoute();
  const [showLoader, setShowLoader] = useState(true);
  const { ventasConfig } = useConfiguracionesVentas();
  const { userName } = useUserData();
  const { empresa } = useEmpresa();

  const fechaActual = new Date().toLocaleDateString("en-CA");
  const {
    totalGanado,
    comprasRealizadas,
    gastosTotales,
    diferenciaCaja,

    refreshDashboard,
  } = useDashboardMetrics(fechaActual);

  const {
    populares,
    caducar,
    loadingPopulares,
    loadingCaducar,
    errorPopulares,
    errorCaducar,
  } = useProductosDashboard();

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-muted ${className}`} />
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (showLoader) return <Preloader />;

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Dashboard"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false}
    >
      <div className="space-y-6 px-4">
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:auto-rows-auto xl:grid-cols-12">
          {/* Contenedor unificado de saludo, hora y métricas */}
          <div className="col-span-12 grid auto-rows-auto grid-cols-12 gap-y-4 xl:col-span-9">
            <div className="col-span-12 flex justify-between gap-2 sm:flex-row xl:grid xl:grid-cols-12 xl:items-start">
              {/* Saludo */}
              <div className="sm:flex-1 xl:col-span-8">
                <h2 className="font-semibold xl:text-xl">
                  Buen día, {userName} 👋
                </h2>
                <p className="text-sm text-muted-foreground">
                  Resumen de operaciones del restaurante{" "}
                  {empresa?.nom_emp ?? "tu negocio"}
                </p>
              </div>

              {/* Hora */}
              <div className="text-right text-sm sm:text-left xl:col-span-4 xl:self-start">
                <HoraActual />
              </div>
            </div>

            {/* Métricas en subgrid */}
            <div className="col-span-12">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* TOTAL GANADO */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white md:max-w-full xl:max-w-full">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Total Ganado</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#3eab78] p-2">
                      <CircleDollarSign className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {safePrice(totalGanado, ventasConfig.moneda)}
                    </p>
                    <div className="mt-1 flex gap-1 text-green-400">
                      <ArrowUp className="h-5 w-5" />
                      <p className="text-sm">3.2% más que ayer</p>
                    </div>
                  </CardContent>
                </Card>

                {/* COMPRAS REALIZADAS */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white md:md:max-w-full xl:max-w-full">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Compras Realizadas</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#e1992e] p-2">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {safePrice(comprasRealizadas.valor, ventasConfig.moneda)}
                    </p>
                    <p className="text-sm text-yellow-400">
                      {comprasRealizadas.cantidad} pedidos
                    </p>
                  </CardContent>
                </Card>

                {/* GASTOS TOTALES */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white md:md:max-w-full xl:max-w-full">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Gastos Totales</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#ef4444] p-2">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {safePrice(gastosTotales.valor, ventasConfig.moneda)}
                    </p>
                    <p className="text-sm text-red-400">
                      {gastosTotales.cantidad} pagos
                    </p>
                  </CardContent>
                </Card>

                {/* DIFERENCIA DE CAJA */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white md:md:max-w-full xl:max-w-full">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>
                      {diferenciaCaja < 0
                        ? "Diferencia de Caja"
                        : diferenciaCaja > 0
                          ? "Sobrante de Caja"
                          : "Caja Cuadrada"}
                    </CardTitle>
                    {diferenciaCaja === 0 ? (
                      <div className="mt-3 rounded-xl bg-[#3eab78] p-2 text-white">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl bg-[#f97316] p-2">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {diferenciaCaja < 0 ? "-" : diferenciaCaja > 0 ? "+" : ""}
                      {safePrice(Math.abs(diferenciaCaja), ventasConfig.moneda)}
                    </p>
                    <p className="text-sm text-orange-400">
                      {diferenciaCaja < 0
                        ? "Revisar cierre"
                        : diferenciaCaja > 0
                          ? "Diferencia detectada"
                          : "Todo está en orden"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Productos y gráficos */}
            <div className="col-span-12">
              <div className="grid gap-4 xl:grid-cols-4">
                {/* Productos más vendidos */}
                <Card className="overflow-hidden rounded-lg border border-border shadow-sm dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between py-5">
                      <CardTitle className="text-md font-semibold">
                        Productos más vendidos
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[370px] space-y-4 overflow-y-auto">
                    {loadingPopulares || errorPopulares ? (
                      [...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-7 w-7 rounded-md" />
                          <div className="flex flex-col space-y-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      ))
                    ) : populares.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay productos populares disponibles.
                      </p>
                    ) : (
                      populares.map((dish, index) => (
                        <div key={dish.id} className="flex items-center gap-3">
                          <span className="w-6 text-sm font-semibold">{`0${index + 1}`}</span>
                          <Image
                            src={dish.img}
                            alt={dish.name}
                            width={28}
                            height={28}
                            className="rounded-md object-cover"
                          />
                          <div className="flex flex-col">
                            <p className="max-w-[180px] truncate text-sm font-medium">
                              {dish.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Orders:{" "}
                              <span className="font-semibold">
                                {dish.orders}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Productos por caducar */}
                <Card className="overflow-hidden rounded-lg border border-border shadow-sm dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between py-5">
                      <CardTitle className="text-md font-semibold">
                        Productos por Caducidad
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[370px] space-y-4 overflow-y-auto pt-1">
                    {loadingCaducar || errorCaducar ? (
                      [...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-7 w-7 rounded-md" />
                          <div className="flex flex-col space-y-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      ))
                    ) : caducar.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay productos con fecha registrados.
                      </p>
                    ) : (
                      caducar.map((prod) => {
                        const dias = parseInt(prod.expiresIn);
                        let color = "text-green-500";
                        if (dias <= 1) color = "text-red-500";
                        else if (dias <= 3) color = "text-orange-500";
                        else if (dias <= 7) color = "text-yellow-500";

                        return (
                          <div
                            key={prod.id}
                            className="flex items-center gap-3"
                          >
                            <Image
                              src={prod.img}
                              alt={prod.name}
                              width={28}
                              height={28}
                              className="rounded-md object-cover"
                            />
                            <div className="flex flex-col">
                              <p
                                className="max-w-[180px] truncate text-sm font-medium"
                                title={prod.name}
                              >
                                {prod.name}
                              </p>
                              <p className={`text-xs ${color}`}>
                                Vence en:{" "}
                                <span className="font-semibold">
                                  {prod.expiresIn}
                                </span>
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Gráficos combinados */}
                <div className="col-span-2 h-[450px] overflow-hidden rounded-lg border border-border p-4 shadow-sm dark:bg-[#1e1e1e] dark:text-white">
                  <div className="flex h-full flex-col gap-4">
                    <div className="h-1/2 overflow-hidden">
                      <GraficoVentasPorCategoria />
                    </div>
                    <div className="h-1/2 overflow-hidden">
                      <GraficoVentasPorPeriodo />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Órdenes en progreso */}
          <div className="hidden xl:col-span-3 xl:col-start-10 xl:block xl:self-start">
            <OrdenesEnProceso onRefreshDashboard={refreshDashboard} />
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
