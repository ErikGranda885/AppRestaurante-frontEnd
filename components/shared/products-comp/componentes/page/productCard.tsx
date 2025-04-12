import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2, XCircle, CheckCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ICategory, IProduct } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { getDaysUntilExpiration } from "@/utils/dates";

// Función de mapeo para adaptar cate_prod a ICategory
export const mapCategory = (cate: any): ICategory => {
  if (typeof cate === "object" && cate !== null && "id_cate" in cate) {
    return cate as ICategory;
  }
  // Si cate es un string, se crea un objeto con valores predeterminados
  return {
    id_cate: 0,
    nom_cate: cate,
    desc_cate: "",
    est_cate: "Activo",
  };
};

export const mapProduct = (prod: any): IProduct => {
  return {
    ...prod,
    cate_prod: mapCategory(prod.cate_prod),
  };
};

export interface ProductCardProps {
  product: IProduct;
  onEdit: (product: IProduct) => void;
  onDeactivate: (product: IProduct) => void;
  onActivate: (product: IProduct) => void;
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
    <Card className="group relative flex h-[110px] max-w-lg overflow-hidden rounded-lg border border-border bg-white p-3 shadow-md transition-colors duration-300 dark:bg-[#262626]">
      {/* Overlay para botones de acción */}
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex space-x-2">
          {/* Botón para Mostrar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-800 shadow transition-colors duration-200 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <Eye className="dark:text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mostrar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Botón para Editar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onEdit(product)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow transition-colors duration-200 hover:bg-blue-200 dark:bg-gray-800 dark:hover:bg-blue-900"
                >
                  <Edit2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Botón para Activar/Inactivar */}
          {product.est_prod === "Activo" ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onDeactivate(product)}
                    variant="destructive"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow transition-colors duration-200 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900"
                  >
                    <XCircle />
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
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-600 shadow transition-colors duration-200 hover:bg-green-100 dark:bg-gray-800 dark:hover:bg-green-900"
                  >
                    <CheckCircle className="h-5 w-5" />
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
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{product.nom_prod}</h2>
            <span className="text-xs">
              Stock:
              {product.stock_prod === null ? "0" : product.stock_prod}
            </span>
          </div>

          <div className="text-xs font-semibold">
            <div>
              <span className="text-xs text-muted-foreground">Categoría: </span>
              {typeof product.cate_prod === "object"
                ? product.cate_prod.nom_cate
                : product.cate_prod}
            </div>
          </div>

          <div className={`text-xs font-bold ${expirationColorClass}`}>
            <span className="text-xs text-muted-foreground">Caduca: </span>
            {expirationText}
          </div>

          <div className="text-xs font-semibold">
            <span className="text-xs text-muted-foreground">
              Precio de venta:
            </span>{" "}
            ${product.prec_vent_prod === null ? "0.00" : product.prec_vent_prod}
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
