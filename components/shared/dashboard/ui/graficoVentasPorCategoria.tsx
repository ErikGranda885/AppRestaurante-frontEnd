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
import { Skeleton } from "@/components/ui/skeleton"; // Asegúrate de importar tu Skeleton

import { useVentasPorCategoria } from "@/hooks/dashboard/useVentasPorCategoria";

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

const formatearDinero = (valor: number) => {
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `$${(valor / 1_000).toFixed(1)}k`;
  return `$${valor.toFixed(2)}`;
};

export function GraficoVentasPorCategoria() {
  const { datos, loading } = useVentasPorCategoria();

  const datosFormateados = Array.isArray(datos)
    ? datos.map((item) => ({
        nombre: item.categoria,
        vendido: Number(item.total),
      }))
    : [];

  return (
    <Card className="h-1/2 w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
      <CardHeader className="pt-5">
        {loading ? (
          <>
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-60" />
          </>
        ) : (
          <>
            <CardTitle>Ventas por Categoría</CardTitle>
            <CardDescription className="mb-1 text-xs">
              Resumen de ingresos por tipo de producto
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="h-[180px] px-5">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[140px] w-full" />
          </div>
        ) : datosFormateados.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">
            No hay datos para mostrar.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosFormateados}
              margin={{ top: 10, right: 10, left: -11, bottom: 0 }}
              className="dark:text-black"
            >
              <XAxis dataKey="nombre" stroke="#888888" />
              <YAxis
                stroke="#888888"
                tickFormatter={(valor) => formatearDinero(valor)}
              />
              <Tooltip
                formatter={(valor: number) => formatearDinero(valor)}
                labelClassName="text-xs"
              />
              <Bar dataKey="vendido" radius={[4, 4, 0, 0]}>
                {datosFormateados.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.nombre}-${index}`}
                    fill={colores[index % colores.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
