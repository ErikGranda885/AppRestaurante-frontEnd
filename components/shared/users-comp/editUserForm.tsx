"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

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
import { Combobox, Option } from "@/components/shared/combobox";
import toast from "react-hot-toast";

// Expresión regular para el nombre
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
        // Si el correo no se ha cambiado, no validar
        // (asumimos que initialData.correo se inyecta en el esquema mediante useMemo)
        if (email === initialDataCorreoRef.current) return true;
        const res = await fetch(
          `http://localhost:5000/usuarios/verificar/correo?email=${encodeURIComponent(
            email
          )}`
        );
        const data = await res.json();
        return !data.exists;
      },
      { message: "El correo ya se encuentra registrado", async: true } as any
    ),
  password: z.string().refine((val) => val === "" || val.length >= 6, {
    message: "La contraseña debe tener al menos 6 caracteres si se ingresa",
  }),
  rol: z.preprocess((arg) => {
    if (typeof arg === "string" && arg.trim() !== "") return parseInt(arg, 10);
    return arg;
  }, z.number({ required_error: "El rol del usuario es obligatorio" })),
});

// Para poder usar initialData.correo en el esquema, usamos un ref.
const initialDataCorreoRef = { current: "" };

export type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  initialData: EditUserFormValues & { id: string };
  roleOptions: Option[];
  onSuccess: (data: any) => void;
}

export function EditUserForm({
  initialData,
  roleOptions,
  onSuccess,
}: EditUserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  // Guardamos el correo inicial en un ref para usarlo en el esquema
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

  const onSubmit = async (values: EditUserFormValues) => {
    // Armar payload sin la contraseña si el campo está vacío
    const payload: any = {
      nom_usu: values.usuario,
      email_usu: values.correo,
      rol_usu: values.rol,
    };

    if (values.password.trim() !== "") {
      payload.clave_usu = values.password;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/usuarios/${initialData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
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
            } relative flex w-96 items-start gap-3 p-4 bg-[#F0FFF4] border border-[#4ADE80] rounded-lg shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <CheckCircle className="w-6 h-6 text-[#166534] mt-1" />
            <div className="flex-1">
              <p className="text-[#166534] text-sm font-semibold">
                Mensaje Informativo
              </p>
              <p className="text-sm text-[#166534]/80">
                Usuario actualizado exitosamente.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4ADE80]/20">
              <div className="progress-bar h-full bg-[#4ADE80]" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" }
      );
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
      toast.error("Error al actualizar el usuario");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campo 1: Nombre */}
        <FormField
          control={form.control}
          name="usuario"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Nombre completo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Juan Pérez"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* Campo 2: Correo */}
        <FormField
          control={form.control}
          name="correo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">
                Correo
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="usuario@ejemplo.com"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* Campo 3: Contraseña con icono para mostrar/ocultar */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
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
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
              <p className="text-xs text-gray-500 mt-1">
                Deja el campo en blanco para mantener la contraseña actual.
              </p>
            </FormItem>
          )}
        />

        {/* Campo 4: Rol */}
        <FormField
          control={form.control}
          name="rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Rol</FormLabel>
              <FormControl>
                <div className="relative">
                  <Combobox
                    items={roleOptions}
                    value={field.value ? String(field.value) : ""}
                    onChange={field.onChange}
                    placeholder="Selecciona un rol"
                    className="w-full"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* Botón de envío: abarca ambas columnas */}
        <div className="sm:col-span-2 flex justify-end pt-4">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </Form>
  );
}
