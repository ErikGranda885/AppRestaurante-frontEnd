"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, Controller } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 🎯 Esquema de validación
const ventasConfigSchema = z.object({
  porcentaje_iva: z
    .number({
      required_error: "Porcentaje de IVA requerido",
      invalid_type_error: "Debe ser un número",
    })
    .int("Debe ser un número entero")
    .min(1, "Debe ser mayor que 0")
    .max(99, "Máximo 2 dígitos"),

  minimo_stock_alerta: z
    .number({
      required_error: "Mínimo de stock requerido",
      invalid_type_error: "Debe ser un número",
    })
    .int("Debe ser un número entero")
    .min(1, "Debe ser mayor que 0")
    .max(99, "Máximo 2 dígitos"),

  moneda: z.string().nonempty("Debe seleccionar una moneda válida"),
});

type VentasConfigFormValues = z.infer<typeof ventasConfigSchema>;

export function VentasConfiguracion() {
  const { ventasConfig, updateConfiguracion, loading } =
    useConfiguracionesVentas();
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<VentasConfigFormValues>({
    resolver: zodResolver(ventasConfigSchema),
    defaultValues: {
      porcentaje_iva: ventasConfig.porcentaje_iva ?? 12,
      minimo_stock_alerta: ventasConfig.minimo_stock_alerta ?? 10,
      moneda: ventasConfig.moneda ?? "",
    },
  });

  useEffect(() => {
    if (!loading && ventasConfig) {
      methods.reset({
        porcentaje_iva: ventasConfig.porcentaje_iva ?? 12,
        minimo_stock_alerta: ventasConfig.minimo_stock_alerta ?? 10,
        moneda: ventasConfig.moneda ?? "",
      });
    }
  }, [ventasConfig, loading, methods]);

  const onSubmit = async (data: VentasConfigFormValues) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await updateConfiguracion("porcentaje_iva", data.porcentaje_iva);
      await updateConfiguracion("moneda", data.moneda);
      await updateConfiguracion(
        "minimo_stock_alerta",
        data.minimo_stock_alerta,
      );
      ToastSuccess({ message: "Configuración guardada correctamente." });
    } catch {
      ToastError({ message: "Error al guardar configuración." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  if (loading) return <div>Cargando configuración de ventas...</div>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
          <h3 className="text-lg font-semibold">Configuración de Ventas</h3>
          <p className="text-sm text-muted-foreground">
            Personaliza las opciones y reglas para las ventas del restaurante.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-between space-y-4">
              {/* Porcentaje IVA */}
              <FormField
                control={methods.control}
                name="porcentaje_iva"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Porcentaje de IVA (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        inputMode="numeric"
                        value={field.value?.toString() ?? ""}
                        placeholder="Ej: 12"
                        minLength={2}
                        className={`${
                          error ? "border-2 border-[#f31260]" : ""
                        } w-full rounded-md dark:bg-[#222224]`}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]|Backspace|Tab|ArrowLeft|ArrowRight|Delete/.test(
                              e.key,
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .replace(/^0+/, ""); // solo dígitos, sin ceros iniciales
                          field.onChange(
                            val === "" ? "" : parseInt(val.slice(0, 2), 10),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage className="error-text" />
                  </FormItem>
                )}
              />

              {/* Moneda */}
              <FormField
                control={methods.control}
                name="moneda"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className={`mt-1 block w-full rounded-md p-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                          error ? "border-2 border-[#f31260]" : "border-input"
                        }`}
                      >
                        <option value="">-- selecciona una moneda --</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="PEN">PEN (S/)</option>
                        <option value="MXN">MXN (MX$)</option>
                        <option value="COP">COP (COL$)</option>
                      </select>
                    </FormControl>
                    <FormMessage className="error-text" />
                  </FormItem>
                )}
              />

              {/* Mínimo stock alerta */}
              <FormField
                control={methods.control}
                name="minimo_stock_alerta"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Mínimo de stock para alerta
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        inputMode="numeric"
                        value={field.value?.toString() ?? ""}
                        placeholder="Ej: 10"
                        maxLength={2}
                        className={`${
                          error ? "border-2 border-[#f31260]" : ""
                        } w-full rounded-md dark:bg-[#222224]`}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]|Backspace|Tab|ArrowLeft|ArrowRight|Delete/.test(
                              e.key,
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .replace(/^0+/, "");
                          field.onChange(
                            val === "" ? "" : parseInt(val.slice(0, 2), 10),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage className="error-text" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-end space-x-4">
          <Button type="submit" disabled={isSaving} aria-disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>

          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            disabled={isSaving}
            aria-disabled={isSaving}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
