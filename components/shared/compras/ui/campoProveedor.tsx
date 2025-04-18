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

export interface ProveedorOption {
  value: string;
  label: string; // Mostrar nombre o ruc
  ruc: string;
  nombre: string;
}

interface CampoProveedorProps {
  control: any;
  name: string;
  label: string;
  options: ProveedorOption[]; // Proveedores activos
}

export const CampoProveedor: React.FC<CampoProveedorProps> = ({
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
                    ? options.find(
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
                      {options.map((option) => (
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
