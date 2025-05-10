"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SeguridadConfiguracion() {
  const [formData, setFormData] = useState({
    activar_google_login: false,
    longitud_minima_password: 8,
    bloquear_usuario_por_intentos: false,
    max_intentos_login: 5,
  });

  const handleInputChange = (key: string, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {};
  const handleSave = () => {};

  return (
    <div className="space-y-10 pt-4">
      <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
        <h3 className="text-lg font-semibold">Configuración de Seguridad</h3>
        <p className="text-sm text-muted-foreground">
          Administra los parámetros de autenticación y seguridad del sistema.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6">
          {/* Inputs izquierda */}
          <div className="space-y-6">
            <div>
              <Label>Longitud mínima de contraseña</Label>
              <Input
                type="number"
                value={formData.longitud_minima_password}
                onChange={(e) =>
                  handleInputChange(
                    "longitud_minima_password",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div>
              <Label>Máximo de intentos de login</Label>
              <Input
                type="number"
                value={formData.max_intentos_login}
                onChange={(e) =>
                  handleInputChange(
                    "max_intentos_login",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>
          </div>

          {/* Switches derecha */}
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">Activar Login con Google</p>
                <p className="text-xs text-muted-foreground">
                  Permite a los usuarios iniciar sesión utilizando su cuenta de
                  Google.
                </p>
              </div>
              <Switch
                checked={formData.activar_google_login}
                onCheckedChange={(checked) =>
                  handleSwitchChange("activar_google_login", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">
                  Bloquear usuario por intentos fallidos
                </p>
                <p className="text-xs text-muted-foreground">
                  Bloquea automáticamente la cuenta tras superar el límite de
                  intentos fallidos.
                </p>
              </div>
              <Switch
                checked={formData.bloquear_usuario_por_intentos}
                onCheckedChange={(checked) =>
                  handleSwitchChange("bloquear_usuario_por_intentos", checked)
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Botones acción */}
      <div className="mt-8 flex items-center justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Guardar</Button>
      </div>
    </div>
  );
}
