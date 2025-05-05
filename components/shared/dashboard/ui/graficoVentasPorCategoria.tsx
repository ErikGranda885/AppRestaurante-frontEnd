"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const datosCrudos = [
  { nombre: "Bebidas", vendido: 340 },
  { nombre: "Entradas", vendido: 220 },
  { nombre: "Platos Fuertes", vendido: 530 },
  { nombre: "Postres", vendido: 150 },
  { nombre: "Postres", vendido: 150 },
  { nombre: "Platos Fuertes", vendido: 530 },
  { nombre: "Comida rápida", vendido: 1000 },
];

// Agrupar automáticamente por categoría
const datosAgrupados = Object.values(
  datosCrudos.reduce(
    (acc, curr) => {
      if (!acc[curr.nombre]) {
        acc[curr.nombre] = { nombre: curr.nombre, vendido: 0 };
      }
      acc[curr.nombre].vendido += curr.vendido;
      return acc;
    },
    {} as Record<string, { nombre: string; vendido: number }>,
  ),
);

// Paleta de colores (expandible)
const colores = [
  "#3eab78",
  "#eab308",
  "#ef4444",
  "#6366f1",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
  "#22c55e",
];

export function GraficoVentasPorCategoria() {
  return (
    <Card className="h-1/2 w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
      <CardHeader className="pt-5">
        <CardTitle>Ventas por Categoría</CardTitle>
        <CardDescription className="mb-1 text-xs">
          Resumen de ingresos por tipo de producto
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[180px] px-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datosAgrupados}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            className="dark:text-black"
          >
            <XAxis dataKey="nombre" stroke="#888888" />
            <YAxis stroke="#888888" />
            <Tooltip />
            <Bar dataKey="vendido" radius={[4, 4, 0, 0]}>
              {datosAgrupados.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colores[index % colores.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
