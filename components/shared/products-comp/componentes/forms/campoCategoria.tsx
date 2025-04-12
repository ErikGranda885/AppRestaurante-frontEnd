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

export interface CategoryOption {
  value: string;
  label: string;
}

interface CampoCategoriaProps {
  control: any;
  name: string;
  label: string;
  options: CategoryOption[];
}

export const CampoCategoria: React.FC<CampoCategoriaProps> = ({
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
                      )?.label
                    : "Selecciona categoría"}
                  <span className="opacity-50">⌄</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 border-border">
                <Command>
                  <CommandInput
                    placeholder="Buscar categoría..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No se encontró categoría.</CommandEmpty>
                    <CommandGroup heading="Categorías">
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={(currentValue) => {
                            const selected = options.find(
                              (o) => o.label === currentValue,
                            );
                            field.onChange(selected?.value || "");
                            setOpen(false);
                          }}
                        >
                          {option.label}
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
