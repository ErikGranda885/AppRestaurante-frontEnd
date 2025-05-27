"use client";

import React, { useState, useEffect } from "react";
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
import { socket } from "@/lib/socket";
import { SERVICIOS_PROVEEDORES } from "@/services/proveedores.service";

export interface ProveedorOption {
  value: string;
  label: string;
  nombre: string;
  ruc: string;
  contacto?: string;
  telefono?: string;
  direccion?: string;
  correo?: string;
  imagen?: string;
}

interface CampoProveedorProps {
  control: any;
  name: string;
  label: string;
}

export const CampoProveedor: React.FC<CampoProveedorProps> = ({
  control,
  name,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const [proveedores, setProveedores] = useState<ProveedorOption[]>([]);

  const cargarProveedores = async () => {
    try {
      const res = await fetch(SERVICIOS_PROVEEDORES.proveedores);
      if (!res.ok) throw new Error("Error al cargar proveedores");
      const data = await res.json();

      const activos: ProveedorOption[] = data
        .filter((p: any) => p.est_prov?.toLowerCase() === "activo")
        .map((p: any) => ({
          value: String(p.id_prov),
          label: p.nom_prov,
          nombre: p.nom_prov,
          ruc: p.ruc_prov,
          contacto: p.cont_prov,
          telefono: p.tel_prov,
          direccion: p.direc_prov,
          correo: p.email_prov,
          imagen: p.img_prov,
        }));

      setProveedores(activos);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  useEffect(() => {
    cargarProveedores();
    socket.on("proveedores-actualizados", cargarProveedores);
    return () => {
      socket.off("proveedores-actualizados", cargarProveedores);
    };
  }, []);

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
                    "w-full justify-between font-normal dark:bg-[#222224]",
                    error ? "border-2 border-[#f31260]" : "",
                  )}
                >
                  {field.value
                    ? proveedores.find(
                        (option) => option.value === field.value.toString(),
                      )?.nombre
                    : "Selecciona proveedor"}
                  <span className="opacity-50">⌄</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] border-border p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar por nombre o RUC..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No se encontró proveedor.</CommandEmpty>
                    <CommandGroup heading="Proveedores">
                      {proveedores.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={`${option.nombre} ${option.ruc}`}
                          onSelect={() => {
                            field.onChange(option.value);
                            setOpen(false);
                          }}
                        >
                          <div>
                            <p className="font-medium">{option.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {option.ruc}
                            </p>
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
