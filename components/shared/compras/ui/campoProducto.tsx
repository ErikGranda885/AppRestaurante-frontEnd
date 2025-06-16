"use client";

import React, { useState, useRef } from "react";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  UseFormSetValue,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormProducts } from "@/components/shared/productos/formularios/createProductForm";
import Image from "next/image";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductoOption {
  value: string;
  nombre: string;
  cod_prod: number;
  img_prod: string;
  tipo?: string;
}

interface CampoProductoProps<T extends FieldValues> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  name: Path<T>;
  label: string;
  options: ProductoOption[];
  setOptions?: React.Dispatch<React.SetStateAction<ProductoOption[]>>;
  placeholder?: string;
}

export function CampoProducto<T extends FieldValues>({
  control,
  setValue,
  name,
  label,
  options,
  setOptions,
  placeholder = "Selecciona un insumo",
}: CampoProductoProps<T>) {
  const [crearModalAbierto, setCrearModalAbierto] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Devuelve solo el nombre del producto seleccionado
  function getNombre(value: string) {
    const item = options.find((o) => o.value === value);
    return item ? item.nombre : placeholder;
  }

  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium">{label}</label>
            <div className="flex gap-2">
              <Select
                value={field.value || ""}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger
                  className={cn(
                    "w-full justify-between font-normal",
                    error ? "border-2 border-[#f31260]" : "",
                  )}
                  ref={triggerRef}
                >
                  {/* SOLO nombre como texto plano */}
                  <span>
                    {getNombre(field.value)}
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-72 overflow-auto">
                  {options.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No hay productos disponibles.
                    </div>
                  )}
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-3 py-1">
                        <Image
                          src={option.img_prod}
                          alt={option.nombre}
                          width={28}
                          height={28}
                          className="rounded border object-cover flex-shrink-0"
                        />
                        <div>
                          <span className="font-medium">{option.nombre}</span>
                          <span className="block text-xs text-muted-foreground">
                            Código: {option.cod_prod}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Botón para crear producto */}
              <Button
                type="button"
                variant="outline"
                className="flex-shrink-0 px-2"
                onClick={() => setCrearModalAbierto(true)}
                title="Crear nuevo producto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <p className="error-text mt-2 text-xs">{error.message}</p>
            )}
          </div>
        )}
      />

      {/* Modal para crear producto */}
      <Dialog open={crearModalAbierto} onOpenChange={setCrearModalAbierto}>
        <DialogContent className="w-[700px] max-w-full border-border">
          <DialogHeader>
            <DialogTitle>Crear nuevo producto</DialogTitle>
            <DialogDescription>
              Ingresa los datos del producto. Se agregará automáticamente al listado.
            </DialogDescription>
          </DialogHeader>
          <FormProducts
            onSuccess={(data: any) => {
              const nuevo: ProductoOption = {
                value: data.producto.id_prod.toString(),
                nombre: data.producto.nom_prod,
                cod_prod: data.producto.id_prod,
                img_prod: data.producto.img_prod,
                tipo: data.producto.tipo,
              };

              if (setOptions) {
                setOptions((prev) => [...prev, nuevo]);
              }

              setValue(name, nuevo.value as any);
              setCrearModalAbierto(false);

              setTimeout(() => {
                triggerRef.current?.focus();
              }, 100);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
