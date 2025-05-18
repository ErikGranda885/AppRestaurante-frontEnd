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
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Receta {
  id_rec: number;
  prod_rec: {
    img_prod: string;
    nom_prod: string;
  };
}

interface CampoRecetaProps {
  control: any;
  name: string;
  label: string;
  recetas: Receta[];
  placeholder?: string;
}

export const CampoReceta: React.FC<CampoRecetaProps> = ({
  control,
  name,
  label,
  recetas,
  placeholder = "Selecciona una receta",
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
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {recetas.map((rec) => (
                  <SelectItem
                    key={rec.id_rec}
                    value={String(rec.id_rec)}
                    className="flex items-center gap-2 py-2"
                  >
                    <div className="flex gap-2">
                      <div className="relative h-6 w-6 overflow-hidden rounded">
                        <Image
                          src={rec.prod_rec?.img_prod}
                          alt={rec.prod_rec?.nom_prod || "Producto"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{rec.prod_rec?.nom_prod || "Sin producto"}</span>
                    </div>
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
