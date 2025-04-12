"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { parse, format } from "date-fns";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Combobox, Option } from "@/components/shared/varios/combobox";
import { CampoFecha } from "../varios/campoFecha";

/* ================================================================
   ESQUEMA DEL FORMULARIO PARA EDITAR INSUMO
================================================================ */
const editInsumoSchema = z.object({
  nom_ins: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  und_ins: z.string().nonempty({
    message: "La unidad de medida es requerida.",
  }),
  stock_ins: z.coerce
    .number({ required_error: "El stock es requerido" })
    .nonnegative("El stock no puede ser negativo"),
  cost_uni_ins: z.coerce
    .number({ required_error: "El costo unitario es requerido" })
    .nonnegative("El costo unitario no puede ser negativo"),
  stock_min_ins: z.coerce
    .number({ required_error: "El stock mínimo es requerido" })
    .nonnegative("El stock mínimo no puede ser negativo"),
  fech_ven_ins: z.date({
    required_error: "La fecha de vencimiento es requerida",
  }),
});

export type EditInsumoFormValues = z.infer<typeof editInsumoSchema>;

interface EditInsumoFormProps {
  initialData: EditInsumoFormValues & {
    id_ins: string;
    fech_ven_ins: string | Date;
  };
  unitOptions: Option[];
  onSuccess: (data: any) => void;
}

export function EditInsumoForm({
  initialData,
  unitOptions,
  onSuccess,
}: EditInsumoFormProps) {
  // Convertir la fecha recibida a un objeto Date, asegurando que nunca sea undefined.
  const initialFecha =
    typeof initialData.fech_ven_ins === "string"
      ? parse(initialData.fech_ven_ins, "dd/MM/yyyy", new Date())
      : (initialData.fech_ven_ins ?? new Date());

  const form = useForm<EditInsumoFormValues>({
    resolver: zodResolver(editInsumoSchema),
    defaultValues: {
      ...initialData,
      fech_ven_ins: initialFecha,
    },
  });

  const onSubmit = async (values: EditInsumoFormValues) => {
    const formattedDate = format(values.fech_ven_ins, "dd/MM/yyyy");
    console.log(
      "Valor de costo ingresado:",
      values.cost_uni_ins,
      typeof values.cost_uni_ins,
    );

    const payload = {
      nom_ins: values.nom_ins,
      und_ins: values.und_ins,
      stock_ins: values.stock_ins,
      cost_uni_ins: values.cost_uni_ins, // Renombrado
      stock_min_ins: values.stock_min_ins,
      fech_ven_ins: formattedDate,
    };

    console.log("Payload a enviar:", payload);

    try {
      const res = await fetch(
        `http://localhost:5000/insumos/${initialData.id_ins}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      onSuccess(data);
      toast.custom(
        (t: any) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-[#4ADE80] bg-[#F0FFF4] p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <CheckCircle className="mt-1 h-6 w-6 text-[#166534]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#166534]">
                Insumo actualizado exitosamente.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
              <div className="progress-bar h-full bg-[#4ADE80]" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
    } catch (err) {
      console.error("Error al actualizar el insumo:", err);
      toast.error("Error al actualizar el insumo");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campo 1: Nombre del Insumo */}
        <FormField
          control={form.control}
          name="nom_ins"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Nombre del Insumo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Pollos, Papas, etc."
                  {...field}
                  className={`pr-10 dark:bg-[#09090b] ${
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

        {/* Campo 2: Unidad de Medida */}
        <FormField
          control={form.control}
          name="und_ins"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Unidad de Medida
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Combobox
                    items={unitOptions}
                    value={field.value ? String(field.value) : ""}
                    onChange={field.onChange}
                    placeholder="Selecciona una unidad"
                    className={`w-full pr-10 dark:bg-[#09090b] ${
                      error
                        ? "border-2 border-[var(--error-per)]"
                        : "dark:border-default-700 dark:border"
                    }`}
                  />
                </div>
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Campo 3: Stock Actual */}
        <FormField
          control={form.control}
          name="stock_ins"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Stock Actual
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese el stock actual"
                  type="number"
                  {...field}
                  className={`pr-10 dark:bg-[#09090b] ${
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

        {/* Campo 4: Costo Unitario */}
        <FormField
          control={form.control}
          name="cost_uni_ins"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Costo Unitario
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese el costo unitario"
                  type="number"
                  step="0.01"
                  {...field}
                  className={`pr-10 dark:bg-[#09090b] ${
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

        {/* Campo 5: Stock Mínimo */}
        <FormField
          control={form.control}
          name="stock_min_ins"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Stock Mínimo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese el stock mínimo"
                  type="number"
                  {...field}
                  className={`pr-10 dark:bg-[#09090b] ${
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

        {/* Campo 6: Fecha de Vencimiento */}
        <FormField
          control={form.control}
          name="fech_ven_ins"
          render={({ fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Fecha de Vencimiento
              </FormLabel>
              <FormControl>
                <CampoFecha
                  control={form.control}
                  name="fech_ven_ins"
                  label=""
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Botón de envío */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-[#f6b100] text-black">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
