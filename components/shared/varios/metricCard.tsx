"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";

export interface MetricCardProps {
  titulo: string;
  valor: string | number;
  porcentaje: string;
  periodo: React.ReactNode;
  iconColor: string;
  badgeColorClass: string;
  customRightContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  porcentaje,
  periodo,
  iconColor,
  badgeColorClass,
  customRightContent,
  className,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={`bg-blanco flex-1 cursor-pointer rounded-xl border border-border p-4 shadow-sm transition-shadow hover:shadow-lg dark:bg-[#1a1a1a] xl:p-7 ${
        className || ""
      } group`}
    >
      <CardHeader className="flex flex-col justify-between gap-2 p-0 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex-1 space-y-2">
          {/* Título + ícono en móvil */}
          <div className="flex items-center justify-between sm:hidden">
            <CardTitle className="text-sm font-medium text-secondary-foreground">
              {titulo}
            </CardTitle>
            {customRightContent ? (
              customRightContent
            ) : (
              <TrendingUpIcon
                className={`h-5 w-5 text-muted-foreground group-hover:scale-110 ${iconColor}`}
              />
            )}
          </div>

          {/* Título en desktop */}
          <div className="hidden sm:block">
            <CardTitle className="text-sm font-medium text-secondary-foreground">
              {titulo}
            </CardTitle>
          </div>

          {/* Valor + porcentaje */}
          <div className="flex items-center gap-1 sm:gap-4">
            <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
              {valor}
            </span>
            <span
              className={`inline-block rounded-md bg-secondary px-2 py-1 text-xs font-semibold ${badgeColorClass}`}
            >
              {porcentaje}
            </span>
          </div>

          {/* Periodo */}
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
            {periodo}
          </CardDescription>
        </div>

        {/* Ícono en desktop */}
        <div className="mt-2 hidden items-center justify-center sm:mt-0 sm:flex">
          {customRightContent ? (
            customRightContent
          ) : (
            <TrendingUpIcon
              className={`h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110 ${iconColor}`}
            />
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
