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
import { UNIT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CampoSelectUnidadProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CampoSelectUnidad: React.FC<CampoSelectUnidadProps> = ({
  control,
  name,
  label,
  placeholder,
  disabled,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium">{label}</label>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "w-full justify-between font-normal",
                error ? "border-2 border-[#f31260]" : "",
              )}
            >
              <SelectValue
                placeholder={placeholder || "Seleccione una unidad"}
              />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((unidad) => (
                <SelectItem key={unidad.value} value={unidad.value} className="cursor-pointer hover:bg-gray-100 focus:bg-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-800">
                  {unidad.label}
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
