import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  XCircle,
  CheckCircle,
  Eye,
  Clock3,
  AlertCircle,
  CalendarX,
} from "lucide-react";
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
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { safePrice } from "@/utils/format";
import { DEFAULT_PRODUCT_IMAGE_URL } from "@/lib/constants";

// Función de mapeo para adaptar cate_prod a ICategory
export const mapCategory = (cate: any): ICategory => {
  if (typeof cate === "object" && cate !== null && "id_cate" in cate) {
    return cate as ICategory;
  }
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
  const daysLeft = getDaysUntilExpiration(product.fecha_vence_proxima);
  const { ventasConfig } = useConfiguracionesVentas();

  // Texto JSX dinámico
  let expirationText: React.ReactNode;
  let expirationIcon = <Clock3 className="mr-1 inline-block h-4 w-4" />;
  let expirationColorClass = "text-gray-500";

  if (daysLeft === null) {
    expirationText = "Sin fecha de vencimiento";
  } else if (daysLeft === 0) {
    expirationText = <span className="font-semibold">Vence hoy</span>;
    expirationColorClass = "text-yellow-500";
    expirationIcon = <AlertCircle className="mr-1 inline-block h-4 w-4" />;
  } else if (daysLeft > 0 && daysLeft <= 3) {
    expirationText = (
      <>
        Quedan
        <span className="font-semibold">
          {" "}
          {daysLeft} día{daysLeft === 1 ? "" : "s"}
        </span>
      </>
    );
    expirationColorClass = "text-yellow-500";
    expirationIcon = <AlertCircle className="mr-1 inline-block h-4 w-4" />;
  } else if (daysLeft > 3 && daysLeft <= 10) {
    expirationText = (
      <>
        Quedan <span className="font-semibold">{daysLeft} días</span>
      </>
    );
    expirationColorClass = "text-amber-500";
  } else if (daysLeft > 10) {
    expirationText = (
      <>
        Quedan <span className="font-semibold"> {daysLeft} días</span>
      </>
    );
    expirationColorClass = "text-green-600";
  } else {
    expirationText = (
      <>
        Caducado hace{" "}
        <span className="font-semibold">
          {Math.abs(daysLeft)} día{Math.abs(daysLeft) === 1 ? "" : "s"}
        </span>
      </>
    );
    expirationColorClass = "text-red-600";
    expirationIcon = <CalendarX className="mr-1 inline-block h-4 w-4" />;
  }

  return (
    <Card className="group relative flex h-[110px] max-w-lg overflow-hidden rounded-lg border border-border bg-white p-3 shadow-md transition-colors duration-300 dark:bg-[#262626]">
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex space-x-2">
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
        <div className="relative mr-3 h-20 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={product.img_prod || DEFAULT_PRODUCT_IMAGE_URL}
            alt={product.nom_prod}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{product.nom_prod}</h2>
            <span className="text-xs">Stock: {product.stock_prod ?? "0"}</span>
          </div>

          {product.tip_prod === "Insumo" && (
            <div className="text-xs font-semibold">
              <span className="text-xs text-muted-foreground">Tipo: </span>
              {product.tip_prod}
            </div>
          )}

          {product.cate_prod?.nom_cate && (
            <div className="text-xs font-semibold">
              <span className="text-xs text-muted-foreground">Categoría: </span>
              {product.cate_prod.nom_cate}
            </div>
          )}

          <div
            className={cn(
              "flex items-center text-xs font-bold",
              expirationColorClass,
            )}
          >
            <span className="mr-1 text-xs text-muted-foreground">Caduca: </span>
            {expirationIcon}
            {expirationText}
          </div>

          <div className="text-xs font-semibold">
            {product.tip_prod === "Insumo" ? (
              <>
                <span className="text-xs text-muted-foreground">
                  Precio de compra:{" "}
                </span>
                {safePrice(product.prec_comp_prod ?? 0, ventasConfig.moneda)}
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">
                  Precio de venta:{" "}
                </span>
                {safePrice(product.prec_vent_prod ?? 0, ventasConfig.moneda)}
              </>
            )}
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
