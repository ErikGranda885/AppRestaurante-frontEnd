"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CampoCategoria, CategoryOption } from "../ui/campoCategoria";
import { ZonaImagen } from "../ui/zonaImagen";
import { CampoTexto } from "../../varios/campoTexto";
import { ICategory } from "@/lib/types";
import { CampoSelectUnidad } from "../ui/campoSelectUnidad";
import { CampoSelectTipo } from "../ui/campoTipo";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { useCrearProducto } from "@/hooks/productos/useCrearProducto";

export type Opcion = {
  value: string;
  label: string;
};

const EsquemaFormulario = z
  .object({
    nombre: z
      .string()
      .nonempty("El nombre del producto es obligatorio")
      .refine(
        async (nombre: string) => {
          const respuesta = await fetch(
            SERVICIOS_PRODUCTOS.verificarNombre(nombre)
          );
          const datos = await respuesta.json();
          return !datos.exists;
        },
        {
          message: "Este nombre ya está registrado",
          async: true,
        } as any
      ),
    categoria: z.string().optional(),
    tipo_prod: z.string().nonempty("Seleccione un tipo de producto"),
    unidad_prod: z.string().nonempty("Seleccione una unidad de medida"),
  })
  .superRefine((valores, contexto) => {
    if (
      valores.tipo_prod.toLowerCase() !== "insumo" &&
      (!valores.categoria || valores.categoria.trim() === "")
    ) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoria"],
        message: "Seleccione una categoría",
      });
    }
  });

export type ValoresFormulario = z.infer<typeof EsquemaFormulario>;

export function FormProducts({
  onSuccess,
}: {
  onSuccess: (datos: any) => void;
}) {
  // Hook de formulario
  const formulario = useForm<ValoresFormulario>({
    resolver: zodResolver(EsquemaFormulario),
    defaultValues: {
      nombre: "",
      categoria: "",
      tipo_prod: "",
      unidad_prod: "",
    },
  });

  // Hook personalizado para crear producto
  const { crearProducto } = useCrearProducto();

  // Estado para bloquear el botón mientras se envía
  const [estaEnviando, setEstaEnviando] = useState(false);

  // Observar el campo tipo_prod
  const tipoProducto = formulario.watch("tipo_prod").toLowerCase();

  // Opciones de categoría
  const [opcionesCategoria, setOpcionesCategoria] = useState<
    CategoryOption[]
  >([]);
  useEffect(() => {
    fetch(SERVICIOS_PRODUCTOS.categorias)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((datos: any) => {
        const activas = datos.categorias.filter(
          (c: ICategory) => c.est_cate?.toLowerCase() === "activo"
        );
        const opciones: Opcion[] = [
          { value: "", label: "Todos" },
          ...activas.map((c: ICategory) => ({
            value: c.id_cate.toString(),
            label: c.nom_cate,
          })),
        ];
        setOpcionesCategoria(opciones);
      })
      .catch((err) =>
        console.error("Error al cargar opciones de categoría:", err)
      );
  }, []);

  // Estados de la imagen
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const refInputImagen = useRef<HTMLInputElement>(null);

  const seleccionarImagen = () => {
    refInputImagen.current?.click();
  };

  const manejarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const archivo = e.dataTransfer.files[0];
      setArchivoImagen(archivo);
      setVistaPrevia(URL.createObjectURL(archivo));
      e.dataTransfer.clearData();
    }
  };

  const manejarDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Función de envío
  const alEnviarFormulario = async (valores: ValoresFormulario) => {
    setEstaEnviando(true);
    try {
      await crearProducto({
        nombre: valores.nombre,
        categoria: valores.categoria || "",
        tipo: valores.tipo_prod,
        unidad: valores.unidad_prod,
        imagenArchivo: archivoImagen,
        imagenPreview: vistaPrevia,
        onSuccess: (datosRes: any) => {
          onSuccess(datosRes);
          formulario.reset();
        },
      });
    } finally {
      setEstaEnviando(false);
    }
  };

  return (
    <Form {...formulario}>
      <form
        onSubmit={formulario.handleSubmit(alEnviarFormulario)}
        className="grid grid-cols-2 gap-4"
      >
        {/* Columna izquierda: campos */}
        <div className="col-span-1 flex flex-col gap-4 pr-3">
          <CampoTexto
            control={formulario.control}
            name="nombre"
            label="Nombre del producto"
            placeholder="Ingrese el nombre"
          />
          <CampoSelectTipo
            control={formulario.control}
            name="tipo_prod"
            label="Tipo de producto"
            placeholder="Seleccione un tipo"
          />
          {tipoProducto !== "insumo" && (
            <CampoCategoria
              control={formulario.control}
              name="categoria"
              label="Categoría"
              options={opcionesCategoria}
            />
          )}
          <CampoSelectUnidad
            control={formulario.control}
            name="unidad_prod"
            label="Unidad de medida"
            placeholder="Seleccione una unidad"
          />
        </div>

        {/* Columna derecha: zona de imagen */}
        <div className="col-span-1 flex h-full items-center justify-center">
          <ZonaImagen
            imageFile={archivoImagen}
            imagePreview={vistaPrevia || ""}
            setImageFile={setArchivoImagen}
            setImagePreview={setVistaPrevia}
            imageInputRef={refInputImagen}
            handleImageSelect={seleccionarImagen}
            handleImageDrop={manejarDrop}
            handleDragOver={manejarDragOver}
          />
        </div>

        {/* Botones al pie */}
        <div className="col-span-2 mt-4 flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => formulario.reset()}
            disabled={estaEnviando}
          >
            Limpiar
          </Button>
          <Button type="submit" disabled={estaEnviando}>
            {estaEnviando ? "Creando..." : "Crear producto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
