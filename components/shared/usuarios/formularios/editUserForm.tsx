"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Upload } from "lucide-react";

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
import { Combobox, Option } from "@/components/shared/varios/combobox";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";
import { uploadImage } from "@/firebase/subirImage";
import { eliminarImagen } from "@/firebase/eliminarImage";
import { DEFAULT_USER_URL } from "@/lib/constants";

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/;

const editUserSchema = z.object({
  usuario: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .regex(nameRegex, {
      message: "El nombre solo puede contener letras y un espacio",
    }),
  correo: z
    .string()
    .email({ message: "Ingresa un correo válido." })
    .refine(
      async (email: string) => {
        if (email === initialDataCorreoRef.current) return true;
        const res = await fetch(
          `http://localhost:5000/usuarios/verificar/correo?email=${encodeURIComponent(email)}`,
        );
        const data = await res.json();
        return !data.exists;
      },
      { message: "El correo ya se encuentra registrado", async: true } as any,
    ),
  password: z.string().refine((val) => val === "" || val.length >= 6, {
    message: "La contraseña debe tener al menos 6 caracteres si se ingresa",
  }),
  rol: z.preprocess(
    (arg) => {
      if (typeof arg === "string" && arg.trim() !== "")
        return parseInt(arg, 10);
      return arg;
    },
    z.number({ message: "Se debe seleccionar un rol" }),
  ),
});

const initialDataCorreoRef = { current: "" };

export type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  initialData: EditUserFormValues & { id: string; img_usu?: string };
  roleOptions: Option[];
  onSuccess: (data: any) => void;
}

export function EditUserForm({
  initialData,
  roleOptions,
  onSuccess,
}: EditUserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [imagenArchivo, setImagenArchivo] = React.useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = React.useState<string | null>(
    initialData.img_usu || null,
  );
  const imagenInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    initialDataCorreoRef.current = initialData.correo;
  }, [initialData.correo]);

  const schema = React.useMemo(() => {
    return editUserSchema;
  }, [initialDataCorreoRef.current]);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const seleccionarImagen = () => {
    imagenInputRef.current?.click();
  };

  const onSubmit = async (values: EditUserFormValues) => {
    let imageUrl = imagenPreview || initialData.img_usu;
    const defaultImage = DEFAULT_USER_URL;

    try {
      if (imagenArchivo) {
        // Si la imagen actual no es la por defecto, elimínala
        if (
          initialData.img_usu &&
          !initialData.img_usu.includes("user-default")
        ) {
          await eliminarImagen(initialData.img_usu);
        }

        // Subimos la nueva imagen
        imageUrl = await uploadImage(
          imagenArchivo,
          "usuarios",
          `usuario_${values.usuario.replace(/\s+/g, "_").toLowerCase()}`,
        );
      } else if (!imagenPreview) {
        imageUrl = defaultImage;
      }

      const payload: any = {
        nom_usu: values.usuario,
        email_usu: values.correo,
        rol_usu: values.rol,
        img_usu: imageUrl,
      };

      if (values.password.trim() !== "") {
        payload.clave_usu = values.password;
      }

      const res = await fetch(
        `http://localhost:5000/usuarios/${initialData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }

      const data = await res.json();
      onSuccess(data);
      ToastSuccess({
        message: "El usuario ha sido actualizado correctamente.",
      });

      const storedUser = localStorage.getItem("user_name") || "";
      if (storedUser === initialData.usuario) {
        localStorage.setItem("user_name", values.usuario);
        window.dispatchEvent(new Event("userNameUpdated"));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado";
      ToastError({
        message: "Error al actualizar el usuario: " + errorMessage,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campo imagen con overlay */}
        <div className="mb-4 flex justify-center">
          <div
            onClick={seleccionarImagen}
            className="relative h-24 w-24 cursor-pointer rounded-full border-2 border-dashed border-gray-300 hover:border-primary dark:border-gray-600"
          >
            <img
              src={imagenPreview || initialData.img_usu || DEFAULT_USER_URL}
              alt="Foto usuario"
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
                } else {
                  setImagenArchivo(null);
                  setImagenPreview(null);
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Campo 1: Nombre */}
        <FormField
          control={form.control}
          name="usuario"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Nombre completo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Juan Pérez"
                  {...field}
                  className={`pr-10 dark:bg-[#09090b] ${
                    error
                      ? "border-2 border-[var(--error-per)]"
                      : "dark:border-default-700 dark:border"
                  }`}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Campo 2: Correo */}
        <FormField
          control={form.control}
          name="correo"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Correo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="usuario@ejemplo.com"
                  {...field}
                  className={`pr-10 dark:bg-[#09090b] ${
                    error
                      ? "border-2 border-[var(--error-per)]"
                      : "dark:border-default-700 dark:border"
                  }`}
                />
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Campo 3: Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Contraseña
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    {...field}
                    className={`pr-10 dark:bg-[#09090b] ${
                      error
                        ? "border-2 border-[var(--error-per)]"
                        : "dark:border-default-700 dark:border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="error-text" />
              <p className="mt-1 text-xs text-gray-500">
                Deja el campo en blanco para mantener la contraseña actual.
              </p>
            </FormItem>
          )}
        />

        {/* Campo 4: Rol */}
        <FormField
          control={form.control}
          name="rol"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Rol</FormLabel>
              <FormControl>
                <div className="relative">
                  <Combobox
                    items={roleOptions}
                    value={field.value ? String(field.value) : ""}
                    onChange={field.onChange}
                    placeholder="Selecciona un rol"
                    className={`w-full pr-10 dark:bg-[#09090b] ${
                      error
                        ? "border-2 border-[var(--error-per)]"
                        : "dark:border-default-700 dark:border"
                    }`}
                  />
                </div>
              </FormControl>
              <FormMessage className="error-text" />
            </FormItem>
          )}
        />

        {/* Botón de envío */}
        <div className="flex justify-end pt-4 sm:col-span-2">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </Form>
  );
}
