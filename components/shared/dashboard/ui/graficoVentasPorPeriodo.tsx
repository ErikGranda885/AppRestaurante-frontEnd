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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useVentasPorPeriodo } from "@/hooks/dashboard/useVentaPorPeriodo";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { safePrice } from "@/utils/format";

export function GraficoVentasPorPeriodo() {
  const { ventasConfig } = useConfiguracionesVentas();
  const [tab, setTab] = useState("mes");
  const { datos, loading, error } = useVentasPorPeriodo();

  const mostrarSkeleton = loading || error;

  const formatCurrency = (value: number) =>
    safePrice(value, ventasConfig.moneda);

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
    <Card className="h-[220px] w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
      <CardHeader className="pb-1 pt-4">
        <div className="flex w-full items-start justify-between">
          <div>
            <CardTitle>Ventas por Período</CardTitle>
            <CardDescription className="text-xs">
              Comparativa por mes, semana o día
            </CardDescription>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-8">
              <TabsTrigger value="mes">Mensual</TabsTrigger>
              <TabsTrigger value="semana">Semanal</TabsTrigger>
              <TabsTrigger value="dia">Diario</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="h-[170px] px-4 pb-4">
        {mostrarSkeleton ? (
          <div className="h-full w-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : datosFiltrados.length === 0 ? (
          <p className="px-2 text-sm text-muted-foreground">
            No hay datos disponibles para este período.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%" key={tab}>
            <LineChart
              data={datosFiltrados}
              margin={{ top: 0, right: 0, left: -20, bottom: -30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="periodo"
                stroke="#888888"
                fontSize={10}
                height={50}
              />
              <YAxis
                stroke="#888888"
                tickFormatter={(value) => formatCurrency(Number(value))}
                fontSize={10}
              />
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
                  position="bottom"
                  offset={10}
                  formatter={formatCurrency}
                  fontSize={10}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
