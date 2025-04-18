"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CampoTextAreaProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
}

export const CampoTextArea: React.FC<CampoTextAreaProps> = ({
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
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor={name}>{label}</Label>
          <Textarea
            id={name}
            placeholder={placeholder || "Ingrese su texto aquí..."}
            className={cn(
              " w-full resize-none",
              error ? "border-2 border-[#f31260]" : "",
            )}
            {...field}
          />
          {error && (
            <p className="error-text text-xs text-red-500">{error.message}</p>
          )}
        </div>
      )}
    />
  );
};
