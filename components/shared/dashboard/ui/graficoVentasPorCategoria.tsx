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

import { useVentasPorCategoria } from "@/hooks/dashboard/useVentasPorCategoria";

const colores = [
  "#3eab78", "#eab308", "#ef4444", "#6366f1",
  "#06b6d4", "#f97316", "#8b5cf6", "#22c55e",
];

// Función para abreviar y formatear el número
const formatearDinero = (valor: number) => {
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toFixed(1)}M`;
  if (valor >= 1_000) return `$${(valor / 1_000).toFixed(1)}k`;
  return `$${valor.toFixed(2)}`;
};

export function GraficoVentasPorCategoria() {
  const { datos, loading } = useVentasPorCategoria();

  // Asegurar que los datos tengan la estructura correcta
  const datosFormateados = Array.isArray(datos)
    ? datos.map((item) => ({
        nombre: item.categoria,
        vendido: Number(item.total),
      }))
    : [];

  return (
    <Card className="h-1/2 w-full border border-border dark:bg-[#1e1e1e] dark:text-white">
      <CardHeader className="pt-5">
        <CardTitle>Ventas por Categoría</CardTitle>
        <CardDescription className="mb-1 text-xs">
          Resumen de ingresos por tipo de producto
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[180px] px-5">
        {loading ? (
          <p className="text-muted-foreground text-sm">Cargando datos...</p>
        ) : datosFormateados.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay datos para mostrar.</p>
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
