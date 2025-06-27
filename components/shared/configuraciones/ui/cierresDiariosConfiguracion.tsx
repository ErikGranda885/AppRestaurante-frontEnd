"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfiguracionesCierreDiario } from "@/hooks/configuraciones/generales/useConfiguracionesCierreDiario";
import { ToastSuccess } from "../../toast/toastSuccess";
import { ToastError } from "../../toast/toastError";

export function CierresDiariosConfiguracion() {
  const [errorHora, setErrorHora] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    cierreCreacionHora,
    setCierreCreacionHoraStateOnly,
    cierreVerificacionHora,
    setCierreVerificacionHoraStateOnly,
    updateConfiguracion,
    loading,
  } = useConfiguracionesCierreDiario();

  const validarHoras = (creacion: string, verificacion: string) => {
    if (creacion && verificacion) {
      const [h1, m1] = creacion.split(":").map(Number);
      const [h2, m2] = verificacion.split(":").map(Number);
      const totalMin1 = h1 * 60 + m1;
      const totalMin2 = h2 * 60 + m2;

      if (totalMin1 >= totalMin2) {
        setErrorHora(
          "La hora de creación debe ser anterior a la de verificación.",
        );
      } else {
        setErrorHora("");
      }
    }
  };

  const handleSave = async () => {
    if (isSaving || errorHora) return;
    setIsSaving(true);
    try {
      await updateConfiguracion("cierre_creacion_hora", cierreCreacionHora);
      await updateConfiguracion(
        "cierre_verificacion_hora",
        cierreVerificacionHora,
      );
      ToastSuccess({
        message: "Configuración de cierre guardada correctamente.",
      });
    } catch {
      ToastError({ message: "Error al guardar configuración." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-10">
      <Card className="border border-border bg-background p-6 pb-10 shadow-sm">
        <h3 className="text-lg font-semibold">
          Configuración de Cierres Diarios
        </h3>
        <p className="text-sm text-muted-foreground">
          Define las reglas y horarios para los cierres automáticos diarios.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6">
          <div className="space-y-6">
            {/* Hora creación */}
            <div>
              <Label>Hora de creación del cierre</Label>
              <Input
                type="time"
                value={cierreCreacionHora}
                onChange={(e) => {
                  setCierreCreacionHoraStateOnly(e.target.value);
                  validarHoras(e.target.value, cierreVerificacionHora);
                }}
                disabled={loading}
              />
            </div>

            {/* Hora verificación */}
            <div>
              <Label>Hora de verificación del cierre</Label>
              <Input
                type="time"
                value={cierreVerificacionHora}
                onChange={(e) => {
                  setCierreVerificacionHoraStateOnly(e.target.value);
                  validarHoras(cierreCreacionHora, e.target.value);
                }}
                disabled={loading}
              />
              {errorHora && (
                <p className="mt-1 text-sm text-red-500">{errorHora}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          aria-disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !!errorHora}
          aria-disabled={isSaving || !!errorHora}
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
