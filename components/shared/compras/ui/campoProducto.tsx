"use client";

import React, { useState } from "react";
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

export interface ProductoOption {
  value: string;
  nombre: string;
  cod_prod: number;
  img_prod: string;
}

interface CampoProductoProps {
  control: any;
  name: string;
  label: string;
  options: ProductoOption[];
}

export const CampoProducto: React.FC<CampoProductoProps> = ({
  control,
  name,
  label,
  options,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel className="text-black dark:text-white">{label}</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between font-normal",
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
                    <CommandEmpty>No se encontró producto.</CommandEmpty>
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
                              <p className="font-medium">{option.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                Código: {option.cod_prod}
                              </p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage className="error-text" />
        </FormItem>
      )}
    />
  );
};
