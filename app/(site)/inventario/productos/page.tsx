"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUpIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/**
 * Props para la tarjeta de métricas.
 */
interface MetricCardProps {
  titulo: string; // Ej: "Productos Registrados"
  valor: string | number; // Ej: 250
  porcentaje: string; // Ej: "+12%"
  periodo: string; // Ej: "Este mes"
  iconColor: string; // Ej: "text-green-400"
  badgeColorClass: string; // Ej: "bg-green-100 dark:bg-green-800/30 text-green-500"
}

/**
 * Componente MetricCard.
 * Muestra una tarjeta con la información de una métrica.
 */
function MetricCard({
  titulo,
  valor,
  porcentaje,
  periodo,
  iconColor,
  badgeColorClass,
}: MetricCardProps) {
  return (
    <Card className="group flex flex-col justify-between rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-[#09090b]">
      <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
        <div className="flex-1">
          {/* Título de la métrica */}
          <CardTitle className="text-sm font-light text-secondary-foreground">
            {titulo}
          </CardTitle>
          {/* Valor y badge de porcentaje */}
          <div className="mt-2 flex items-center gap-5">
            <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
              {valor}
            </span>
            <span
              className={`inline-block rounded-md px-2 py-1 text-sm font-bold ${badgeColorClass}`}
            >
              {porcentaje}
            </span>
          </div>
          {/* Periodo */}
          <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {periodo}
          </CardDescription>
        </div>
        {/* Ícono con efecto hover */}
        <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
          <TrendingUpIcon
            className={`h-7 w-7 transition-transform duration-300 group-hover:scale-110 ${iconColor}`}
          />
        </div>
      </CardHeader>
    </Card>
  );
}

/**
 * Página principal de Gestión de Productos con métrica y sección para futuros datos.
 */
export default function Page() {
  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Inventario"
      breadcrumbPageTitle="Gestión de Productos"
      submenu={true}
      isLoading={false}
    >
      <div className="p-6">
        {/* Cards de Métricas */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            titulo="Productos Registrados"
            valor={250}
            porcentaje="+12%"
            periodo="Este mes"
            iconColor="text-green-400"
            badgeColorClass="bg-green-100 dark:bg-green-800/30 text-green-500 dark:text-green-400"
          />
          <MetricCard
            titulo="Stock Crítico"
            valor={5}
            porcentaje="+5%"
            periodo="Este mes"
            iconColor="text-yellow-400"
            badgeColorClass="bg-yellow-100 dark:bg-yellow-800/30 text-yellow-500 dark:text-yellow-400"
          />
          <MetricCard
            titulo="Próx. a Caducar"
            valor={8}
            porcentaje="+2%"
            periodo="Este mes"
            iconColor="text-pink-400"
            badgeColorClass="bg-pink-100 dark:bg-pink-800/30 text-pink-500 dark:text-pink-400"
          />
        </div>
        {/* Botones importar y nuevo producto */}
        <Separator className="my-4" />
        {/* diseño de filtros: combobox que cargue categorias , estado ,buscar  */}
        <div className="flex flex-row justify-between">
          <Input type="text" placeholder="Buscar" className="w-[20%]" />
          <Input type="text" placeholder="Categoría" className="w-[20%]" />
          <Input type="text" placeholder="Estado" className="w-[20%]" />
          <div className="flex">
            <Button className="mr-4">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button>Nuevo Producto</Button>
          </div>
        </div>
        {/* */}
        
      </div>
    </ModulePageLayout>
  );
}
