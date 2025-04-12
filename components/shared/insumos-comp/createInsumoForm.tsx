"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";
import { CampoTexto } from "../form/campoTexto";
import { CampoNumero } from "../form/campoNumero";
import { CampoFecha } from "../form/campoFecha";
import { IInsumo } from "@/lib/types";
import { CampoSelectUnidad } from "../products-comp/componentes/forms/campoSelectUnidad";

/* ================================
   ESQUEMA DEL FORMULARIO CON ZOD
================================ */
const FormSchema = z.object({
  nom_ins: z.string().nonempty("El nombre del insumo es requerido"),
  und_ins: z.string().nonempty("La unidad de medida es requerida"),
  stock_ins: z.coerce
    .number({ required_error: "El stock es requerido" })
    .nonnegative("El stock no puede ser negativo"),
  cost_uni_ins: z.coerce
    .number({ required_error: "El costo unitario es requerido" })
    .nonnegative("El costo unitario no puede ser negativo"),
  fech_ven_ins: z.date({
    required_error: "La fecha de vencimiento es requerida",
  }),
  stock_min_ins: z.coerce
    .number({ required_error: "El stock mínimo es requerido" })
    .nonnegative("El stock mínimo no puede ser negativo"),
});

type FormValues = z.infer<typeof FormSchema>;

export function CreateInsumoForm({
  onSuccess,
}: {
  onSuccess: (data: IInsumo) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nom_ins: "",
      und_ins: "",
      stock_ins: 0,
      cost_uni_ins: 0,
      fech_ven_ins: new Date(),
      stock_min_ins: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Convertir la fecha a formato "dd/MM/yyyy"
    const fechaVencimiento = format(data.fech_ven_ins, "dd/MM/yyyy", {
      locale: es,
    });

    // Se omite el id_ins ya que generalmente este es generado en el backend
    const payload: Omit<IInsumo, "id_ins"> = {
      nom_ins: data.nom_ins,
      und_ins: data.und_ins,
      stock_ins: data.stock_ins,
      cost_uni_ins: data.cost_uni_ins,
      fech_ven_ins: fechaVencimiento,
      stock_min_ins: data.stock_min_ins,
      est_insu: "",
    };

    try {
      const response = await fetch("http://localhost:5000/insumos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Error al crear el insumo: ${response.status}`);
      }
      const resData: IInsumo = await response.json();
      onSuccess(resData);
      form.reset();
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
                Insumo creado exitosamente.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
              <div className="progress-bar h-full bg-[#4ADE80]" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
    } catch (error: any) {
      console.error("Error al crear el insumo:", error);
      toast.error("Error al crear el insumo", { duration: 3000 });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CampoTexto
          control={form.control}
          name="nom_ins"
          label="Nombre del Insumo"
          placeholder="ej.Pollos, Papas, etc."
        />
        <CampoSelectUnidad
          control={form.control}
          name="und_ins"
          label="Unidad de Medida"
          placeholder="Seleccione una unidad"
        />
        <CampoNumero
          control={form.control}
          name="stock_ins"
          label="Stock Actual"
          placeholder="Ingrese el stock actual"
        />
        <CampoNumero
          control={form.control}
          name="cost_uni_ins"
          label="Costo Unitario"
          placeholder="Ingrese el costo unitario"
          step="0.01"
          parseValue={(value: string) => parseFloat(value.replace(",", "."))}
        />
        <CampoNumero
          control={form.control}
          name="stock_min_ins"
          label="Stock Mínimo"
          placeholder="Ingrese el stock mínimo"
        />
        <CampoFecha
          control={form.control}
          name="fech_ven_ins"
          label="Fecha de Vencimiento"
        />
        <div className="col-span-2 flex justify-end">
          <Button type="submit" className="bg-[#f6b100] text-black">
            Crear Insumo
          </Button>
        </div>
      </form>
    </Form>
  );
}
