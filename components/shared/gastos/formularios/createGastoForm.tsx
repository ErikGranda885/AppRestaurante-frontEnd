"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { useGastos } from "@/hooks/gastos/useGastos";
import { safePrice } from "@/utils/format";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";

// Esquema de validación
const gastoSchema = z.object({
  desc_gas: z
    .string()
    .min(2, { message: "La descripción debe tener al menos 2 caracteres." }),
  mont_gas: z
    .number({ invalid_type_error: "El monto debe ser un número válido." })
    .positive({ message: "El monto debe ser positivo." }),
  obs_gas: z.string().optional(),
});

// Tipado
type GastoFormValues = z.infer<typeof gastoSchema>;

export interface CreateGastoFormProps {
  onSuccess?: () => void;
}

export function CreateGastoForm({ onSuccess }: CreateGastoFormProps) {
    const { ventasConfig } = useConfiguracionesVentas();
  const [montoTexto, setMontoTexto] = React.useState<string>("");
  const form = useForm<GastoFormValues>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      desc_gas: "",
      mont_gas: 0,
      obs_gas: "",
    },
  });

  const { crearGasto } = useGastos();

  const onSubmit = async (values: GastoFormValues) => {
    try {
      const now = new Date();
      const fechaFormateada = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(
        now.getHours(),
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds(),
      ).padStart(2, "0")}`;

      const payload = {
        desc_gas: values.desc_gas,
        mont_gas: values.mont_gas,
        fech_gas: fechaFormateada,
        obs_gas: values.obs_gas ?? "",
      };

      await crearGasto(payload);

      ToastSuccess({ message: "Gasto creado correctamente." });
      form.reset();
      onSuccess && onSuccess();
    } catch (error) {
      ToastError({
        message:
          error instanceof Error
            ? error.message
            : "Error al registrar el gasto.",
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
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Descripción
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Compra de insumos"
                  {...field}
                  className={`dark:bg-[#09090b] ${
                    error
                      ? "border-2 border-[var(--error-per)]"
                      : "dark:border-default-700 dark:border"
                  }`}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Campo: Monto */}
        <FormField
          control={form.control}
          name="mont_gas"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Monto
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="0.00"
                  value={
                    montoTexto ||
                    (field.value ? `$${field.value.toFixed(2)}` : "")
                  }
                  onChange={(e) => {
                    const input = e.target.value.replace(/[^\d.]/g, ""); // Permitimos solo dígitos y punto
                    setMontoTexto(input); // Actualiza el texto mostrado

                    const parsed = parseFloat(input);
                    if (!isNaN(parsed)) {
                      field.onChange(parsed);
                    } else {
                      field.onChange(0);
                    }
                  }}
                  onBlur={() => {
                    if (field.value !== undefined) {
                      setMontoTexto(
                        safePrice(field.value, ventasConfig.moneda),
                      );
                    }
                  }}
                  className={`dark:bg-[#09090b] ${
                    error
                      ? "border-2 border-[var(--error-per)]"
                      : "dark:border-default-700 dark:border"
                  }`}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Campo: Observaciones */}
        <FormField
          control={form.control}
          name="obs_gas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Observaciones (opcional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Compra urgente"
                  {...field}
                  className="dark:border-default-700 dark:border dark:bg-[#09090b]"
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Botón */}
        <div className="flex justify-end pt-4">
          <Button type="submit">Registrar Gasto</Button>
        </div>
      </form>
    </Form>
  );
}
