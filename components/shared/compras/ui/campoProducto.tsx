"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormProducts } from "@/components/shared/productos/formularios/createProductForm";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";

import { Control, FieldValues, Path, UseFormSetValue } from "react-hook-form";
import { Plus } from "lucide-react";

export interface ProductoOption {
  value: string;
  nombre: string;
  cod_prod: number;
  img_prod: string;
  tipo?:string
}

interface CampoProductoProps<T extends FieldValues> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  name: Path<T>;
  label: string;
  options: ProductoOption[];
  setOptions?: React.Dispatch<React.SetStateAction<ProductoOption[]>>;
}

export function CampoProducto<T extends FieldValues>({
  control,
  setValue,
  name,
  label,
  options,
  setOptions,
}: CampoProductoProps<T>) {
  const [open, setOpen] = useState(false);
  const [crearModalAbierto, setCrearModalAbierto] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const crearBtnRef = useRef<HTMLButtonElement>(null);

  // ✨ Enfoca el botón "Crear nuevo producto" cuando no hay resultados
  useEffect(() => {
    if (open && options.length === 0) {
      const timer = setTimeout(() => {
        crearBtnRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, options]);

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => (
          <FormItem>
            <FormLabel className="text-black dark:text-white">
              {label}
            </FormLabel>
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={triggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between dark:bg-[#222224]",
                      error ? "border-2 border-[#f31260]" : "",
                    )}
                  >
                    {field.value
                      ? options.find((option) => option.value === field.value)
                          ?.nombre
                      : "Selecciona producto"}
                    <span className="opacity-50">⌄</span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[320px] border-border p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar por nombre o ID..."
                      className="h-9"
                    />
                    <CommandList>
                      {options.length > 0 ? (
                        <>
                          <CommandGroup heading="Productos">
                            {options.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={`${option.nombre} ${option.cod_prod}`}
                                onSelect={() => {
                                  field.onChange(option.value);
                                  setOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={option.img_prod}
                                    alt={option.nombre}
                                    width={40}
                                    height={40}
                                    className="rounded object-cover"
                                  />
                                  <div>
                                    <p className="font-medium">
                                      {option.nombre}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Código: {option.cod_prod}
                                    </p>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          {/* Mostrar crear producto cuando sí hay productos */}
                          <CommandItem
                            className="cursor-pointer border border-border py-2"
                            onSelect={() => {
                              setCrearModalAbierto(true);
                              setOpen(false);
                            }}
                          >
                            <Plus className="h-4 w-4" /> Crear nuevo producto
                          </CommandItem>
                        </>
                      ) : null}

                      {/* Mostrar cuando NO hay coincidencias */}
                      <CommandEmpty className="flex flex-col items-start gap-2 p-3">
                        <p className="text-sm text-muted-foreground">
                          No se encontró producto.
                        </p>
                        <Button
                          ref={crearBtnRef}
                          variant="outline"
                          className="mt-1 w-full text-sm"
                          onClick={() => {
                            setCrearModalAbierto(true);
                            setOpen(false);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Crear nuevo producto
                        </Button>
                      </CommandEmpty>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage className="error-text" />
          </FormItem>
        )}
      />

      <Dialog open={crearModalAbierto} onOpenChange={setCrearModalAbierto}>
        <DialogContent className="w-[700px] max-w-full border-border">
          <DialogHeader>
            <DialogTitle>Crear nuevo producto</DialogTitle>
            <DialogDescription>
              Ingresa los datos del producto. Se agregará automáticamente al
              listado.
            </DialogDescription>
          </DialogHeader>

          <FormProducts
            onSuccess={(data: any) => {
              const nuevo: ProductoOption = {
                value: data.producto.id_prod.toString(),
                nombre: data.producto.nom_prod,
                cod_prod: data.producto.id_prod,
                img_prod: data.producto.img_prod,
              };

              if (setOptions) {
                setOptions((prev) => [...prev, nuevo]);
              }

              setValue(name, nuevo.value as any);
              setCrearModalAbierto(false);

              setTimeout(() => {
                triggerRef.current?.focus();
                setOpen(false);
              }, 100);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
