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
import { useVentasPorPeriodo } from "@/hooks/dashboard/useVentaPorPeriodo";

// Formateador para valores monetarios con $ y k/m
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(2)}`;
}

export function GraficoVentasPorPeriodo() {
  const [tab, setTab] = useState("mes");
  const { datos, loading } = useVentasPorPeriodo();

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
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <TabsContent value={tab}>
            <div className="w-full text-black">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Cargando datos...
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
                        typeof value === "number"
                          ? formatCurrency(value)
                          : value
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="ventas"
                      stroke="#bcbcbc"
                      strokeWidth={2}
                      dot={{ fill: "#3eab78" }}
                      activeDot={{ r: 6 }}
                    >
                      <LabelList
                        dataKey="ventas"
                        position="top"
                        offset={10}
                        formatter={formatCurrency}
                        fontSize={12}
                      />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
