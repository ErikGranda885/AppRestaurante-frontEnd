"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CierresDiariosConfiguracion() {
  const [formData, setFormData] = useState({
    activar_cierre_automatico: true,
    cierre_creacion_hora: "07:00",
    cierre_verificacion_hora: "23:59",
    mostrar_diferencias_cierre: true,
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {};
  const handleSave = () => {};

  return (
    <div className="space-y-10 ">
      <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
        <h3 className="text-lg font-semibold">
          Configuración de Cierres Diarios
        </h3>
        <p className="text-sm text-muted-foreground">
          Define las reglas y horarios para los cierres automáticos diarios.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6">
          {/* Inputs izquierda */}
          <div className="space-y-6">
            <div>
              <Label>Hora de creación del cierre</Label>
              <Input
                type="time"
                value={formData.cierre_creacion_hora}
                onChange={(e) =>
                  handleInputChange("cierre_creacion_hora", e.target.value)
                }
              />
            </div>

            <div>
              <Label>Hora de verificación del cierre</Label>
              <Input
                type="time"
                value={formData.cierre_verificacion_hora}
                onChange={(e) =>
                  handleInputChange("cierre_verificacion_hora", e.target.value)
                }
              />
            </div>
          </div>

          {/* Switches derecha */}
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">Activar cierre automático</p>
                <p className="text-xs text-muted-foreground">
                  Si se activa, el sistema intentará crear cierres automáticos
                  de manera programada.
                </p>
              </div>
              <Switch
                checked={formData.activar_cierre_automatico}
                onCheckedChange={(checked) =>
                  handleSwitchChange("activar_cierre_automatico", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">
                  Mostrar diferencias de cierre
                </p>
                <p className="text-xs text-muted-foreground">
                  Si se activa, se resaltarán las diferencias entre el sistema y
                  el efectivo al cerrar el día.
                </p>
              </div>
              <Switch
                checked={formData.mostrar_diferencias_cierre}
                onCheckedChange={(checked) =>
                  handleSwitchChange("mostrar_diferencias_cierre", checked)
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
