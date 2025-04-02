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
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

// Definición del esquema para crear categorías
const createCategorySchema = z
  .object({
    nombre: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
      .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
        message: "El nombre solo puede contener letras y espacios",
      }),
    descripcion: z.string().optional(),
  })
  .superRefine(async (values, ctx) => {
    const { nombre } = values;
    try {
      const res = await fetch(
        `http://localhost:5000/categorias/verificar?nombre=${encodeURIComponent(
          nombre,
        )}`,
      );
      const data = await res.json();
      // Si data es true, significa que la categoría ya existe
      if (data === true) {
        ctx.addIssue({
          code: "custom",
          message: "La categoría ya se encuentra registrada",
          path: ["nombre"],
        });
      }
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: "Error al verificar la categoría",
        path: ["nombre"],
      });
    }
  });

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

interface CreateCategoryFormProps {
  onSuccess: (data: any) => void;
}

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  const onSubmit = async (values: CreateCategoryFormValues) => {
    // Actualiza las propiedades para que coincidan con lo que espera el backend.
    const payload = {
      nom_cate: values.nombre,
      desc_cate: values.descripcion,
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
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-[#4ADE80] bg-[#F0FFF4] p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <CheckCircle className="mt-1 h-6 w-6 text-[#166534]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#166534]">
                Mensaje Informativo
              </p>
              <p className="text-sm text-[#166534]/80">
                Categoría creada exitosamente.
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
      console.error("Error al crear la categoría:", err);
      toast.error("Error al crear la categoría");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campo: Nombre de la Categoría */}
        <FormField
          control={form.control}
          name="nombre"
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
                      : "dark:border dark:border-default-700"
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
          name="descripcion"
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
                      : "dark:border dark:border-default-700"
                  }`}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Botón de envío */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-[#f6b100] text-black">Crear Categoría</Button>
        </div>
      </form>
    </Form>
  );
}
