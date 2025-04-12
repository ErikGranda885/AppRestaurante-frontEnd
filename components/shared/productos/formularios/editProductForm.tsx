"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CampoTexto } from "../../varios/campoTexto";
import { CampoCategoria } from "../ui/campoCategoria";
import { CampoSelectTipo } from "../ui/campoTipo";
import { CampoSelectUnidad } from "../ui/campoSelectUnidad";
import { ZonaImagen } from "../ui/zonaImagen";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";
import { uploadImage } from "@/firebase/subirImage";

// Declaramos un ref para almacenar el nombre inicial y así evitar la validación si no cambia
const initialProductNameRef = { current: "" };

const editProductSchema = z.object({
  nombre: z
    .string()
    .nonempty("El nombre del producto es requerido")
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .refine(
      async (nombre: string) => {
        // Si el nombre no se ha modificado, omite la verificación asíncrona
        if (nombre === initialProductNameRef.current) return true;
        const res = await fetch(
          `http://localhost:5000/productos/verificar?nombre=${encodeURIComponent(nombre)}`,
        );
        const data = await res.json();
        return !data.exists;
      },
      {
        message: "El nombre del producto ya se encuentra registrado",
        async: true,
      } as any,
    ),
  categoria: z.string().nonempty("Seleccione una categoría"),
  tipo_prod: z.string().nonempty("Seleccione un tipo de producto"),
  undidad_prod: z.string().nonempty("Seleccione una unidad de medida"),
});

export type EditProductFormValues = z.infer<typeof editProductSchema>;

interface EditProductFormProps {
  initialData: {
    id: string;
    nombre: string;
    categoria: string;
    tipo_prod: string;
    undidad_prod: string;
    img_prod: string;
  };
  // Se utilizarán en el componente CampoCategoria
  categoryOptions: { value: string; label: string }[];
  onSuccess: (data: any) => void;
}

export function EditProductForm({
  initialData,
  categoryOptions,
  onSuccess,
}: EditProductFormProps) {
  // Actualizamos el ref con el valor inicial del nombre para la validación asíncrona
  useEffect(() => {
    initialProductNameRef.current = initialData.nombre;
  }, [initialData.nombre]);

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: initialData,
  });

  // Estados para el manejo de la imagen y su previsualización
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData.img_prod,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const onSubmit = async (values: EditProductFormValues) => {
    let imageUrl = imagePreview;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    // Se arma el payload que espera el backend
    const payload = {
      nom_prod: values.nombre,
      cate_prod: Number(values.categoria),
      tip_prod: values.tipo_prod,
      und_prod: values.undidad_prod,
      img_prod: imageUrl,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/productos/${initialData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || `Error: ${res.status}`);
      }
      const data = await res.json();
      onSuccess(data);
      ToastSuccess({ message: "Producto actualizado correctamente" });
    } catch (err: any) {
      console.error("Error al actualizar el producto:", err);
      ToastError({
        message: `Error al actualizar el producto: ${err.message}`,
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
