"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CloudUpload } from "lucide-react";
import { useEmpresa } from "@/hooks/configuraciones/generales/useEmpresa";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";

export function GeneralesConfiguracion() {
  const { empresa, loading, saveEmpresa } = useEmpresa();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nombre_negocio: "",
    ruc_negocio: "",
    direccion_negocio: "",
    telefono_negocio: "",
    email_negocio: "",
    logo_negocio: "",
    incluir_logo_reportes: false,
    incluir_logo_facturas: false,
  });

  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre_negocio: empresa.nom_emp,
        ruc_negocio: empresa.ruc_emp,
        direccion_negocio: empresa.dir_emp,
        telefono_negocio: empresa.tel_emp,
        email_negocio: empresa.corre_emp,
        logo_negocio: empresa.logo_emp,
        incluir_logo_reportes: false,
        incluir_logo_facturas: false,
      });
      setLogoFile(null); // ✅ limpia file al cargar empresa
    }
  }, [empresa]);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logo_negocio: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    if (empresa) {
      setFormData({
        nombre_negocio: empresa.nom_emp,
        ruc_negocio: empresa.ruc_emp,
        direccion_negocio: empresa.dir_emp,
        telefono_negocio: empresa.tel_emp,
        email_negocio: empresa.corre_emp,
        logo_negocio: empresa.logo_emp,
        incluir_logo_reportes: false,
        incluir_logo_facturas: false,
      });
      setLogoFile(null); // ✅ también limpia file al cancelar
    }
  };

  const handleSave = async () => {
    try {
      await saveEmpresa(
        {
          nom_emp: formData.nombre_negocio,
          ruc_emp: formData.ruc_negocio,
          dir_emp: formData.direccion_negocio,
          tel_emp: formData.telefono_negocio,
          corre_emp: formData.email_negocio,
          logo_emp: logoFile ? "" : (empresa?.logo_emp ?? ""),
        },
        logoFile ?? undefined,
        empresa?.id_emp,
      );

      ToastSuccess({
        message: "Empresa actualizada correctamente",
      });

      setLogoFile(null); // ✅ limpia file después de guardar
    } catch (error) {
      ToastError({
        message: "Error al actualizar la empresa",
      });
    }
  };

  if (loading) return <div>Cargando información de empresa...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-muted">
          {formData.logo_negocio ? (
            <Image
              src={formData.logo_negocio}
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
          <h2 className="text-2xl font-bold">{formData.nombre_negocio}</h2>
          <p className="text-sm text-muted-foreground">
            {formData.email_negocio}
          </p>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </div>
      </div>

      {/* Company profile */}
      <Card className="border border-border bg-background p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Perfil del negocio</h3>
        <p className="text-sm text-muted-foreground">
          Actualiza los datos generales de tu restaurante.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Nombre del Negocio</Label>
            <Input
              value={formData.nombre_negocio}
              onChange={(e) =>
                handleInputChange("nombre_negocio", e.target.value)
              }
            />
          </div>

          <div>
            <Label>RUC</Label>
            <Input
              value={formData.ruc_negocio}
              onChange={(e) => handleInputChange("ruc_negocio", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Dirección</Label>
            <Textarea
              value={formData.direccion_negocio}
              onChange={(e) =>
                handleInputChange("direccion_negocio", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Teléfono</Label>
            <Input
              value={formData.telefono_negocio}
              onChange={(e) =>
                handleInputChange("telefono_negocio", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email_negocio}
              onChange={(e) =>
                handleInputChange("email_negocio", e.target.value)
              }
            />
          </div>
        </div>
      </Card>

      {/* Company logo */}
      <Card className="border border-border bg-background p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Logo del negocio</h3>
        <p className="text-sm text-muted-foreground">
          Sube o reemplaza el logo. Se recomienda SVG, PNG o JPG (máx.
          800x400px).
        </p>

        <div className="mt-6 flex items-center gap-6">
          <div className="relative h-20 w-20 rounded-md border border-border bg-muted">
            {formData.logo_negocio ? (
              <Image
                src={formData.logo_negocio}
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
              o arrastra y suelta
              <br />
              SVG, PNG, JPG o GIF (máx. 800x400px)
            </span>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFileChange(e.target.files[0])
              }
            />
          </label>
        </div>
      </Card>

      {/* Branding */}
      <Card className="border border-border bg-background p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Branding</h3>
        <p className="text-sm text-muted-foreground">
          Controla el uso del logo en reportes y comprobantes.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Incluir logo en reportes</p>
              <p className="text-xs text-muted-foreground">
                Mostrar el logo en todos los reportes del sistema.
              </p>
            </div>
            <Switch
              checked={formData.incluir_logo_reportes}
              onCheckedChange={(checked) =>
                handleSwitchChange("incluir_logo_reportes", checked)
              }
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
              checked={formData.incluir_logo_facturas}
              onCheckedChange={(checked) =>
                handleSwitchChange("incluir_logo_facturas", checked)
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
