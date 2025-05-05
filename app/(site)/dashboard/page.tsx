"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Wallet,
  AlertTriangle,
  CircleDollarSign,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoraActual } from "@/components/shared/dashboard/ui/horaActual";
import { GraficoVentasPorCategoria } from "@/components/shared/dashboard/ui/graficoVentasPorCategoria";
import { GraficoVentasPorPeriodo } from "@/components/shared/dashboard/ui/graficoVentasPorPeriodo";

export default function Dashboard() {
  useProtectedRoute();

  const [horaActual, setHoraActual] = useState(new Date());
  const [userName, setUserName] = useState<string | null>("");

  useEffect(() => {
    const showToast = localStorage.getItem("showWelcomeToast");
    const storedUserName = localStorage.getItem("user_name");

    if (showToast === "true" && storedUserName) {
      setUserName(storedUserName);
      ToastSuccess({
        message: `Bienvenido de nuevo ${storedUserName}`,
      });
      localStorage.removeItem("showWelcomeToast");
    }

    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const productosPopulares = [
    { nombre: "Shawarma Clásico", pedidos: 30 },
    { nombre: "Papas con queso", pedidos: 25 },
    { nombre: "Shawarma Especial", pedidos: 21 },
    { nombre: "Jugo Natural", pedidos: 18 },
    { nombre: "Hamburguesa Shawarma", pedidos: 15 },
  ];

  const productosAgotados = [
    { nombre: "Salsa de ajo", disponible: "Mañana" },
    { nombre: "Pan árabe", disponible: "04:20 PM" },
    { nombre: "Papas congeladas", disponible: "Mañana" },
    { nombre: "Salsas mixtas", disponible: "Mañana" },
  ];

  return (
    <>
      <ModulePageLayout
        breadcrumbLinkTitle="Dashboard"
        breadcrumbPageTitle=""
        submenu={false}
        isLoading={false}
      >
        <div className="space-y-6 px-4">
          {/* Encabezado con grid */}
          <div className="grid grid-cols-12 items-start justify-between gap-4">
            {/* Saludo */}
            <div className="col-span-7">
              <h2 className="text-xl font-semibold">Buen día, {userName} 👋</h2>
              <p className="text-sm text-muted-foreground">
                Resumen de operaciones del restaurante Shawarma La Estación
              </p>
            </div>
            {/* Hora dinamica */}
            <div className="col-span-2 text-right text-sm">
              <HoraActual />
            </div>
            {/* Tarjetas métricas con grid */}
            <div className="col-span-9 grid">
              <div className="flex w-full justify-between gap-4">
                {/* Total Ganado */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Total Ganado</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#3eab78] p-2">
                      <CircleDollarSign className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$526.00</p>
                    <div className="mt-1 flex gap-1 text-green-400">
                      <ArrowUp className="h-5 w-5" />
                      <p className="text-sm">3.2% más que ayer</p>
                    </div>
                  </CardContent>
                </Card>
                {/* Compras realizadas */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Compras Realizadas</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#e1992e] p-2">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$210.00</p>
                    <p className="text-sm text-yellow-400">5 pedidos</p>
                  </CardContent>
                </Card>
                {/* Gastos totales */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Gastos Totales</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#ef4444] p-2">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$90.00</p>
                    <p className="text-sm text-red-400">12 pagos</p>
                  </CardContent>
                </Card>
                {/* Diferencia de caja */}
                <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Diferencia de Caja</CardTitle>
                    <div className="mt-3 rounded-xl bg-[#f97316] p-2">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">-$20.00</p>
                    <p className="text-sm text-orange-400">Revisar cierre</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Nueva card */}
            <div className="col-span-3 col-start-10 row-span-3 row-start-1 grid h-[670px]">
              <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle> </CardTitle>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            </div>
            {/* Cards a ampliar en alto */}
            <div className="col-span-9 row-start-3 grid">
              <div className="flex h-full w-full justify-between gap-4">
                {/* Productos populares */}
                <Card className="h-full w-[280px] rounded-lg border border-border shadow-sm dark:bg-[#1e1e1e] dark:text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between py-5">
                      <CardTitle className="text-md font-semibold">
                        Productos Populares
                      </CardTitle>
                      <span className="cursor-pointer text-xs font-medium text-blue-500 hover:underline">
                        Ver Todos
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    {[
                      {
                        name: "Southwest Scramble Bowl",
                        orders: 26,
                        img: "/images/dish1.png",
                      },
                      {
                        name: "Hickory Smoked Bacon",
                        orders: 24,
                        img: "/images/dish2.png",
                      },
                      {
                        name: "Chicken Tender Plate",
                        orders: 23,
                        img: "/images/dish3.png",
                      },
                      {
                        name: "Grilled Chicken Sandwich",
                        orders: 22,
                        img: "/images/dish4.png",
                      },
                      {
                        name: "BBQ Bacon Burger",
                        orders: 22,
                        img: "/images/dish5.png",
                      },
                    ].map((dish, index) => (
                      <div key={dish.name} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-semibold text-white">{`0${index + 1}`}</span>
                        <img
                          src={dish.img}
                          alt={dish.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <p className="max-w-[180px] truncate text-sm font-medium text-white">
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

                {/* Productos Por caducar */}
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
                    {[
                      {
                        name: "Leche Entera Pasteurizada",
                        expiresIn: "2 días",
                        img: "/images/leche.png",
                      },
                      {
                        name: "Yogur de Frutilla 1L",
                        expiresIn: "3 días",
                        img: "/images/yogur.png",
                      },
                      {
                        name: "Jamón de Pavo",
                        expiresIn: "4 días",
                        img: "/images/jamon.png",
                      },
                      {
                        name: "Queso Fresco",
                        expiresIn: "5 días",
                        img: "/images/queso.png",
                      },
                      {
                        name: "Pan de Molde",
                        expiresIn: "5 días",
                        img: "/images/pan.png",
                      },
                    ].map((prod) => (
                      <div key={prod.name} className="flex items-center gap-3">
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <p
                            className="max-w-[180px] truncate text-sm font-medium text-white"
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
                {/* GRAFICOS */}
                <div className="flex h-[435px] min-w-[350px] flex-1 flex-col gap-4">
                  {/* Ventas por categoría */}
                  <GraficoVentasPorCategoria />
                  {/* Gráfica de ventas por período */}
                  <GraficoVentasPorPeriodo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModulePageLayout>
    </>
  );
}
