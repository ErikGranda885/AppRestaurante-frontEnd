"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useConfiguracionesCierreDiario } from "@/hooks/configuraciones/generales/useConfiguracionesCierreDiario";

export function CierresDiariosConfiguracion() {
  const {
    activarCierreAutomatico,
    setActivarCierreAutomatico,
    cierreCreacionHora,
    setCierreCreacionHora,
    cierreVerificacionHora,
    setCierreVerificacionHora,
    mostrarDiferenciasCierre,
    setMostrarDiferenciasCierre,
    loading,
  } = useConfiguracionesCierreDiario();

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
          {/* Inputs izquierda */}
          <div className="space-y-6">
            <div>
              <Label>Hora de creación del cierre</Label>
              <Input
                type="time"
                value={cierreCreacionHora}
                onChange={(e) => setCierreCreacionHora(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label>Hora de verificación del cierre</Label>
              <Input
                type="time"
                value={cierreVerificacionHora}
                onChange={(e) => setCierreVerificacionHora(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Switches derecha */}
          {/* <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-4">
              <div>
                <p className="text-sm font-medium">Activar cierre automático</p>
                <p className="text-xs text-muted-foreground">
                  Si se activa, el sistema intentará crear cierres automáticos
                  de manera programada.
                </p>
              </div>
              <Switch
                checked={activarCierreAutomatico}
                onCheckedChange={(checked) =>
                  setActivarCierreAutomatico(checked)
                }
                disabled={loading}
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
                checked={mostrarDiferenciasCierre}
                onCheckedChange={(checked) =>
                  setMostrarDiferenciasCierre(checked)
                }
                disabled={loading}
              />
            </div>
          </div> */}
        </div>
      </Card>
    </div>
  );
}
