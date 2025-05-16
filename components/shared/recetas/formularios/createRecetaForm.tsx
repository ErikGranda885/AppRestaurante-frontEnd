"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { CampoTexto } from "@/components/shared/varios/campoTexto";
import { CampoProducto } from "@/components/shared/compras/ui/campoProducto";
import { Button } from "@/components/ui/button";
import { useProductos } from "@/hooks/compras/useProductos";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { useEffect, useState } from "react";
import { IReceta, IRecetaForm } from "@/lib/types";
import { SERVICIOS_RECETAS } from "@/services/recetas.service";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CampoSelectUnidad } from "../../productos/ui/campoSelectUnidad";
import { useInsumos } from "@/hooks/recetas/useInsumos";
import { CampoNumero } from "../../varios/campoNumero";
import { CampoMoneda } from "../ui/campoMoneda";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";

const esquemaReceta = z.object({
  nom_rec: z.string().min(1, "Nombre requerido"),
  desc_rec: z.string().min(1, "Ingrese la descripción de la receta"),
  prod_rec: z.string().min(1, "Seleccione un producto final"),
  pvp_rec: z.number().min(0.01, "PVP inválido"),
  ingredientes: z
    .array(
      z.object({
        prod_rec: z.string().min(1, "Seleccione un producto"),
        cant_rec: z.number().min(0.01, "Cantidad inválida"),
        und_prod_rec: z.string().min(1, "Unidad requerida"),
      }),
    )
    .min(1, "Debe agregar al menos un ingrediente"),
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
      ingredientes: [],
    },
  });

  const { control, setValue, handleSubmit, reset } = form;
  const {
    productosOptions: productosFinales,
    setProductosOptions: setProductosFinales,
  } = useProductos();
  const {
    productosOptions: productosInsumos,
    setProductosOptions: setProductosInsumos,
  } = useInsumos();
  const [loading, setLoading] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredientes",
  });

  // ⬇️ Aquí colocas el useEffect
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "prod_rec") {
        const seleccionado = productosFinales.find(
          (p) => p.value === value.prod_rec,
        );
        if (seleccionado) {
          setValue("nom_rec", seleccionado.nombre); // ← aquí se asigna automáticamente
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, productosFinales, setValue]);

  const onSubmit = async (data: IRecetaForm) => {
    setLoading(true);
    try {
      // 🔽 MODIFICACIÓN AQUÍ
      const payloadReceta = {
        nom_rec: data.nom_rec,
        desc_rec: data.desc_rec,
        prod_rec: Number(data.prod_rec),
        ingredientes: data.ingredientes.map((ing) => ({
          prod_rec: Number(ing.prod_rec),
          cant_rec: ing.cant_rec,
          und_prod_rec: ing.und_prod_rec,
        })),
      };

      const res = await fetch(SERVICIOS_RECETAS.crear, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadReceta),
      });

      if (!res.ok) throw new Error("Error al crear receta");

      // ✅ Nueva llamada para actualizar el precio del producto
      await fetch(
        SERVICIOS_PRODUCTOS.actualizarProducto(Number(data.prod_rec)),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prec_vent_prod: data.pvp_rec,
          }),
        },
      );

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
        className="grid gap-6 md:grid-cols-[minmax(250px,300px)_1fr]"
      >
        {/* Columna izquierda */}
        <div className="flex flex-col gap-4">
          <CampoProducto
            control={control}
            setValue={setValue}
            name="prod_rec"
            label="Producto Final"
            options={productosFinales}
            setOptions={setProductosFinales}
          />
          <CampoTexto
            control={control}
            name="desc_rec"
            label="Descripción"
            placeholder="Ej. Producto preparado para venta"
          />

          <CampoMoneda
            control={control}
            name="pvp_rec"
            label="Precio de Venta (PVP)"
            placeholder="Ej. $5.00"
          />
        </div>

        {/* Columna derecha: Ingredientes con scroll */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Ingredientes</h3>
          <ScrollArea className="max-h-[190px] rounded-md border p-2 pr-4">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left">Producto</th>
                  <th className="pb-2">Cantidad</th>
                  <th className="pb-2">Unidad</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fields.map((field, index) => (
                  <tr key={field.id} className="align-middle">
                    <td className="pr-2">
                      <CampoProducto
                        control={control}
                        setValue={setValue}
                        name={`ingredientes.${index}.prod_rec`}
                        options={productosInsumos}
                        setOptions={setProductosInsumos}
                        label=""
                      />
                    </td>
                    <td className="w-[100px] px-1">
                      <CampoNumero
                        control={control}
                        name={`ingredientes.${index}.cant_rec`}
                        placeholder="Ej. 250"
                        label=""
                      />
                    </td>
                    <td className="w-[120px] px-1">
                      <CampoSelectUnidad
                        control={control}
                        name={`ingredientes.${index}.und_prod_rec`}
                        label=""
                        placeholder="Unidad"
                      />
                    </td>
                    <td className="w-[40px] px-1">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                        className="hover:bg-destructive/20"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() =>
                append({ prod_rec: "", cant_rec: 1, und_prod_rec: "" })
              }
              variant="outline"
            >
              + Añadir ingrediente
            </Button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="col-span-full mt-4 flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => reset()}
            disabled={loading}
          >
            Limpiar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Receta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
