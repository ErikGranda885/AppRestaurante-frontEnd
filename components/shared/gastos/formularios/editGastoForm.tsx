"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { z } from "zod";
import { SERVICIOS_GASTOS } from "@/services/gastos.service";

// Esquema de validación
const editGastoSchema = z.object({
  id_gas: z.number(),
  desc_gas: z.string().min(1, { message: "La descripción es obligatoria" }),
  mont_gas: z.number().min(0, { message: "El monto debe ser mayor o igual a 0" }),
  obs_gas: z.string().optional(),
});

type EditGastoFormValues = z.infer<typeof editGastoSchema>;

export interface EditGastoFormProps {
  gasto: EditGastoFormValues;
  onSuccess?: (gastoActualizado: EditGastoFormValues) => void;
}

export function EditGastoForm({ gasto, onSuccess }: EditGastoFormProps) {
  const form = useForm<EditGastoFormValues>({
    resolver: zodResolver(editGastoSchema),
    defaultValues: gasto,
  });

  const onSubmit = async (values: EditGastoFormValues) => {
    try {
      const payload = {
        desc_gas: values.desc_gas,
        mont_gas: values.mont_gas,
        obs_gas: values.obs_gas ?? "",
      };

      const res = await fetch(SERVICIOS_GASTOS.actualizar(values.id_gas), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }

      ToastSuccess({ message: "Gasto actualizado correctamente." });
      form.reset();
      onSuccess?.({
        id_gas: values.id_gas,
        ...payload,
      });
    } catch (error) {
      ToastError({
        message: error instanceof Error ? error.message : "Error al actualizar el gasto.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo: Descripción */}
        <FormField
          control={form.control}
          name="desc_gas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Descripción</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Compra de insumos"
                  {...field}
                  className="dark:border-default-700 dark:border dark:bg-[#09090b]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo: Monto */}
        <FormField
          control={form.control}
          name="mont_gas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : parseFloat(value));
                  }}
                  className="dark:border-default-700 dark:border dark:bg-[#09090b]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo: Observaciones */}
        <FormField
          control={form.control}
          name="obs_gas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Observaciones</FormLabel>
              <FormControl>
                <Input
                  placeholder="Opcional"
                  {...field}
                  className="dark:border-default-700 dark:border dark:bg-[#09090b]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón de Guardar */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="text-sm">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
