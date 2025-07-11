"use client";

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CampoNumeroProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  min?: number;
}

export const CampoNumero: React.FC<CampoNumeroProps> = ({
  control,
  name,
  label,
  placeholder = "Ingrese un valor",
  min = 1,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel className="text-black dark:text-white">{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(e) => {
                const soloNumeros = e.target.value
                  .replace(/[^0-9.,]/g, "") // elimina letras y signos
                  .replace(/^0+(?![.,]|$)/, ""); // quita ceros iniciales
                field.onChange(soloNumeros);
              }}
              onBlur={() => {
                const parsed = parseFloat(field.value);
                if (!isNaN(parsed)) {
                  // ✅ Siempre enviar como string
                  const normalizado =
                    min !== undefined && parsed < min ? min : parsed;
                  field.onChange(String(normalizado));
                } else {
                  field.onChange("");
                }
              }}
              className={cn(
                "dark:bg-[#09090b]",
                error ? "border-2 border-[var(--error-per)]" : "",
              )}
            />
          </FormControl>
          <FormMessage className="error-text" />
        </FormItem>
      )}
    />
  );
};
