"use client";

import React from "react";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIP_PROD_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CampoSelectTipProdProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}

export const CampoSelectTipo: React.FC<CampoSelectTipProdProps> = ({
  control,
  name,
  label,
  placeholder,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium">{label}</label>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger
              className={cn(
                "w-full justify-between font-normal",
                error ? "border-2 border-[#f31260]" : "",
              )}
            >
              <SelectValue
                placeholder={placeholder || "Seleccione el tipo de producto"}
              />
            </SelectTrigger>
            <SelectContent>
              {TIP_PROD_OPTIONS.map((tipOpt) => (
                <SelectItem key={tipOpt.value} value={tipOpt.value}>
                  {tipOpt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="error-text mt-2 text-xs">{error.message}</p>}
        </div>
      )}
    />
  );
};
