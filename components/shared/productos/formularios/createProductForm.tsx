"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { uploadImage } from "@/firebase/subirImage";
import { CampoCategoria, CategoryOption } from "../ui/campoCategoria";
import { ZonaImagen } from "../ui/zonaImagen";
import { CampoTexto } from "../../varios/campoTexto";
import { ICategory } from "@/lib/types";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";
import { CampoSelectUnidad } from "../ui/campoSelectUnidad";
import { CampoSelectTipo } from "../ui/campoTipo";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";

export type Option = {
  value: string;
  label: string;
};

// Esquema del formulario
// Se define "categoria" como opcional y se usa superRefine para validar que, si el tipo de producto no es "insumo",
// se requiera que el campo categoría tenga contenido (comparación insensible a mayúsculas).
const EsquemaFormulario = z
  .object({
    nombre: z
      .string()
      .nonempty("El nombre del producto es requerido")
      .refine(
        async (nombre: string) => {
          return fetch(
            `http://localhost:5000/productos/verificar?nombre=${encodeURIComponent(nombre)}`,
          )
            .then((res) => res.json())
            .then((data) => !data.exists);
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
    // Convertimos a minúsculas para comparar de forma insensible a mayúsculas
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

export type ValoresFormulario = z.infer<typeof EsquemaFormulario>;

// Ref para almacenar el nombre inicial (para evitar verificación si no cambia)
const initialProductNameRef = { current: "" };

export function FormProducts({
  onSuccess,
}: {
  onSuccess: (data: any) => void;
}) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(EsquemaFormulario),
    defaultValues: {
      nombre: "",
      categoria: "",
      tipo_prod: "",
      undidad_prod: "",
    },
  });

  // Usamos form.watch para obtener el valor actual de "tipo_prod"
  const tipoProducto = form.watch("tipo_prod").toLowerCase();

  // Cargar opciones de categoría desde la API mediante el servicio definido
  const [opcionesCategoria, setOpcionesCategoria] = useState<CategoryOption[]>(
    [],
  );
  useEffect(() => {
    fetch(SERVICIOS_PRODUCTOS.categorias)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data: any) => {
        const activas = data.categorias.filter(
          (cate: ICategory) => cate.est_cate?.toLowerCase() === "activo",
        );
        const opciones: Option[] = [
          { value: "", label: "Todos" },
          ...activas.map((cate: ICategory) => ({
            value: cate.id_cate.toString(),
            label: cate.nom_cate,
          })),
        ];
        setOpcionesCategoria(opciones);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  // Estados para la imagen y su previsualización
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const imagenInputRef = useRef<HTMLInputElement>(null);

  // Funciones para manejo de imagen
  const seleccionarImagen = () => {
    imagenInputRef.current?.click();
  };

  const manejarDropImagen = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const archivo = e.dataTransfer.files[0];
      setImagenArchivo(archivo);
      setImagenPreview(URL.createObjectURL(archivo));
      e.dataTransfer.clearData();
    }
  };

  const manejarDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Función de envío del formulario
  const onSubmit = async (data: ValoresFormulario) => {
    let imageUrl = imagenPreview || "";
    if (imagenArchivo) {
      imageUrl = await uploadImage(
        imagenArchivo,
        "productos", // carpeta en Firebase
        `producto_${data.nombre.replace(/\s+/g, "_").toLowerCase()}`, // nombre personalizado
      );
    } else {
      imageUrl =
        "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/productos%2Fproduct-default.jpg?alt=media&token=a06d2373-fd9a-4fa5-a715-3c9ab7ae546d";
    }

    const payload = {
      nom_prod: data.nombre,
      cate_prod: tipoProducto === "insumo" ? null : Number(data.categoria),
      tip_prod: data.tipo_prod,
      und_prod: data.undidad_prod,
      img_prod: imageUrl,
    };

    try {
      const response = await fetch(SERVICIOS_PRODUCTOS.productos, {
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
        {/* Columna izquierda: campos del formulario */}
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
            {/* Solo se muestra el campo Categoría si el tipo no es "insumo" */}
            {tipoProducto !== "insumo" && (
              <CampoCategoria
                control={form.control}
                name="categoria"
                label="Categoría"
                options={opcionesCategoria}
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
        {/* Columna derecha: zona de imagen */}
        <div className="col-span-1 flex h-full items-center justify-center">
          <ZonaImagen
            imageFile={imagenArchivo}
            imagePreview={imagenPreview || ""}
            setImageFile={setImagenArchivo}
            setImagePreview={setImagenPreview}
            imageInputRef={imagenInputRef}
            handleImageSelect={seleccionarImagen}
            handleImageDrop={manejarDropImagen}
            handleDragOver={manejarDragOver}
          />
        </div>
        {/* Botón de envío */}
        <div className="col-span-2 mt-4 flex justify-end gap-4">
          <Button type="button" onClick={() => form.reset()}>
            Limpiar
          </Button>
          <Button className="hover:/80 text-black" type="submit">
            Crear Producto
          </Button>
        </div>
      </form>
    </Form>
  );
}
