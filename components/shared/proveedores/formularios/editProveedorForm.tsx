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

// Referencia para mantener el RUC original
const initialRucRef = { current: "" };

const editProveedorSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  contacto: z.string().min(2, "El contacto es obligatorio"),
  telefono: z.string().min(7, "Teléfono inválido"),
  direccion: z.string().min(5, "Dirección obligatoria"),
  email: z.string().email("Correo inválido"),
  ruc: z
    .string()
    .min(10, "RUC inválido")
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
    let imageUrl = imagenPreview || initialData.img_prov;
    const defaultImage =
      "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/proveedores%2Fproveedor-default.jpg?alt=media";

    try {
      // Si cambia la imagen, eliminar la anterior (excepto si es default)
      if (imagenArchivo) {
        if (
          initialData.img_prov &&
          !initialData.img_prov.includes("proveedor-default")
        ) {
          await eliminarImagen(initialData.img_prov);
        }

        imageUrl = await uploadImage(
          imagenArchivo,
          "proveedores",
          `proveedor_${values.nombre.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else if (!imagenPreview) {
        imageUrl = defaultImage;
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
      onSuccess(data);
      ToastSuccess({ message: "Proveedor actualizado correctamente." });
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
        {/* Imagen con overlay */}
        <div className="row-start-1 col-span-2 flex justify-center">
          <div
            onClick={seleccionarImagen}
            className="relative h-24 w-24 cursor-pointer rounded-full border-2 border-dashed border-gray-300 hover:border-primary"
          >
            <img
              src={
                imagenPreview ||
                initialData.img_prov ||
                "https://firebasestorage.googleapis.com/v0/b/dicolaic-app.appspot.com/o/proveedores%2Fproveedor-default.jpg?alt=media"
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
                  setImagenArchivo(file);
                  setImagenPreview(URL.createObjectURL(file));
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Campos */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Supermercado XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contacto</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Luis Torres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 0999999999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Av. La Prensa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input placeholder="proveedor@correo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ruc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUC</FormLabel>
              <FormControl>
                <Input placeholder="Ej. 1790012345001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón de guardar */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-[#f6b100] text-black">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
