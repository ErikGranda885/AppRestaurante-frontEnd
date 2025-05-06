"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Wallet,
  AlertTriangle,
  CircleDollarSign,
  ArrowUp,
} from "lucide-react";
import { HoraActual } from "@/components/shared/dashboard/ui/horaActual";
import { GraficoVentasPorCategoria } from "@/components/shared/dashboard/ui/graficoVentasPorCategoria";
import { GraficoVentasPorPeriodo } from "@/components/shared/dashboard/ui/graficoVentasPorPeriodo";
import OrdenesEnProceso from "@/components/shared/dashboard/ui/ordenesProgreso";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useUserData } from "@/hooks/dashboard/useUserData";
import { useHoraActual } from "@/hooks/dashboard/useHoraActual";
import { useDashboardMetrics } from "@/hooks/dashboard/useDashboardMetrics";
import { useProductosDashboard } from "@/hooks/dashboard/useProductosDashboard";
import Image from "next/image";

export default function Dashboard() {
  useProtectedRoute();

  const { userName } = useUserData();
  const { horaActual } = useHoraActual();
  const fechaActual = new Date().toLocaleDateString("en-CA");
  const dashboard = useDashboardMetrics(fechaActual);
  const {
    totalGanado,
    comprasRealizadas,
    gastosTotales,
    diferenciaCaja,
    loading,
    error,
  } = dashboard;
  const { populares, caducar } = useProductosDashboard();
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-muted ${className}`} />
  );

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Dashboard"
      breadcrumbPageTitle=""
      submenu={false}
      isLoading={false}
    >
      <div className="space-y-6 px-4">
        <div className="grid grid-cols-12 items-start justify-between gap-4">
          {/* Saludo */}
          <div className="col-span-7">
            <h2 className="text-xl font-semibold">Buen día, {userName} 👋</h2>
            <p className="text-sm text-muted-foreground">
              Resumen de operaciones del restaurante Shawarma La Estación
            </p>
          </div>
          {/* Hora dinámica */}
          <div className="col-span-2 text-right text-sm">
            <HoraActual />
          </div>

          {/* Métricas */}
          <div className="col-span-9 grid">
            <div className="flex w-full justify-between gap-4">
              {/* TOTAL GANADO */}
              {loading || error ? (
                <Card className="h-[150px] w-full animate-pulse border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-8 w-8 rounded-full bg-[#3eab78]" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Total Ganado</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#3eab78] p-2">
                      <CircleDollarSign className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${totalGanado.toFixed(2)}
                    </p>
                    <div className="mt-1 flex gap-1 text-green-400">
                      <ArrowUp className="h-5 w-5" />
                      <p className="text-sm">3.2% más que ayer</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* COMPRAS REALIZADAS */}
              {loading || error ? (
                <Card className="h-[150px] w-full animate-pulse border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full bg-[#e1992e]" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Compras Realizadas</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#e1992e] p-2">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${comprasRealizadas.valor.toFixed(2)}
                    </p>
                    <p className="text-sm text-yellow-400">
                      {comprasRealizadas.cantidad} pedidos
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* GASTOS TOTALES */}
              {loading || error ? (
                <Card className="h-[150px] w-full animate-pulse border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full bg-[#ef4444]" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Gastos Totales</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#ef4444] p-2">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${gastosTotales.valor.toFixed(2)}
                    </p>
                    <p className="text-sm text-red-400">
                      {gastosTotales.cantidad} pagos
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* DIFERENCIA DE CAJA */}
              {loading || error ? (
                <Card className="h-[150px] w-full animate-pulse border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-8 w-8 rounded-full bg-[#f97316]" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Diferencia de Caja</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#f97316] p-2">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {diferenciaCaja < 0 ? "-" : ""}$
                      {Math.abs(diferenciaCaja).toFixed(2)}
                    </p>
                    <p className="text-sm text-orange-400">Revisar cierre</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Órdenes en progreso */}
          <div className="col-span-3 col-start-10 row-span-3 row-start-1 grid h-[670px]">
            <OrdenesEnProceso />
          </div>

          {/* Productos y gráficos */}
          <div className="col-span-9 row-start-3 grid">
            <div className="flex h-full w-full justify-between gap-4">
              {/* Productos populares */}
              <Card className="h-full w-[280px] rounded-lg border border-border shadow-sm dark:bg-[#1e1e1e] dark:text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between py-5">
                    <CardTitle className="text-md font-semibold">
                      Productos más vendidos
                    </CardTitle>
                    <span className="cursor-pointer text-xs font-medium text-blue-500 hover:underline">
                      Ver Todos
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  {populares.map((dish, index) => (
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
                          <span className="font-semibold">{dish.orders}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Productos por caducar */}
              <Card className="h-[455px] w-[280px] rounded-lg border border-border shadow-sm dark:bg-[#1e1e1e] dark:text-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between py-5">
                    <CardTitle className="text-md font-semibold">
                      Productos por Caducar
                    </CardTitle>
                    <span className="cursor-pointer text-xs font-medium text-blue-500 hover:underline">
                      Ver Todos
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  {caducar.map((prod) => (
                    <div key={prod.id} className="flex items-center gap-3">
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
                        <p className="text-xs text-red-400">
                          Vence en:{" "}
                          <span className="font-semibold">
                            {prod.expiresIn}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Gráficos */}
              <div className="flex h-[435px] min-w-[350px] flex-1 flex-col gap-4">
                <GraficoVentasPorCategoria />
                <GraficoVentasPorPeriodo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
}
