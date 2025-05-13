"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/firebase/subirImage";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { DEFAULT_PROVEEDOR_IMAGE_URL } from "@/lib/constants"; // ✅ IMPORTANTE

const proveedorSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  contacto: z.string().min(2, "El contacto es obligatorio"),
  telefono: z
    .string()
    .min(7, "Número de teléfono muy corto")
    .max(15, "Número de teléfono muy largo"),
  direccion: z.string().min(5, "Dirección obligatoria"),
  email: z.string().email("Correo inválido"),
  ruc: z.string().min(10, "El RUC debe tener al menos 10 caracteres"),
});

type CreateProveedorFormValues = z.infer<typeof proveedorSchema>;

export function CreateProveedorForm({
  onSuccess,
}: {
  onSuccess: (data: any) => void;
}) {
  const form = useForm<CreateProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre: "",
      contacto: "",
      telefono: "",
      direccion: "",
      email: "",
      ruc: "",
    },
  });

  const [imagenArchivo, setImagenArchivo] = React.useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = React.useState<string | null>(null);
  const imagenInputRef = React.useRef<HTMLInputElement>(null);

  const onSubmit = async (values: CreateProveedorFormValues) => {
    let imageUrl = "";

    try {
      if (imagenArchivo) {
        imageUrl = await uploadImage(
          imagenArchivo,
          "proveedores",
          `proveedor_${values.nombre.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else {
        imageUrl = DEFAULT_PROVEEDOR_IMAGE_URL; // ✅ USO DE CONSTANTE
      }

      const payload = {
        nom_prov: values.nombre,
        cont_prov: values.contacto,
        tel_prov: values.telefono,
        direc_prov: values.direccion,
        email_prov: values.email,
        ruc_prov: values.ruc,
        img_prov: imageUrl,
        est_prov: "Activo",
      };

      const res = await fetch("http://localhost:5000/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al crear proveedor");
      const data = await res.json();
      onSuccess(data);
      form.reset();
      setImagenArchivo(null);
      setImagenPreview(null);
      ToastSuccess({ message: "Proveedor creado correctamente" });
    } catch (err) {
      ToastError({ message: "Error al crear proveedor" });
      console.error(err);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8"
      >
        {/* Columna 1 */}
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Nombre del proveedor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Nuva Supermercados"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contacto"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Nombre del contacto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. María Vargas"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. 0999999999"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Columna 2 */}
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="direccion"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Av. Amazonas y Río Coca"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="proveedor@ejemplo.com"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ruc"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>RUC</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. 1790012345001"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Imagen */}
        <div className="col-span-full">
          <FormItem>
            <FormLabel>Imagen del proveedor</FormLabel>
            <FormControl>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  ref={imagenInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImagenArchivo(file);
                      setImagenPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </FormControl>
          </FormItem>
          {imagenPreview && (
            <img
              src={imagenPreview}
              alt="Previsualización"
              className="mt-2 h-20 w-20 rounded-full border object-cover"
            />
          )}
        </div>

        {/* Botón */}
        <div className="col-span-full flex justify-end pt-2">
          <Button type="submit">Crear Proveedor</Button>
        </div>
      </form>
    </Form>
  );
}
