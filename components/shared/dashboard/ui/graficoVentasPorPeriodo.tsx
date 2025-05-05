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

const datosMensuales = [
  { periodo: "Enero", ventas: 1200 },
  { periodo: "Febrero", ventas: 980 },
  { periodo: "Marzo", ventas: 1450 },
  { periodo: "Abril", ventas: 800 },
  { periodo: "Mayo", ventas: 1600 },
];

const datosSemanales = [
  { periodo: "Semana 1", ventas: 320 },
  { periodo: "Semana 2", ventas: 450 },
  { periodo: "Semana 3", ventas: 290 },
  { periodo: "Semana 4", ventas: 510 },
];

const datosDiarios = [
  { periodo: "Lun", ventas: 120 },
  { periodo: "Mar", ventas: 150 },
  { periodo: "Mié", ventas: 180 },
  { periodo: "Jue", ventas: 90 },
  { periodo: "Vie", ventas: 200 },
  { periodo: "Sáb", ventas: 220 },
  { periodo: "Dom", ventas: 160 },
];

export function GraficoVentasPorPeriodo() {
  const [tab, setTab] = useState("mes");

  const obtenerDatos = () => {
    switch (tab) {
      case "mes":
        return datosMensuales;
      case "semana":
        return datosSemanales;
      case "dia":
        return datosDiarios;
      default:
        return [];
    }
  };

  const datos = obtenerDatos();

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <Card className="w-full border border-border dark:bg-[#1e1e1e] dark:text-white h-[220px]">
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
            <div className=" w-full text-black">
              {" "}
              {/* altura mínima asegurada */}
              <ResponsiveContainer width="100%" height={125}>
                <LineChart
                  data={datos}
                  margin={{ top: 20, right: 15, left: -20, bottom: -12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip  />
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
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
