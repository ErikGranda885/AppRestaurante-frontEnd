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
import { Skeleton } from "@/components/ui/skeleton";
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

export function GraficoVentasPorCategoria() {
  const { datos, loading, error } = useVentasPorCategoria();

  const datosFormateados = Array.isArray(datos)
    ? datos.map((item) => ({
        nombre: item.categoria,
        vendido: Number(item.total),
      }))
    : [];

  const mostrarSkeleton = loading || error;

  return (
    <Card className="h-[215px] w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
      <CardHeader className="pt-5">
        {mostrarSkeleton ? (
          <>
            <Skeleton className="mb-2 h-4 w-40" />
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

      <CardContent className="h-[217px] px-5">
        {mostrarSkeleton ? (
          <div className="flex h-full w-full items-center justify-center">
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
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              className="dark:text-black"
            >
              <XAxis
                dataKey="nombre"
                stroke="#888888"
                angle={-0}
                textAnchor="end"
                height={60}
                fontSize={10}
                interval={0}
                className="text-xs"
              />
              <YAxis
                stroke="#888888"
                tickFormatter={(valor) => `$${valor.toFixed(2)}`}
                fontSize={10}
              />
              <Tooltip
                formatter={(valor: number) => `$${valor.toFixed(2)}`}
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
