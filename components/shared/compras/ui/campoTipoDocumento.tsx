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
import { TIPO_DOCUMENTO_OPTIONS } from "@/lib/constants";

interface CampoTipoDocumentoProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}

export const CampoTipoDocumento: React.FC<CampoTipoDocumentoProps> = ({
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
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger
                className={cn(
                  "w-full justify-between font-normal dark:bg-[#222224]",
                  error ? "border-2 border-[#f31260]" : "",
                )}
              >
                <SelectValue
                  placeholder={placeholder || "Seleccione tipo de documento"}
                />
              </SelectTrigger>
              <SelectContent>
                {TIPO_DOCUMENTO_OPTIONS.map((doc) => (
                  <SelectItem key={doc.value} value={doc.value}>
                    {doc.label}
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
