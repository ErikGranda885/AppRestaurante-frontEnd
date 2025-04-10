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

export interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  items: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setQuery("");
  };

  // Filtra utilizando el label y el value convertidos a string y minúsculas.
  const filteredItems = query.trim()
    ? items.filter((item) => {
        const lowerQuery = query.trim().toLowerCase();
        const label = String(item.label).toLowerCase();
        const valueStr = String(item.value).toLowerCase();
        return label.includes(lowerQuery) || valueStr.includes(lowerQuery);
      })
    : items;

  // Depuración: imprime la consulta y los items filtrados.
  console.log("Query:", query, "Filtered Items:", filteredItems);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[200px] justify-between ${className} `}
        >
          {value
            ? items.find((item) => String(item.value) === String(value))?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-border w-[200px] bg-white p-0 dark:bg-[#09090b] dark:text-white">
        <Command>
          <CommandInput
            placeholder={placeholder}
            className="h-9"
            value={query}
            onValueChange={(val) => {
              setQuery(val);
              console.log("Query updated:", val);
            }}
          />
          <CommandList>
            <CommandEmpty>Resultado no encontrado</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={String(item.value)}
                  value={`${item.value} ${item.label}`}
                  onSelect={(selectedValue) => {
                    const selectedId = selectedValue.split(" ")[0];
                    onChange(
                      String(selectedId) === String(value) ? "" : selectedId,
                    );
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      String(value) === String(item.value)
                        ? "opacity-100"
                        : "opacity-0",
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
