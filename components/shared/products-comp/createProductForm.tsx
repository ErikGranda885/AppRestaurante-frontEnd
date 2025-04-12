"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { uploadImage } from "@/firebase/subirImage";
import {
  CampoCategoria,
  CategoryOption,
} from "./componentes/forms/campoCategoria";
import { ZonaImagen } from "./componentes/forms/zonaImagen";
import { CampoTexto } from "../form/campoTexto";
import { ICategory } from "@/lib/types";
import { ToastSuccess } from "../toast/toastSuccess";
import { ToastError } from "../toast/toastError";
import { CampoSelectUnidad } from "./componentes/forms/campoSelectUnidad";
import { CampoSelectTipo } from "./componentes/forms/campoTipo";

export type Option = {
  value: string;
  label: string;
};

/* ============================
   ESQUEMA DEL FORMULARIO
=============================== */
const FormSchema = z.object({
  nombre: z
    .string()
    .nonempty("El nombre del producto es requerido")
    .refine(
      ((nombre: string) => {
        return fetch(
          `http://localhost:5000/productos/verificar?nombre=${encodeURIComponent(nombre)}`,
        )
          .then((res) => res.json())
          .then((data) => !data.exists);
      }) as (nombre: string) => Promise<boolean>,
      {
        message: "El nombre del producto ya se encuentra registrado",
        async: true,
      } as any,
    ),

  categoria: z.string().nonempty("Seleccione una categoría"),
  tipo_prod: z.string().nonempty("Seleccione un tipo de producto"),
  undidad_prod: z.string().nonempty("Seleccione una unidad de medida"),
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
      nombre: "",
      categoria: "",
      tipo_prod: "",
      undidad_prod: "",
    },
  });

  // Cargar opciones de categoría desde la API
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data: any) => {
        // Filtrar solo categorías activas (usando la interfaz ICategory)
        const active = data.categorias.filter(
          (cate: ICategory) => cate.est_cate?.toLowerCase() === "activo",
        );
        const options: Option[] = [
          { value: "", label: "Todos" },
          ...active.map((cate: ICategory) => ({
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
      imageUrl =
        "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/productos%2Fproduct-default.jpg?alt=media&token=a06d2373-fd9a-4fa5-a715-3c9ab7ae546d";
    }

    const payload = {
      nom_prod: data.nombre,
      cate_prod: Number(data.categoria),
      img_prod: imageUrl,
      tip_prod: data.tipo_prod,
      und_prod: data.undidad_prod,
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
      ToastSuccess({
        message: "Producto creado correctamente",
      });
    } catch (error) {
      console.error("Error al crear el producto:", error);
      ToastError({
        message: "Error al crear el producto",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        {/* Columna Izquierda: Campos organizados en 2 filas */}
        <div className="col-span-1 flex flex-col gap-4 pr-3">
          <div className="grid grid-cols-1 gap-4">
            <CampoTexto
              control={form.control}
              name="nombre"
              label="Nombre del Producto"
              placeholder="Nombre del producto"
            />

            <CampoCategoria
              control={form.control}
              name="categoria"
              label="Categoría"
              options={categoryOptions}
            />
            <CampoSelectTipo
              control={form.control}
              name="tipo_prod"
              label="Tipo de Producto"
              placeholder="Seleccione el tipo de producto"
            />
            <CampoSelectUnidad
              control={form.control}
              name="undidad_prod"
              label="Unidad de Medida"
              placeholder="Seleccione una unidad"
            />
          </div>
        </div>
        {/* Columna Derecha: Zona de imagen */}
        <div className="col-span-1 flex h-full items-center justify-center">
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
        <div className="col-span-2 mt-4 flex justify-end gap-4">
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
