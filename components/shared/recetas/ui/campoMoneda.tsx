"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";

interface CampoMonedaProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
}

export function CampoMoneda<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: CampoMonedaProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const { ventasConfig } = useConfiguracionesVentas();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        // Inicializar con el valor formateado solo al montar
        useEffect(() => {
          if (
            field.value !== undefined &&
            field.value !== null &&
            !isNaN(Number(field.value))
          ) {
            setInputValue(field.value.toString().replace(".", ","));
          }
        }, [field.value]);

        return (
          <FormItem>
            {label && (
              <FormLabel className="text-black dark:text-white">
                {label}
              </FormLabel>
            )}
            <FormControl>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                value={inputValue}
                className={`${
                  error ? "border-2 border-[#f31260]" : ""
                } w-full rounded-md dark:bg-[#222224]`}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9,]/g, "");
                  setInputValue(raw);

                  const valor = parseFloat(raw.replace(",", "."));
                  if (!isNaN(valor)) {
                    field.onChange(valor);
                  } else {
                    field.onChange(null);
                  }
                }}
                onBlur={() => {
                  const valor = parseFloat(inputValue.replace(",", "."));
                  if (!isNaN(valor)) {
                    const final = valor.toFixed(2).replace(".", ",");
                    setInputValue(final);
                    field.onChange(valor);
                  } else {
                    setInputValue("0,00");
                    field.onChange(0);
                  }
                }}
                onFocus={() => {
                  // quitar formato al hacer foco (opcional)
                }}
              />
            </FormControl>
            <FormMessage className="error-text" />
          </FormItem>
        );
      }}
    />
  );
}
