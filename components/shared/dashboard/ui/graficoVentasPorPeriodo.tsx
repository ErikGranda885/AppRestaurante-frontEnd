"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useVentasPorPeriodo } from "@/hooks/dashboard/useVentaPorPeriodo";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { safePrice } from "@/utils/format";

export function GraficoVentasPorPeriodo() {
  const { ventasConfig } = useConfiguracionesVentas();
  function formatCurrency(value: number): string {
    return safePrice(value, ventasConfig.moneda);
  }
  const [tab, setTab] = useState("mes");
  const { datos, loading, error } = useVentasPorPeriodo(); // <- Agregado `error`

  const mostrarSkeleton = loading || error;

  const obtenerDatos = () => {
    switch (tab) {
      case "mes":
        return datos.mensual;
      case "semana":
        return datos.semanal;
      case "dia":
        return datos.diario;
      default:
        return [];
    }
  };

  const datosFiltrados = obtenerDatos();

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <Card className="h-[220px] w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
        <CardHeader className="flex-row items-start justify-between">
          {mostrarSkeleton ? (
            <>
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-52" />
              </div>
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-8 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="mt-2">
                <CardTitle>Ventas por Período</CardTitle>
                <CardDescription className="text-xs">
                  Comparativa por mes, semana o día
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="mes">Mensual</TabsTrigger>
                <TabsTrigger value="semana">Semanal</TabsTrigger>
                <TabsTrigger value="dia">Diario</TabsTrigger>
              </TabsList>
            </>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <TabsContent value={tab}>
            {mostrarSkeleton ? (
              <div className="h-[125px] w-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : datosFiltrados.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">
                No hay datos disponibles para este período.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={125}>
                <LineChart
                  data={datosFiltrados}
                  margin={{ top: 20, right: 15, left: -1, bottom: -12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" stroke="#888888" />
                  <YAxis stroke="#888888" tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number" ? formatCurrency(value) : value
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#bcbcbc"
                    strokeWidth={2}
                    dot={{ fill: "#3eab78" }}
                    activeDot={{ r: 6 }}
                  >
                    <LabelList
                      dataKey="total"
                      position="top"
                      offset={10}
                      formatter={formatCurrency}
                      fontSize={12}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
