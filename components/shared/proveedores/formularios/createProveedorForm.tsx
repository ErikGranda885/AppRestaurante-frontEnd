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
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos"),
  direccion: z.string().min(5, "Dirección obligatoria"),
  email: z
    .string()
    .email("Correo inválido")
    .regex(
      /^[\w.-]+@(gmail|hotmail|outlook|yahoo)\.com$/,
      "Solo se permiten correos de Gmail, Hotmail, Outlook o Yahoo",
    ),
  ruc: z.string().regex(/^\d{13}$/, "El RUC debe tener exactamente 13 números"),
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
    const startTime = performance.now(); // ⏱️ Inicio
    let imageUrl = "";

    try {
      // ✅ Validar tipo MIME del archivo (solo imágenes)
      if (imagenArchivo && !imagenArchivo.type.startsWith("image/")) {
        ToastError({
          message: "Solo se pueden cargar archivos con formato: PNG/JPG",
        });
        return;
      }

      if (imagenArchivo) {
        imageUrl = await uploadImage(
          imagenArchivo,
          "proveedores",
          `proveedor_${values.nombre.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else {
        imageUrl = DEFAULT_PROVEEDOR_IMAGE_URL;
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
      const endTime = performance.now(); // ⏱️ Fin
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      onSuccess(data);
      form.reset();
      setImagenArchivo(null);
      setImagenPreview(null);
      ToastSuccess({
        message: `Proveedor creado correctamente en ${duration} segundos.`,
      });
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
                <FormLabel className="text-black dark:text-white">
                  Nombre del proveedor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Nuva Supermercados"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contacto"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Nombre del contacto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. María Vargas"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Teléfono
                </FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Ej. 0999999999"
                    {...field}
                    value={field.value ?? ""}
                    onKeyDown={(e) => {
                      const allowed = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                      ];
                      if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      field.onChange(onlyNumbers);
                    }}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage className="error-text" />
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
                <FormLabel className="text-black dark:text-white">
                  Dirección
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Av. Amazonas y Río Coca"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  Correo electrónico
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="proveedor@ejemplo.com"
                    {...field}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ruc"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  RUC
                </FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="Ej. 1790012345001"
                    {...field}
                    value={field.value ?? ""}
                    onKeyDown={(e) => {
                      const allowed = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                      ];
                      if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 13);
                      field.onChange(onlyNumbers);
                    }}
                    className={`pr-10 ${error ? "border-2 border-[var(--error-per)]" : ""}`}
                  />
                </FormControl>
                <FormMessage className="error-text" />
              </FormItem>
            )}
          />
        </div>

        {/* Imagen */}
        <div className="col-span-full">
          <FormItem>
            <FormLabel className="text-black dark:text-white">
              Imagen del proveedor
            </FormLabel>
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
