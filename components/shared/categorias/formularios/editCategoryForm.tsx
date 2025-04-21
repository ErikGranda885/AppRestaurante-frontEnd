"use client";
import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";

// Declaramos un ref para almacenar el nombre inicial y así evitar la validación si no ha cambiado
const initialDataCorreoRef = { current: "" };

const editCategorySchemaBase = z.object({
  nom_cate: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    })
    .refine(
      async (nombre: string) => {
        if (nombre === initialDataCorreoRef.current) return true;
        const res = await fetch(
          `http://localhost:5000/categorias/verificar?nombre=${encodeURIComponent(nombre)}`,
        );
        const data = await res.json();
        return !data.exists;
      },
      {
        message: "El nombre de la categoría ya se encuentra registrado",
        async: true,
      } as any,
    ),
  desc_cate: z.string().optional(),
});

export type EditCategoryFormValues = z.infer<typeof editCategorySchemaBase>;

interface EditCategoryFormProps {
  initialData: EditCategoryFormValues & { id_cate: number };
  onSuccess: (data: any) => void;
}

export function EditCategoryForm({
  initialData,
  onSuccess,
}: EditCategoryFormProps) {
  // Actualizamos el ref con el valor inicial de "nom_cate" para comparar en la validación asíncrona
  React.useEffect(() => {
    initialDataCorreoRef.current = initialData.nom_cate;
  }, [initialData.nom_cate]);

  const form = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchemaBase),
    defaultValues: initialData,
  });

  const onSubmit = async (values: EditCategoryFormValues) => {
    // Armamos el payload según lo que espera el backend
    const payload = {
      nom_cate: values.nom_cate,
      desc_cate: values.desc_cate,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/categorias/${initialData.id_cate}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        // Intentamos extraer el mensaje de error de la respuesta
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || `Error: ${res.status}`);
      }
      const data = await res.json();
      onSuccess(data);
      ToastSuccess({
        message: "Categoría actualizada correctamente",
      });
    } catch (err: any) {
      console.error("Error al actualizar la categoría:", err);
      ToastError({
        message: `Error al actualizar la categoría: ${err.message}`,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campo para el nombre de la categoría */}
        <FormField
          control={form.control}
          name="nom_cate"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Nombre de la Categoría
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Electrónica"
                  {...field}
                  className={`pr-10 dark:bg-[#09090b] ${
                    error
                      ? "border-2 border-[var(--error-per)]"
                      : "dark:border-0"
                  }`}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Campo para la descripción (opcional) */}
        <FormField
          control={form.control}
          name="desc_cate"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Descripción
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa una breve descripción..."
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

        <div className="flex justify-end pt-4">
          <Button type="submit" className="text-black">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
