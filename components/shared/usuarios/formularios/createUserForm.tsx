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
import { RoleCombobox } from "../ui/comboboxRol";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ToastError } from "../../toast/toastError";
import { ToastSuccess } from "../../toast/toastSuccess";
import { IRol } from "@/lib/types";

// Esquema para el formulario principal de crear usuario
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/;
const createUserSchema = z.object({
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
      ((email: string) => {
        return fetch(
          `http://localhost:5000/usuarios/verificar/correo?email=${encodeURIComponent(email)}`,
        )
          .then((res) => res.json())
          .then((data) => !data.exists);
      }) as (email: string) => Promise<boolean>,
      { message: "El correo ya se encuentra registrado", async: true } as any,
    ),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  rol: z.string().nonempty("Selecciona un rol"),
});
type CreateUserFormValues = z.infer<typeof createUserSchema>;

// Esquema para el formulario del modal de creación de rol
const roleSchema = z.object({
  nom_rol: z
    .string()
    .min(2, "El nombre del rol debe tener al menos 2 caracteres."),
  desc_rol: z
    .string()
    .min(2, "La descripción del rol debe tener al menos 2 caracteres."),
});
type RoleFormValues = z.infer<typeof roleSchema>;

export interface CreateUserFormProps {
  roleOptions: IRol[];
  onSuccess: (data: any) => void;
  onRoleCreated?: (newRole: IRol) => void;
}

export function CreateUserForm({
  roleOptions,
  onSuccess,
  onRoleCreated,
}: CreateUserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  // Estado para controlar el modal de creación de rol
  const [showRoleModal, setShowRoleModal] = React.useState(false);

  // Formulario principal de usuario
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      usuario: "",
      correo: "",
      password: "",
      rol: "",
    },
  });

  // Formulario para el modal de rol
  const {
    register: registerRole,
    handleSubmit: handleSubmitRole,
    formState: { errors: roleErrors },
    reset: resetRoleForm,
    control: roleControl,
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { nom_rol: "", desc_rol: "" },
  });

  const onSubmit = async (values: CreateUserFormValues) => {
    const payload = {
      nom_usu: values.usuario,
      email_usu: values.correo,
      clave_usu: values.password,
      rol_usu: parseInt(values.rol, 10), // Convierto el string a número
    };

    try {
      const res = await fetch("http://localhost:5000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }
      const data = await res.json();
      onSuccess(data);
      form.reset();
      ToastSuccess({ message: "Usuario creado correctamente" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado";
      ToastError({ message: "Error al crear el usuario: " + errorMessage });
    }
  };

  // Función para confirmar la creación del rol del modal
  const handleConfirmCreateRole = async (values: RoleFormValues) => {
    try {
      const res = await fetch("http://localhost:5000/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom_rol: values.nom_rol,
          desc_rol: values.desc_rol,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }
      const response = await res.json();
      // Suponemos que la respuesta tiene { message: string, rol: { id_rol, nom_rol, ... } }
      const createdRole = response.rol; // Asegúrate de que la propiedad se llame 'rol'
      console.log("Nuevo rol creado:", createdRole);

      // Actualiza el campo "rol" en el formulario principal
      form.setValue("rol", String(createdRole.id_rol));
      // Notifica al padre (si se pasa onRoleCreated)
      if (onRoleCreated) {
        onRoleCreated(createdRole);
      }
      ToastSuccess({ message: "Rol creado correctamente" });
      resetRoleForm();
      setShowRoleModal(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado";
      ToastError({ message: "Error al crear el rol: " + errorMessage });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
            </FormItem>
          )}
        />

        {/* Campo 4: Rol mediante RoleCombobox */}
        <FormField
          control={form.control}
          name="rol"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel className="text-black dark:text-white">Rol</FormLabel>
              <FormControl>
                <RoleCombobox
                  items={roleOptions} // roleOptions es un IRol[]
                  value={field.value ? String(field.value) : ""}
                  onChange={(value: string) => field.onChange(value)}
                  onCreateRole={() => setShowRoleModal(true)}
                  placeholder="Selecciona un rol"
                  className={`w-full pr-10 dark:bg-[#09090b] ${
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

        {/* Botón de envío */}
        <div className="flex justify-end gap-2 pt-4 sm:col-span-2">
          <Button type="submit" className="bg-[#f6b100] text-black">
            Crear Usuario
          </Button>
        </div>
      </form>

      {/* Modal para crear rol */}
      {showRoleModal && (
        <Dialog
          open={showRoleModal}
          onOpenChange={(open) => {
            if (!open) setShowRoleModal(false);
          }}
        >
          <DialogContent className="border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Rol</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo rol:
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitRole(handleConfirmCreateRole)}>
              <FormField
                control={roleControl}
                name="nom_rol"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Nombre del rol
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre del rol"
                        {...field}
                        className={`w-full pr-10 dark:bg-[#09090b] ${
                          error
                            ? "border-2 border-[var(--error-per)]"
                            : "dark:border-default-700 dark:border"
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="error-text">
                      {error?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={roleControl}
                name="desc_rol"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">
                      Descripción del rol
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descripción del rol"
                        {...field}
                        className={`w-full pr-10 dark:bg-[#09090b] ${
                          error
                            ? "border-2 border-[var(--error-per)]"
                            : "dark:border-default-700 dark:border"
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="error-text">
                      {error?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <div className="mt-3 flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRoleModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#f6b100] text-black">
                    Crear
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Form>
  );
}
