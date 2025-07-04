"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadImage } from "@/firebase/subirImage";
import { eliminarImagen } from "@/firebase/eliminarImage";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import { ToastError } from "@/components/shared/toast/toastError";
import { DEFAULT_PROVEEDOR_IMAGE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { error } from "console";

const initialRucRef = { current: "" };

const editProveedorSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  contacto: z.string().min(2, "El contacto es obligatorio"),

  telefono: z
    .string()
    .length(10, "El teléfono debe tener 10 dígitos")
    .regex(/^\d+$/, "El teléfono solo debe contener números"),

  direccion: z.string().min(5, "Dirección obligatoria"),

  email: z
    .string()
    .email("Correo inválido")
    .refine(
      (val) =>
        val.endsWith("@gmail.com") ||
        val.endsWith("@hotmail.com") ||
        val.endsWith("@outlook.com") ||
        val.endsWith("@yahoo.com"),
      {
        message: "Solo se permiten correos de Gmail, Hotmail, Outlook o Yahoo",
      },
    ),

  ruc: z
    .string()
    .length(13, "El RUC debe tener 13 dígitos")
    .regex(/^\d+$/, "El RUC solo debe contener números")
    .refine(
      async (ruc: string) => {
        if (ruc === initialRucRef.current) return true;
        const res = await fetch(
          `http://localhost:5000/proveedores/verificar?ruc=${ruc}`,
        );
        const data = await res.json();
        return !data.exists;
      },
      { message: "El RUC ya está registrado", async: true } as any,
    ),
});

type EditProveedorFormValues = z.infer<typeof editProveedorSchema>;

interface Props {
  initialData: EditProveedorFormValues & { id: string; img_prov?: string };
  onSuccess: (data: any) => void;
}

export function EditProveedorForm({ initialData, onSuccess }: Props) {
  const [imagenArchivo, setImagenArchivo] = React.useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = React.useState<string | null>(
    initialData.img_prov || null,
  );
  const imagenInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    initialRucRef.current = initialData.ruc;
  }, [initialData.ruc]);

  const form = useForm<EditProveedorFormValues>({
    resolver: zodResolver(editProveedorSchema),
    defaultValues: initialData,
  });

  const seleccionarImagen = () => imagenInputRef.current?.click();

  const onSubmit = async (values: EditProveedorFormValues) => {
    const startTime = performance.now();

    let imageUrl =
      imagenPreview || initialData.img_prov || DEFAULT_PROVEEDOR_IMAGE_URL;

    try {
      if (imagenArchivo) {
        if (
          initialData.img_prov &&
          !initialData.img_prov.includes("proveedor_default")
        ) {
          await eliminarImagen(initialData.img_prov);
        }

        imageUrl = await uploadImage(
          imagenArchivo,
          "proveedores",
          `proveedor_${values.nombre.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else if (!imagenPreview) {
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
      };

      const res = await fetch(
        `http://localhost:5000/proveedores/${initialData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Error al actualizar proveedor");

      const data = await res.json();

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      onSuccess(data);
      ToastSuccess({
        message: `Proveedor actualizado correctamente en ${duration} segundos.`,
      });
    } catch (error) {
      ToastError({ message: "Error al actualizar proveedor." });
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-6 sm:gap-x-8"
      >
        <div className="col-span-2 row-start-1 flex justify-center">
          <div
            onClick={seleccionarImagen}
            className="relative h-24 w-24 cursor-pointer rounded-full border-2 border-dashed border-gray-300 hover:border-primary"
          >
            <img
              src={
                imagenPreview ||
                initialData.img_prov ||
                DEFAULT_PROVEEDOR_IMAGE_URL
              }
              alt="Foto proveedor"
              className="h-full w-full rounded-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity hover:opacity-100">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={imagenInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (!file.type.startsWith("image/")) {
                    ToastError({
                      message: "Solo se permiten archivos de imagen.",
                    });
                    return;
                  }
                  setImagenArchivo(file);
                  setImagenPreview(URL.createObjectURL(file));
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Campos del formulario */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Nombre
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Supermercado XYZ"
                  {...field}
                  className={cn(
                    "dark:bg-[#09090b]",
                    error ? "border-2 border-[var(--error-per)]" : "",
                  )}
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
                Contacto
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Luis Torres"
                  {...field}
                  className={cn(
                    "dark:bg-[#09090b]",
                    error ? "border-2 border-[var(--error-per)]" : "",
                  )}
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
                  className={cn(
                    "dark:bg-[#09090b]",
                    error ? "border-2 border-[var(--error-per)]" : "",
                  )}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

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
                  placeholder="Ej. Av. La Prensa"
                  {...field}
                  className={cn(
                    "dark:bg-[#09090b]",
                    error ? "border-2 border-[var(--error-per)]" : "",
                  )}
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
                Correo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="proveedor@correo.com"
                  {...field}
                  className={cn(
                    "dark:bg-[#09090b]",
                    error ? "border-2 border-[var(--error-per)]" : "",
                  )}
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
              <FormLabel className="text-black dark:text-white">RUC</FormLabel>
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
                  className={cn(
                    "dark:bg-[#09090b]",
                    error ? "border-2 border-[var(--error-per)]" : "",
                  )}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        <div className="col-start-2 flex justify-end pt-4">
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </Form>
  );
}
