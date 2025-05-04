"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const opciones = [
  { value: "Todos", label: "Todos" },
  { value: "Sin cerrar", label: "Sin cerrar" },
  { value: "Cerrada", label: "Cerrada" },
];

interface ComboboxEstadoProps {
  value: string;
  onChange: (value: string) => void;
}

export function ComboboxEstado({ value, onChange }: ComboboxEstadoProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel =
    opciones.find((opt) => opt.value === value)?.label || "Seleccionar estado";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[130px] justify-between dark:bg-[#222224]"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] border border-border p-0">
        <Command>
          <CommandInput placeholder="Filtrar estado..." />
          <CommandList>
            <CommandEmpty>No se encontró estado</CommandEmpty>
            <CommandGroup>
              {opciones.map((estado) => (
                <CommandItem
                  key={estado.value}
                  value={estado.value}
                  onSelect={() => {
                    onChange(estado.value);
                    setOpen(false);
                  }}
                >
                  {estado.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === estado.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
