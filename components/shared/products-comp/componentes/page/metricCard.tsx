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
}

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  porcentaje,
  periodo,
  iconColor,
  badgeColorClass,
  customRightContent,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className="group flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-[#1a1a1a]"
    >
      <CardHeader className="flex flex-col justify-between p-0 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CardTitle className="text-sm font-light text-secondary-foreground">
            {titulo}
          </CardTitle>
          <div className="mt-2 flex items-center gap-5">
            <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
              {valor}
            </span>
            <span
              className={`inline-block rounded-md px-2 text-sm font-bold ${badgeColorClass}`}
            >
              {porcentaje}
            </span>
          </div>
          <CardDescription className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {periodo}
          </CardDescription>
        </div>
        <div className="mt-4 flex flex-shrink-0 items-center justify-center sm:mt-0">
          {customRightContent ? (
            customRightContent
          ) : (
            <TrendingUpIcon
              className={`h-7 w-7 transition-transform duration-300 group-hover:scale-110 ${iconColor}`}
            />
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
