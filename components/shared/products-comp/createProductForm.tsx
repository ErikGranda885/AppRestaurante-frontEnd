"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { parse, differenceInDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Definir los tipos para el formulario
export type CreateProductFormValues = {
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
  fecha_vencimiento: string;
  imagen: File | null;
};

type Option = {
  value: string;
  label: string;
};

type CreateProductFormProps = {
  cateOptions: Option[];
  onSuccess: (data: { producto: FormData }) => void;
};

export function CreateProductForm({
  cateOptions,
  onSuccess,
}: CreateProductFormProps) {
  const form = useForm<CreateProductFormValues>({
    defaultValues: {
      nombre: "",
      categoria: "",
      stock: 0,
      precio: 0,
      fecha_vencimiento: "",
      imagen: null,
    },
  });

  // Estado para previsualizar la imagen
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0] || null;
      form.setValue("imagen", file);
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
    },
    accept: {
      "image/*": [],
    },
  });

  const onSubmit = (values: CreateProductFormValues) => {
    const formData = new FormData();
    formData.append("nombre", values.nombre);
    formData.append("categoria", values.categoria);
    formData.append("stock", values.stock.toString());
    formData.append("precio", values.precio.toString());
    formData.append("fecha_vencimiento", values.fecha_vencimiento);
    if (values.imagen) {
      formData.append("imagen", values.imagen);
    }
    onSuccess({ producto: formData });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {/* Columna Izquierda: Campos del producto */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Nombre del producto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ejemplo: Camiseta"
                    {...field}
                    className="dark:border dark:border-default-700 dark:bg-[#09090b]"
                  />
                </FormControl>
                <FormMessage className="text-danger-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Categoría
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded-md border p-2 dark:border-default-700 dark:bg-[#09090b]"
                  >
                    <option value="">Selecciona una categoría</option>
                    {cateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-danger-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Stock
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ejemplo: 100"
                    {...field}
                    className="dark:border dark:border-default-700 dark:bg-[#09090b]"
                  />
                </FormControl>
                <FormMessage className="text-danger-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Precio
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ejemplo: 1000"
                    {...field}
                    className="dark:border dark:border-default-700 dark:bg-[#09090b]"
                  />
                </FormControl>
                <FormMessage className="text-danger-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fecha_vencimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Fecha de vencimiento
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="dark:border dark:border-default-700 dark:bg-[#09090b]"
                  />
                </FormControl>
                <FormMessage className="text-danger-500" />
              </FormItem>
            )}
          />
        </div>

        {/* Columna Derecha: Área de arrastrar y soltar imagen */}
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-default-700">
          <div
            {...getRootProps()}
            className="flex h-48 w-full cursor-pointer flex-col items-center justify-center"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-gray-500">Suelta la imagen aquí...</p>
            ) : (
              <p className="text-gray-500">
                Arrastra y suelta una imagen aquí, o haz clic para seleccionar
              </p>
            )}
          </div>
          {imagePreview && (
            <div className="mt-4">
              <Image
                src={imagePreview}
                alt="Previsualización de la imagen"
                width={200}
                height={200}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>

        {/* Botón de envío (ocupa ambas columnas en pantallas medianas) */}
        <div className="col-span-1 flex justify-end pt-4 md:col-span-2">
          <Button type="submit">Crear Producto</Button>
        </div>
      </form>
    </Form>
  );
}
