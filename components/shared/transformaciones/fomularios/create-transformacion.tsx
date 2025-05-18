"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { SERVICIOS_RECETAS } from "@/services/recetas.service";
import { SERVICIOS_TRANSFORMACIONES } from "@/services/transformaciones.service";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { CampoReceta } from "@/components/shared/transformaciones/ui/campoReceta";
import { CampoNumero } from "@/components/shared/transformaciones/ui/campoNumero";

const schema = z.object({
  receta: z.string().min(1, { message: "Seleccione una receta." }),
  cantidad: z
    .string()
    .min(1, { message: "Ingrese una cantidad válida." })
    .refine((val) => parseFloat(val) > 0, {
      message: "La cantidad debe ser mayor a 0",
    }),
});

type FormValues = z.infer<typeof schema>;

export function FormTransformacion({
  onSuccess,
  onClose,
}: {
  onSuccess?: () => void | Promise<void>;
  onClose?: () => void;
}) {
  const [recetas, setRecetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      receta: "",
      cantidad: "",
    },
  });

  useEffect(() => {
    const fetchRecetas = async () => {
      try {
        const res = await fetch(SERVICIOS_RECETAS.listar);
        const data = await res.json();
        setRecetas(data);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar recetas");
      }
    };
    fetchRecetas();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        rece_trans: parseInt(values.receta),
        cant_prod_trans: parseFloat(values.cantidad),
        usu_trans: 1,
      };

      const res = await fetch(SERVICIOS_TRANSFORMACIONES.crear, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Error al registrar transformación",
        );
      }

      ToastSuccess({ message: "Transformación registrada correctamente" });

      if (onSuccess) {
        await Promise.resolve(onSuccess());
      }

      form.reset();
    } catch (err: any) {
      ToastError({
        message: err.message || "Error al registrar transformación",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CampoReceta
          control={form.control}
          name="receta"
          label="Receta"
          recetas={recetas}
        />

        <CampoNumero
          control={form.control}
          name="cantidad"
          label="Cantidad a producir"
          placeholder="Ej. 10"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => {
              form.reset();
              if (onClose) onClose();
            }}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
