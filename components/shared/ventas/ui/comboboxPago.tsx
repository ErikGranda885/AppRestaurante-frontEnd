"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxPagoProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const opcionesPago = [
  { label: "Todos", value: "" },
  { label: "Efectivo", value: "efectivo" },
  { label: "Transferencia", value: "transferencia" },
];

export function ComboboxPago({
  value,
  onChange,
  placeholder = "Seleccionar tipo de pago",
}: ComboboxPagoProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const itemsFiltrados = query.trim()
    ? opcionesPago.filter((item) =>
        item.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : opcionesPago;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[160px] justify-between dark:bg-[#222224]"
        >
          {opcionesPago.find((item) => item.value === value)?.label ??
            placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] border border-border p-0">
        <Command>
          <CommandInput
            placeholder="Buscar tipo..."
            value={query}
            onValueChange={setQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No se encontró</CommandEmpty>
            <CommandGroup>
              {itemsFiltrados.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={() => {
                    onChange(item.value === value ? "" : item.value);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0",
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
