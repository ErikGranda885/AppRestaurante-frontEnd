"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

// Definición del esquema para crear categorías
const createCategorySchema = z.object({
  nom_cate: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    })
    .refine(
      ((nombre: string) => {
        return fetch(
          `http://localhost:5000/categorias/verificar?nombre=${encodeURIComponent(nombre)}`,
        )
          .then((res) => res.json())
          .then((data) => !data.exists);
      }) as (nombre: string) => Promise<boolean>,
      {
        message: "El nombre de la categoria ya se encuentra resgistrado",
        async: true,
      } as any,
    ),
  desc_cate: z.string().optional(),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

interface CreateCategoryFormProps {
  onSuccess: (data: any) => void;
}

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      nom_cate: "",
      desc_cate: "",
    },
  });

  const onSubmit = async (values: CreateCategoryFormValues) => {
    // Actualiza las propiedades para que coincidan con lo que espera el backend.
    const payload = {
      nom_cate: values.nom_cate,
      desc_cate: values.desc_cate,
    };

    try {
      const res = await fetch("http://localhost:5000/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      onSuccess(data);
      form.reset();
      ToastSuccess({
        message: "Categoría creada correctamente",
      });
    } catch (err) {
      console.error("Error al crear la categoría:", err);
      ToastError({
        message: "Error al crear la categoría",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campo: nom_cate de la Categoría */}
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
                      : "dark:border-default-700 dark:border"
                  }`}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Campo: Descripción (opcional) */}
        <FormField
          control={form.control}
          name="desc_cate"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Descripción (opcional)
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

        {/* Botón de envío */}
        <div className="flex justify-end pt-4">
          <Button type="submit">Crear Categoría</Button>
        </div>
      </form>
    </Form>
  );
}
