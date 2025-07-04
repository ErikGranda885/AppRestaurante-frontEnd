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
import { IRol } from "@/lib/types";
import { useCrearUsuario } from "@/hooks/usuarios/useCrearUsuario";
import { useCrearRol } from "@/hooks/usuarios/useCrearRol";
import { ToastError } from "../../toast/toastError";
import { SERVICIOS_USUARIOS } from "@/services/usuarios.service";

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
      (email) =>
        ["@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com"].some((d) =>
          email.toLowerCase().endsWith(d),
        ),
      {
        message: "Solo se permiten correos de Gmail, Hotmail, Outlook o Yahoo.",
      },
    )
    .refine(
      async (email) => {
        const res = await fetch(
          SERVICIOS_USUARIOS.verificarCorreoUsuario(email),
        );
        const data = await res.json();
        return !data.exists;
      },
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
  const { crearUsuario } = useCrearUsuario();
  const { crearRol } = useCrearRol();

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
  const [imagenArchivo, setImagenArchivo] = React.useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = React.useState<string | null>(null);
  const imagenInputRef = React.useRef<HTMLInputElement>(null);

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
    crearUsuario({
      values,
      imagenNueva: imagenArchivo,
      onSuccess: (data: any) => {
        onSuccess(data);
        form.reset();
        setImagenArchivo(null);
        setImagenPreview(null);
      },
    });
  };
  const handleConfirmCreateRole = async (values: RoleFormValues) => {
    crearRol({
      values,
      onSuccess: (createdRole) => {
        form.setValue("rol", String(createdRole.id_rol));
        onRoleCreated?.(createdRole);
      },
      onClose: () => setShowRoleModal(false),
      resetForm: () => resetRoleForm(),
    });
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
        {/* Campo 5 : Imagen del usuario */}
        <FormItem className="mt-2">
          <FormLabel className="text-black dark:text-white">
            Imagen de usuario
          </FormLabel>
          <FormControl>
            <div>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                ref={imagenInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  const formatosPermitidos = [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                  ];

                  if (file) {
                    if (!formatosPermitidos.includes(file.type)) {
                      ToastError({
                        message:
                          "❌ Solo se permiten imágenes JPG, JPEG, PNG o WEBP.",
                      });
                      return;
                    }

                    setImagenArchivo(file);
                    setImagenPreview(URL.createObjectURL(file));
                  }
                }}
                className="dark:border-default-700 dark:border dark:bg-[#09090b]"
              />
              {imagenPreview && (
                <img
                  src={imagenPreview}
                  alt="Previsualización"
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>
          </FormControl>
        </FormItem>

        {/* Botón de envío */}
        <div className="flex justify-end gap-2 pt-4 sm:col-span-2">
          <Button type="submit">Crear Usuario</Button>
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
                  <Button type="submit">Crear</Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Form>
  );
}
