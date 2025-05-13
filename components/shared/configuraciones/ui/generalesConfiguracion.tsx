"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CloudUpload } from "lucide-react";

import { useEmpresa } from "@/hooks/configuraciones/generales/useEmpresa";
import { useConfiguracionesBranding } from "@/hooks/configuraciones/generales/useConfiguracionesBranding";

import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CampoTexto } from "../../varios/campoTexto";

const empresaSchema = z.object({
  nombre_negocio: z.string().min(3, "Debe tener al menos 3 caracteres"),
  ruc_negocio: z
    .string()
    .length(13, "El RUC debe tener exactamente 13 dígitos")
    .regex(/^\d+$/, "El RUC debe contener solo números"),
  direccion_negocio: z.string().min(5, "La dirección es requerida"),
  telefono_negocio: z
    .string()
    .min(7, "Teléfono demasiado corto")
    .regex(/^\d+$/, "Solo números permitidos"),
  email_negocio: z.string().email("Correo inválido"),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

export function GeneralesConfiguracion() {
  const { empresa, loading, saveEmpresa } = useEmpresa();
  const { logoReportes, setLogoReportes, logoFacturas, setLogoFacturas } =
    useConfiguracionesBranding();

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const methods = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nombre_negocio: "",
      ruc_negocio: "",
      direccion_negocio: "",
      telefono_negocio: "",
      email_negocio: "",
    },
  });

  const { control, reset, watch } = methods;

  useEffect(() => {
    if (empresa) {
      reset({
        nombre_negocio: empresa.nom_emp,
        ruc_negocio: empresa.ruc_emp,
        direccion_negocio: empresa.dir_emp,
        telefono_negocio: empresa.tel_emp,
        email_negocio: empresa.corre_emp,
      });
      setLogoFile(null);
    }
  }, [empresa, reset]);

  const onSubmit = async (values: EmpresaFormValues) => {
    try {
      await saveEmpresa(
        {
          nom_emp: values.nombre_negocio,
          ruc_emp: values.ruc_negocio,
          dir_emp: values.direccion_negocio,
          tel_emp: values.telefono_negocio,
          corre_emp: values.email_negocio,
          logo_emp: logoFile ? "" : (empresa?.logo_emp ?? ""),
        },
        logoFile ?? undefined,
        empresa?.id_emp,
      );

      ToastSuccess({ message: "Empresa actualizada correctamente" });
      setLogoFile(null);
    } catch {
      ToastError({ message: "Error al actualizar la empresa" });
    }
  };

  if (loading) return <div>Cargando información de empresa...</div>;

  const nombre = watch("nombre_negocio");
  const correo = watch("email_negocio");

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-muted">
            {logoFile ? (
              <Image
                src={URL.createObjectURL(logoFile)}
                alt="Preview Logo"
                fill
                className="rounded-md object-cover"
              />
            ) : empresa?.logo_emp ? (
              <Image
                src={empresa.logo_emp}
                alt="Logo"
                fill
                className="rounded-md object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Logo
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {nombre || "Nombre del negocio"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {correo || "correo@ejemplo.com"}
            </p>
          </div>

          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                empresa &&
                reset({
                  nombre_negocio: empresa.nom_emp,
                  ruc_negocio: empresa.ruc_emp,
                  direccion_negocio: empresa.dir_emp,
                  telefono_negocio: empresa.tel_emp,
                  email_negocio: empresa.corre_emp,
                })
              }
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={methods.formState.isSubmitting}>
              Guardar cambios
            </Button>
          </div>
        </div>

        <Card className="border border-border bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Perfil del negocio</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <CampoTexto
              control={control}
              name="nombre_negocio"
              label="Nombre del negocio"
            />
            <CampoTexto control={control} name="ruc_negocio" label="RUC" />
            <div className="md:col-span-2">
              <Label>Dirección</Label>
              <Textarea {...methods.register("direccion_negocio")} />
            </div>
            <CampoTexto
              control={control}
              name="telefono_negocio"
              label="Teléfono"
            />
            <CampoTexto control={control} name="email_negocio" label="Email" />
          </div>
        </Card>

        <Card className="border border-border bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Logo del negocio</h3>
          <div className="mt-6 flex items-center gap-6">
            <div className="relative h-20 w-20 rounded-md border border-border bg-muted">
              {logoFile ? (
                <Image
                  src={URL.createObjectURL(logoFile)}
                  alt="Preview Logo"
                  fill
                  className="rounded-md object-cover"
                />
              ) : empresa?.logo_emp ? (
                <Image
                  src={empresa.logo_emp}
                  alt="Logo"
                  fill
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Sin logo
                </div>
              )}
            </div>

            <label
              htmlFor="logo-upload"
              className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-center text-sm transition hover:bg-muted"
            >
              <CloudUpload className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-primary">Click para subir</span>
              <span className="text-xs text-muted-foreground">
                SVG, PNG, JPG o GIF (máx. 800x400px)
              </span>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && setLogoFile(e.target.files[0])
                }
              />
            </label>
          </div>
        </Card>

        <Card className="border border-border bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Branding</h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Incluir logo en reportes</p>
                <p className="text-xs text-muted-foreground">
                  Mostrar el logo en todos los reportes del sistema.
                </p>
              </div>
              <Switch
                checked={logoReportes}
                onCheckedChange={setLogoReportes}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Incluir logo en facturas</p>
                <p className="text-xs text-muted-foreground">
                  Mostrar el logo en los comprobantes de compra y venta.
                </p>
              </div>
              <Switch
                checked={logoFacturas}
                onCheckedChange={setLogoFacturas}
              />
            </div>
          </div>
        </Card>
      </form>
    </FormProvider>
  );
}
