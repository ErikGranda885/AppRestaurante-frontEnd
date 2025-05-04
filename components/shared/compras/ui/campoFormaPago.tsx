"use client";

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FORMA_PAGO_OPTIONS } from "@/lib/constants";

interface CampoFormaPagoProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}

export const CampoFormaPago: React.FC<CampoFormaPagoProps> = ({
  control,
  name,
  label,
  placeholder,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel className="text-black dark:text-white">{label}</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className={cn(
                  "w-full justify-between font-normal dark:bg-[#222224]",
                  error ? "border-2 border-[#f31260]" : "",
                )}
              >
                <SelectValue
                  placeholder={placeholder || "Seleccione forma de pago"}
                />
              </SelectTrigger>
              <SelectContent>
                {FORMA_PAGO_OPTIONS.map((forma) => (
                  <SelectItem key={forma.value} value={forma.value}>
                    {forma.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage className="error-text" />
        </FormItem>
      )}
    />
  );
};
