"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { CampoTexto } from "@/components/shared/varios/campoTexto";
import { CampoProducto } from "@/components/shared/compras/ui/campoProducto";
import { Button } from "@/components/ui/button";
import { useProductos } from "@/hooks/compras/useProductos";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { useState } from "react";
import { IReceta } from "@/lib/types";

const esquemaReceta = z.object({
  nom_rec: z.string().min(1, "Ingrese el nombre de la receta"),
  desc_rec: z.string().min(1, "Ingrese la descripción de la receta"),
  prod_rec: z.string().min(1, "Seleccione un producto final"),
});

type FormReceta = z.infer<typeof esquemaReceta>;

export function FormCrearReceta({
  onSuccess,
}: {
  onSuccess: (data: IReceta) => void;
}) {
  const form = useForm<FormReceta>({
    resolver: zodResolver(esquemaReceta),
    defaultValues: {
      nom_rec: "",
      desc_rec: "",
      prod_rec: "",
    },
  });

  const { control, setValue, handleSubmit, reset } = form;
  const { productosOptions, setProductosOptions } = useProductos();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormReceta) => {
    setLoading(true);
    try {
      const payload = {
        nom_rec: data.nom_rec,
        desc_rec: data.desc_rec,
        prod_rec: Number(data.prod_rec),
      };

      const res = await fetch("http://localhost:5000/recetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al crear receta");

      const recetaCreada = await res.json();
      ToastSuccess({ message: "Receta creada exitosamente" });
      reset();
      onSuccess(recetaCreada);
    } catch (error: any) {
      ToastError({ message: error.message || "Error inesperado" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <div className="col-span-2">
          <CampoTexto
            control={control}
            name="nom_rec"
            label="Nombre de la receta"
            placeholder="Ej. Papipollo"
          />
        </div>

        <div className="col-span-2">
          <CampoTexto
            control={control}
            name="desc_rec"
            label="Descripción"
            placeholder="Ej. Producto preparado para venta"
          />
        </div>

        <div className="col-span-2">
          <CampoProducto
            control={control}
            setValue={setValue}
            name="prod_rec"
            label="Producto Final"
            options={productosOptions}
            setOptions={setProductosOptions}
          />
        </div>

        <div className="col-span-2 mt-4 flex justify-end gap-4">
          <Button type="reset" variant="secondary" onClick={() => reset()}>
            Limpiar
          </Button>
          <Button type="submit" disabled={loading}>
            Crear Receta
          </Button>
        </div>
      </form>
    </Form>
  );
}
