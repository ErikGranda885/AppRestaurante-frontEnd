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
import { ToastSuccess } from "../toast/toastSuccess";
import { ToastError } from "../toast/toastError";

// Esquema base para editar categorías
const editCategorySchemaBase = z.object({
  nom_cate: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    }),
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
  // Guardamos el nombre inicial en un ref para comparar si se modifica
  const initialCategoryNameRef = React.useRef(initialData.nom_cate);
  React.useEffect(() => {
    initialCategoryNameRef.current = initialData.nom_cate;
  }, [initialData.nom_cate]);

  const schema = React.useMemo(() => {
    return editCategorySchemaBase.superRefine(async (values, ctx) => {
      const newName = values.nom_cate.trim().toLowerCase();
      const initialName = initialCategoryNameRef.current.trim().toLowerCase();

      // Solo consultamos si el nombre cambió de verdad
      if (newName !== initialName) {
        try {
          const url = `http://localhost:5000/categorias/verificar?nom_cate=${encodeURIComponent(
            values.nom_cate.trim(),
          )}`;
          console.log(
            "[EditCategory] Verificando nombre:",
            values.nom_cate.trim(),
          );
          console.log("[EditCategory] URL de verificación:", url);

          const res = await fetch(url);
          console.log("[EditCategory] Status fetch:", res.status);
          const exists = await res.json();
          console.log(
            "[EditCategory] Respuesta del servidor (exists):",
            exists,
          );

          if (exists === true) {
            console.warn("[EditCategory] El servidor indica que ya existe");
            ctx.addIssue({
              code: "custom",
              message: "La categoría ya se encuentra registrada",
              path: ["nom_cate"],
            });
          }
        } catch (err) {
          console.error("[EditCategory] Error al verificar categoría:", err);
          ctx.addIssue({
            code: "custom",
            message: "Error al verificar la categoría",
            path: ["nom_cate"],
          });
        }
      } else {
        console.log(
          "[EditCategory] Nombre sin cambios, no verifico en servidor",
        );
      }
    });
  }, [initialData.nom_cate]);

  const form = useForm<EditCategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: EditCategoryFormValues) => {
    // Armamos el payload con los campos que espera el backend
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
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      onSuccess(data);
      ToastSuccess({
        message: "Categoría actualizada correctamente",
      });
    } catch (err) {
      console.error("Error al actualizar la categoría:", err);
      ToastError({
        message: "Error al actualizar la categoría",
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
          <Button type="submit" className="bg-[#f6b100] text-black">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
