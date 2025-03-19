"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle } from "lucide-react";

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

// Esquema base para editar categorías
const editCategorySchemaBase = z.object({
  nombre: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    }),
  descripcion: z.string().optional(),
});

export type EditCategoryFormValues = z.infer<typeof editCategorySchemaBase>;

interface EditCategoryFormProps {
  initialData: EditCategoryFormValues & { id: string };
  onSuccess: (data: any) => void;
}

export function EditCategoryForm({
  initialData,
  onSuccess,
}: EditCategoryFormProps) {
  // Guardamos el nombre inicial en un ref para comparar si se modifica
  const initialCategoryNameRef = React.useRef(initialData.nombre);
  React.useEffect(() => {
    initialCategoryNameRef.current = initialData.nombre;
  }, [initialData.nombre]);

  // Creamos el esquema con validación asíncrona: si se modificó el nombre,
  // se verifica si ya existe esa categoría.
  const schema = React.useMemo(() => {
    return editCategorySchemaBase.superRefine(async (values, ctx) => {
      if (values.nombre !== initialCategoryNameRef.current) {
        try {
          const res = await fetch(
            `http://localhost:5000/categorias/verificar?nombre=${encodeURIComponent(
              values.nombre,
            )}`,
          );
          const data = await res.json();
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
      }
    });
  }, [initialData.nombre]);

  const form = useForm<EditCategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: EditCategoryFormValues) => {
    // Armamos el payload con los nombres que espera el backend: nom_cate y desc_cate
    const payload = {
      nom_cate: values.nombre,
      desc_cate: values.descripcion,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/categorias/${initialData.id}`,
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
                Categoría actualizada exitosamente.
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
      console.error("Error al actualizar la categoría:", err);
      toast.error("Error al actualizar la categoría");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campo: Nombre de la Categoría */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Nombre de la Categoría
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Electrónica"
                  {...field}
                  className="dark:border dark:border-default-700 dark:bg-[#09090b]"
                />
              </FormControl>
              <FormMessage className="text-danger-500" />
            </FormItem>
          )}
        />

        {/* Campo: Descripción (opcional) */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Descripción
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa una breve descripción..."
                  {...field}
                  className="dark:border dark:border-default-700 dark:bg-[#09090b]"
                />
              </FormControl>
              <FormMessage className="text-danger-500" />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </Form>
  );
}
