"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mutate } from "swr";
import { useInsumos } from "@/hooks/recetas/useInsumos";
import { SERVICIOS_EQUIVALENCIAS } from "@/services/equivalencias.service";
import { CampoProducto } from "@/components/shared/compras/ui/campoProducto";
import { CampoNumero } from "@/components/shared/varios/campoNumero";
import { Button } from "@/components/ui/button";
import { CampoSelectUnidad } from "../../productos/ui/campoSelectUnidad";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";

const schema = z.object({
  prod_equiv: z.string().min(1, "Seleccione un producto insumo"),
  und_prod_equiv: z.string().min(1, "Seleccione una unidad"),
  cant_equiv: z
    .number({ invalid_type_error: "Ingrese una cantidad válida" })
    .positive("Debe ser mayor a cero"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function FormEquivalencia({ onSuccess, onClose }: Props) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prod_equiv: "",
      und_prod_equiv: "",
      cant_equiv: 1,
    },
  });

  const { productosOptions, setProductosOptions } = useInsumos();
  const { handleSubmit, reset, setValue } = methods;

  const onSubmit = async (data: FormData) => {
    const startTime = performance.now(); // ⏱️ Inicio

    try {
      const payload = {
        prod_equiv: Number(data.prod_equiv),
        und_prod_equiv: data.und_prod_equiv,
        cant_equiv: data.cant_equiv,
      };

      const res = await fetch(SERVICIOS_EQUIVALENCIAS.crear, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Error al registrar equivalencia");
      }

      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      ToastSuccess({
        message: `${
          result.message || "Equivalencia registrada correctamente"
        } en ${duration} segundos.`,
      });

      await mutate(SERVICIOS_EQUIVALENCIAS.listar);
      reset();
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      ToastError({ message: err.message || "Error al registrar equivalencia" });
    }
  };

  const handleCancel = () => {
    reset();
    onClose?.();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CampoProducto
          name="prod_equiv"
          label="Producto insumo"
          control={methods.control}
          options={productosOptions}
          setOptions={setProductosOptions}
          setValue={setValue}
        />

        <CampoNumero
          name="cant_equiv"
          label="Cantidad de equivalencia"
          control={methods.control}
        />

        <CampoSelectUnidad
          name="und_prod_equiv"
          label="Unidad de equivalencia"
          control={methods.control}
        />

        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit">Registrar</Button>
        </div>
      </form>
    </FormProvider>
  );
}
