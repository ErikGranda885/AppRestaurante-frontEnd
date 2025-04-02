"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Funciones helper para fechas
export const parseDateString = (dateStr: string): Date | null => {
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  return null;
};

export const resetTime = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getDaysUntilExpiration = (
  expirationDateString: string,
): number | null => {
  const expirationDate = parseDateString(expirationDateString);
  if (!expirationDate) return null;
  const today = resetTime(new Date());
  const expDate = resetTime(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export interface Category {
  id_cate: number;
  nom_cate: string;
  desc_cate: string;
  est_cate: string;
}

export interface Product {
  id_prod: number;
  prec_prod: number;
  stock_prod: number;
  cate_prod: Category;
  nom_prod: string;
  est_prod: string;
  fech_ven_prod: string;
  img_prod: string;
}

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onActivate: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDeactivate,
  onActivate,
}) => {
  const daysLeft = getDaysUntilExpiration(product.fech_ven_prod);
  const expirationText =
    daysLeft === null
      ? "Fecha inválida"
      : daysLeft > 0
        ? `Quedan ${daysLeft} día${daysLeft === 1 ? "" : "s"}`
        : daysLeft === 0
          ? "Vence hoy"
          : `Caducado hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) === 1 ? "" : "s"}`;

  let expirationColorClass = "text-gray-400";
  if (daysLeft === null) {
    expirationColorClass = "text-gray-500";
  } else if (daysLeft < 0) {
    expirationColorClass = "error-text";
  } else if (daysLeft <= 3) {
    expirationColorClass = "warning-text";
  } else if (daysLeft <= 10) {
    expirationColorClass = "ama-text";
  } else if (daysLeft > 10) {
    expirationColorClass = "success-text";
  }

  return (
    <Card className="group relative flex max-w-lg overflow-hidden rounded-lg border border-border bg-white p-3 shadow-md transition-colors duration-300 dark:bg-[#262626]">
      {/* Overlay para botones de acción */}
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onEdit(product)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow hover:bg-[#b3d4fa] dark:bg-[#002147]"
                >
                  <Edit2 className="h-6 w-6 text-[#006fee]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {product.est_prod === "Activo" ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onDeactivate(product)}
                    variant="destructive"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow hover:bg-[#fbb8cf] dark:bg-[#49051d]"
                  >
                    <XCircle className="error-text h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inactivar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onActivate(product)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow hover:bg-green-100 dark:bg-green-900"
                  >
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Activar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="relative z-10 flex w-full">
        {/* Imagen */}
        <div className="relative mr-3 h-20 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={product.img_prod}
            alt={product.nom_prod}
            fill
            className="object-cover"
          />
        </div>
        {/* Información */}
        <div className="flex flex-1 flex-col space-y-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{product.nom_prod}</h2>
            <span className="text-xs">Stock: {product.stock_prod}</span>
          </div>
          <div className="text-xs font-semibold">
            <span className="text-xs text-muted-foreground">Categoría: </span>
            {product.cate_prod.nom_cate}
          </div>
          <div className={`text-xs font-bold ${expirationColorClass}`}>
            <span className="text-xs text-muted-foreground">Caduca: </span>
            {expirationText}
          </div>
          <div>
            <span className="text-sm font-bold">
              <span className="text-xs text-muted-foreground">Precio: </span>$
              {product.prec_prod.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <span
        className={cn(
          "absolute bottom-2 right-2 rounded-md px-2 py-1 text-xs font-semibold",
          product.est_prod === "Activo"
            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
            : "error-text bg-[#fbb8cf] dark:bg-[#49051d]",
        )}
      >
        {product.est_prod}
      </span>
    </Card>
  );
};
