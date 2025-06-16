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
  placeholder?: string;
}

export const CampoCategoria: React.FC<CampoCategoriaProps> = ({
  control,
  name,
  label,
  options,
  placeholder,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium">{label}</label>
          <Select value={field.value || ""} onValueChange={field.onChange}>
            <SelectTrigger
              className={cn(
                "w-full justify-between font-normal",
                error ? "border-2 border-[#f31260]" : "",
              )}
            >
              <SelectValue
                placeholder={placeholder || "Selecciona categoría"}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) =>
                option.value !== "" ? (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-800"
                  >
                    {option.label}
                  </SelectItem>
                ) : null,
              )}
            </SelectContent>
          </Select>
          {error && <p className="error-text mt-2 text-xs">{error.message}</p>}
        </div>
      )}
    />
  );
};
