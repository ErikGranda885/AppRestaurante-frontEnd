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

interface CampoSelectUnidadProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}

export const CampoSelectUnidad: React.FC<CampoSelectUnidadProps> = ({
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
          <label className="mb-1 font-semibold">{label}</label>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={placeholder || "Seleccione una unidad"}
              />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((unidad) => (
                <SelectItem key={unidad.value} value={unidad.value}>
                  {unidad.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
};
