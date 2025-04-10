"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import toast from "react-hot-toast";
import { uploadImage } from "@/firebase/subirImage";
import { CheckCircle, XCircle } from "lucide-react";
import { CampoTexto } from "../form/campoTexto";
import { CampoNumero } from "../form/campoNumero";
import { CampoCategoria } from "./componentes/forms/campoCategoria";
import { CampoFecha } from "../form/campoFecha";
import { ZonaImagen } from "./componentes/forms/zonaImagen";
import { CampoBoolean } from "./componentes/forms/campoComBool";
import { ToastSuccess } from "../toast/toastSuccess";
import { ToastError } from "../toast/toastError";

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
    stock_prod: z.coerce.number({ required_error: "El stock es requerido" }),
    categoria: z.coerce.number({ required_error: "La categoría es requerida" }),
    fech_ven_prod: z.date().optional(),
    aplica_iva: z.boolean().default(true),
    materia_prima: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.materia_prima && !data.fech_ven_prod) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de vencimiento es requerida",
        path: ["fech_ven_prod"],
      });
    }
    if (!data.materia_prima && data.stock_prod <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "El stock debe ser mayor a cero",
        path: ["stock_prod"],
      });
    }
  })
  .superRefine(async (values, ctx) => {
    const nuevoNombre = values.nom_prod.trim().toLowerCase();
    const nombreInicial = values.initial_nom_prod.trim().toLowerCase();
    // Si el nombre no ha sido modificado, se omite la verificación
    if (nuevoNombre === nombreInicial) return;

    try {
      const res = await fetch("http://localhost:5000/productos/verificar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });
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
      aplica_iva: initialData.aplica_iva,
      materia_prima: initialData.materia_prima,
    },
  });
  // Se utiliza watch para saber el valor de "materia_prima"
  const isMateriaPrima = form.watch("materia_prima");

  const onSubmit = async (values: EditProductFormValues) => {
    let imageUrl = imagePreview;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
    const payload = {
      nom_prod: values.nom_prod,
      prec_prod: values.prec_prod,
      stock_prod: values.stock_prod,
      cate_prod: values.categoria,
      fech_ven_prod: values.fech_ven_prod,
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
      ToastSuccess({
        message: "Producto actualizado correctamente",
      });
    } catch (err) {
      ToastError({
        message: "Error al actualizar el producto",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`grid max-w-4xl ${
          isMateriaPrima ? "grid-cols-1" : "grid-cols-6"
        }`}
      >
        {/* Sección de inputs */}
        <div className="col-span-4 flex flex-col gap-4 pr-3">
          <div
            className={`grid p-2 ${
              isMateriaPrima ? "grid-cols-1" : "grid-cols-2 gap-2"
            }`}
          >
            {/* Siempre se muestran estos tres campos */}
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

            {/* Solo se muestran si NO es materia prima */}
            {!isMateriaPrima && (
              <>
                <CampoBoolean
                  control={form.control}
                  name="materia_prima"
                  label="Es Materia Prima"
                  placeholder="Seleccione una opción"
                />
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
        {/* Zona de imagen */}
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
