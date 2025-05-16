"use client";

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path } from "react-hook-form";
import { useState } from "react";
import { safePrice } from "@/utils/format";
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
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          {label && <FormLabel className="text-black dark:text-white ">{label}</FormLabel>}
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
                const raw = e.target.value
                  .replace(/[^\d,\.]/g, "")
                  .replace(",", ".");

                setInputValue(raw);
                const parsed = Number(raw);
                if (!isNaN(parsed)) {
                  field.onChange(parsed);
                }
              }}
              onBlur={() => {
                const parsed = Number(inputValue.replace(",", "."));
                const valorFinal = !isNaN(parsed) ? parsed : 0;
                setInputValue(
                  safePrice(valorFinal, ventasConfig.moneda ?? "USD", "es-EC"),
                );
                field.onChange(valorFinal);
              }}
              onFocus={() => {
                if (typeof field.value === "number") {
                  setInputValue(field.value.toString().replace(".", ","));
                }
              }}
            />
          </FormControl>
          <FormMessage className="error-text"/>
        </FormItem>
      )}
    />
  );
}
