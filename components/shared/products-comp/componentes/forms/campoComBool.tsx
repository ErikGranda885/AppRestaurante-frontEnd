"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export interface CampoBooleanProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  /**
   * Opciones para el select.
   * Por defecto se usan { value: 1, label: "Sí" } y { value: 0, label: "No" }
   */
  options?: { value: number; label: string }[];
  className?: string;
}

export const CampoBoolean: React.FC<CampoBooleanProps> = ({
  control,
  name,
  label,
  placeholder = "Seleccione una opción",
  options,
  className,
}) => {
  // Opciones por defecto
  const defaultOptions = [
    { value: 1, label: "Sí" },
    { value: 0, label: "No" },
  ];
  const selectOptions = options || defaultOptions;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Convertir el valor numérico a string ("1" o "0")
        const stringValue =
          field.value === undefined || field.value === null
            ? undefined
            : field.value.toString();
        return (
          <FormItem>
            <FormLabel className="text-black dark:text-white">{label}</FormLabel>
            <FormControl>
              <Select
                value={stringValue}
                onValueChange={(val) => {
                  field.onChange(Number(val));
                }}
              >
                <SelectTrigger className={className}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.map((option) => (
                    <SelectItem
                      key={option.value.toString()}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
