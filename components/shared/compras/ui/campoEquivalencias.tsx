"use client";

import { useEffect, useState } from "react";
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
import { Control, FieldValues, Path } from "react-hook-form";
import { SERVICIOS_EQUIVALENCIAS } from "@/services/equivalencias.service";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket"; // 👈 Importar el hook

interface EquivalenciaItem {
  id_equiv: number;
  und_prod_equiv: string;
  prod_equiv: {
    nom_prod: string;
    und_prod: string;
  };
}

interface CampoSelectEquivalenciaProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  productoId: string | number;
  label?: string;
  disabled?: boolean;
}

export function CampoSelectEquivalencia<T extends FieldValues>({
  control,
  name,
  productoId,
  label = "Unidad equivalente",
  disabled = false,
}: CampoSelectEquivalenciaProps<T>) {
  const [equivalencias, setEquivalencias] = useState<EquivalenciaItem[]>([]);

  // Función para cargar equivalencias
  const fetchEquivalencias = async () => {
    try {
      if (!productoId) return;
      const res = await fetch(
        SERVICIOS_EQUIVALENCIAS.porProducto(Number(productoId)),
      );
      if (!res.ok) throw new Error("Error al cargar equivalencias");
      const data = await res.json();
      setEquivalencias(data);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar las equivalencias");
    }
  };

  // Al cargar o cambiar producto
  useEffect(() => {
    fetchEquivalencias();
  }, [productoId]);

  // 👇 Socket para escuchar actualizaciones
  useSocket("equivalencias-actualizadas", () => {
    console.log("🔁 Equivalencias actualizadas vía socket");
    fetchEquivalencias();
  });

  if (!productoId || equivalencias.length === 0) return null;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona unidad" />
              </SelectTrigger>
              <SelectContent>
                {equivalencias.map((eq) => (
                  <SelectItem key={eq.id_equiv} value={eq.und_prod_equiv}>
                    {`${eq.prod_equiv.nom_prod} → ${eq.prod_equiv.und_prod} → ${eq.und_prod_equiv}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
