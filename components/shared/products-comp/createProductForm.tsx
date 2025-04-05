"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { uploadImage } from "@/firebase/subirImage";
import { CheckCircle } from "lucide-react";
import { CampoNumero } from "./componentes/forms/campoNumero";
import {
  CampoCategoria,
  CategoryOption,
} from "./componentes/forms/campoCategoria";
import { CampoFecha } from "./componentes/forms/campoFecha";
import { ZonaImagen } from "./componentes/forms/zonaImagen";
import { CampoTexto } from "./componentes/forms/campoTexto";
import { CampoBoolean } from "./componentes/forms/campoComBool";

interface Category {
  id_cate: number;
  nom_cate: string;
  desc_cate: string;
  est_cate: string;
}
export type Option = {
  value: string;
  label: string;
};

/* ============================
   ESQUEMA DEL FORMULARIO
=============================== */
const FormSchema = z.object({
  nom_prod: z
    .string()
    .nonempty("El nombre del producto es requerido")
    .superRefine(async (nombre, ctx) => {
      const res = await fetch(
        `http://localhost:5000/productos/verificar/producto?nombre=${encodeURIComponent(nombre)}`,
      );
      const data = await res.json();
      if (data.exists) {
        ctx.addIssue({
          code: "custom",
          message: "El producto ya se encuentra registrado",
        });
      }
    }),
  prec_prod: z.coerce
    .number({ required_error: "El precio es requerido" })
    .positive("El precio debe ser mayor a cero"),
  stock_prod: z.coerce
    .number({ required_error: "El stock es requerido" })
    .positive("El stock debe ser mayor a cero"),
  categoria: z.coerce.number({ required_error: "La categoría es requerida" }),
  fech_ven_prod: z.date({
    required_error: "La fecha de vencimiento es requerida",
  }),
  // Preprocesa el valor para que 1 se convierta en true y 0 en false.
  aplica_iva: z
    .preprocess((val) => Number(val) === 1, z.boolean())
    .default(true),
  materia_prima: z
    .preprocess((val) => Number(val) === 1, z.boolean())
    .default(false),
});

type FormValues = z.infer<typeof FormSchema>;

export function FormProducts({
  onSuccess,
}: {
  onSuccess: (data: any) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nom_prod: "",
      prec_prod: 0,
      stock_prod: 0,
      categoria: 0,
      fech_ven_prod: new Date(),
      aplica_iva: undefined,
      materia_prima: undefined,
    },
  });

  // Utilizamos watch para saber el valor de "materia_prima"
  const isMateriaPrima = form.watch("materia_prima");

  // Cargar opciones de categoría desde la API
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data: any) => {
        // Filtrar solo categorías activas
        const active = data.categorias.filter(
          (cate: Category) => cate.est_cate.toLowerCase() === "activo",
        );
        const options: Option[] = [
          { value: "", label: "Todos" },
          ...active.map((cate: Category) => ({
            value: cate.id_cate.toString(),
            label: cate.nom_cate,
          })),
        ];
        setCategoryOptions(options);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  // Estados para la imagen y su previsualización
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Funciones para el manejo de imagen en ZonaImagen
  const handleImageSelect = () => {
    imageInputRef.current?.click();
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Función de envío del formulario
  const onSubmit = async (data: FormValues) => {
    let imageUrl = imagePreview || "";
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    } else {
      // Imagen por defecto
      imageUrl =
        "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/productos%2Fproduct-default.jpg?alt=media&token=a06d2373-fd9a-4fa5-a715-3c9ab7ae546d";
    }

    // Si es materia prima, forzamos stock 0 y no se requiere fecha de vencimiento.
    let stock = data.stock_prod;
    let fechVenc = format(data.fech_ven_prod, "dd/MM/yyyy", { locale: es });
    if (data.materia_prima) {
      stock = 0;
      fechVenc = ""; // Valor para indicar que no aplica fecha
    }

    const payload = {
      nom_prod: data.nom_prod,
      prec_prod: data.prec_prod,
      stock_prod: stock,
      cate_prod: data.categoria,
      fech_ven_prod: fechVenc,
      img_prod: imageUrl,
      est_prod: "Activo",
      iva_prod: data.aplica_iva,
    };

    try {
      const response = await fetch("http://localhost:5000/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Error al crear el producto: ${response.status}`);
      }
      const resData = await response.json();
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
                Mensaje Informativo
              </p>
              <p className="text-sm text-[#166534]/80">
                Producto creado exitosamente.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
              <div className="progress-bar h-full bg-[#4ADE80]" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
    } catch (error) {
      console.error("Error al crear el producto:", error);
      toast.error("Error al crear el producto", { duration: 3000 });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-4xl grid-cols-6"
      >
        {/* Columna Izquierda: Campos organizados en 2 filas */}
        <div className="col-span-4 flex flex-col gap-4 pr-3">
          {/* Primera fila: 5 campos */}
          <div className="grid grid-cols-2 gap-2 p-2">
            <CampoTexto
              control={form.control}
              name="nom_prod"
              label="Nombre del Producto"
              placeholder="Nombre del producto"
            />
            <CampoNumero
              control={form.control}
              name="prec_prod"
              label="Precio"
              placeholder="Precio"
              step="0.01"
              parseValue={(value: string) =>
                parseFloat(value.replace(",", "."))
              }
            />
            <CampoCategoria
              control={form.control}
              name="categoria"
              label="Categoría"
              options={categoryOptions}
            />
            {/* Campo para seleccionar si es materia prima, siempre visible */}
            <CampoBoolean
              control={form.control}
              name="materia_prima"
              label="Es Materia Prima"
              placeholder="Seleccione una opción"
            />
            {/* Mostramos estos campos solo si NO es materia prima */}
            {!isMateriaPrima && (
              <>
                <CampoNumero
                  control={form.control}
                  name="stock_prod"
                  label="Stock"
                  placeholder="Stock"
                />
                <CampoFecha
                  control={form.control}
                  name="fech_ven_prod"
                  label="Fecha de Vencimiento"
                />
                <CampoBoolean
                  control={form.control}
                  name="aplica_iva"
                  label="Aplica IVA"
                  placeholder="Seleccione una opción"
                />
              </>
            )}
          </div>
        </div>
        {/* Columna Derecha: Zona de imagen */}
        <div className="col-span-2 flex h-full items-center justify-center">
          <ZonaImagen
            imageFile={imageFile}
            imagePreview={imagePreview || ""}
            setImageFile={setImageFile}
            setImagePreview={setImagePreview}
            imageInputRef={imageInputRef}
            handleImageSelect={handleImageSelect}
            handleImageDrop={handleImageDrop}
            handleDragOver={handleDragOver}
          />
        </div>
        {/* Botón de envío */}
        <div className="col-span-2 col-start-5 mt-4 flex justify-end gap-4">
          <Button type="button" onClick={() => form.reset()}>
            Limpiar
          </Button>
          <Button
            className="bg-[#f6b100] text-black hover:bg-[#f6b100]/80"
            type="submit"
          >
            Crear Producto
          </Button>
        </div>
      </form>
    </Form>
  );
}
