"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { uploadImage } from "@/firebase/subirImage";
import { CampoCategoria } from "../ui/campoCategoria";
import { ZonaImagen } from "../ui/zonaImagen";
import { CampoTexto } from "../../varios/campoTexto";
import { ICategory } from "@/lib/types";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";
import { CampoSelectUnidad } from "../ui/campoSelectUnidad";
import { CampoSelectTipo } from "../ui/campoTipo";
import { eliminarImagen } from "@/firebase/eliminarImage";

// Ref para almacenar el nombre inicial del producto (para omitir validación asíncrona si no cambia)
const initialProductNameRef = { current: "" };

const EsquemaFormulario = z
  .object({
    nombre: z
      .string()
      .nonempty("El nombre del producto es requerido")
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
      .refine(
        async (nombre: string) => {
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
    categoria: z.string().optional(),
    tipo_prod: z.string().nonempty("Seleccione un tipo de producto"),
    undidad_prod: z.string().nonempty("Seleccione una unidad de medida"),
  })
  .superRefine((val, ctx) => {
    if (
      val.tipo_prod.toLowerCase() !== "insumo" &&
      (!val.categoria || val.categoria.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoria"],
        message: "Seleccione una categoría",
      });
    }
  });

export type EditProductFormValues = z.infer<typeof EsquemaFormulario>;

interface EditProductFormProps {
  initialData: {
    id: string;
    nombre: string;
    categoria: string | null;
    tipo_prod: string;
    undidad_prod: string;
    img_prod: string;
  };
  onSuccess: (data: any) => void;
  categoryOptions: { value: string; label: string }[];
}

export function EditProductForm({
  initialData,
  categoryOptions,
  onSuccess,
}: EditProductFormProps) {
  useEffect(() => {
    initialProductNameRef.current = initialData.nombre;
  }, [initialData.nombre]);

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(EsquemaFormulario),
    defaultValues: {
      nombre: initialData.nombre,
      categoria: initialData.categoria || "",
      tipo_prod: initialData.tipo_prod,
      undidad_prod: initialData.undidad_prod,
    },
  });

  // Obtiene el valor actual de "tipo_prod" y lo convierte a minúsculas
  const tipoProducto = form.watch("tipo_prod")?.toLowerCase() || "";

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

    try {
      if (imageFile) {
        // Si había imagen anterior y no es la imagen por defecto, elimínala
        const defaultImage =
          "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/productos%2Fproduct-default.jpg?alt=media&token=c3e03102-01ac-4891-802a-40aff8502b45";

        if (initialData.img_prod && initialData.img_prod !== defaultImage) {
          await eliminarImagen(initialData.img_prod);
        }

        imageUrl = await uploadImage(
          imageFile,
          "productos",
          `producto_${values.nombre.replace(/\s+/g, "_").toLowerCase()}`,
        );
      }

      const payload = {
        nom_prod: values.nombre,
        cate_prod: tipoProducto === "insumo" ? null : Number(values.categoria),
        tip_prod: values.tipo_prod,
        und_prod: values.undidad_prod,
        img_prod: imageUrl,
      };

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
        {/* Columna izquierda: Campos del formulario */}
        <div className="col-span-1 flex flex-col gap-4 pr-3">
          <div className="grid grid-cols-1 gap-4">
            <CampoTexto
              control={form.control}
              name="nombre"
              label="Nombre del Producto"
              placeholder="Nombre del producto"
            />

            <CampoSelectTipo
              control={form.control}
              name="tipo_prod"
              label="Tipo de Producto"
              placeholder="Seleccione el tipo de producto"
            />

            {/* Se muestra el campo Categoría solo si el valor actual de tipo_prod no es "insumo" */}
            {tipoProducto !== "insumo" && (
              <CampoCategoria
                control={form.control}
                name="categoria"
                label="Categoría"
                options={categoryOptions}
              />
            )}

            <CampoSelectUnidad
              control={form.control}
              name="undidad_prod"
              label="Unidad de Medida"
              placeholder="Seleccione una unidad"
            />
          </div>
        </div>
        {/* Columna derecha: Zona de imagen */}
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
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </Form>
  );
}
