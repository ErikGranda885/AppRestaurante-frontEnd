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

// Importamos los componentes generales desde sus archivos
import { CheckCircle, XCircle } from "lucide-react";
import { CampoTexto } from "./componentes/forms/campoTexto";
import { CampoNumero } from "./componentes/forms/campoNumero";
import { CampoCategoria } from "./componentes/forms/campoCategoria";
import { CampoFecha } from "./componentes/forms/campoFecha";
import { ZonaImagen } from "./componentes/forms/zonaImagen";

/* ------------------------------
   ESQUEMA BASE CON VALIDACIÓN ASÍNCRONA
------------------------------ */
// Se agrega la propiedad "initial_nom_prod" para almacenar el nombre original
const EditProductSchemaBase = z
  .object({
    initial_nom_prod: z.string(),
    nom_prod: z.string().nonempty("El nombre del producto es requerido"),
    prec_prod: z.coerce
      .number({ required_error: "El precio es requerido" })
      .positive("El precio debe ser mayor a cero"),
    stock_prod: z.coerce
      .number({ required_error: "El stock es requerido" })
      .positive("El stock debe ser mayor a cero"),
    // Se espera que la categoría se envíe como número
    categoria: z.coerce.number({ required_error: "La categoría es requerida" }),
    fech_ven_prod: z.date({
      required_error: "La fecha de vencimiento es requerida",
    }),
  })
  .superRefine(async (values, ctx) => {
    const nuevoNombre = values.nom_prod.trim();
    const nombreInicial = values.initial_nom_prod.trim();
    // Si el nombre no se modificó (ignorando mayúsculas y espacios) no se valida
    if (nuevoNombre.toLowerCase() === nombreInicial.toLowerCase()) return;
    try {
      const res = await fetch(
        `http://localhost:5000/productos/verificar/producto?nombre=${encodeURIComponent(
          nuevoNombre,
        )}`,
      );
      const data = await res.json();
      if (data.exists) {
        ctx.addIssue({
          code: "custom",
          message: "El producto ya se encuentra registrado",
          path: ["nom_prod"],
        });
      }
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: "Error al verificar el producto",
        path: ["nom_prod"],
      });
    }
  });

export type EditProductFormValues = z.infer<typeof EditProductSchemaBase>;

interface PropsFormEditarProducto {
  // initialData no incluye initial_nom_prod, lo agregamos en defaultValues
  initialData: Omit<EditProductFormValues, "initial_nom_prod"> & {
    id: string;
    img_prod: string;
  };
  categoryOptions: { value: string; label: string }[];
  onSuccess: (data: any) => void;
}

export function EditProductForm({
  initialData,
  categoryOptions,
  onSuccess,
}: PropsFormEditarProducto) {
  // Estados para imagen y previsualización
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData.img_prod,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Funciones para el manejo de imagen
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

  // Creamos el formulario; en defaultValues se incluye "initial_nom_prod" con el valor original
  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(EditProductSchemaBase),
    defaultValues: {
      ...initialData,
      initial_nom_prod: initialData.nom_prod.trim(),
      nom_prod: initialData.nom_prod.trim(),
    },
  });

  const onSubmit = async (values: EditProductFormValues) => {
    let imageUrl = imagePreview;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
    const payload = {
      nom_prod: values.nom_prod,
      prec_prod: values.prec_prod,
      stock_prod: values.stock_prod,
      cate_prod: values.categoria, // se envía como número
      fech_ven_prod: format(values.fech_ven_prod, "dd/MM/yyyy", { locale: es }),
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
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      onSuccess(data);
      toast.custom(
        (t) => (
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
                Producto actualizado exitosamente.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
              <div className="progress-bar h-full bg-[#4ADE80]" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
    } catch (err) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-red-400 bg-red-50 p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <XCircle className="mt-1 h-6 w-6 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-500">Error</p>
              <p className="text-sm text-red-500/80">
                Ocurrió un error al actualizar el producto.{" "}
                <span className="block">Por favor, intenta de nuevo.</span>
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-400/20">
              <div className="progress-bar h-full bg-red-400" />
            </div>
          </div>
        ),
        { duration: 3000, position: "top-right" },
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto grid max-w-4xl grid-cols-2 gap-8"
      >
        <div>
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
            parseValue={(value: string) => parseFloat(value)}
          />
          <CampoNumero
            control={form.control}
            name="stock_prod"
            label="Stock"
            placeholder="Stock"
          />
          <CampoCategoria
            control={form.control}
            name="categoria"
            label="Categoría"
            options={categoryOptions}
          />
          <CampoFecha
            control={form.control}
            name="fech_ven_prod"
            label="Fecha de Vencimiento"
          />
        </div>
        <ZonaImagen
          imageFile={imageFile}
          imagePreview={imagePreview}
          setImageFile={setImageFile}
          setImagePreview={setImagePreview}
          imageInputRef={imageInputRef}
          handleImageSelect={handleImageSelect}
          handleImageDrop={handleImageDrop}
          handleDragOver={handleDragOver}
        />
        <div className="col-span-2 flex justify-end">
          <Button type="submit" className="w-full">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
